import asyncio

import httpx
import pytest

from app.clients.gemini_embedding import GeminiEmbeddingClient
from app.errors.app_error import AppError


def _vector(dimensions: int = 768, value: float = 0.25) -> list[float]:
    return [value] * dimensions


def _ok(texts: int, dimensions: int = 768) -> httpx.Response:
    return httpx.Response(
        200,
        json={"embeddings": [{"values": _vector(dimensions)} for _ in range(texts)]},
    )


def _client(
    handler: httpx.MockTransport | None = None,
    *,
    sleeps: list[float] | None = None,
    api_key: str = "test-key",
    provider: str = "gemini",
    dimensions: int = 768,
) -> GeminiEmbeddingClient:
    transport = handler

    async def sleep(delay: float) -> None:
        if sleeps is not None:
            sleeps.append(delay)

    return GeminiEmbeddingClient(
        api_key=api_key,
        model="gemini-embedding-2",
        dimensions=dimensions,
        provider=provider,
        transport=transport,
        sleep=sleep,
    )


def test_retries_429_then_returns_vectors() -> None:
    calls = {"count": 0}
    sleeps: list[float] = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        assert request.headers["x-goog-api-key"] == "test-key"
        assert request.url.path.endswith("models/gemini-embedding-2:batchEmbedContents")
        body = request.read()
        assert body.count(b'"text"') == 1
        assert b'"output_dimensionality":768' in body or b'"output_dimensionality": 768' in body
        if calls["count"] == 1:
            return httpx.Response(429, json={"error": {"message": "rate limit"}})
        return _ok(1)

    async def run() -> list[list[float]]:
        client = _client(httpx.MockTransport(handler), sleeps=sleeps)
        return await client.embed(["refund policy"])

    vectors = asyncio.run(run())

    assert calls["count"] == 2
    assert sleeps == [0.5]
    assert len(vectors) == 1
    assert len(vectors[0]) == 768


def test_retries_timeout_then_returns_vectors() -> None:
    calls = {"count": 0}

    def handler(_request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        if calls["count"] == 1:
            raise httpx.ReadTimeout("timed out")
        return _ok(1)

    async def run() -> list[list[float]]:
        client = _client(httpx.MockTransport(handler), sleeps=[])
        return await client.embed(["refund policy"])

    vectors = asyncio.run(run())
    assert calls["count"] == 2
    assert vectors[0][0] == 0.25


def test_exhausted_retries_raise_app_error() -> None:
    calls = {"count": 0}
    sleeps: list[float] = []

    def handler(_request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        return httpx.Response(503, json={"error": {"message": "unavailable"}})

    async def run() -> None:
        client = _client(httpx.MockTransport(handler), sleeps=sleeps)
        await client.embed(["refund policy"])

    with pytest.raises(AppError) as caught:
        asyncio.run(run())

    assert calls["count"] == 3
    assert sleeps == [0.5, 1.0]
    assert caught.value.code == "EMBEDDING_UNAVAILABLE"
    assert caught.value.status_code == 503
    assert "unavailable" not in caught.value.message


def test_does_not_retry_unauthorized() -> None:
    calls = {"count": 0}
    sleeps: list[float] = []

    def handler(_request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        return httpx.Response(401, json={"error": {"message": "API key not valid"}})

    async def run() -> None:
        client = _client(httpx.MockTransport(handler), sleeps=sleeps)
        await client.embed(["refund policy"])

    with pytest.raises(AppError) as caught:
        asyncio.run(run())

    assert calls["count"] == 1
    assert sleeps == []
    assert caught.value.code == "EMBEDDING_UNAVAILABLE"
    assert "API key not valid" not in caught.value.message
    assert "LLM_API_KEY" in caught.value.message


def test_sends_one_request_per_text() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        payload = request.read()
        assert payload.count(b'"text"') == 2
        assert payload.count(b'"output_dimensionality"') == 2
        assert b"models/gemini-embedding-2" in payload
        return _ok(2)

    async def run() -> list[list[float]]:
        client = _client(httpx.MockTransport(handler))
        return await client.embed(["alpha", "beta"])

    vectors = asyncio.run(run())
    assert len(vectors) == 2


def test_missing_api_key_does_not_call_provider() -> None:
    def handler(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("provider should not be called")

    async def run() -> None:
        client = _client(httpx.MockTransport(handler), api_key="  ")
        await client.embed(["refund policy"])

    with pytest.raises(AppError) as caught:
        asyncio.run(run())

    assert caught.value.code == "EMBEDDING_UNAVAILABLE"


def test_malformed_success_is_not_retried() -> None:
    calls = {"count": 0}

    def handler(_request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        return httpx.Response(200, json={"embeddings": [{"values": [1, 2, 3]}]})

    async def run() -> None:
        client = _client(httpx.MockTransport(handler), sleeps=[])
        await client.embed(["refund policy"])

    with pytest.raises(AppError):
        asyncio.run(run())

    assert calls["count"] == 1
