export const TASK_STATUSES = [
  { value: "a_faire", label: "À faire" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "delegue", label: "Délégué" },
  { value: "reporte", label: "Reporté" },
  { value: "bloque", label: "Bloqué" },
];

export const TASK_PRIORITIES = [
  { value: "haute", label: "Haute" },
  { value: "moyenne", label: "Moyenne" },
  { value: "basse", label: "Basse" },
];

// Valeurs par défaut, écrasées dynamiquement par AssigneesContext (libellés
// renommables par Farouk depuis les Paramètres). Les clés (value) sont fixes.
export const ASSIGNEES = [
  { value: "moi", label: "Moi" },
  { value: "renfort_1", label: "Renfort 1" },
  { value: "renfort_2", label: "Renfort 2" },
];

export const PROMPT_TYPES = [
  { value: "fiche_produit_seo", label: "Fiche produit SEO" },
  { value: "description_courte", label: "Description courte" },
  { value: "description_longue", label: "Description longue" },
  { value: "meta_description", label: "Méta-description" },
  { value: "article_seo", label: "Article SEO" },
  { value: "post_facebook", label: "Post Facebook" },
  { value: "post_instagram", label: "Post Instagram" },
  { value: "epingle_pinterest", label: "Épingle Pinterest" },
  { value: "audit_seo", label: "Audit SEO" },
  { value: "maillage_interne", label: "Maillage interne" },
  { value: "fiche_temu", label: "Fiche Temu" },
  { value: "fiche_tiktok_shop", label: "Fiche TikTok Shop" },
];

export function labelFor(list, value) {
  return list.find((item) => item.value === value)?.label || value;
}

// Couleur associée à chaque entreprise dans la timeline des blocs (voir
// Timeline.jsx). Un bloc sans entreprise (Organisation, Préparation) reste en
// gris neutre.
export const COMPANY_COLORS = {
  "mobilier-malin": { dot: "bg-blue-500", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  "trust-industrie": { dot: "bg-orange-500", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  "easymove-wear": { dot: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  "dreams-fly": { dot: "bg-purple-500", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
};
export const NEUTRAL_BLOCK_COLOR = {
  dot: "bg-slate-400",
  bg: "bg-slate-50",
  border: "border-slate-200",
  text: "text-slate-600",
};

// Miroir de backend/app/services/kpi_metrics.py — métriques fixes par entreprise (V1, saisie manuelle).
export const KPI_METRICS = {
  "mobilier-malin": [
    { key: "fiches_produits_creees", label: "Fiches produits créées" },
    { key: "fiches_produits_optimisees", label: "Fiches produits optimisées" },
    { key: "posts_pinterest", label: "Posts Pinterest" },
    { key: "posts_facebook", label: "Posts Facebook" },
    { key: "posts_instagram", label: "Posts Instagram" },
    { key: "pages_seo_creees", label: "Pages SEO créées" },
    { key: "erreurs_corrigees", label: "Erreurs corrigées" },
    { key: "backlinks_obtenus", label: "Backlinks obtenus" },
  ],
  "trust-industrie": [
    { key: "erreurs_seo_corrigees", label: "Erreurs SEO corrigées" },
    { key: "pages_optimisees", label: "Pages optimisées" },
    { key: "redirections_corrigees", label: "Redirections corrigées" },
    { key: "erreurs_404_traitees", label: "404 traitées" },
    { key: "articles_publies", label: "Articles publiés" },
    { key: "backlinks_obtenus", label: "Backlinks obtenus" },
  ],
  "easymove-wear": [
    { key: "produits_temu_crees", label: "Produits Temu créés" },
    { key: "produits_tiktok_shop_crees", label: "Produits TikTok Shop créés" },
    { key: "contenus_publies", label: "Contenus publiés" },
    { key: "fiches_produits_optimisees", label: "Fiches produits optimisées" },
    { key: "posts_sociaux_publies", label: "Posts sociaux publiés" },
  ],
  "dreams-fly": [
    { key: "articles_publies", label: "Articles publiés" },
    { key: "pages_optimisees", label: "Pages optimisées" },
    { key: "posts_sociaux_publies", label: "Posts sociaux publiés" },
    { key: "contenus_crees", label: "Contenus créés" },
  ],
};
