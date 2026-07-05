from datetime import date

from pydantic import BaseModel

from app.schemas.company import CompanyOut
from app.schemas.task import TaskOut


class CompanySummary(BaseModel):
    company: CompanyOut
    todo: int
    in_progress: int
    done: int
    overdue: int


class WeekProgress(BaseModel):
    total_tasks: int
    completed_tasks: int
    percent: float


class DashboardResponse(BaseModel):
    date: date
    tasks_today_count: int
    tasks_today_completed_count: int
    workload_today_minutes: int
    overloaded_today: bool
    priority_tasks_today: list[TaskOut]
    overdue_tasks: list[TaskOut]
    companies_summary: list[CompanySummary]
    week_progress: WeekProgress
