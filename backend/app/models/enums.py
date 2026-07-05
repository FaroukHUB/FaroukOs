import enum


class TaskStatus(str, enum.Enum):
    A_FAIRE = "a_faire"
    EN_COURS = "en_cours"
    TERMINE = "termine"
    DELEGUE = "delegue"
    REPORTE = "reporte"
    BLOQUE = "bloque"


class TaskPriority(str, enum.Enum):
    HAUTE = "haute"
    MOYENNE = "moyenne"
    BASSE = "basse"


class Assignee(str, enum.Enum):
    MOI = "moi"
    RENFORT_1 = "renfort_1"
    RENFORT_2 = "renfort_2"


class PromptType(str, enum.Enum):
    FICHE_PRODUIT_SEO = "fiche_produit_seo"
    DESCRIPTION_COURTE = "description_courte"
    DESCRIPTION_LONGUE = "description_longue"
    META_DESCRIPTION = "meta_description"
    ARTICLE_SEO = "article_seo"
    POST_FACEBOOK = "post_facebook"
    POST_INSTAGRAM = "post_instagram"
    EPINGLE_PINTEREST = "epingle_pinterest"
    AUDIT_SEO = "audit_seo"
    MAILLAGE_INTERNE = "maillage_interne"
    FICHE_TEMU = "fiche_temu"
    FICHE_TIKTOK_SHOP = "fiche_tiktok_shop"
