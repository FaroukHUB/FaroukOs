from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class KPIEntryCreate(BaseModel):
    company_id: int
    metric_key: str
    week_start_date: date
    value: float


class KPIEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    metric_key: str
    week_start_date: date
    value: float
    created_at: datetime
    updated_at: datetime
