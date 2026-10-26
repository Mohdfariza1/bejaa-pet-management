from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

VALID_ROLES = {"Boss", "Staff"}

def _check_password(v):
    if v is not None and len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    return v

class LoginIn(BaseModel):
    username: str
    password: str

class StaffCreate(BaseModel):
    name: str
    username: str
    password: str
    role: str = "Staff"

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()

    @field_validator("username")
    @classmethod
    def username_clean(cls, v):
        v = v.strip().lower()
        if len(v) < 3 or not v.replace(".", "").replace("_", "").isalnum():
            raise ValueError("Username: at least 3 letters or numbers, no spaces")
        return v

    @field_validator("password")
    @classmethod
    def password_long(cls, v):
        return _check_password(v)

    @field_validator("role")
    @classmethod
    def role_valid(cls, v):
        if v not in VALID_ROLES:
            raise ValueError("Role must be Boss or Staff")
        return v

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("password")
    @classmethod
    def password_long(cls, v):
        return _check_password(v)

    @field_validator("role")
    @classmethod
    def role_valid(cls, v):
        if v is not None and v not in VALID_ROLES:
            raise ValueError("Role must be Boss or Staff")
        return v

class StaffOut(BaseModel):
    id: int
    name: str
    username: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
