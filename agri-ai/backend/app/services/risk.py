"""Risk assessment service. Computes a weighted aggregate farm risk from inputs."""
from typing import Dict, List, Optional

from app import data_loader
from app.config.settings import settings

# Weight of each sub-risk in the overall score (sums to 1.0).
WEIGHTS = {
    "weather": 0.25,
    "soil": 0.20,
    "water": 0.20,
    "disease": 0.20,
    "price": 0.15,
}

# Labels used in top_risks / recommendations.
LABELS = {
    "weather": "Weather",
    "soil": "Soil",
    "water": "Water",
    "disease": "Disease",
    "price": "Price",
}

RECOMMENDATIONS = {
    "weather": "Secure crop insurance & consider protective measures for extreme weather",
    "soil": "Improve soil health — add organic matter or compost to build resilience",
    "water": "Plan irrigation scheduling & adopt water conservation to reduce shortage risk",
    "disease": "Schedule preventive crop protection & scout fields regularly for disease",
    "price": "Lock in forward contracts or diversify crops to manage price volatility",
}


class RiskAssessmentService:
    def assess(
        self,
        weather: Optional[float] = None,
        soil_health: Optional[float] = None,
        water: Optional[float] = None,
        disease: Optional[float] = None,
        price: Optional[float] = None,
        crop: Optional[str] = None,
    ) -> Dict:
        """Aggregate five sub-risks (each 0-100) into an overall risk score.

        All values are computed from the provided inputs:
        - weather, price are already risk scores (higher = worse).
        - soil_health is a health score (higher = better)  -> risk = 100 - score.
        - water_availability is a resource score (higher = better) -> risk = 100 - score.
        - disease risk falls back to the dataset's observed disease rate for
          the given crop (share of records with a non-healthy status) when the
          caller does not supply one.
        Missing inputs default to 0 (no imposed risk).
        """
        if disease is None and crop:
            disease = data_loader.disease_rate(crop)

        # In the AgriAI Risk Factors interface, all five sliders are 0-100 risk levels (0 = none, 100 = extreme risk)
        sub_risks = {
            "weather": _as_risk(weather),
            "soil": _as_risk(soil_health),
            "water": _as_risk(water),
            "disease": _as_risk(disease),
            "price": _as_risk(price),
        }

        overall = sum(WEIGHTS[k] * sub_risks[k] for k in WEIGHTS)
        overall = round(min(100.0, max(0.0, overall)), 1)

        level = _level(overall)
        sorted_factors = sorted(WEIGHTS.keys(), key=lambda k: sub_risks[k], reverse=True)
        top_risks = [LABELS[k] for k in sorted_factors if sub_risks[k] >= 30][:3]
        recommendations = [RECOMMENDATIONS[k] for k in sorted_factors if sub_risks[k] >= 30]
        if not recommendations:
            recommendations = ["Continue standard farm monitoring and follow recommended seasonal crop practices."]

        high_risk_count = sum(1 for v in sub_risks.values() if v >= 60)
        moderate_risk_count = sum(1 for v in sub_risks.values() if 30 <= v < 60)
        low_risk_count = sum(1 for v in sub_risks.values() if v < 30)

        return {
            "overall_risk": overall,
            "level": level,
            "breakdown": {k: round(v, 1) for k, v in sub_risks.items()},
            "top_risks": top_risks,
            "recommendations": recommendations,
            "high_risk_count": high_risk_count,
            "moderate_risk_count": moderate_risk_count,
            "low_risk_count": low_risk_count,
            "demo_mode": settings.DEMO_MODE,
        }


def _as_risk(value: Optional[float]) -> float:
    if value is None:
        return 0.0
    return min(100.0, max(0.0, float(value)))


def _level(score: float) -> str:
    if score < 30:
        return "Low"
    if score < 60:
        return "Moderate"
    if score < 80:
        return "High"
    return "Critical"
