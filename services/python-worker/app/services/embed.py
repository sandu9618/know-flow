from app.clients.embedding import EmbeddingClient
from app.config import settings
from app.errors.app_error import AppError

MAX_BATCH_SIZE = 50


class EmbedService:
    def __init__(self, client: EmbeddingClient) -> None:
        self._client = client

    async def embed_batch(self, text: str | None, texts: list[str] | None) -> list[list[float]]:
        normalized = self._normalize(text, texts)
        vectors = await self._client.embed(normalized)
        dimensions = settings.embedding_dimensions

        if len(vectors) != len(normalized) or any(len(vector) != dimensions for vector in vectors):
            raise AppError(
                "EMBEDDING_UNAVAILABLE",
                "The embedding service returned an unexpected vector size.",
                503,
            )

        return vectors

    def _normalize(self, text: str | None, texts: list[str] | None) -> list[str]:
        has_text = text is not None
        has_texts = texts is not None
        if has_text == has_texts:
            raise AppError(
                "EMBED_INPUT_INVALID",
                "Provide exactly one of text or texts.",
                400,
            )

        items = [text] if text is not None else list(texts or [])
        if not 1 <= len(items) <= MAX_BATCH_SIZE:
            raise AppError(
                "BATCH_SIZE_INVALID",
                "Batch must be 1–50 texts.",
                400,
            )

        normalized: list[str] = []
        for item in items:
            stripped = item.strip()
            if not stripped:
                raise AppError(
                    "EMBED_INPUT_INVALID",
                    "Each text must be non-empty.",
                    400,
                )
            normalized.append(stripped)

        return normalized
