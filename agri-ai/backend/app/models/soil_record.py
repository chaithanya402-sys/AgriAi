from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.config.database import Base


class SoilRecord(Base):
    __tablename__ = "soil_records"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    nitrogen = Column(Float)
    phosphorus = Column(Float)
    potassium = Column(Float)
    ph = Column(Float)
    organic_carbon = Column(Float)
    moisture = Column(Float)
    texture = Column(String(50), nullable=True)
    health_score = Column(Float)
    grade = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
