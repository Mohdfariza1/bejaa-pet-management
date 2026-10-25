import os
import secrets
from typing import Optional
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 — registers all models with Base.metadata
from app.routers import owners, pets, cages, bookings, medical, search, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Staff routes need the key the Next.js middleware adds after login; empty API_KEY locks everything
def require_api_key(x_api_key: Optional[str] = Header(None)):
    if not settings.API_KEY or not x_api_key or not secrets.compare_digest(x_api_key, settings.API_KEY):
        raise HTTPException(status_code=401, detail="Not authorised")

staff = [Depends(require_api_key)]
app.include_router(owners.router, dependencies=staff)
app.include_router(pets.router, dependencies=staff)
app.include_router(cages.router, dependencies=staff)
app.include_router(bookings.router, dependencies=staff)
app.include_router(medical.router, dependencies=staff)
app.include_router(search.router, dependencies=staff)
app.include_router(stats.router, dependencies=staff)

app.include_router(cages.public_router)
app.include_router(bookings.public_router)

@app.get("/")
def root():
    return {"status": "ok", "app": settings.APP_NAME}
