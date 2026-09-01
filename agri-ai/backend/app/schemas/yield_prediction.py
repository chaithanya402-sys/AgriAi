from pydantic import BaseModel
from typing import List, Optional, Dict


class YieldPredictionRequest(BaseModel):
    farm_id: int
    crop: str
    area: float
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


class FeatureImportance(BaseModel):
    label: str
    importance: float


class YieldPredictionResponse(BaseModel):
    crop: str
    predicted_yield: float
    unit: str
    confidence: float
    area: float
    feature_importance: List[FeatureImportance]
    demo_mode: bool
