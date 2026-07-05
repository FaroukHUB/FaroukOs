from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.assignee_label import AssigneeLabel
from app.schemas.assignee import AssigneeLabelOut, AssigneeLabelUpdate

router = APIRouter(prefix="/api/assignees", tags=["assignees"])


@router.get("", response_model=list[AssigneeLabelOut])
def list_assignees(db: Session = Depends(get_db)):
    return db.execute(select(AssigneeLabel)).scalars().all()


@router.patch("/{key}", response_model=AssigneeLabelOut)
def update_assignee_label(key: str, payload: AssigneeLabelUpdate, db: Session = Depends(get_db)):
    assignee = db.get(AssigneeLabel, key)
    if assignee is None:
        raise HTTPException(status_code=404, detail="Assigné introuvable")
    label = payload.label.strip()
    if not label:
        raise HTTPException(status_code=400, detail="Le nom ne peut pas être vide")
    assignee.label = label
    db.commit()
    db.refresh(assignee)
    return assignee
