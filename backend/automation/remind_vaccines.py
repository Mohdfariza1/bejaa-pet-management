import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import date, timedelta
from app.database import SessionLocal
from app.models.medical import Vaccine
from app.models.pet import Pet
from app.models.owner import Owner
from automation.wa_sender import send_whatsapp


def run():
    today = date.today()
    in_7_days = today + timedelta(days=7)
    db = SessionLocal()
    sent = 0
    total = 0

    try:
        # Vaccines due in exactly 7 days
        due_soon = (
            db.query(Vaccine)
            .filter(Vaccine.next_due_date == in_7_days)
            .all()
        )
        # Vaccines due today (last chance reminder)
        due_today = (
            db.query(Vaccine)
            .filter(Vaccine.next_due_date == today)
            .all()
        )

        print(f"[Vaccines] {len(due_soon)} due in 7 days, {len(due_today)} due today")
        total = len(due_soon) + len(due_today)

        for v in due_soon:
            pet = db.query(Pet).filter(Pet.id == v.pet_id).first()
            if not pet:
                continue
            owner = db.query(Owner).filter(Owner.id == pet.owner_id).first()
            if not owner:
                continue
            msg = (
                f"Hi {owner.name}! Health reminder: *{pet.name}*'s *{v.name}* vaccine "
                f"is due in 7 days ({in_7_days.strftime('%d %b %Y')}). "
                f"Please schedule a visit with us soon. 🏥 — Bejaa Pet Hotel Clinic"
            )
            if send_whatsapp(owner.phone, msg):
                sent += 1

        for v in due_today:
            pet = db.query(Pet).filter(Pet.id == v.pet_id).first()
            if not pet:
                continue
            owner = db.query(Owner).filter(Owner.id == pet.owner_id).first()
            if not owner:
                continue
            msg = (
                f"Hi {owner.name}! Today is the due date for *{pet.name}*'s *{v.name}* vaccine "
                f"({today.strftime('%d %b %Y')}). "
                f"Walk-in available today. Don't delay! 🏥 — Bejaa Pet Hotel Clinic"
            )
            if send_whatsapp(owner.phone, msg):
                sent += 1

    finally:
        db.close()
    print(f"[Vaccines] Done. {sent}/{total} sent.\n")


if __name__ == "__main__":
    run()
