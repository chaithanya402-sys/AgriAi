from pydantic import BaseModel
from typing import Optional


class IrrigationRequest(BaseModel):
    farm_id: int
    soil_moisture: float
    crop: str
    temperature: Optional[float] = None
    forecast_rainfall_mm: Optional[float] = None


class IrrigationResponse(BaseModel):
    recommendation: str
    amount_mm: float
    reason: str
    crop: str
    demo_mode: bool
