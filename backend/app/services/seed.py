from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.company import Company
from app.models.enums import Assignee, PromptType, TaskPriority, TaskStatus
from app.models.prompt import PromptTemplate
from app.models.task import Task
from app.services.date_utils import get_week_bounds

COMPANIES: list[dict] = [
    {
        "name": "Mobilier Malin",
        "slug": "mobilier-malin",
        "categories": [
            "SEO", "Produits", "Fiches produits", "Catégories", "Collections", "Blog",
            "Pinterest", "Facebook", "Instagram", "Google Merchant Center", "Google Shopping",
            "Search Console", "Analytics", "Maillage interne", "Images", "Meta descriptions",
            "Backlinks",
        ],
    },
    {
        "name": "Trust Industrie",
        "slug": "trust-industrie",
        "categories": [
            "SEO", "Audit SEO", "SEMrush", "H1", "H2", "Titles", "Meta descriptions",
            "Redirections", "404", "Maillage interne", "Catégories", "Produits", "Blog",
            "Backlinks", "Search Console", "Analytics", "Nettoyage SEO",
        ],
    },
    {
        "name": "EasyMove Wear",
        "slug": "easymove-wear",
        "categories": [
            "SEO", "Produits", "Temu", "TikTok Shop", "TikTok", "Pinterest", "Facebook",
            "Instagram", "Fiches produits", "Images", "Contenu", "Search Console", "Analytics",
        ],
    },
    {
        "name": "Dreams Fly",
        "slug": "dreams-fly",
        "categories": [
            "SEO", "Blog", "Contenu", "Facebook", "Instagram", "Pinterest", "Search Console",
            "Analytics",
        ],
    },
]

# (titre, catégorie, priorité, durée en minutes, jour offset depuis aujourd'hui, assigné)
EXAMPLE_TASKS: dict[str, list[tuple]] = {
    "mobilier-malin": [
        ("Optimiser 4 fiches produits", "Fiches produits", TaskPriority.HAUTE, 90, 0, Assignee.MOI),
        ("Créer 5 épingles Pinterest", "Pinterest", TaskPriority.MOYENNE, 60, 0, Assignee.STAGIAIRE_1),
        ("Vérifier Google Merchant Center", "Google Merchant Center", TaskPriority.HAUTE, 30, 1, Assignee.MOI),
        ("Ajouter maillage interne sur 3 produits", "Maillage interne", TaskPriority.BASSE, 45, 2, Assignee.MOI),
    ],
    "trust-industrie": [
        ("Corriger les pages 404 prioritaires", "404", TaskPriority.HAUTE, 60, 0, Assignee.MOI),
        ("Nettoyer les H1 du site", "H1", TaskPriority.MOYENNE, 45, 0, Assignee.MOI),
        ("Optimiser les meta descriptions", "Meta descriptions", TaskPriority.MOYENNE, 60, 1, Assignee.STAGIAIRE_2),
        ("Auditer les catégories principales", "Audit SEO", TaskPriority.HAUTE, 90, 2, Assignee.MOI),
    ],
    "easymove-wear": [
        ("Créer 5 produits Temu", "Temu", TaskPriority.HAUTE, 120, 0, Assignee.STAGIAIRE_1),
        ("Préparer 3 fiches TikTok Shop", "TikTok Shop", TaskPriority.MOYENNE, 60, 0, Assignee.STAGIAIRE_1),
        ("Créer contenu Instagram", "Instagram", TaskPriority.MOYENNE, 45, 1, Assignee.MOI),
        ("Optimiser fiches produits", "Fiches produits", TaskPriority.BASSE, 60, 2, Assignee.STAGIAIRE_2),
    ],
    "dreams-fly": [
        ("Préparer 1 article SEO", "Blog", TaskPriority.HAUTE, 90, 0, Assignee.MOI),
        ("Créer publication Facebook", "Facebook", TaskPriority.MOYENNE, 30, 0, Assignee.MOI),
        ("Vérifier Search Console", "Search Console", TaskPriority.BASSE, 30, 1, Assignee.MOI),
        ("Optimiser une page existante", "SEO", TaskPriority.MOYENNE, 45, 2, Assignee.MOI),
    ],
}

