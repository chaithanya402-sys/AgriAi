"""Yield Prediction service. Routes to demo or real model based on DEMO_MODE."""
from typing import Dict
from app.config.settings import settings
from app.ml import demo_models
from app.ml.real_models import RealYieldPrediction


class YieldPredictionService:
    def __init__(self):
        self.real = RealYieldPrediction() if not settings.DEMO_MODE else None

    def predict(self, crop: str, features: Dict[str, float]) -> Dict:
        if self.real and self.real.available:
            result = self.real.predict(crop, features)
            demo_mode = False
        else:
            result = demo_models.predict_yield(crop, features)
            demo_mode = True

        result["demo_mode"] = demo_mode
        return result
