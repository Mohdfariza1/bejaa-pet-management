from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.owner import Owner
from app.models.pet import Pet
from app.schemas.owner import OwnerOut
from app.schemas.pet import PetOut

router = APIRouter(tags=["search"])

@router.get("/search")
def unified_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    owners = (
        db.query(Owner)
        .filter(or_(Owner.name.ilike(f"%{q}%"), Owner.phone.ilike(f"%{q}%")))
        .limit(20).all()
    )
    pets = db.query(Pet).filter(Pet.name.ilike(f"%{q}%")).limit(20).all()
    return {
        "owners": [OwnerOut.model_validate(o) for o in owners],
        "pets": [PetOut.model_validate(p) for p in pets],
    }
