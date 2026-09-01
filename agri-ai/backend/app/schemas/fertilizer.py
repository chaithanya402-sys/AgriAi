from pydantic import BaseModel
from typing import List, Optional


class FertilizerRequest(BaseModel):
    farm_id: int
    crop: str
    nitrogen: float
    phosphorus: float
    potassium: float
    soil_ph: Optional[float] = None


class NutrientRecommendation(BaseModel):
    nutrient: str
    current: float
    target: float
    delta: float


class FertilizerResponse(BaseModel):
    crop: str
    recommended: List[NutrientRecommendation]
    npk_ratio: str
    guidance: str
    disclaimer: str
    demo_mode: bool
