# Bejaa Pet Management System — Planning.md
> Lead Architect: Farizal | Engine: Pitou | Started: 2026-05-11

## Stack
- Backend: Python FastAPI + SQLite (local dev)
- Frontend: Next.js 14 App Router
- Styling: Tailwind CSS (no UI kits)
- DB ORM: SQLAlchemy (sync, SQLite)

## Design Law
- Theme: Dark Mode — Charcoal #111 / Gold #FFCC00 / White
- UX Rule: 3-Click Workflow for every major task
- Zero AI filler, zero unnecessary comments

## Modules
| # | Module | Status |
|---|--------|--------|
| 1 | CRM — Pet & Owner profiling | Pending |
| 2 | Hotel Engine — Cage availability + bookings | Pending |
| 3 | Clinic — Medical records + vaccine tracker | Pending |
| 4 | Automation — WhatsApp reminder hooks | Pending |

## Phases
| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Directory Setup + Base Config | ✅ Done |
| 2 | Database Schema + Models | Pending |
| 3 | FastAPI Routers + Business Logic | Pending |
| 4 | Next.js UI — CRM Module | Pending |
| 5 | Next.js UI — Hotel Engine | ✅ Done |
| 6 | Next.js UI — Clinic Module | ✅ Done |
| 7 | Automation Hooks | ✅ Done |
| 8 | Polish + QA | ✅ Done |

## Security (Antibody Logic)
- All inputs validated via Pydantic schemas before hitting DB
- No raw SQL — ORM only
- Date range conflicts checked at router level before insert
- Cage double-booking: DB-level unique constraint + router pre-check

## DB Schema (SQLite)
Tables: owners, pets, cages, bookings, medical_records, vaccines

## Directory Tree
```
bejaa-pet-management/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/        → SQLAlchemy ORM models
│   │   ├── routers/       → FastAPI route handlers
│   │   ├── schemas/       → Pydantic validators
│   │   └── core/          → config, constants
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (dashboard)/
│   │       ├── crm/
│   │       ├── hotel/
│   │       └── clinic/
│   ├── components/
│   │   ├── ui/            → shared buttons, modals, inputs
│   │   ├── crm/
│   │   ├── hotel/
│   │   └── clinic/
│   ├── lib/
│   │   └── api.ts         → all fetch calls to FastAPI
│   ├── tailwind.config.ts
│   └── package.json
└── Planning.md
```
