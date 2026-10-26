import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from app.core.config import settings
from app.core.auth import require_staff, hash_password
from app.database import engine, Base, SessionLocal
import app.models  # noqa: F401 — registers all models with Base.metadata
from app.models.staff import Staff
from app.routers import owners, pets, cages, bookings, medical, search, stats, staff

Base.metadata.create_all(bind=engine)

# create_all never adds columns to tables that already exist, so new ones are added here
_new_columns = {
    "owners": {"archived_at": "TIMESTAMP"},
    "pets": {"alert": "VARCHAR(200)", "archived_at": "TIMESTAMP"},
}
with engine.begin() as conn:
    for table, columns in _new_columns.items():
        have = {c["name"] for c in inspect(conn).get_columns(table)}
        for name, sql_type in columns.items():
            if name not in have:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {sql_type}"))

# First boss account comes from ADMIN_USERNAME / ADMIN_PASSWORD, only while the staff table is empty
with SessionLocal() as db:
    if settings.ADMIN_USERNAME and settings.ADMIN_PASSWORD and not db.query(Staff).first():
        db.add(Staff(name="Boss", username=settings.ADMIN_USERNAME.strip().lower(), role="Boss",
                     password_hash=hash_password(settings.ADMIN_PASSWORD)))
        db.commit()

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

# Data routes need the server key plus a logged-in, active staff member (both added by Next.js middleware)
logged_in = [Depends(require_staff)]
app.include_router(owners.router, dependencies=logged_in)
app.include_router(pets.router, dependencies=logged_in)
app.include_router(cages.router, dependencies=logged_in)
app.include_router(bookings.router, dependencies=logged_in)
app.include_router(medical.router, dependencies=logged_in)
app.include_router(search.router, dependencies=logged_in)
app.include_router(stats.router, dependencies=logged_in)
app.include_router(staff.router)
app.include_router(staff.auth_router)

app.include_router(cages.public_router)
app.include_router(bookings.public_router)

@app.get("/")
def root():
    return {"status": "ok", "app": settings.APP_NAME}
