from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.company import Company


def get_company_or_404(db: Session, company_id: int) -> Company:
    company = db.get(Company, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")
    return company


def validate_category_for_company(db: Session, company_id: int, category_id: int | None) -> None:
    """Une tâche ne peut utiliser qu'une catégorie appartenant à la même entreprise."""
    if category_id is None:
        return
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=400, detail="Catégorie introuvable")
    if category.company_id != company_id:
        raise HTTPException(
            status_code=400,
            detail="Cette catégorie n'appartient pas à cette entreprise",
        )
