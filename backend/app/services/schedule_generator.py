"""Génère une semaine de travail réaliste (lundi-vendredi), toutes entreprises
confondues, en respectant une charge quotidienne de 7h30 à 9h30 et en piochant
dans la bibliothèque de tâches de chaque entreprise (task_templates.py).

Règle absolue : chaque tâche générée appartient à une seule entreprise. Les
listes de tâches par entreprise (TASK_TEMPLATES) ne sont jamais mélangées.
"""

import random
from datetime import date, timedelta

from app.models.category import Category
from app.models.company import Company
from app.models.enums import Assignee, TaskPriority, TaskStatus
from app.models.task import Task
from app.services.task_templates import FRIDAY_RECURRING, MONDAY_RECURRING, TASK_TEMPLATES

DAILY_MINUTES_MIN = 7 * 60 + 30  # 7h30
DAILY_MINUTES_MAX = 9 * 60 + 30  # 9h30

PRIORITY_WEIGHTS = [
    (TaskPriority.HAUTE, 0.2),
    (TaskPriority.MOYENNE, 0.5),
    (TaskPriority.BASSE, 0.3),
]
ASSIGNEE_WEIGHTS = [
    (Assignee.MOI, 0.7),
    (Assignee.RENFORT_1, 0.15),
    (Assignee.RENFORT_2, 0.15),
]


def _weighted_choice(weighted: list[tuple]):
    values, weights = zip(*weighted)
    return random.choices(values, weights=weights, k=1)[0]


def _make_task(
    title: str,
    company: Company,
    category: Category | None,
    minutes: int,
    day: date,
    priority: TaskPriority,
    assignee: Assignee,
) -> Task:
    return Task(
        title=title,
        company_id=company.id,
        category_id=category.id if category else None,
        priority=priority,
        status=TaskStatus.A_FAIRE,
        estimated_minutes=minutes,
        planned_date=day,
        assignee=assignee,
    )


def _company_daily_shares(companies: list[Company], total_minutes: int) -> dict[int, int]:
    """Répartit le budget du jour entre entreprises, avec une part aléatoire
    (jamais un partage identique deux jours de suite)."""
    weights = {c.id: random.uniform(0.6, 1.4) for c in companies}
    weight_sum = sum(weights.values())
    return {
        company_id: round(total_minutes * weight / weight_sum)
        for company_id, weight in weights.items()
    }


def generate_week_tasks(
    companies: list[Company],
    categories_by_company: dict[str, dict[str, Category]],
    week_start: date,
) -> list[Task]:
    tasks: list[Task] = []

    for day_offset in range(5):
        day = week_start + timedelta(days=day_offset)
        daily_target = random.randint(DAILY_MINUTES_MIN, DAILY_MINUTES_MAX)
        recurring_minutes = 0

        recurring_set = None
        if day_offset == 0:
            recurring_set = MONDAY_RECURRING
        elif day_offset == 4:
            recurring_set = FRIDAY_RECURRING

        if recurring_set:
            for company in companies:
                cat_map = categories_by_company.get(company.slug, {})
                for title, category_name, minutes in recurring_set:
                    category = cat_map.get(category_name) if category_name else None
                    priority = TaskPriority.HAUTE if "rapport" in title.lower() else TaskPriority.MOYENNE
                    tasks.append(
                        _make_task(title, company, category, minutes, day, priority, Assignee.MOI)
                    )
                    recurring_minutes += minutes

        remaining = max(daily_target - recurring_minutes, 0)
        company_budgets = _company_daily_shares(companies, remaining)

        for company in companies:
            budget = company_budgets[company.id]
            pool = list(TASK_TEMPLATES.get(company.slug, []))
            random.shuffle(pool)
            cat_map = categories_by_company.get(company.slug, {})
            used = 0
            for title, category_name, minutes in pool:
                if used >= budget:
                    break
                # Ignore les tâches trop longues pour la place restante (sauf la
                # toute première, pour garantir au moins une tâche par entreprise) :
                # on continue à chercher une tâche plus courte plutôt que de
                # dépasser largement le budget du jour.
                if used > 0 and used + minutes > budget:
                    continue
                category = cat_map.get(category_name) if category_name else None
                priority = _weighted_choice(PRIORITY_WEIGHTS)
                assignee = _weighted_choice(ASSIGNEE_WEIGHTS)
                tasks.append(
                    _make_task(title, company, category, minutes, day, priority, assignee)
                )
                used += minutes

    return tasks
