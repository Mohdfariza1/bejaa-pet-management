from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.cage import Cage
from app.models.booking import Booking
from app.schemas.cage import CageCreate, CageUpdate, CageOut

router = APIRouter(prefix="/cages", tags=["cages"])

@router.get("", response_model=list[CageOut])
def list_cages(active_only: bool = Query(True), db: Session = Depends(get_db)):
    query = db.query(Cage)
    if active_only:
        query = query.filter(Cage.is_active == True)
    return query.order_by(Cage.label).all()

# /available must be defined BEFORE /{cage_id} to avoid FastAPI matching "available" as an int
@router.get("/available", response_model=list[CageOut])
def available_cages(check_in: date, check_out: date, db: Session = Depends(get_db)):
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    booked_ids = db.query(Booking.cage_id).filter(
        Booking.status.not_in(["Cancelled", "Checked Out"]),
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    ).subquery()
    return db.query(Cage).filter(
        Cage.is_active == True,
        Cage.id.not_in(booked_ids)
    ).order_by(Cage.label).all()

@router.post("", response_model=CageOut, status_code=201)
def create_cage(data: CageCreate, db: Session = Depends(get_db)):
    if db.query(Cage).filter(Cage.label == data.label).first():
        raise HTTPException(status_code=409, detail=f"Cage '{data.label}' already exists")
    cage = Cage(**data.model_dump())
    db.add(cage)
    db.commit()
    db.refresh(cage)
    return cage

@router.get("/{cage_id}", response_model=CageOut)
def get_cage(cage_id: int, db: Session = Depends(get_db)):
    cage = db.query(Cage).filter(Cage.id == cage_id).first()
    if not cage:
        raise HTTPException(status_code=404, detail="Cage not found")
    return cage

@router.put("/{cage_id}", response_model=CageOut)
def update_cage(cage_id: int, data: CageUpdate, db: Session = Depends(get_db)):
    cage = db.query(Cage).filter(Cage.id == cage_id).first()
    if not cage:
        raise HTTPException(status_code=404, detail="Cage not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(cage, field, value)
    db.commit()
    db.refresh(cage)
    return cage

@router.delete("/{cage_id}", status_code=204)
def delete_cage(cage_id: int, db: Session = Depends(get_db)):
    cage = db.query(Cage).filter(Cage.id == cage_id).first()
    if not cage:
        raise HTTPException(status_code=404, detail="Cage not found")
    db.delete(cage)
    db.commit()
