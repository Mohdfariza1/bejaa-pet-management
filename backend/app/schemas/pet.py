from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional

VALID_SPECIES = {"Dog", "Cat", "Bird", "Rabbit", "Hamster", "Fish", "Other"}
VALID_GENDER = {"Male", "Female", "Unknown"}

class PetCreate(BaseModel):
    owner_id: int
    name: str
    species: str
    breed: Optional[str] = None
    gender: Optional[str] = "Unknown"
    date_of_birth: Optional[date] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Pet name cannot be empty")
        return v.strip()

    @field_validator("species")
    @classmethod
    def species_valid(cls, v):
        if v not in VALID_SPECIES:
            raise ValueError(f"Species must be one of: {', '.join(sorted(VALID_SPECIES))}")
        return v

    @field_validator("gender")
    @classmethod
    def gender_valid(cls, v):
        if v and v not in VALID_GENDER:
            raise ValueError(f"Gender must be one of: {', '.join(VALID_GENDER)}")
        return v

    @field_validator("weight_kg")
    @classmethod
    def weight_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Weight must be greater than 0")
        return v

class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None

class PetOut(BaseModel):
    id: int
    owner_id: int
    name: str
    species: str
    breed: Optional[str]
    gender: Optional[str]
    date_of_birth: Optional[date]
    weight_kg: Optional[float]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
