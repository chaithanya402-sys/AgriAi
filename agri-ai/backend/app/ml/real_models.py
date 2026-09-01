"""
Real trained-model services. Loads models from backend/models/* on startup
(NOT per-request). DEMO_MODE=false switches the service layer to these.
Each class mirrors the interface of demo_models so the route/service layer
does not change.
"""
import os
import glob
from typing import Dict, List


def _find_model(pattern: str):
    matches = glob.glob(os.path.join("models", pattern))
    return matches[0] if matches else None


class RealCropRecommendation:
    """Loads a trained sklearn LabelEncoder/RandomForest if present."""

    def __init__(self):
        self.path = _find_model("crop_recommendation*.pkl")
        self.model = None
        if self.path:
            import joblib
            self.model = joblib.load(self.path)

    @property
    def available(self) -> bool:
        return self.model is not None

    def recommend(self, features: Dict[str, float]) -> List[Dict]:
        # NOTE: When a trained model exists, run prediction here.
        # Until then, fall back to the demo heuristic but clearly label it.
        raise NotImplementedError(
            "No trained crop model found. Train or place backend/models/crop_recommendation.pkl"
        )


class RealYieldPrediction:
    """Loads a trained yield regressor (XGBoost) if present."""

    def __init__(self):
        self.path = _find_model("yield_prediction*.pkl")
        self.model = None
        if self.path:
            import joblib
            self.model = joblib.load(self.path)

    @property
    def available(self) -> bool:
        return self.model is not None

    def predict(self, crop: str, features: Dict[str, float]) -> Dict:
        raise NotImplementedError(
            "No trained yield model found. Train or place backend/models/yield_prediction.pkl"
        )
