from datetime import date, time, timedelta

from sqlalchemy.orm import Session

from app.models.assignee_label import AssigneeLabel
from app.models.category import Category
from app.models.company import Company
from app.models.enums import Assignee, PromptType, TaskPriority
from app.models.prompt import PromptTemplate
from app.models.task import Task
from app.models.time_block import TimeBlock
from app.services.date_utils import get_week_bounds

DEFAULT_ASSIGNEE_LABELS = {
    Assignee.MOI.value: "Moi",
    Assignee.RENFORT_1.value: "Renfort 1",
    Assignee.RENFORT_2.value: "Renfort 2",
}

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

# (label, heure de début, heure de fin, slug entreprise ou None pour un bloc transverse)
DEFAULT_BLOCKS: list[tuple[str, time, time, str | None]] = [
    ("Organisation", time(8, 0), time(9, 0), None),
    ("Mobilier Malin", time(9, 0), time(11, 0), "mobilier-malin"),
    ("Trust Industrie", time(11, 15), time(15, 0), "trust-industrie"),
    ("EasyMove Wear", time(15, 15), time(16, 45), "easymove-wear"),
    ("Dreams Fly", time(16, 45), time(17, 30), "dreams-fly"),
    ("Préparation du lendemain", time(17, 30), time(18, 0), None),
]

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
    _seed_companies(db)
    _seed_assignee_labels(db)
    _seed_blocks_and_routine(db)


def _seed_assignee_labels(db: Session) -> None:
    if db.query(AssigneeLabel).count() > 0:
        return
    for key, label in DEFAULT_ASSIGNEE_LABELS.items():
        db.add(AssigneeLabel(key=key, label=label))
    db.commit()


def _seed_companies(db: Session) -> None:
    if db.query(Company).count() > 0:
        return

    for company_data in COMPANIES:
        company = Company(name=company_data["name"], slug=company_data["slug"])
        db.add(company)
        db.flush()

        for category_name in company_data["categories"]:
            db.add(Category(name=category_name, company_id=company.id))

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


def _seed_blocks_and_routine(db: Session) -> None:
    """Crée les blocs horaires par défaut (une seule fois) puis, seulement à la
    toute première génération de la base, la routine hebdomadaire (Search
    Console/Analytics/KPI le lundi, rapport le vendredi) par entreprise.

    Aucune tâche « projet » n'est générée automatiquement : c'est Farouk qui
    construit sa semaine via les workflows, bloc par bloc.
    """
    if db.query(TimeBlock).count() > 0:
        return

    companies_by_slug = {c.slug: c for c in db.query(Company).all()}
    categories_by_company: dict[str, dict[str, Category]] = {}
    for company in companies_by_slug.values():
        categories_by_company[company.slug] = {
            cat.name: cat for cat in db.query(Category).filter(Category.company_id == company.id)
        }

    blocks_by_slug: dict[str | None, TimeBlock] = {}
    for position, (label, start_time, end_time, company_slug) in enumerate(DEFAULT_BLOCKS):
        company = companies_by_slug.get(company_slug) if company_slug else None
        block = TimeBlock(
            label=label,
            company_id=company.id if company else None,
            start_time=start_time,
            end_time=end_time,
            position=position,
        )
        db.add(block)
        db.flush()
        if label == "Organisation":
            blocks_by_slug["organisation"] = block
        if label == "Préparation du lendemain":
            blocks_by_slug["preparation"] = block

    today = date.today()
    week_start, _ = get_week_bounds(today)
    monday = week_start
    friday = week_start + timedelta(days=4)

    organisation_block = blocks_by_slug["organisation"]
    preparation_block = blocks_by_slug["preparation"]

    for company in companies_by_slug.values():
        cat_map = categories_by_company[company.slug]
        db.add(
            Task(
                title=f"Search Console – {company.name}",
                company_id=company.id,
                category_id=cat_map.get("Search Console").id if cat_map.get("Search Console") else None,
                block_id=organisation_block.id,
                priority=TaskPriority.MOYENNE,
                estimated_minutes=15,
                planned_date=monday,
                assignee=Assignee.MOI,
            )
        )
        db.add(
            Task(
                title=f"Analytics – {company.name}",
                company_id=company.id,
                category_id=cat_map.get("Analytics").id if cat_map.get("Analytics") else None,
                block_id=organisation_block.id,
                priority=TaskPriority.MOYENNE,
                estimated_minutes=15,
                planned_date=monday,
                assignee=Assignee.MOI,
            )
        )
        db.add(
            Task(
                title=f"KPI de la semaine – {company.name}",
                company_id=company.id,
                category_id=None,
                block_id=organisation_block.id,
                priority=TaskPriority.MOYENNE,
                estimated_minutes=15,
                planned_date=monday,
                assignee=Assignee.MOI,
            )
        )
        db.add(
            Task(
                title=f"Rapport hebdomadaire – {company.name}",
                company_id=company.id,
                category_id=None,
                block_id=preparation_block.id,
                priority=TaskPriority.HAUTE,
                estimated_minutes=30,
                planned_date=friday,
                assignee=Assignee.MOI,
            )
        )
        db.add(
            Task(
                title=f"Mettre à jour les KPI – {company.name}",
                company_id=company.id,
                category_id=None,
                block_id=preparation_block.id,
                priority=TaskPriority.MOYENNE,
                estimated_minutes=20,
                planned_date=friday,
                assignee=Assignee.MOI,
            )
        )

    db.commit()
