from pydantic import BaseModel, Field
from typing import List, Optional


class RiskRequest(BaseModel):
    farm_id: int
    crop: Optional[str] = None
    weather_risk: Optional[float] = Field(None, ge=0, le=100)
    soil_health_score: Optional[float] = Field(None, ge=0, le=100)
    water_availability: Optional[float] = Field(None, ge=0, le=100)
    disease_risk: Optional[float] = Field(None, ge=0, le=100)
    price_volatility: Optional[float] = Field(None, ge=0, le=100)


class RiskBreakdown(BaseModel):
    weather: float
    soil: float
    water: float
    disease: float
    price: float


class RiskAssessmentResponse(BaseModel):
    overall_risk: float
    level: str
    breakdown: RiskBreakdown
    top_risks: List[str]
    recommendations: List[str]
    demo_mode: bool
