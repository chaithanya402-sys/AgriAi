from app.models.user import User
from app.models.farm import Farm, Field
from app.models.soil_record import SoilRecord
from app.models.analytics import (
    CropPrediction, YieldPrediction, WeatherRecord, IrrigationRecommendation,
    FertilizerRecommendation, DiseasePrediction, MarketPrice, FarmAlert,
    OptimizationResult,
)

# Import all models so create_all() registers them
__all__ = [
    "User", "Farm", "Field", "SoilRecord",
    "CropPrediction", "YieldPrediction", "WeatherRecord",
    "IrrigationRecommendation", "FertilizerRecommendation",
    "DiseasePrediction", "MarketPrice", "FarmAlert", "OptimizationResult",
]
