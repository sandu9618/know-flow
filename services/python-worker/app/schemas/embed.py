from pydantic import BaseModel


class EmbedRequest(BaseModel):
    text: str | None = None
    texts: list[str] | None = None


class EmbedMeta(BaseModel):
    count: int
    dimensions: int
    model: str


class EmbedResponse(BaseModel):
    data: list[list[float]]
    meta: EmbedMeta
