"""Bibliothèque de workflows par entreprise.

Un workflow est un modèle proposé dans l'interface ("+ Ajouter un workflow") :
en choisir un crée d'un coup toutes ses sous-tâches dans le bloc horaire
choisi. Jamais mélangé entre entreprises — chaque workflow appartient à une
seule entreprise, comme les tâches qu'il génère.

Chaque item : (titre, nom de catégorie ou None, durée estimée en minutes).
"""

WORKFLOWS: dict[str, list[dict]] = {
    "mobilier-malin": [
        {
            "name": "Nouvelle fiche produit",
            "items": [
                ("Créer nouvelle fiche produit", "Fiches produits", 40),
                ("Optimiser images produit", "Images", 25),
                ("Renommer fichiers images", "Images", 15),
                ("Vérifier attributs alt images", "Images", 15),
                ("Vérifier meta description", "Meta descriptions", 20),
            ],
        },
        {
            "name": "Optimisation fiche produit",
            "items": [
                ("Optimiser fiche produit", "Fiches produits", 30),
                ("Vérifier H1", "SEO", 15),
                ("Vérifier Title", "SEO", 15),
                ("Vérifier meta description", "Meta descriptions", 20),
            ],
        },
        {
            "name": "Article SEO",
            "items": [
                ("Rédiger article de blog", "Blog", 60),
                ("Publier article de blog", "Blog", 30),
                ("Vérifier meta description", "Meta descriptions", 20),
            ],
        },
        {
            "name": "Pinterest",
            "items": [
                ("Créer publication Pinterest", "Pinterest", 20),
                ("Programmer publications Pinterest", "Pinterest", 25),
            ],
        },
        {
            "name": "Optimisation catégorie",
            "items": [
                ("Optimiser page catégorie", "Catégories", 30),
                ("Ajouter maillage interne", "Maillage interne", 25),
            ],
        },
        {
            "name": "Google Merchant",
            "items": [
                ("Vérifier Google Merchant Center", "Google Merchant Center", 20),
                ("Corriger produits refusés Merchant Center", "Google Merchant Center", 30),
            ],
        },
        {
            "name": "Google Shopping",
            "items": [
                ("Vérifier Google Shopping", "Google Shopping", 20),
            ],
        },
        {
            "name": "Réseaux sociaux",
            "items": [
                ("Créer publication Facebook", "Facebook", 20),
                ("Créer publication Instagram", "Instagram", 20),
                ("Créer Reel Instagram", "Instagram", 35),
            ],
        },
        {
            "name": "Backlinks",
            "items": [
                ("Vérifier backlinks", "Backlinks", 30),
                ("Recherche de nouveaux backlinks", "Backlinks", 45),
            ],
        },
        {
            "name": "SEO stratégique",
            "items": [
                ("Recherche de mots-clés", "SEO", 45),
                ("Analyse concurrentielle", "SEO", 45),
                ("Optimiser page marque", "SEO", 30),
                ("Vérifier erreurs 404", "SEO", 20),
            ],
        },
    ],
    "trust-industrie": [
        {
            "name": "Audit SEMrush",
            "items": [
                ("Audit SEMrush complet", "SEMrush", 90),
                ("Analyser rapport SEMrush", "SEMrush", 45),
            ],
        },
        {
            "name": "Nettoyage balises",
            "items": [
                ("Corriger balises H1", "H1", 20),
                ("Corriger balises H2", "H2", 20),
                ("Corriger balises Title", "Titles", 20),
                ("Corriger meta descriptions", "Meta descriptions", 25),
            ],
        },
        {
            "name": "Nettoyage technique",
            "items": [
                ("Nettoyer URLs non conformes", "Nettoyage SEO", 30),
                ("Corriger balises canonical", "Nettoyage SEO", 25),
                ("Corriger pages 404", "404", 30),
                ("Corriger redirections", "Redirections", 30),
            ],
        },
        {
            "name": "Optimisation catalogue",
            "items": [
                ("Optimiser catégories produits", "Catégories", 30),
                ("Optimiser fiches produits", "Produits", 30),
                ("Ajouter maillage interne", "Maillage interne", 25),
            ],
        },
        {
            "name": "Contenu SEO",
            "items": [
                ("Optimiser contenus existants", "Blog", 35),
                ("Rédiger article SEO", "Blog", 60),
            ],
        },
        {
            "name": "Recherche & analyse",
            "items": [
                ("Recherche de mots-clés", "SEO", 45),
                ("Analyse concurrentielle", "SEO", 45),
            ],
        },
        {
            "name": "Backlinks",
            "items": [
                ("Vérifier backlinks existants", "Backlinks", 30),
                ("Trouver nouveaux backlinks", "Backlinks", 45),
            ],
        },
        {
            "name": "Audit structure",
            "items": [
                ("Auditer structure du site", "Audit SEO", 60),
                ("Auditer maillage interne", "Audit SEO", 45),
            ],
        },
        {
            "name": "Suivi performance",
            "items": [
                ("Vérifier Search Console", "Search Console", 20),
                ("Vérifier Analytics", "Analytics", 20),
                ("Vérifier performances globales", "Analytics", 30),
            ],
        },
    ],
    "easymove-wear": [
        {
            "name": "Produit Temu",
            "items": [
                ("Créer produit Temu", "Temu", 40),
                ("Optimiser produit Temu", "Temu", 25),
                ("Vérifier statut produits Temu", "Temu", 15),
            ],
        },
        {
            "name": "Produit TikTok Shop",
            "items": [
                ("Créer fiche TikTok Shop", "TikTok Shop", 40),
                ("Optimiser fiche TikTok Shop", "TikTok Shop", 25),
                ("Vérifier produits TikTok Shop", "TikTok Shop", 15),
            ],
        },
        {
            "name": "Fiche produit",
            "items": [
                ("Créer fiche produit", "Fiches produits", 35),
                ("Optimiser fiche produit", "Fiches produits", 25),
                ("Rédiger SEO fiche produit", "SEO", 30),
                ("Optimiser images produit", "Images", 25),
            ],
        },
        {
            "name": "Réseaux sociaux",
            "items": [
                ("Créer publication Pinterest", "Pinterest", 20),
                ("Créer publication Facebook", "Facebook", 20),
                ("Créer publication Instagram", "Instagram", 20),
            ],
        },
        {
            "name": "Contenu vidéo",
            "items": [
                ("Créer vidéo TikTok", "TikTok", 35),
                ("Créer Reel produit", "Instagram", 35),
            ],
        },
        {
            "name": "Contenu promotionnel",
            "items": [
                ("Créer contenu promotionnel", "Contenu", 30),
            ],
        },
        {
            "name": "SEO & veille",
            "items": [
                ("Recherche de mots-clés", "SEO", 40),
                ("Analyse concurrentielle", "SEO", 40),
            ],
        },
        {
            "name": "Suivi performance",
            "items": [
                ("Vérifier Search Console", "Search Console", 20),
                ("Vérifier Analytics", "Analytics", 20),
            ],
        },
    ],
    "dreams-fly": [
        {
            "name": "Article de blog",
            "items": [
                ("Rédiger article de blog", "Blog", 60),
                ("Optimiser article existant", "Blog", 30),
            ],
        },
        {
            "name": "SEO page",
            "items": [
                ("Optimiser page SEO", "SEO", 30),
                ("Recherche de mots-clés", "SEO", 40),
                ("Analyse concurrentielle", "SEO", 40),
            ],
        },
        {
            "name": "Réseaux sociaux",
            "items": [
                ("Créer publication Pinterest", "Pinterest", 20),
                ("Créer publication Facebook", "Facebook", 20),
                ("Créer publication Instagram", "Instagram", 20),
            ],
        },
        {
            "name": "Contenu",
            "items": [
                ("Créer contenu inspirant", "Contenu", 30),
            ],
        },
        {
            "name": "Suivi performance",
            "items": [
                ("Vérifier Search Console", "Search Console", 20),
                ("Vérifier Analytics", "Analytics", 20),
            ],
        },
    ],
}


def get_workflows_for_slug(slug: str) -> list[dict]:
    return WORKFLOWS.get(slug, [])
