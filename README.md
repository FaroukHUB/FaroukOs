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

## Déploiement gratuit : backend sur Fly.io + frontend sur Vercel

Fly.io fait tourner l'app dans un vrai conteneur (pas de serverless), avec un disque
persistant pour le fichier SQLite — et tu gardes ton propre sous-domaine. Une seule
CLI à installer une fois (`flyctl`), le reste se fait en 3 commandes.

**1. Backend sur Fly.io**

1. Installer la CLI : voir https://fly.io/docs/flyctl/install/ puis `fly auth signup`
   (ou `fly auth login` si tu as déjà un compte).
2. Depuis `backend/` (le dépôt contient déjà `Dockerfile` et `fly.toml`) :
   ```bash
   cd backend
   fly launch --no-deploy   # détecte le Dockerfile, reprend fly.toml, choisit un nom si "farouk-os-api" est pris
   fly volumes create farouk_os_data --size 1 --region cdg
   ```
3. Modifier `FRONTEND_ORIGINS` dans `fly.toml` avec l'URL Vercel finale (étape 2
   ci-dessous), puis :
   ```bash
   fly deploy
   ```
4. Vérifier `https://<ton-app>.fly.dev/api/health`. Pour un sous-domaine perso
   (`api.tondomaine.fr`), `fly certs add api.tondomaine.fr` puis suivre les
   instructions DNS affichées.

**2. Frontend sur Vercel**

1. Sur vercel.com, *Add New Project* → importer ton repo GitHub.
2. *Root Directory* : `frontend`. Framework preset : **Vite** (auto-détecté).
3. *Environment Variables* : ajouter `VITE_API_BASE_URL` =
   `https://<ton-app>.fly.dev/api` (ou ton sous-domaine perso une fois configuré).
4. Déployer. Recopier l'URL Vercel obtenue dans `FRONTEND_ORIGINS` (fly.toml) si elle
   diffère, puis `fly deploy` à nouveau.

À savoir : `min_machines_running = 0` dans `fly.toml` met l'app en veille sans trafic
(gratuit) — léger délai au premier accès après une pause, sans impact fonctionnel.

## Alternative gratuite sans CLI : PythonAnywhere + Vercel

Encore plus simple à mettre en place (aucune CLI, aucune carte bancaire), mais sans
sous-domaine perso sur le compte gratuit (`tonpseudo.pythonanywhere.com`).
PythonAnywhere ne fait tourner que du WSGI, donc on réutilise le même
`backend/passenger_wsgi.py` (adaptateur `a2wsgi`) que pour un mutualisé cPanel.

**1. Backend sur PythonAnywhere (compte gratuit "Beginner")**

1. Créer un compte sur pythonanywhere.com (gratuit, `tonpseudo.pythonanywhere.com`).
2. Onglet *Consoles* → ouvrir une console **Bash**, puis :
   ```bash
   git clone <URL_DE_TON_REPO> farouk-os
   cd farouk-os/backend
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Onglet *Web* → *Add a new web app* → **Manual configuration** → Python 3.11.
4. Dans la section *Virtualenv*, indiquer le chemin :
   `/home/tonpseudo/farouk-os/backend/venv`
5. Cliquer sur le lien *WSGI configuration file* et remplacer tout le contenu par :
   ```python
   import sys, os

   path = '/home/tonpseudo/farouk-os/backend'
   if path not in sys.path:
       sys.path.insert(0, path)

   os.environ['FRONTEND_ORIGINS'] = 'https://ton-projet.vercel.app'

   from passenger_wsgi import application
   ```
   (le compte gratuit n'a pas d'écran "variables d'environnement" séparé — on les
   définit directement ici, avant l'import)
6. Bouton vert **Reload**, puis vérifier `https://tonpseudo.pythonanywhere.com/api/health`.

**2. Frontend sur Vercel**

1. Sur vercel.com, *Add New Project* → importer ton repo GitHub.
2. *Root Directory* : `frontend`. Framework preset : **Vite** (auto-détecté).
3. *Environment Variables* : ajouter `VITE_API_BASE_URL` =
   `https://tonpseudo.pythonanywhere.com/api`.
4. Déployer. Vercel te donne une URL du style `ton-projet.vercel.app` (à recopier
   dans le fichier WSGI ci-dessus si l'URL diffère de celle utilisée).

À savoir sur le gratuit PythonAnywhere : le fichier SQLite est conservé indéfiniment
(pas d'expiration), mais les requêtes vers des domaines externes sont bloquées par
défaut — sans impact ici puisque l'app ne fait aucun appel externe.

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
