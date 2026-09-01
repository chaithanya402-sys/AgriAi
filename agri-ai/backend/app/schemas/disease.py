from pydantic import BaseModel
from typing import Dict


class DiseasePredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]
    is_healthy: bool
    low_confidence: bool
    message: str
    demo_mode: bool
    image_processed: bool
