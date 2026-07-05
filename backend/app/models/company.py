from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    categories = relationship(
        "Category", back_populates="company", cascade="all, delete-orphan"
    )
    tasks = relationship("Task", back_populates="company", cascade="all, delete-orphan")
    kpi_entries = relationship(
        "KPIEntry", back_populates="company", cascade="all, delete-orphan"
    )
    prompts = relationship(
        "PromptTemplate", back_populates="company", cascade="all, delete-orphan"
    )
