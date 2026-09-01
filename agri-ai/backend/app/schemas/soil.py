from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SoilAnalysisRequest(BaseModel):
    farm_id: int
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    organic_carbon: float
    moisture: float
    texture: Optional[str] = None


class NutrientStatus(BaseModel):
    nutrient: str
    value: float
    status: str
    score: float
    ideal_range: List[float]
    explanation: str


class SoilAnalysisResponse(BaseModel):
    id: Optional[int] = None
    health_score: float
    grade: str
    nutrients: List[NutrientStatus]
    recommendations: List[str]
    explanation: str
