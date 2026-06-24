from fastapi import FastAPI

from app.config import settings

app = FastAPI(title="KnowFlow Python Worker", version="0.0.0")


@app.get("/health")
async def health() -> dict:
    return {"data": {"status": "ok"}}


@app.on_event("startup")
async def startup() -> None:
    print(f"KnowFlow Python worker listening on http://localhost:{settings.port}")
