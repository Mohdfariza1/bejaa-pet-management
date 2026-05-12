from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    visit_date = Column(Date, nullable=False)
    type = Column(String(30), nullable=False)  # Checkup | Treatment | Surgery | Grooming | Emergency
    diagnosis = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    vet_name = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    pet = relationship("Pet", back_populates="medical_records")


class Vaccine(Base):
    __tablename__ = "vaccines"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    name = Column(String(100), nullable=False)
    administered_date = Column(Date, nullable=False)
    next_due_date = Column(Date, nullable=True)
    administered_by = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    pet = relationship("Pet", back_populates="vaccines")
