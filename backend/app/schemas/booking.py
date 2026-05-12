from pydantic import BaseModel, field_validator, model_validator
from datetime import date, datetime
from typing import Optional

VALID_STATUSES = {"Pending", "Confirmed", "Checked In", "Checked Out", "Cancelled"}

class BookingCreate(BaseModel):
    pet_id: int
    cage_id: int
    check_in: date
    check_out: date
    notes: Optional[str] = None

    @model_validator(mode="after")
    def dates_valid(self):
        if self.check_out <= self.check_in:
            raise ValueError("Check-out date must be after check-in date")
        return self

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def status_valid(cls, v):
        if v and v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(VALID_STATUSES)}")
        return v

class BookingOut(BaseModel):
    id: int
    pet_id: int
    cage_id: int
    check_in: date
    check_out: date
    status: str
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
