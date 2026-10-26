from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.staff import Staff
from app.schemas.staff import LoginIn, StaffCreate, StaffUpdate, StaffOut
from app.core.auth import hash_password, verify_password, require_api_key, require_boss

auth_router = APIRouter(prefix="/auth", tags=["auth"], dependencies=[Depends(require_api_key)])
router = APIRouter(prefix="/staff", tags=["staff"])

@auth_router.post("/login", response_model=StaffOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.username == data.username.strip().lower()).first()
    if not staff or not staff.is_active or not verify_password(data.password, staff.password_hash):
        raise HTTPException(status_code=401, detail="Wrong username or password")
    return staff

@router.get("", response_model=list[StaffOut])
def list_staff(db: Session = Depends(get_db), _: Staff = Depends(require_boss)):
    return db.query(Staff).order_by(Staff.is_active.desc(), Staff.name).all()

@router.post("", response_model=StaffOut, status_code=201)
def create_staff(data: StaffCreate, db: Session = Depends(get_db), _: Staff = Depends(require_boss)):
    if db.query(Staff).filter(Staff.username == data.username).first():
        raise HTTPException(status_code=409, detail="That username is already taken")
    staff = Staff(name=data.name, username=data.username, role=data.role, password_hash=hash_password(data.password))
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff

@router.put("/{staff_id}", response_model=StaffOut)
def update_staff(staff_id: int, data: StaffUpdate, db: Session = Depends(get_db), me: Staff = Depends(require_boss)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    if staff.id == me.id and (data.is_active is False or data.role == "Staff"):
        raise HTTPException(status_code=400, detail="You can't turn off or demote your own account")
    if data.name is not None:
        staff.name = data.name.strip() or staff.name
    if data.password:
        staff.password_hash = hash_password(data.password)
    if data.role is not None:
        staff.role = data.role
    if data.is_active is not None:
        staff.is_active = data.is_active
    db.commit()
    db.refresh(staff)
    return staff
