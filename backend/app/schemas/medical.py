from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional

VALID_VISIT_TYPES = {"Checkup", "Treatment", "Surgery", "Grooming", "Emergency"}

class MedicalRecordCreate(BaseModel):
    pet_id: int
    visit_date: date
    type: str
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    vet_name: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("type")
    @classmethod
    def type_valid(cls, v):
        if v not in VALID_VISIT_TYPES:
            raise ValueError(f"Type must be one of: {', '.join(VALID_VISIT_TYPES)}")
        return v

class MedicalRecordOut(BaseModel):
    id: int
    pet_id: int
    visit_date: date
    type: str
    diagnosis: Optional[str]
    treatment: Optional[str]
    vet_name: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class VaccineCreate(BaseModel):
    pet_id: int
    name: str
    administered_date: date
    next_due_date: Optional[date] = None
    administered_by: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Vaccine name cannot be empty")
        return v.strip()

    @field_validator("next_due_date", mode="after")
    @classmethod
    def due_after_administered(cls, v, info):
        if v and "administered_date" in info.data and v <= info.data["administered_date"]:
            raise ValueError("Next due date must be after administered date")
        return v

class VaccineOut(BaseModel):
    id: int
    pet_id: int
    name: str
    administered_date: date
    next_due_date: Optional[date]
    administered_by: Optional[str]
    notes: Optional[str]

    model_config = {"from_attributes": True}
