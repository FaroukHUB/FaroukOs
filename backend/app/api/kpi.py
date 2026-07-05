from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kpi import KPIEntry
from app.schemas.kpi import KPIEntryCreate, KPIEntryOut
from app.services.kpi_metrics import get_metrics_for_slug
from app.services.task_rules import get_company_or_404

router = APIRouter(prefix="/api/kpi", tags=["kpi"])


@router.get("", response_model=list[KPIEntryOut])
def list_kpi(
    company_id: int | None = None,
    week_start_date: date | None = None,
    db: Session = Depends(get_db),
):
    query = select(KPIEntry)
    if company_id is not None:
        query = query.where(KPIEntry.company_id == company_id)
    if week_start_date is not None:
        query = query.where(KPIEntry.week_start_date == week_start_date)
    query = query.order_by(KPIEntry.week_start_date.desc())
    return db.execute(query).scalars().all()


@router.post("", response_model=KPIEntryOut, status_code=201)
def upsert_kpi(payload: KPIEntryCreate, db: Session = Depends(get_db)):
    company = get_company_or_404(db, payload.company_id)

    allowed_keys = {m["key"] for m in get_metrics_for_slug(company.slug)}
    if payload.metric_key not in allowed_keys:
        raise HTTPException(
            status_code=400,
            detail=f"Métrique '{payload.metric_key}' inconnue pour {company.name}",
        )

    week_monday = payload.week_start_date - timedelta(days=payload.week_start_date.weekday())

    existing = db.execute(
        select(KPIEntry).where(
            KPIEntry.company_id == payload.company_id,
            KPIEntry.metric_key == payload.metric_key,
            KPIEntry.week_start_date == week_monday,
        )
    ).scalar_one_or_none()

    if existing:
        existing.value = payload.value
        db.commit()
        db.refresh(existing)
        return existing

    entry = KPIEntry(
        company_id=payload.company_id,
        metric_key=payload.metric_key,
        week_start_date=week_monday,
        value=payload.value,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
