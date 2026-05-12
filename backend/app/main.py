from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 — registers all models with Base.metadata
from app.routers import owners, pets, cages, bookings, medical, search, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(owners.router)
app.include_router(pets.router)
app.include_router(cages.router)
app.include_router(bookings.router)
app.include_router(medical.router)
app.include_router(search.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"status": "ok", "app": settings.APP_NAME}
