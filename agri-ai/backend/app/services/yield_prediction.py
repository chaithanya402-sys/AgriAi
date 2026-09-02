from typing import Dict, Optional
from app.config.settings import settings
from app.ml import demo_models
from app.ml.real_models import RealYieldPrediction


class YieldPredictionService:
    def __init__(self):
        self.real = RealYieldPrediction() if not settings.DEMO_MODE else None

    def predict(
        self,
        crop: str,
        features: Dict[str, float],
        state: Optional[str] = None,
        district: Optional[str] = None,
        area: float = 1.0,
        season: Optional[str] = None,
    ) -> Dict:
        if self.real and self.real.available:
            result = self.real.predict(crop, features)
            demo_mode = False
        elif state and district:
            from app.services import agricultural_dataset_service as ads
            result = ads.get_yield_data(
                state_name=state,
                district_name=district,
                crop_name=crop,
                area=area,
                season=season,
                features=features,
            )
            demo_mode = False
        else:
            result = demo_models.predict_yield(crop, features)
            demo_mode = True

        result["demo_mode"] = demo_mode
        return result
