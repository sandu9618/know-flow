import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.errors.app_error import AppError
from app.main import app
from app.routers.embed import get_embedding_client


class FakeEmbeddingClient:
    def __init__(self, dimensions: int | None = None) -> None:
        self.dimensions = settings.embedding_dimensions if dimensions is None else dimensions
        self.calls: list[list[str]] = []

    async def embed(self, texts: list[str]) -> list[list[float]]:
        self.calls.append(texts)
        return [[0.1] * self.dimensions for _ in texts]


class FailingEmbeddingClient:
    async def embed(self, texts: list[str]) -> list[list[float]]:
        raise AppError(
            "EMBEDDING_UNAVAILABLE",
            "The embedding service could not complete the request. Please try again shortly.",
            503,
        )


@pytest.fixture
def fake_client() -> FakeEmbeddingClient:
    fake = FakeEmbeddingClient()
    app.dependency_overrides[get_embedding_client] = lambda: fake
    yield fake
    app.dependency_overrides.clear()


def test_health_reports_ok() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["status"] == "ok"


def test_embed_single_text_returns_expected_dimension(fake_client: FakeEmbeddingClient) -> None:
    with TestClient(app) as client:
        response = client.post("/embed", json={"text": "refund policy"})

    assert response.status_code == 200
    body = response.json()
    assert body["meta"]["count"] == 1
    assert body["meta"]["dimensions"] == settings.embedding_dimensions
    assert body["meta"]["model"] == settings.llm_embedding_model
    assert len(body["data"]) == 1
    assert len(body["data"][0]) == settings.embedding_dimensions
    assert fake_client.calls == [["refund policy"]]


def test_embed_batch_returns_one_vector_per_text(fake_client: FakeEmbeddingClient) -> None:
    texts = [f"chunk {index}" for index in range(10)]

    with TestClient(app) as client:
        response = client.post("/embed", json={"texts": texts})

    assert response.status_code == 200
    body = response.json()
    assert body["meta"]["count"] == 10
    assert len(body["data"]) == 10
    assert all(len(vector) == settings.embedding_dimensions for vector in body["data"])
    assert fake_client.calls == [texts]


def test_embed_rejects_batch_over_50(fake_client: FakeEmbeddingClient) -> None:
    with TestClient(app) as client:
        response = client.post("/embed", json={"texts": [f"chunk {index}" for index in range(51)]})

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "BATCH_SIZE_INVALID"
    assert fake_client.calls == []


def test_embed_rejects_both_text_and_texts(fake_client: FakeEmbeddingClient) -> None:
    with TestClient(app) as client:
        response = client.post("/embed", json={"text": "one", "texts": ["two"]})

    assert response.status_code == 400
    assert response.json()["error"] == {
        "code": "EMBED_INPUT_INVALID",
        "message": "Provide exactly one of text or texts.",
        "details": None,
    }
    assert fake_client.calls == []


def test_embed_rejects_empty_text(fake_client: FakeEmbeddingClient) -> None:
    with TestClient(app) as client:
        response = client.post("/embed", json={"text": "   "})

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "EMBED_INPUT_INVALID"
    assert fake_client.calls == []


def test_embed_rejects_non_string_input() -> None:
    with TestClient(app) as client:
        response = client.post("/embed", json={"text": 12})

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "EMBED_INPUT_INVALID"


def test_embed_maps_client_failure_to_503() -> None:
    app.dependency_overrides[get_embedding_client] = lambda: FailingEmbeddingClient()
    try:
        with TestClient(app) as client:
            response = client.post("/embed", json={"text": "refund policy"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "EMBEDDING_UNAVAILABLE"


def test_embed_rejects_unexpected_vector_size() -> None:
    app.dependency_overrides[get_embedding_client] = lambda: FakeEmbeddingClient(dimensions=3)
    try:
        with TestClient(app) as client:
            response = client.post("/embed", json={"text": "refund policy"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "EMBEDDING_UNAVAILABLE"
