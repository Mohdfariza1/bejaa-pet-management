from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Cage(Base):
    __tablename__ = "cages"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(20), nullable=False, unique=True)
    type = Column(String(20), nullable=False, default="Standard")   # Standard | Premium | VIP
    size = Column(String(20), nullable=False, default="Medium")     # Small | Medium | Large
    is_active = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="cage")
