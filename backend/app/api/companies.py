from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.company import Company
from app.models.kpi import KPIEntry
from app.models.prompt import PromptTemplate
from app.models.task import Task
from app.schemas.category import CategoryOut
from app.schemas.company import CompanyOut
from app.schemas.kpi import KPIEntryOut
from app.schemas.prompt import PromptOut
from app.schemas.task import TaskOut
from app.schemas.workflow import WorkflowOut
from app.services.task_rules import get_company_or_404
from app.services.workflows import get_workflows_for_slug

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.get("", response_model=list[CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return db.execute(select(Company).order_by(Company.name)).scalars().all()


@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    return get_company_or_404(db, company_id)


@router.get("/{company_id}/categories", response_model=list[CategoryOut])
def list_company_categories(company_id: int, db: Session = Depends(get_db)):
    get_company_or_404(db, company_id)
    return (
        db.execute(
            select(Category).where(Category.company_id == company_id).order_by(Category.name)
        )
        .scalars()
        .all()
    )


@router.get("/{company_id}/tasks", response_model=list[TaskOut])
def list_company_tasks(company_id: int, db: Session = Depends(get_db)):
    get_company_or_404(db, company_id)
    return (
        db.execute(
            select(Task)
            .where(Task.company_id == company_id)
            .order_by(Task.planned_date, Task.id)
        )
        .scalars()
        .all()
    )


@router.get("/{company_id}/kpi", response_model=list[KPIEntryOut])
def list_company_kpi(company_id: int, db: Session = Depends(get_db)):
    get_company_or_404(db, company_id)
    return (
        db.execute(
            select(KPIEntry)
            .where(KPIEntry.company_id == company_id)
            .order_by(KPIEntry.week_start_date.desc())
        )
        .scalars()
        .all()
    )


@router.get("/{company_id}/prompts", response_model=list[PromptOut])
def list_company_prompts(company_id: int, db: Session = Depends(get_db)):
    get_company_or_404(db, company_id)
    return (
        db.execute(select(PromptTemplate).where(PromptTemplate.company_id == company_id))
        .scalars()
        .all()
    )


@router.get("/{company_id}/workflows", response_model=list[WorkflowOut])
def list_company_workflows(company_id: int, db: Session = Depends(get_db)):
    company = get_company_or_404(db, company_id)
    workflows = get_workflows_for_slug(company.slug)
    return [
        {
            "name": w["name"],
            "items": [
                {"title": title, "category_name": category_name, "minutes": minutes}
                for title, category_name, minutes in w["items"]
            ],
        }
        for w in workflows
    ]
