from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.enums import PromptType
from app.models.prompt import PromptTemplate
from app.schemas.prompt import PromptCreate, PromptOut, PromptUpdate
from app.services.task_rules import get_company_or_404

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.get("", response_model=list[PromptOut])
def list_prompts(
    company_id: int | None = None,
    prompt_type: PromptType | None = None,
    db: Session = Depends(get_db),
):
    query = select(PromptTemplate)
    if company_id is not None:
        query = query.where(PromptTemplate.company_id == company_id)
    if prompt_type is not None:
        query = query.where(PromptTemplate.prompt_type == prompt_type)
    return db.execute(query).scalars().all()


@router.post("", response_model=PromptOut, status_code=201)
def create_prompt(payload: PromptCreate, db: Session = Depends(get_db)):
    get_company_or_404(db, payload.company_id)
    prompt = PromptTemplate(**payload.model_dump())
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.patch("/{prompt_id}", response_model=PromptOut)
def update_prompt(prompt_id: int, payload: PromptUpdate, db: Session = Depends(get_db)):
    prompt = db.get(PromptTemplate, prompt_id)
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt introuvable")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(prompt, field, value)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.delete("/{prompt_id}", status_code=204)
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.get(PromptTemplate, prompt_id)
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt introuvable")
    db.delete(prompt)
    db.commit()