# (type, titre, contenu)
EXAMPLE_PROMPTS: dict[str, list[tuple]] = {
    "mobilier-malin": [
        (
            PromptType.FICHE_PRODUIT_SEO,
            "Fiche produit SEO – Mobilier Malin",
            "Tu es un expert en copywriting SEO e-commerce pour Mobilier Malin, un site de "
            "vente de mobilier. Rédige une fiche produit optimisée pour le produit suivant : "
            "[nom du produit], [caractéristiques principales]. Fournis : un titre SEO (60 "
            "caractères max), une description courte (2-3 phrases), une description longue "
            "(structurée en paragraphes avec les avantages et l'usage), une meta description "
            "(155 caractères max) et 5 mots-clés SEO pertinents. Ton : chaleureux, clair, "
            "orienté conversion.",
        ),
        (
            PromptType.EPINGLE_PINTEREST,
            "Épingle Pinterest – Mobilier Malin",
            "Tu es responsable Pinterest pour Mobilier Malin. Rédige le texte d'une épingle "
            "pour le produit ou l'article suivant : [nom du produit / lien blog]. Fournis : un "
            "titre accrocheur (100 caractères max), une description optimisée SEO (500 "
            "caractères max) avec mots-clés déco/mobilier, et 3 suggestions de hashtags.",
        ),
        (
            PromptType.MAILLAGE_INTERNE,
            "Maillage interne – Mobilier Malin",
            "Tu es consultant SEO pour Mobilier Malin. Voici une page cible : [URL/nom de la "
            "page]. Propose 5 opportunités de liens internes pertinents depuis d'autres pages "
            "du site ([liste de pages ou catégories]), avec pour chacune : la page source, "
            "l'ancre de lien suggérée et la justification SEO.",
        ),
    ],
    "trust-industrie": [
        (
            PromptType.AUDIT_SEO,
            "Audit SEO – Trust Industrie",
            "Tu es consultant SEO senior en charge de l'audit du site Trust Industrie "
            "(entreprise B2B industrielle). Analyse les éléments suivants : [URL ou liste de "
            "pages, données SEMrush/Search Console]. Identifie les problèmes techniques et "
            "de contenu (balises, structure Hn, maillage, indexation), classe-les par "
            "priorité (haute/moyenne/basse) et propose une action corrective pour chacun.",
        ),
        (
            PromptType.META_DESCRIPTION,
            "Meta description – Trust Industrie",
            "Tu es expert SEO pour Trust Industrie, entreprise B2B industrielle. Rédige une "
            "meta description (155 caractères max) pour la page suivante : [URL / sujet de la "
            "page]. Ton : professionnel, technique, orienté clic, avec un mot-clé principal "
            "clairement inclus.",
        ),
        (
            PromptType.MAILLAGE_INTERNE,
            "Maillage interne – Trust Industrie",
            "Tu es consultant SEO pour Trust Industrie. Voici une page cible : [URL/nom de la "
            "page]. Propose 5 liens internes pertinents depuis d'autres pages du site "
            "([liste de pages/catégories]), avec ancre suggérée et justification SEO.",
        ),
    ],
    "easymove-wear": [
        (
            PromptType.FICHE_TEMU,
            "Fiche Temu – EasyMove Wear",
            "Tu es responsable e-commerce pour EasyMove Wear (marque de vêtements de sport) "
            "sur Temu. Rédige une fiche produit optimisée pour la marketplace Temu pour "
            "l'article suivant : [nom du produit], [caractéristiques : matière, coupe, "
            "tailles, couleurs]. Fournis : un titre orienté recherche (avec mots-clés "
            "produit), une liste de points forts (bullet points), une description complète "
            "et des mots-clés de recherche adaptés à Temu.",
        ),
        (
            PromptType.FICHE_TIKTOK_SHOP,
            "Fiche TikTok Shop – EasyMove Wear",
            "Tu es responsable e-commerce pour EasyMove Wear sur TikTok Shop. Rédige une "
            "fiche produit pour l'article suivant : [nom du produit], [caractéristiques]. "
            "Fournis : un titre percutant adapté à l'audience TikTok, une description courte "
            "dynamique, 3 arguments de vente clés et des hashtags pertinents pour la "
            "découvrabilité.",
        ),
        (
            PromptType.POST_INSTAGRAM,
            "Post Instagram – EasyMove Wear",
            "Tu es community manager pour EasyMove Wear, marque de vêtements de sport. "
            "Rédige un post Instagram pour promouvoir : [produit / thème du post]. Fournis : "
            "une accroche, un texte de post (100-150 mots, ton dynamique et motivant), un "
            "appel à l'action et 8 hashtags pertinents.",
        ),
    ],
    "dreams-fly": [
        (
            PromptType.ARTICLE_SEO,
            "Article SEO – Dreams Fly",
            "Tu es rédacteur SEO pour Dreams Fly. Rédige un article de blog optimisé SEO sur "
            "le sujet suivant : [sujet de l'article]. Fournis : un titre H1 optimisé, un plan "
            "structuré en H2/H3, une introduction (2-3 phrases), le corps de l'article "
            "(600-900 mots) et une meta description (155 caractères max). Ton : inspirant, "
            "clair, engageant.",
        ),
        (
            PromptType.POST_FACEBOOK,
            "Post Facebook – Dreams Fly",
            "Tu es community manager pour Dreams Fly. Rédige un post Facebook sur le thème "
            "suivant : [thème / actualité / article à relayer]. Fournis : un texte de post "
            "(80-120 mots, ton inspirant et chaleureux), un appel à l'action et une "
            "suggestion de visuel.",
        ),
        (
            PromptType.EPINGLE_PINTEREST,
            "Épingle Pinterest – Dreams Fly",
            "Tu es responsable Pinterest pour Dreams Fly. Rédige le texte d'une épingle pour "
            "l'article ou le thème suivant : [sujet]. Fournis : un titre accrocheur (100 "
            "caractères max), une description optimisée SEO (500 caractères max) et 3 "
            "suggestions de hashtags.",
        ),
    ],
}


