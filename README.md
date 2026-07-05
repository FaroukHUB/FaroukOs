# Farouk OS

Application privée de gestion quotidienne (SEO, e-commerce, contenu, tâches) pour 4
entreprises : Mobilier Malin, Trust Industrie, EasyMove Wear, Dreams Fly.

Usage personnel, pas de SaaS multi-client, pas d'authentification en V1.

## Architecture

- **Backend** : FastAPI + SQLAlchemy + SQLite (`backend/`)
- **Frontend** : React + Vite + Tailwind CSS (`frontend/`)

Chaque tâche appartient à une seule entreprise, et une catégorie appartient toujours à
une seule entreprise. Le backend refuse la création d'une tâche dont la catégorie
n'appartient pas à la même entreprise.

## Lancer le backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Swagger : http://127.0.0.1:8000/docs
- Au premier lancement, la base SQLite (`backend/farouk_os.db`) est créée et préremplie
  avec les 4 entreprises, leurs catégories, quelques tâches d'exemple et une bibliothèque
  de prompts IA de démarrage.

## Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

- App : http://127.0.0.1:5173
- Le frontend proxy les appels `/api/*` vers `http://127.0.0.1:8000` (voir
  `frontend/vite.config.js`) : lancer le backend avant le frontend.

## Pages V1

Dashboard, Aujourd'hui, Calendrier semaine, Entreprises, Tâches, Stagiaires, KPI,
Prompts IA, Paramètres.

## Règles métier clés

- Une tâche ne peut utiliser qu'une catégorie de la même entreprise.
- Les KPI sont saisis manuellement, par semaine (aucune intégration API).
- Les prompts IA sont des modèles à copier-coller, liés à une entreprise précise
  (aucun appel à une API IA externe en V1).
- Si la charge du jour dépasse 10h de tâches estimées, une alerte s'affiche.
