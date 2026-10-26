from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta, timezone
from app.database import get_db
from app.models.owner import Owner
from app.models.pet import Pet
from app.models.cage import Cage
from app.models.booking import Booking
from app.models.medical import Vaccine

router = APIRouter(tags=["stats"])

# The server runs on UTC; the shop runs on Malaysia time (UTC+8, no daylight saving)
def shop_today() -> date:
    return datetime.now(timezone(timedelta(hours=8))).date()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    today = shop_today()
    return {
        "owners": db.query(Owner).count(),
        "pets": db.query(Pet).count(),
        "active_bookings": db.query(Booking).filter(
            Booking.status.in_(["Pending", "Confirmed", "Checked In"])
        ).count(),
        "checkins_today": db.query(Booking).filter(
            Booking.check_in == today,
            Booking.status.in_(["Pending", "Confirmed"]),
        ).count(),
        "checkouts_today": db.query(Booking).filter(
            Booking.check_out == today,
            Booking.status == "Checked In",
        ).count(),
        "overdue_vaccines": db.query(Vaccine).filter(
            Vaccine.next_due_date < today,
            Vaccine.next_due_date.isnot(None),
        ).count(),
    }

def _overdue_vaccines(db: Session, today: date) -> dict[int, list[Vaccine]]:
    # Only the newest dose of each vaccine counts: an old dose that was since renewed is not overdue
    latest: dict[tuple[int, str], Vaccine] = {}
    for v in db.query(Vaccine).order_by(Vaccine.administered_date).all():
        latest[(v.pet_id, v.name.strip().lower())] = v
    overdue: dict[int, list[Vaccine]] = {}
    for v in latest.values():
        if v.next_due_date and v.next_due_date < today:
            overdue.setdefault(v.pet_id, []).append(v)
    return overdue

# Everything the front desk needs today, with names instead of counts
@router.get("/today")
def get_today(db: Session = Depends(get_db)):
    today = shop_today()
    overdue = _overdue_vaccines(db, today)

    rows = (
        db.query(Booking, Pet, Owner, Cage)
        .join(Pet, Booking.pet_id == Pet.id)
        .join(Owner, Pet.owner_id == Owner.id)
        .join(Cage, Booking.cage_id == Cage.id)
        .filter(Booking.status.in_(["Pending", "Confirmed", "Checked In"]))
        .order_by(Booking.check_in, Pet.name)
        .all()
    )

    def stay(b: Booking, p: Pet, o: Owner, c: Cage) -> dict:
        return {
            "booking_id": b.id, "status": b.status, "check_in": b.check_in, "check_out": b.check_out,
            "notes": b.notes, "cage": c.label, "pet_id": p.id, "pet": p.name, "species": p.species,
            "alert": p.alert, "owner": o.name, "phone": o.phone,
            "vaccines_overdue": [v.name for v in overdue.get(p.id, [])],
        }

    arriving, leaving, staying, late_pickup, missed_arrival = [], [], [], [], []
    for b, p, o, c in rows:
        waiting = b.status in ("Pending", "Confirmed")
        if waiting and b.check_in == today:
            arriving.append(stay(b, p, o, c))
        elif waiting and b.check_in < today:
            missed_arrival.append(stay(b, p, o, c))
        elif b.status == "Checked In" and b.check_out == today:
            leaving.append(stay(b, p, o, c))
        elif b.status == "Checked In" and b.check_out < today:
            late_pickup.append(stay(b, p, o, c))
        elif b.status == "Checked In":
            staying.append(stay(b, p, o, c))

    vaccine_rows = (
        db.query(Pet, Owner)
        .join(Owner, Pet.owner_id == Owner.id)
        .filter(Pet.id.in_(overdue.keys()), Pet.archived_at.is_(None))
        .order_by(Pet.name)
        .all()
    )
    vaccines_due = [
        {"pet_id": p.id, "pet": p.name, "species": p.species, "owner": o.name, "phone": o.phone,
         "vaccines": [{"name": v.name, "due": v.next_due_date} for v in overdue[p.id]]}
        for p, o in vaccine_rows
    ]

    return {
        "date": today,
        "late_pickup": late_pickup,
        "missed_arrival": missed_arrival,
        "arriving": arriving,
        "leaving": leaving,
        "staying": staying,
        "vaccines_due": vaccines_due,
        "in_hotel": sum(1 for b, *_ in rows if b.status == "Checked In"),
        "pending": sum(1 for b, *_ in rows if b.status == "Pending"),
        "cages": db.query(Cage).filter(Cage.is_active == True).count(),
    }
