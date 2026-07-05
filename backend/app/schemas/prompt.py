from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import PromptType


class PromptCreate(BaseModel):
    company_id: int
    prompt_type: PromptType
    title: str
    content: str


class PromptUpdate(BaseModel):
    prompt_type: PromptType | None = None
    title: str | None = None
    content: str | None = None


class PromptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    prompt_type: PromptType
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
