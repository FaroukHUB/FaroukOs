from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict

from app.models.enums import Assignee, TaskPriority, TaskStatus


class TaskBase(BaseModel):
    title: str
    description: str | None = None
    company_id: int
    category_id: int | None = None
    priority: TaskPriority = TaskPriority.MOYENNE
    status: TaskStatus = TaskStatus.A_FAIRE
    estimated_minutes: int = 30
    planned_date: date
    planned_time: time | None = None
    assignee: Assignee = Assignee.MOI
    notes: str | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    company_id: int | None = None
    category_id: int | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    estimated_minutes: int | None = None
    planned_date: date | None = None
    planned_time: time | None = None
    assignee: Assignee | None = None
    notes: str | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    company_id: int
    category_id: int | None
    priority: TaskPriority
    status: TaskStatus
    estimated_minutes: int
    planned_date: date
    planned_time: time | None
    assignee: Assignee
    notes: str | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None


class TodayResponse(BaseModel):
    date: date
    tasks: list[TaskOut]
    total_estimated_minutes: int
    overloaded: bool


class DaySummary(BaseModel):
    date: date
    weekday_label: str
    total_estimated_minutes: int
    overloaded: bool
    companies: list[str]
    tasks: list[TaskOut]


class WeekResponse(BaseModel):
    week_start: date
    week_end: date
    days: list[DaySummary]
