from datetime import date, timedelta


def get_week_bounds(today: date) -> tuple[date, date]:
    """Lundi-vendredi de la semaine de travail en cours.

    Le week-end n'a pas de semaine de travail : samedi/dimanche affichent
    la semaine à venir plutôt qu'une semaine déjà terminée.
    """
    weekday = today.weekday()  # Lundi=0 ... Dimanche=6
    if weekday >= 5:
        week_start = today + timedelta(days=7 - weekday)
    else:
        week_start = today - timedelta(days=weekday)
    return week_start, week_start + timedelta(days=4)
