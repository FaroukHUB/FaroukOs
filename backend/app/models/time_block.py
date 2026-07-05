from datetime import time

from sqlalchemy import ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TimeBlock(Base):
    """Bloc horaire de la journée type (ex: 09h-11h Mobilier Malin).

    Un seul jeu de blocs pour tous les jours ouvrés en V1 — pas de variation
    par jour de la semaine. Un bloc sans company_id est un bloc transverse
    (Organisation, Préparation du lendemain) : les tâches qu'il contient
    appartiennent chacune à une seule entreprise, seul le bloc est neutre.
    """

    __tablename__ = "time_blocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    company_id: Mapped[int | None] = mapped_column(ForeignKey("companies.id"), nullable=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    company = relationship("Company")
