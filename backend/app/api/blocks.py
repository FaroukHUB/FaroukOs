from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.time_block import TimeBlock
from app.schemas.time_block import TimeBlockCreate, TimeBlockOut, TimeBlockUpdate
from app.services.task_rules import get_company_or_404

router = APIRouter(prefix="/api/blocks", tags=["blocks"])


@router.get("", response_model=list[TimeBlockOut])
def list_blocks(db: Session = Depends(get_db)):
    return db.execute(select(TimeBlock).order_by(TimeBlock.start_time)).scalars().all()


@router.post("", response_model=TimeBlockOut, status_code=201)
def create_block(payload: TimeBlockCreate, db: Session = Depends(get_db)):
    if payload.company_id is not None:
        get_company_or_404(db, payload.company_id)
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="L'heure de fin doit être après l'heure de début")

    max_position = db.execute(select(TimeBlock)).scalars().all()
    next_position = (max((b.position for b in max_position), default=-1)) + 1

    block = TimeBlock(
        label=payload.label,
        company_id=payload.company_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        position=next_position,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.patch("/{block_id}", response_model=TimeBlockOut)
def update_block(block_id: int, payload: TimeBlockUpdate, db: Session = Depends(get_db)):
    block = db.get(TimeBlock, block_id)
    if block is None:
        raise HTTPException(status_code=404, detail="Bloc introuvable")

    data = payload.model_dump(exclude_unset=True)
    if "company_id" in data and data["company_id"] is not None:
        get_company_or_404(db, data["company_id"])

    for field, value in data.items():
        setattr(block, field, value)

    if block.end_time <= block.start_time:
        raise HTTPException(status_code=400, detail="L'heure de fin doit être après l'heure de début")

    db.commit()
    db.refresh(block)
    return block


@router.delete("/{block_id}", status_code=204)
def delete_block(block_id: int, db: Session = Depends(get_db)):
    block = db.get(TimeBlock, block_id)
    if block is None:
        raise HTTPException(status_code=404, detail="Bloc introuvable")
    db.delete(block)
    db.commit()
