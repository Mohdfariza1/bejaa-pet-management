from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from typing import Optional
import re
from app.database import get_db
from app.models.owner import Owner
from app.models.pet import Pet
from app.schemas.owner import OwnerCreate, OwnerUpdate, OwnerOut

router = APIRouter(prefix="/owners", tags=["owners"])

# 012-3456789, 60123456789 and +60123456789 are the same person: match every way it may have been saved
def phone_variants(phone: str) -> list[str]:
    core = re.sub(r"\D", "", phone)
    if core.startswith("60"):
        core = core[2:]
    core = core.lstrip("0")
    return [core, "0" + core, "60" + core, "+60" + core]

def find_by_phone(db: Session, phone: str) -> Optional[Owner]:
    return db.query(Owner).filter(Owner.phone.in_(phone_variants(phone))).first()

@router.get("", response_model=list[OwnerOut])
def list_owners(q: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Owner).filter(Owner.archived_at.is_(None))
    if q:
        query = query.filter(
            or_(Owner.name.ilike(f"%{q}%"), Owner.phone.ilike(f"%{q}%"))
        )
    return query.order_by(Owner.name).all()

# /check-phone must be defined BEFORE /{owner_id}
@router.get("/check-phone", response_model=Optional[OwnerOut])
def check_phone(phone: str, db: Session = Depends(get_db)):
    return find_by_phone(db, phone)

@router.post("", response_model=OwnerOut, status_code=201)
def create_owner(data: OwnerCreate, db: Session = Depends(get_db)):
    existing = find_by_phone(db, data.phone)
    if existing:
        raise HTTPException(status_code=409, detail=f"This number already belongs to {existing.name}")
    owner = Owner(**data.model_dump())
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner

@router.get("/{owner_id}", response_model=OwnerOut)
def get_owner(owner_id: int, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    return owner

@router.put("/{owner_id}", response_model=OwnerOut)
def update_owner(owner_id: int, data: OwnerUpdate, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(owner, field, value)
    db.commit()
    db.refresh(owner)
    return owner

# Delete only archives: the customer, pets and history stay in the database and can be brought back
@router.delete("/{owner_id}", status_code=204)
def delete_owner(owner_id: int, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    now = datetime.utcnow()
    owner.archived_at = now
    db.query(Pet).filter(Pet.owner_id == owner_id, Pet.archived_at.is_(None)).update({Pet.archived_at: now})
    db.commit()

@router.post("/{owner_id}/restore", response_model=OwnerOut)
def restore_owner(owner_id: int, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    db.query(Pet).filter(Pet.owner_id == owner_id, Pet.archived_at == owner.archived_at).update({Pet.archived_at: None})
    owner.archived_at = None
    db.commit()
    db.refresh(owner)
    return owner
