from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.database import get_db
from app.models.owner import Owner
from app.schemas.owner import OwnerCreate, OwnerUpdate, OwnerOut

router = APIRouter(prefix="/owners", tags=["owners"])

@router.get("", response_model=list[OwnerOut])
def list_owners(q: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Owner)
    if q:
        query = query.filter(
            or_(Owner.name.ilike(f"%{q}%"), Owner.phone.ilike(f"%{q}%"))
        )
    return query.order_by(Owner.name).all()

@router.post("", response_model=OwnerOut, status_code=201)
def create_owner(data: OwnerCreate, db: Session = Depends(get_db)):
    if db.query(Owner).filter(Owner.phone == data.phone).first():
        raise HTTPException(status_code=409, detail="Phone number already registered")
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

@router.delete("/{owner_id}", status_code=204)
def delete_owner(owner_id: int, db: Session = Depends(get_db)):
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    db.delete(owner)
    db.commit()
