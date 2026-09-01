"""Soil Analysis service — computes health score from real formula."""
from typing import Dict, List, Tuple
from app.ml import demo_models


class SoilAnalysisService:
    def analyze(self, features: Dict[str, float]) -> Dict:
        score, grade, nutrients = demo_models.compute_soil_health(features)
        recommendations = _recommendations(nutrients)
        return {
            "health_score": score,
            "grade": grade,
            "nutrients": nutrients,
            "recommendations": recommendations,
            "explanation": _overall_explanation(score, grade),
        }


def _recommendations(nutrients: List[Dict]) -> List[str]:
    recs = []
    for n in nutrients:
        if n["status"] == "Low":
            recs.append(
                f"Consider raising {n['nutrient'].lower()} toward the ideal "
                f"{n['ideal_range'][0]}-{n['ideal_range'][1]} range."
            )
    if not recs:
        recs.append("Soil nutrient levels are generally balanced. Maintain current practices.")
    return recs


def _overall_explanation(score: float, grade: str) -> str:
    if score >= 80:
        return "Your soil is in excellent health. Most nutrients are near optimal."
    if score >= 60:
        return "Your soil is in good health with a few nutrients to watch. Targeted actions can improve it further."
    if score >= 40:
        return "Your soil needs attention; several nutrients are below optimal."
    return "Your soil health is poor; a structured soil improvement plan is recommended."
