"""Point d'entrée pour l'hébergement mutualisé cPanel/Passenger (ex: 02switch).

Passenger sait servir des applications WSGI ; FastAPI est ASGI. On adapte donc
l'app avec a2wsgi. Ce fichier n'est utile qu'en déploiement mutualisé — il n'est
pas utilisé par `uvicorn app.main:app` en local ou sur un VPS.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from a2wsgi import ASGIMiddleware  # noqa: E402

from app.main import app as _asgi_app  # noqa: E402

application = ASGIMiddleware(_asgi_app)
