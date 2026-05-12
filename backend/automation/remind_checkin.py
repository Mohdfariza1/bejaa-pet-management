import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import date, timedelta
from app.database import SessionLocal
from app.models.booking import Booking
from app.models.pet import Pet
from app.models.owner import Owner
from automation.wa_sender import send_whatsapp


def run():
    tomorrow = date.today() + timedelta(days=1)
    db = SessionLocal()
    sent = 0
    bookings = []
    try:
        bookings = (
            db.query(Booking)
            .filter(
                Booking.check_in == tomorrow,
                Booking.status.in_(["Pending", "Confirmed"]),
            )
            .all()
        )
        print(f"[Check-in] {len(bookings)} booking(s) for {tomorrow}")
        for b in bookings:
            pet = db.query(Pet).filter(Pet.id == b.pet_id).first()
            if not pet:
                continue
            owner = db.query(Owner).filter(Owner.id == pet.owner_id).first()
            if not owner:
                continue
            msg = (
                f"Hi {owner.name}! Reminder: *{pet.name}* is checking in to Bejaa Pet Hotel "
                f"tomorrow ({tomorrow.strftime('%d %b %Y')}). "
                f"Please arrive by 10:00 AM. See you soon! 🐾"
            )
            if send_whatsapp(owner.phone, msg):
                sent += 1
    finally:
        db.close()
    print(f"[Check-in] Done. {sent}/{len(bookings)} sent.\n")


if __name__ == "__main__":
    run()
