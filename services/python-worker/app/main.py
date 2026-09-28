from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.errors.handlers import register_exception_handlers
from app.routers.embed import router as embed_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    print(f"KnowFlow Python worker listening on http://localhost:{settings.port}")
    yield


app = FastAPI(title="KnowFlow Python Worker", version="0.0.0", lifespan=lifespan)
register_exception_handlers(app)
app.include_router(embed_router)


@app.get("/health")
async def health() -> dict[str, dict[str, str]]:
    data: dict[str, str] = {"status": "ok"}
    if settings.llm_api_key.strip():
        data["embeddingModel"] = settings.llm_embedding_model
    return {"data": data}
