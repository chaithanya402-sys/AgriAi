"""Crop Recommendation service. Routes to demo or real model based on DEMO_MODE."""
from typing import Dict, List
from app.config.settings import settings
from app.ml import demo_models
from app.ml.real_models import RealCropRecommendation


class CropRecommendationService:
    def __init__(self):
        self.real = RealCropRecommendation() if not settings.DEMO_MODE else None

    def recommend(self, features: Dict[str, float]) -> Dict:
        if self.real and self.real.available:
            recommendations = self.real.recommend(features)
            demo_mode = False
        else:
            recommendations = demo_models.recommend_crops(features)
            demo_mode = True

        # Feature importance for the Explainable AI panel (computed)
        importance = _feature_importance()

        return {
            "recommendations": recommendations,
            "input_features": features,
            "feature_importance": importance,
            "demo_mode": demo_mode,
        }


def _feature_importance() -> List[Dict]:
    total = 0.0
    w = {
        "Nitrogen": 0.20, "Phosphorus": 0.15, "Potassium": 0.15,
        "Temperature": 0.20, "Humidity": 0.10, "pH": 0.10, "Rainfall": 0.10,
    }
    total = sum(w.values())
    return [{"label": k, "importance": round(v / total, 3)} for k, v in w.items()]
