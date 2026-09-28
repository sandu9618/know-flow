from app.config import settings
from app.schemas.embed import EmbedMeta, EmbedRequest, EmbedResponse
from app.services.embed import EmbedService


class EmbedHandler:
    def __init__(self, embed_service: EmbedService) -> None:
        self._embed_service = embed_service

    async def embed(self, body: EmbedRequest) -> EmbedResponse:
        vectors = await self._embed_service.embed_batch(body.text, body.texts)
        dimensions = len(vectors[0]) if vectors else settings.embedding_dimensions
        return EmbedResponse(
            data=vectors,
            meta=EmbedMeta(
                count=len(vectors),
                dimensions=dimensions,
                model=settings.llm_embedding_model,
            ),
        )
