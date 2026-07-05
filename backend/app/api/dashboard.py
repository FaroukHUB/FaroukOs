from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.company import Company
from app.models.enums import TaskPriority, TaskStatus
from app.models.task import Task
from app.schemas.dashboard import CompanySummary, DashboardResponse, WeekProgress
from app.services.date_utils import get_week_bounds

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

OVERLOAD_MINUTES = 10 * 60


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    today = date.today()
    week_start, week_end = get_week_bounds(today)

    today_tasks = (
        db.execute(select(Task).where(Task.planned_date == today)).scalars().all()
    )
    workload_today_minutes = sum(t.estimated_minutes for t in today_tasks)
    tasks_today_completed_count = sum(
        1 for t in today_tasks if t.status == TaskStatus.TERMINE
    )

    priority_tasks_today = [
        t
        for t in today_tasks
        if t.priority == TaskPriority.HAUTE and t.status != TaskStatus.TERMINE
    ]

    overdue_tasks = (
        db.execute(
            select(Task)
            .where(Task.planned_date < today, Task.status != TaskStatus.TERMINE)
            .order_by(Task.planned_date)
        )
        .scalars()
        .all()
    )

    companies = db.execute(select(Company).order_by(Company.name)).scalars().all()
    companies_summary: list[CompanySummary] = []
    for company in companies:
        tasks = (
            db.execute(select(Task).where(Task.company_id == company.id)).scalars().all()
        )
        companies_summary.append(
            CompanySummary(
                company=company,
                todo=sum(1 for t in tasks if t.status == TaskStatus.A_FAIRE),
                in_progress=sum(1 for t in tasks if t.status == TaskStatus.EN_COURS),
                done=sum(1 for t in tasks if t.status == TaskStatus.TERMINE),
                overdue=sum(
                    1
                    for t in tasks
                    if t.planned_date < today and t.status != TaskStatus.TERMINE
                ),
            )
        )

    week_tasks = (
        db.execute(
            select(Task).where(Task.planned_date >= week_start, Task.planned_date <= week_end)
        )
        .scalars()
        .all()
    )
    total_week = len(week_tasks)
    completed_week = sum(1 for t in week_tasks if t.status == TaskStatus.TERMINE)
    percent = round((completed_week / total_week) * 100, 1) if total_week else 0.0

    return DashboardResponse(
        date=today,
        tasks_today_count=len(today_tasks),
        tasks_today_completed_count=tasks_today_completed_count,
        workload_today_minutes=workload_today_minutes,
        overloaded_today=workload_today_minutes > OVERLOAD_MINUTES,
        priority_tasks_today=priority_tasks_today,
        overdue_tasks=overdue_tasks,
        companies_summary=companies_summary,
        week_progress=WeekProgress(
            total_tasks=total_week, completed_tasks=completed_week, percent=percent
        ),
    )
