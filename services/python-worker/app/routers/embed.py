from fastapi import APIRouter, Depends

from app.clients.embedding import EmbeddingClient
from app.clients.gemini_embedding import GeminiEmbeddingClient
from app.config import settings
from app.handlers.embed import EmbedHandler
from app.schemas.embed import EmbedRequest, EmbedResponse
from app.services.embed import EmbedService

router = APIRouter()


def get_embedding_client() -> EmbeddingClient:
    return GeminiEmbeddingClient(
        api_key=settings.llm_api_key,
        model=settings.llm_embedding_model,
        dimensions=settings.embedding_dimensions,
        provider=settings.llm_provider,
    )


def get_embed_service(client: EmbeddingClient = Depends(get_embedding_client)) -> EmbedService:
    return EmbedService(client)


def get_embed_handler(service: EmbedService = Depends(get_embed_service)) -> EmbedHandler:
    return EmbedHandler(service)


@router.post("/embed", response_model=EmbedResponse)
async def embed_text(
    body: EmbedRequest,
    handler: EmbedHandler = Depends(get_embed_handler),
) -> EmbedResponse:
    return await handler.embed(body)
