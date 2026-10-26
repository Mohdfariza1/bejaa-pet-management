import hashlib
import hmac
import os
import secrets
from typing import Optional
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database import get_db
from app.models.staff import Staff

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
    return hmac.compare_digest(digest.hex(), digest_hex)

# Only the Next.js server knows the key; an empty API_KEY locks everything
def require_api_key(x_api_key: Optional[str] = Header(None)):
    if not settings.API_KEY or not x_api_key or not secrets.compare_digest(x_api_key, settings.API_KEY):
        raise HTTPException(status_code=401, detail="Not authorised")

# Checked on every request, so turning a staff member off locks them out on their next click
def require_staff(
    _: None = Depends(require_api_key),
    x_staff_id: Optional[int] = Header(None),
    db: Session = Depends(get_db),
) -> Staff:
    staff = db.query(Staff).filter(Staff.id == x_staff_id, Staff.is_active == True).first() if x_staff_id else None
    if not staff:
        raise HTTPException(status_code=401, detail="Please log in again")
    return staff

def require_boss(staff: Staff = Depends(require_staff)) -> Staff:
    if staff.role != "Boss":
        raise HTTPException(status_code=403, detail="Only the boss can do this")
    return staff
