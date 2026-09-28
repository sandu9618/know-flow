import asyncio
import logging
from collections.abc import Awaitable, Callable

import httpx

from app.errors.app_error import AppError

logger = logging.getLogger(__name__)

INITIAL_BACKOFF_SECONDS = 0.5
MAX_ATTEMPTS = 3
REQUEST_TIMEOUT_SECONDS = 30.0

Sleep = Callable[[float], Awaitable[None]]


class _TransientEmbeddingError(Exception):
    pass


class _PermanentEmbeddingError(Exception):
    def __init__(self, status_code: int) -> None:
        super().__init__(f"embedding request failed with status {status_code}")
        self.status_code = status_code


class GeminiEmbeddingClient:
    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        dimensions: int,
        provider: str,
        transport: httpx.AsyncBaseTransport | None = None,
        sleep: Sleep | None = None,
        max_attempts: int = MAX_ATTEMPTS,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._dimensions = dimensions
        self._provider = provider
        self._transport = transport
        self._sleep = sleep or self._default_sleep
        self._max_attempts = max_attempts

    async def embed(self, texts: list[str]) -> list[list[float]]:
        self._ensure_configured()

        async with httpx.AsyncClient(
            timeout=REQUEST_TIMEOUT_SECONDS,
            transport=self._transport,
        ) as client:
            for attempt in range(self._max_attempts):
                try:
                    return await self._request(client, texts)
                except _TransientEmbeddingError:
                    if attempt + 1 >= self._max_attempts:
                        break
                    delay = INITIAL_BACKOFF_SECONDS * (2**attempt)
                    logger.warning(
                        "transient embedding failure; retrying attempt=%s",
                        attempt + 1,
                    )
                    await self._sleep(delay)
                except _PermanentEmbeddingError as exc:
                    raise self._permanent_error(exc.status_code) from exc

        raise AppError(
            "EMBEDDING_UNAVAILABLE",
            "The embedding service could not complete the request. Please try again shortly.",
            503,
        )

    def _ensure_configured(self) -> None:
        if self._provider != "gemini":
            raise AppError(
                "EMBEDDING_UNAVAILABLE",
                "Embeddings are only available when LLM_PROVIDER is gemini.",
                503,
            )

        if not self._api_key.strip():
            raise AppError(
                "EMBEDDING_UNAVAILABLE",
                "Embedding is not configured. Check LLM_API_KEY.",
                503,
            )

    async def _request(self, client: httpx.AsyncClient, texts: list[str]) -> list[list[float]]:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self._model}:batchEmbedContents"
        )
        payload = {
            "requests": [
                {
                    "model": f"models/{self._model}",
                    "content": {"parts": [{"text": text}]},
                    "output_dimensionality": self._dimensions,
                }
                for text in texts
            ]
        }

        try:
            response = await client.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": self._api_key,
                },
                json=payload,
            )
        except httpx.TimeoutException as exc:
            raise _TransientEmbeddingError() from exc
        except httpx.RequestError as exc:
            raise _TransientEmbeddingError() from exc

        if response.status_code == 429 or response.status_code >= 500:
            raise _TransientEmbeddingError()

        if response.status_code != 200:
            raise _PermanentEmbeddingError(response.status_code)

        return self._parse_embeddings(response, len(texts))

    def _parse_embeddings(self, response: httpx.Response, expected_count: int) -> list[list[float]]:
        try:
            payload = response.json()
        except ValueError as exc:
            raise _PermanentEmbeddingError(response.status_code) from exc

        embeddings = payload.get("embeddings") if isinstance(payload, dict) else None
        if not isinstance(embeddings, list) or len(embeddings) != expected_count:
            raise _PermanentEmbeddingError(response.status_code)

        vectors: list[list[float]] = []
        for item in embeddings:
            values = item.get("values") if isinstance(item, dict) else None
            if not isinstance(values, list) or len(values) != self._dimensions:
                raise _PermanentEmbeddingError(response.status_code)

            vector: list[float] = []
            for value in values:
                if isinstance(value, bool) or not isinstance(value, (int, float)):
                    raise _PermanentEmbeddingError(response.status_code)
                vector.append(float(value))
            vectors.append(vector)

        return vectors

    def _permanent_error(self, status_code: int) -> AppError:
        if status_code in (401, 403):
            message = "Embedding is not configured correctly. Check LLM_API_KEY."
        elif status_code in (400, 404):
            message = "The configured embedding model is unavailable. Check LLM_EMBEDDING_MODEL."
        else:
            message = "The embedding service could not complete the request."

        return AppError("EMBEDDING_UNAVAILABLE", message, 503)

    @staticmethod
    async def _default_sleep(delay: float) -> None:
        await asyncio.sleep(delay)
