from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.enums import Assignee, TaskPriority, TaskStatus
from app.models.task import Task
from app.schemas.task import DaySummary, TaskCreate, TaskOut, TaskUpdate, TodayResponse, WeekResponse
from app.schemas.workflow import ApplyWorkflowRequest
from app.services.date_utils import get_week_bounds
from app.services.task_rules import (
    get_company_or_404,
    validate_block_for_company,
    validate_category_for_company,
)
from app.services.workflows import get_workflows_for_slug

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

OVERLOAD_MINUTES = 10 * 60
WEEKDAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]


@router.get("", response_model=list[TaskOut])
def list_tasks(
    company_id: int | None = None,
    category_id: int | None = None,
    block_id: int | None = None,
    status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    planned_date: date | None = None,
    assignee: Assignee | None = None,
    db: Session = Depends(get_db),
):
    query = select(Task)
    if company_id is not None:
        query = query.where(Task.company_id == company_id)
    if category_id is not None:
        query = query.where(Task.category_id == category_id)
    if block_id is not None:
        query = query.where(Task.block_id == block_id)
    if status is not None:
        query = query.where(Task.status == status)
    if priority is not None:
        query = query.where(Task.priority == priority)
    if planned_date is not None:
        query = query.where(Task.planned_date == planned_date)
    if assignee is not None:
        query = query.where(Task.assignee == assignee)
    query = query.order_by(Task.planned_date, Task.id)
    return db.execute(query).scalars().all()


@router.get("/today", response_model=TodayResponse)
def get_today_tasks(db: Session = Depends(get_db)):
    today = date.today()
    tasks = (
        db.execute(select(Task).where(Task.planned_date == today).order_by(Task.id))
        .scalars()
        .all()
    )
    total_minutes = sum(t.estimated_minutes for t in tasks)
    return TodayResponse(
        date=today,
        tasks=tasks,
        total_estimated_minutes=total_minutes,
        overloaded=total_minutes > OVERLOAD_MINUTES,
    )


@router.get("/week", response_model=WeekResponse)
def get_week_tasks(db: Session = Depends(get_db)):
    today = date.today()
    week_start, week_end = get_week_bounds(today)

    tasks = (
        db.execute(
            select(Task)
            .where(Task.planned_date >= week_start, Task.planned_date <= week_end)
            .order_by(Task.planned_date, Task.id)
        )
        .scalars()
        .all()
    )

    days: list[DaySummary] = []
    for offset in range(5):
        day = week_start + timedelta(days=offset)
        day_tasks = [t for t in tasks if t.planned_date == day]
        total_minutes = sum(t.estimated_minutes for t in day_tasks)
        companies = sorted({t.company.name for t in day_tasks})
        days.append(
            DaySummary(
                date=day,
                weekday_label=WEEKDAY_LABELS[offset],
                total_estimated_minutes=total_minutes,
                overloaded=total_minutes > OVERLOAD_MINUTES,
                companies=companies,
                tasks=day_tasks,
            )
        )

    return WeekResponse(week_start=week_start, week_end=week_end, days=days)


@router.post("", response_model=TaskOut, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    get_company_or_404(db, payload.company_id)
    validate_category_for_company(db, payload.company_id, payload.category_id)
    validate_block_for_company(db, payload.company_id, payload.block_id)

    task = Task(**payload.model_dump())
    if task.status == TaskStatus.TERMINE:
        task.completed_at = datetime.now(timezone.utc)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.post("/apply-workflow", response_model=list[TaskOut], status_code=201)
def apply_workflow(payload: ApplyWorkflowRequest, db: Session = Depends(get_db)):
    """Crée d'un coup toutes les sous-tâches d'un workflow (ex: "Nouvelle
    fiche produit") pour une entreprise, une date et un bloc donnés."""
    company = get_company_or_404(db, payload.company_id)
    validate_block_for_company(db, payload.company_id, payload.block_id)

    workflow = next(
        (w for w in get_workflows_for_slug(company.slug) if w["name"] == payload.workflow_name),
        None,
    )
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow introuvable pour cette entreprise")

    categories_by_name = {
        c.name: c
        for c in db.execute(select(Category).where(Category.company_id == company.id)).scalars()
    }

    created: list[Task] = []
    for title, category_name, minutes in workflow["items"]:
        category = categories_by_name.get(category_name) if category_name else None
        task = Task(
            title=title,
            company_id=company.id,
            category_id=category.id if category else None,
            block_id=payload.block_id,
            estimated_minutes=minutes,
            planned_date=payload.planned_date,
            assignee=payload.assignee,
        )
        db.add(task)
        created.append(task)

    db.commit()
    for task in created:
        db.refresh(task)
    return created


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")

    data = payload.model_dump(exclude_unset=True)

    target_company_id = data.get("company_id", task.company_id)
    if "company_id" in data:
        get_company_or_404(db, target_company_id)
    if "category_id" in data or "company_id" in data:
        validate_category_for_company(
            db, target_company_id, data.get("category_id", task.category_id)
        )
    if "block_id" in data or "company_id" in data:
        validate_block_for_company(db, target_company_id, data.get("block_id", task.block_id))

    for field, value in data.items():
        setattr(task, field, value)

    if "status" in data:
        if data["status"] == TaskStatus.TERMINE and task.completed_at is None:
            task.completed_at = datetime.now(timezone.utc)
        elif data["status"] != TaskStatus.TERMINE:
            task.completed_at = None

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    db.delete(task)
    db.commit()
