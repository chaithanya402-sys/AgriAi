"""Context-grounded AI Assistant.

Answers are produced by RULE-BASED matching against the farmer's real stored
data. No external LLM is called and no API key is used. Every number in an
answer comes from the database; absent values are reported as such.
"""
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.analytics import (
    DiseasePrediction,
    FarmAlert,
    IrrigationRecommendation,
    WeatherRecord,
    YieldPrediction,
)
from app.models.farm import Farm
from app.models.soil_record import SoilRecord

# Ideal soil ranges used only to interpret stored values (not to invent data)
_NUTRIENT_RANGES = {
    "nitrogen": (120, 180),
    "phosphorus": (20, 40),
    "potassium": (60, 120),
    "ph": (6.0, 7.5),
}

_FALLBACK_TEXT = (
    "based on the farm's recorded data and should be supplemented with "
    "professional expert advice."
)


class AssistantService:
    def answer(self, db: Session, farm_id: int, user_id: int, question: str) -> Dict:
        q = (question or "").lower()

        context = self._gather_context(db, farm_id, user_id)
        summary = context["summary"]

        answer = self._match_rule(q, context)

        return {
            "answer": answer,
            "context_summary": summary,
            "demo_mode": True,  # rule-based assistant, not a live model
        }

    # ------------------------------------------------------------------ #
    # Context gathering
    # ------------------------------------------------------------------ #
    def _gather_context(self, db: Session, farm_id: int, user_id: int) -> Dict:
        farm = (
            db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user_id).first()
        )

        soil = (
            db.query(SoilRecord)
            .filter(SoilRecord.farm_id == farm_id)
            .order_by(SoilRecord.created_at.desc())
            .first()
        )
        yields = (
            db.query(YieldPrediction)
            .filter(YieldPrediction.farm_id == farm_id)
            .order_by(YieldPrediction.created_at.desc())
            .all()
        )
        weather = (
            db.query(WeatherRecord)
            .filter(WeatherRecord.farm_id == farm_id)
            .order_by(WeatherRecord.recorded_at.desc())
            .first()
        )
        irrigation = (
            db.query(IrrigationRecommendation)
            .filter(IrrigationRecommendation.farm_id == farm_id)
            .order_by(IrrigationRecommendation.created_at.desc())
            .first()
        )
        diseases = (
            db.query(DiseasePrediction)
            .filter(DiseasePrediction.farm_id == farm_id)
            .order_by(DiseasePrediction.created_at.desc())
            .all()
        )
        alerts = (
            db.query(FarmAlert)
            .filter(FarmAlert.farm_id == farm_id)
            .order_by(FarmAlert.created_at.desc())
            .all()
        )

        summary = {
            "farm": {
                "farm_id": farm_id,
                "name": farm.name if farm else "unknown",
                "location": farm.location if farm else None,
                "total_area": farm.total_area if farm else None,
            },
            "latest_soil": self._soil_summary(soil),
            "yield_predictions": [
                {
                    "crop": y.crop,
                    "predicted_yield": y.predicted_yield,
                    "unit": y.unit,
                    "confidence": y.confidence,
                }
                for y in yields
            ],
            "latest_weather": (
                {
                    "temperature": weather.temperature,
                    "humidity": weather.humidity,
                    "rainfall": weather.rainfall,
                    "condition": weather.condition,
                }
                if weather
                else None
            ),
            "latest_irrigation": (
                {
                    "soil_moisture": irrigation.soil_moisture,
                    "recommendation": irrigation.recommendation,
                    "amount_mm": irrigation.amount_mm,
                }
                if irrigation
                else None
            ),
            "disease_predictions": [
                {
                    "prediction": d.prediction,
                    "confidence": d.confidence,
                }
                for d in diseases
            ],
            "alerts": [
                {
                    "alert_type": a.alert_type,
                    "severity": a.severity,
                    "message": a.message,
                    "is_read": a.is_read,
                }
                for a in alerts
            ],
        }
        return {"farm": farm, "summary": summary}

    def _soil_summary(self, soil: Optional[SoilRecord]) -> Optional[Dict]:
        if not soil:
            return None
        nutrients = {}
        for key in ("nitrogen", "phosphorus", "potassium"):
            value = getattr(soil, key)
            if value is None:
                continue
            low, high = _NUTRIENT_RANGES[key]
            status = "below ideal" if value < low else ("above ideal" if value > high else "in ideal range")
            nutrients[key] = {"value": value, "status": status}
        return {
            "health_score": soil.health_score,
            "grade": soil.grade,
            "ph": soil.ph,
            "moisture": soil.moisture,
            "organic_carbon": soil.organic_carbon,
            "nutrients": nutrients,
        }

    # ------------------------------------------------------------------ #
    # Rule-based answering
    # ------------------------------------------------------------------ #
    def _match_rule(self, q: str, context: Dict) -> str:
        summary = context["summary"]

        if any(k in q for k in ("yield", "low yield", "produce", "productivity")):
            return self._answer_yield(q, summary)

        if any(k in q for k in ("irrigation", "water", "moisture")):
            return self._answer_irrigation(summary)

        if any(k in q for k in ("disease", "sick", "healthy", "pest")):
            return self._answer_disease(summary)

        if any(k in q for k in ("weather", "rain", "temperature", "climate")):
            return self._answer_weather(summary)

        if any(k in q for k in ("soil", "nutrient", "fertility")):
            return self._answer_soil(summary)

        if any(k in q for k in ("alert", "warning", "notification", "risk")):
            return self._answer_alerts(summary)

        return self._answer_general(summary)

    # -- yield -------------------------------------------------------- #
    def _answer_yield(self, q: str, summary: Dict) -> str:
        soil = summary["latest_soil"]
        yields = summary["yield_predictions"]
        best_yield = yields[0] if yields else None

        if not soil and not best_yield:
            return (
                "There is no recorded data for yield predictions or soil analysis "
                + "yet for this farm. Record a soil test and run yield prediction "
                f"to get started. This answer is {_FALLBACK_TEXT}"
            )

        parts = []
        if soil:
            score = soil["health_score"]
            score_txt = (
                f"{score}/100"
                if score is not None
                else "no recorded health score"
            )

            # pick the nutrient with the most influence (worst status)
            levers = []
            for name, info in soil["nutrients"].items():
                low, high = _NUTRIENT_RANGES[name]
                value = info["value"]
                # distance from ideal band
                if value < low:
                    levers.append((low - value, name, "below ideal"))
                elif value > high:
                    levers.append((value - high, name, "above ideal"))
            top_lever = max(levers, key=lambda x: x[0]) if levers else None

            if best_yield:
                parts.append(
                    f"Your latest soil analysis scored {score_txt} with "
                    f"an overall grade of {soil['grade'] or 'no recorded grade'}."
                )
            else:
                parts.append(
                    f"Your latest soil analysis scored {score_txt} with "
                    f"an overall grade of {soil['grade'] or 'no recorded grade'}."
                )

        if best_yield:
            crop = best_yield.get("crop") or "the crop"
            py = best_yield.get("predicted_yield")
            unit = best_yield.get("unit") or ""
            yield_txt = (
                f"{py} {unit}".strip()
                if py is not None
                else "no recorded value"
            )
            if top_lever:
                _, name, status = top_lever
                parts.append(
                    f"Based on the Yield Prediction of {yield_txt} for {crop}, "
                    f"the most impactful lever is {name}, which is currently "
                    f"{status}. Raising it toward the ideal range would support "
                    "higher yield."
                )
            else:
                parts.append(
                    f"Based on the Yield Prediction of {yield_txt} for {crop}, "
                    "your soil nutrients are within their ideal ranges, so "
                    "maintaining current soil management is recommended."
                )
        elif not soil:
            parts.append("There is no recorded yield prediction yet for this farm.")

        parts.append(f"This answer is {_FALLBACK_TEXT}")
        return " ".join(parts)

    # -- irrigation --------------------------------------------------- #
    def _answer_irrigation(self, summary: Dict) -> str:
        irrigation = summary["latest_irrigation"]
        soil = summary["latest_soil"]
        weather = summary["latest_weather"]

        if not irrigation:
            return (
                "There is no recorded irrigation recommendation yet for this farm. "
                f"The last recorded soil moisture is "
                + self._soil_moisture_txt(soil)
                + f". This answer is {_FALLBACK_TEXT}"
            )

        moisture = irrigation["soil_moisture"]
        parts = []
        parts.append(
            "The latest irrigation recommendation is "
            f"'{irrigation['recommendation']}'"
        )
        if irrigation["amount_mm"] is not None:
            parts.append(
                f"with {irrigation['amount_mm']} mm of water to apply."
            )
        parts.append(
            f"Recorded soil moisture at that time was "
            f"{self._soil_moisture_txt(soil)}."
        )
        if weather and weather["rainfall"] is not None:
            parts.append(
                f"Recent recorded rainfall is {weather['rainfall']} mm, which can "
                "affect how much additional water you need."
            )
        parts.append(f"This answer is {_FALLBACK_TEXT}")
        return " ".join(parts)

    def _soil_moisture_txt(self, soil: Optional[Dict]) -> str:
        if not soil or soil.get("moisture") is None:
            return "no recorded data yet"
        return f"{soil['moisture']}"

    # -- disease ------------------------------------------------------ #
    def _answer_disease(self, summary: Dict) -> str:
        diseases = summary["disease_predictions"]
        if not diseases:
            return (
                "There is no recorded disease prediction data yet for this farm. "
                "Upload a crop image through the disease detection feature to "
                f"get a prediction. This answer is {_FALLBACK_TEXT}"
            )
        top = diseases[0]
        parts = [
            f"The most recent disease prediction is '{top['prediction']}' "
            f"with a confidence of {top['confidence']}."
        ]
        if len(diseases) > 1:
            parts.append(
                f"It is based on {len(diseases)} recorded predictions in total."
            )
        parts.append(
            "A confirmed diagnosis by an agronomist is recommended before any "
            "treatment is applied."
        )
        return " ".join(parts)

    # -- weather ------------------------------------------------------ #
    def _answer_weather(self, summary: Dict) -> str:
        weather = summary["latest_weather"]
        if not weather:
            return (
                "There is no recorded weather data yet for this farm. "
                f"This answer is {_FALLBACK_TEXT}"
            )
        parts = [
            "The latest recorded weather for this farm is: "
            + self._weather_txt(weather)
            + "."
        ]
        parts.append(f"This answer is {_FALLBACK_TEXT}")
        return " ".join(parts)

    def _weather_txt(self, weather: Dict) -> str:
        bits = []
        if weather.get("temperature") is not None:
            bits.append(f"{weather['temperature']}°C temperature")
        if weather.get("humidity") is not None:
            bits.append(f"{weather['humidity']}% humidity")
        if weather.get("rainfall") is not None:
            bits.append(f"{weather['rainfall']} mm rainfall")
        if weather.get("condition"):
            bits.append(f"{weather['condition']} conditions")
        if not bits:
            return "no recorded values"
        return ", ".join(bits)

    # -- soil --------------------------------------------------------- #
    def _answer_soil(self, summary: Dict) -> str:
        soil = summary["latest_soil"]
        if not soil:
            return (
                "There is no recorded soil analysis yet for this farm. Record a "
                f"soil test to get started. This answer is {_FALLBACK_TEXT}"
            )
        parts = [
            f"Your latest soil health score is "
            f"{soil['health_score'] if soil['health_score'] is not None else 'no recorded value'}"
            f" with grade '{soil['grade'] or 'no recorded grade'}'."
        ]
        nutrient_bits = []
        for name, info in soil["nutrients"].items():
            nutrient_bits.append(
                f"{name} at {info['value']} ({info['status']})"
            )
        if nutrient_bits:
            parts.append("Key nutrients: " + ", ".join(nutrient_bits) + ".")
        if soil.get("ph") is not None:
            ph_status = "in ideal range"
            if soil["ph"] < _NUTRIENT_RANGES["ph"][0]:
                ph_status = "below ideal"
            elif soil["ph"] > _NUTRIENT_RANGES["ph"][1]:
                ph_status = "above ideal"
            parts.append(f"Soil pH is {soil['ph']} ({ph_status}).")
        parts.append(f"This answer is {_FALLBACK_TEXT}")
        return " ".join(parts)

    # -- alerts ------------------------------------------------------- #
    def _answer_alerts(self, summary: Dict) -> str:
        alerts = summary["alerts"]
        open_alerts = [a for a in alerts if not a["is_read"]]
        if not open_alerts:
            return (
                f"You have no open alerts for this farm "
                f"({len(alerts)} total recorded). "
                f"This answer is {_FALLBACK_TEXT}"
            )
        parts = [f"You have {len(open_alerts)} open alert(s):"]
        for a in open_alerts:
            parts.append(
                f"- [{a['severity']}] ({a['alert_type']}) {a['message']}"
            )
        parts.append(f"This answer is {_FALLBACK_TEXT}")
        return " ".join(parts)

    # -- general ------------------------------------------------------ #
    def _answer_general(self, summary: Dict) -> str:
        parts = [
            "Here is a summary of this farm's recorded data:"
        ]
        soil = summary["latest_soil"]
        yields = summary["yield_predictions"]
        if soil:
            parts.append(
                f"Latest soil health score is "
                f"{soil['health_score'] if soil['health_score'] is not None else 'no recorded value'}"
                f" (grade {soil['grade'] or 'no recorded grade'})."
            )
        else:
            parts.append("There is no recorded soil analysis yet.")
        if yields:
            top = yields[0]
            parts.append(
                f"Latest yield prediction is {top['predicted_yield']} {top['unit'] or ''}"
                f" for {top['crop'] or 'the crop'}."
            )
        else:
            parts.append("There is no recorded yield prediction yet.")
        if summary["latest_weather"]:
            parts.append(
                "Latest weather: " + self._weather_txt(summary["latest_weather"]) + "."
            )
        open_alerts = [a for a in summary["alerts"] if not a["is_read"]]
        parts.append(
            f"You have {len(open_alerts)} open alert(s) recorded."
        )
        parts.append(
            "Available data includes soil records, yield predictions, weather, "
            "irrigation, disease predictions, and alerts. Ask about any of these, "
            "or ask about yield, irrigation, disease, soil, or alerts specifically."
        )
        parts.append(f"This answer is {_FALLBACK_TEXT}")
        return " ".join(parts)
