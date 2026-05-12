from pydantic import BaseModel, field_validator
from typing import Optional

VALID_TYPES = {"Standard", "Premium", "VIP"}
VALID_SIZES = {"Small", "Medium", "Large"}

class CageCreate(BaseModel):
    label: str
    type: str = "Standard"
    size: str = "Medium"
    is_active: bool = True

    @field_validator("label")
    @classmethod
    def label_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Cage label cannot be empty")
        return v.strip().upper()

    @field_validator("type")
    @classmethod
    def type_valid(cls, v):
        if v not in VALID_TYPES:
            raise ValueError(f"Type must be one of: {', '.join(VALID_TYPES)}")
        return v

    @field_validator("size")
    @classmethod
    def size_valid(cls, v):
        if v not in VALID_SIZES:
            raise ValueError(f"Size must be one of: {', '.join(VALID_SIZES)}")
        return v

class CageUpdate(BaseModel):
    label: Optional[str] = None
    type: Optional[str] = None
    size: Optional[str] = None
    is_active: Optional[bool] = None

class CageOut(BaseModel):
    id: int
    label: str
    type: str
    size: str
    is_active: bool

    model_config = {"from_attributes": True}
