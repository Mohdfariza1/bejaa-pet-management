from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from app.database import get_db
from app.models.booking import Booking
from app.models.pet import Pet
from app.models.cage import Cage
from app.schemas.booking import BookingCreate, BookingUpdate, BookingOut

router = APIRouter(prefix="/bookings", tags=["bookings"])

def _overlap_exists(db: Session, cage_id: int, check_in: date, check_out: date, exclude_id: Optional[int] = None) -> bool:
    query = db.query(Booking).filter(
        Booking.cage_id == cage_id,
        Booking.status.not_in(["Cancelled", "Checked Out"]),
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )
    if exclude_id:
        query = query.filter(Booking.id != exclude_id)
    return query.first() is not None

@router.get("", response_model=list[BookingOut])
def list_bookings(
    status: Optional[str] = Query(None),
    pet_id: Optional[int] = Query(None),
    cage_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    if pet_id:
        query = query.filter(Booking.pet_id == pet_id)
    if cage_id:
        query = query.filter(Booking.cage_id == cage_id)
    return query.order_by(Booking.check_in.desc()).all()

@router.post("", response_model=BookingOut, status_code=201)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    if not db.query(Pet).filter(Pet.id == data.pet_id).first():
        raise HTTPException(status_code=404, detail="Pet not found")
    cage = db.query(Cage).filter(Cage.id == data.cage_id, Cage.is_active == True).first()
    if not cage:
        raise HTTPException(status_code=404, detail="Cage not found or inactive")
    if _overlap_exists(db, data.cage_id, data.check_in, data.check_out):
        raise HTTPException(status_code=409, detail="Cage is already booked for the selected dates")
    booking = Booking(**data.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.put("/{booking_id}", response_model=BookingOut)
def update_booking(booking_id: int, data: BookingUpdate, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(booking, field, value)
    db.commit()
    db.refresh(booking)
    return booking

@router.delete("/{booking_id}", status_code=204)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "Cancelled"
    db.commit()
