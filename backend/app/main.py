from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import assignees, companies, dashboard, kpi, prompts, tasks
from app.database import Base, SessionLocal, engine
from app.services.seed import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Farouk OS", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(tasks.router)
app.include_router(kpi.router)
app.include_router(prompts.router)
app.include_router(dashboard.router)
app.include_router(assignees.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
