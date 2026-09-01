from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from app.config.database import Base


class CropPrediction(Base):
    __tablename__ = "crop_predictions"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop = Column(String(100))
    score = Column(Float)
    reason = Column(Text)
    demo_mode = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class YieldPrediction(Base):
    __tablename__ = "yield_predictions"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop = Column(String(100))
    predicted_yield = Column(Float)
    unit = Column(String(20))
    confidence = Column(Float)
    area = Column(Float)
    demo_mode = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WeatherRecord(Base):
    __tablename__ = "weather_records"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    rainfall = Column(Float)
    condition = Column(String(100))
    source = Column(String(20), default="demo")
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class IrrigationRecommendation(Base):
    __tablename__ = "irrigation_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    soil_moisture = Column(Float)
    recommendation = Column(String(50))
    amount_mm = Column(Float)
    reason = Column(Text)
    demo_mode = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FertilizerRecommendation(Base):
    __tablename__ = "fertilizer_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    crop = Column(String(100))
    recommendation = Column(Text)
    npk_split = Column(JSON)
    demo_mode = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    prediction = Column(String(100))
    confidence = Column(Float)
    image_name = Column(String(255))
    probabilities = Column(JSON)
    demo_mode = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MarketPrice(Base):
    __tablename__ = "market_prices"
    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String(100))
    market = Column(String(100), nullable=True)
    price_per_tonne = Column(Float)
    currency = Column(String(10), default="INR")
    source = Column(String(20), default="demo")
    date = Column(DateTime(timezone=True), server_default=func.now())


class FarmAlert(Base):
    __tablename__ = "farm_alerts"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    alert_type = Column(String(50))  # weather, disease, risk, market
    severity = Column(String(20))  # info, warning, danger
    message = Column(Text)
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OptimizationResult(Base):
    __tablename__ = "optimization_results"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    current_plan = Column(JSON)
    optimized_plan = Column(JSON)
    improvements = Column(JSON)
    demo_mode = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
