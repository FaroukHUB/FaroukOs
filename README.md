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

Dashboard, Aujourd'hui, Calendrier semaine, Entreprises, Tâches, Renforts, KPI,
Prompts IA, Paramètres.

## Déploiement sur hébergement mutualisé 02switch (cPanel)

Le mutualisé cPanel ne fait tourner que du WSGI (via Passenger), alors que FastAPI est
ASGI. Le dépôt inclut déjà ce qu'il faut : `backend/passenger_wsgi.py` (adaptateur
`a2wsgi`) et `frontend/public/.htaccess` (réécriture SPA, copié dans `dist/` au build).

**1. Backend — sous-domaine `api.tondomaine.fr`**

1. cPanel > *Domaines* : créer le sous-domaine `api.tondomaine.fr`.
2. cPanel > *Setup Python App* : créer une application
   - Python 3.11 (ou la version la plus récente proposée)
   - Racine de l'app : dossier du sous-domaine (ex. `api.tondomaine.fr`)
   - Fichier de démarrage : `passenger_wsgi.py` — callable : `application`
3. Déposer le contenu de `backend/` (dossier `app/`, `requirements.txt`,
   `passenger_wsgi.py`) dans cette racine (Git, ou zip + File Manager).
4. Dans le terminal cPanel, activer le virtualenv indiqué par le panneau puis :
   ```bash
   pip install -r requirements.txt
   ```
5. Dans *Setup Python App*, définir la variable d'environnement `FRONTEND_ORIGINS`
   avec l'URL du frontend, ex. `https://app.tondomaine.fr` (sans slash final).
6. Redémarrer l'app ("Restart"), puis vérifier `https://api.tondomaine.fr/api/health`.

**2. Frontend — sous-domaine `app.tondomaine.fr`**

1. En local, créer `frontend/.env` (copie de `.env.example`) avec :
   ```
   VITE_API_BASE_URL=https://api.tondomaine.fr/api
   ```
2. `npm run build` → génère `frontend/dist/` (avec le `.htaccess` inclus).
3. cPanel > *Domaines* : créer le sous-domaine `app.tondomaine.fr`.
4. Déposer le contenu de `dist/` (pas le dossier lui-même) dans la racine de ce
   sous-domaine.

À savoir : SQLite doit rester dans un dossier accessible en écriture par
l'app (la racine convient) ; pas de WebSocket dans ce mode (l'app n'en utilise pas) ;
un léger délai est possible au premier accès après une période d'inactivité
(comportement normal de Passenger en mutualisé).

Sur un VPS (02switch ou autre), pas besoin de tout ça : `uvicorn app.main:app` +
nginx en reverse proxy suffisent, comme en local.

## Règles métier clés

- Une tâche ne peut utiliser qu'une catégorie de la même entreprise.
- Les KPI sont saisis manuellement, par semaine (aucune intégration API).
- Les prompts IA sont des modèles à copier-coller, liés à une entreprise précise
  (aucun appel à une API IA externe en V1).
- Si la charge du jour dépasse 10h de tâches estimées, une alerte s'affiche.