def run_seed(db: Session) -> None:
    """Préremplit la base au premier lancement uniquement (idempotent)."""
    if db.query(Company).count() > 0:
        return

    today = date.today()
    # Ancre les tâches d'exemple sur la semaine de travail (lundi-vendredi) en
    # cours, pour qu'elles apparaissent correctement dans "Aujourd'hui" et le
    # calendrier semaine même si le seed tourne un week-end.
    work_week_start, _ = get_week_bounds(today)
    base_date = today if today.weekday() < 5 else work_week_start

    for company_data in COMPANIES:
        company = Company(name=company_data["name"], slug=company_data["slug"])
        db.add(company)
        db.flush()

        categories_by_name: dict[str, Category] = {}
        for category_name in company_data["categories"]:
            category = Category(name=category_name, company_id=company.id)
            db.add(category)
            db.flush()
            categories_by_name[category_name] = category

        for title, category_name, priority, minutes, day_offset, assignee in EXAMPLE_TASKS.get(
            company.slug, []
        ):
            category = categories_by_name.get(category_name)
            db.add(
                Task(
                    title=title,
                    company_id=company.id,
                    category_id=category.id if category else None,
                    priority=priority,
                    status=TaskStatus.A_FAIRE,
                    estimated_minutes=minutes,
                    planned_date=base_date + timedelta(days=day_offset),
                    assignee=assignee,
                )
            )

        for prompt_type, title, content in EXAMPLE_PROMPTS.get(company.slug, []):
            db.add(
                PromptTemplate(
                    company_id=company.id,
                    prompt_type=prompt_type,
                    title=title,
                    content=content,
                )
            )

    db.commit()
