"""Liste figée des métriques KPI suivies par entreprise (saisie manuelle, hebdomadaire)."""

KPI_METRICS: dict[str, list[dict[str, str]]] = {
    "mobilier-malin": [
        {"key": "fiches_produits_creees", "label": "Fiches produits créées"},
        {"key": "fiches_produits_optimisees", "label": "Fiches produits optimisées"},
        {"key": "posts_pinterest", "label": "Posts Pinterest"},
        {"key": "posts_facebook", "label": "Posts Facebook"},
        {"key": "posts_instagram", "label": "Posts Instagram"},
        {"key": "pages_seo_creees", "label": "Pages SEO créées"},
        {"key": "erreurs_corrigees", "label": "Erreurs corrigées"},
        {"key": "backlinks_obtenus", "label": "Backlinks obtenus"},
    ],
    "trust-industrie": [
        {"key": "erreurs_seo_corrigees", "label": "Erreurs SEO corrigées"},
        {"key": "pages_optimisees", "label": "Pages optimisées"},
        {"key": "redirections_corrigees", "label": "Redirections corrigées"},
        {"key": "erreurs_404_traitees", "label": "404 traitées"},
        {"key": "articles_publies", "label": "Articles publiés"},
        {"key": "backlinks_obtenus", "label": "Backlinks obtenus"},
    ],
    "easymove-wear": [
        {"key": "produits_temu_crees", "label": "Produits Temu créés"},
        {"key": "produits_tiktok_shop_crees", "label": "Produits TikTok Shop créés"},
        {"key": "contenus_publies", "label": "Contenus publiés"},
        {"key": "fiches_produits_optimisees", "label": "Fiches produits optimisées"},
        {"key": "posts_sociaux_publies", "label": "Posts sociaux publiés"},
    ],
    "dreams-fly": [
        {"key": "articles_publies", "label": "Articles publiés"},
        {"key": "pages_optimisees", "label": "Pages optimisées"},
        {"key": "posts_sociaux_publies", "label": "Posts sociaux publiés"},
        {"key": "contenus_crees", "label": "Contenus créés"},
    ],
}


def get_metrics_for_slug(slug: str) -> list[dict[str, str]]:
    return KPI_METRICS.get(slug, [])
