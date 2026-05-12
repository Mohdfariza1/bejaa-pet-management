from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.medical import MedicalRecord, Vaccine
from app.models.pet import Pet
from app.schemas.medical import MedicalRecordCreate, MedicalRecordOut, VaccineCreate, VaccineOut

router = APIRouter(tags=["clinic"])

@router.get("/medical/{pet_id}", response_model=list[MedicalRecordOut])
def get_medical_records(pet_id: int, db: Session = Depends(get_db)):
    if not db.query(Pet).filter(Pet.id == pet_id).first():
        raise HTTPException(status_code=404, detail="Pet not found")
    return (
        db.query(MedicalRecord)
        .filter(MedicalRecord.pet_id == pet_id)
        .order_by(MedicalRecord.visit_date.desc())
        .all()
    )

@router.post("/medical", response_model=MedicalRecordOut, status_code=201)
def create_medical_record(data: MedicalRecordCreate, db: Session = Depends(get_db)):
    if not db.query(Pet).filter(Pet.id == data.pet_id).first():
        raise HTTPException(status_code=404, detail="Pet not found")
    record = MedicalRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/vaccines/{pet_id}", response_model=list[VaccineOut])
def get_vaccines(pet_id: int, db: Session = Depends(get_db)):
    if not db.query(Pet).filter(Pet.id == pet_id).first():
        raise HTTPException(status_code=404, detail="Pet not found")
    return (
        db.query(Vaccine)
        .filter(Vaccine.pet_id == pet_id)
        .order_by(Vaccine.next_due_date.asc())
        .all()
    )

@router.post("/vaccines", response_model=VaccineOut, status_code=201)
def add_vaccine(data: VaccineCreate, db: Session = Depends(get_db)):
    if not db.query(Pet).filter(Pet.id == data.pet_id).first():
        raise HTTPException(status_code=404, detail="Pet not found")
    vaccine = Vaccine(**data.model_dump())
    db.add(vaccine)
    db.commit()
    db.refresh(vaccine)
    return vaccine
