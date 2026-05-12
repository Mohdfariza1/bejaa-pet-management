from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.pet import Pet
from app.models.owner import Owner
from app.schemas.pet import PetCreate, PetUpdate, PetOut

router = APIRouter(prefix="/pets", tags=["pets"])

@router.get("", response_model=list[PetOut])
def list_pets(
    owner_id: Optional[int] = Query(None),
    species: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Pet)
    if owner_id:
        query = query.filter(Pet.owner_id == owner_id)
    if species:
        query = query.filter(Pet.species == species)
    return query.order_by(Pet.name).all()

@router.post("", response_model=PetOut, status_code=201)
def create_pet(data: PetCreate, db: Session = Depends(get_db)):
    if not db.query(Owner).filter(Owner.id == data.owner_id).first():
        raise HTTPException(status_code=404, detail="Owner not found")
    pet = Pet(**data.model_dump())
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet

@router.get("/{pet_id}", response_model=PetOut)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@router.put("/{pet_id}", response_model=PetOut)
def update_pet(pet_id: int, data: PetUpdate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(pet, field, value)
    db.commit()
    db.refresh(pet)
    return pet

@router.delete("/{pet_id}", status_code=204)
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    db.delete(pet)
    db.commit()
