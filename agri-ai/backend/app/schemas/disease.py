from pydantic import BaseModel
from typing import Dict, List, Optional


class DiseasePredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]
    is_healthy: bool
    low_confidence: bool
    message: Optional[str] = ""
    demo_mode: bool
    image_processed: bool
    crop_detected: Optional[str] = None
    description: Optional[str] = None
    treatment: Optional[List[str]] = None
    ai_model: Optional[str] = None
