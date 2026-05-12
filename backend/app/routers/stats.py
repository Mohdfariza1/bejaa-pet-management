from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.owner import Owner
from app.models.pet import Pet
from app.models.booking import Booking
from app.models.medical import Vaccine

router = APIRouter(tags=["stats"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    today = date.today()
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
