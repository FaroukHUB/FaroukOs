from datetime import date, datetime, time, timezone

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.enums import Assignee, TaskPriority, TaskStatus


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), nullable=False)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)

    priority: Mapped[TaskPriority] = mapped_column(
        Enum(TaskPriority), nullable=False, default=TaskPriority.MOYENNE
    )
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus), nullable=False, default=TaskStatus.A_FAIRE
    )

    estimated_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    planned_date: Mapped[date] = mapped_column(Date, nullable=False)
    planned_time: Mapped[time | None] = mapped_column(Time, nullable=True)

    assignee: Mapped[Assignee] = mapped_column(
        Enum(Assignee), nullable=False, default=Assignee.MOI
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    company = relationship("Company", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")
