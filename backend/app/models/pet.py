from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("owners.id"), nullable=False)
    name = Column(String(100), nullable=False)
    species = Column(String(50), nullable=False)
    breed = Column(String(100), nullable=True)
    gender = Column(String(10), nullable=True, default="Unknown")
    date_of_birth = Column(Date, nullable=True)
    weight_kg = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("Owner", back_populates="pets")
    bookings = relationship("Booking", back_populates="pet", cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="pet", cascade="all, delete-orphan")
    vaccines = relationship("Vaccine", back_populates="pet", cascade="all, delete-orphan")
