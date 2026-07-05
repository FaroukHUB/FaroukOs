from datetime import time

from pydantic import BaseModel, ConfigDict


class TimeBlockCreate(BaseModel):
    label: str
    company_id: int | None = None
    start_time: time
    end_time: time


class TimeBlockUpdate(BaseModel):
    label: str | None = None
    company_id: int | None = None
    start_time: time | None = None
    end_time: time | None = None


class TimeBlockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    company_id: int | None
    start_time: time
    end_time: time
    position: int
