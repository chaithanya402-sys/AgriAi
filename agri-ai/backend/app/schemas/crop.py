from pydantic import BaseModel
from typing import List, Optional, Dict


class CropRecommendationRequest(BaseModel):
    farm_id: int
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    area: Optional[float] = 1.0
    state: Optional[str] = None
    district: Optional[str] = None


class CropOption(BaseModel):
    crop: str
    score: float
    reason: str
    expected_yield: float
    production: float
    revenue: float
    risk: float


class FeatureImportance(BaseModel):
    label: str
    importance: float


class CropRecommendationResponse(BaseModel):
    recommendations: List[CropOption]
    input_features: Dict[str, float]
    feature_importance: List[FeatureImportance]
    demo_mode: bool
