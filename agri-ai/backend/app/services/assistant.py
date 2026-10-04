"""Context-grounded AgriAI Assistant powered by Groq.

STRICTLY AGRICULTURE-ONLY:
Answers are grounded in the farmer's stored farm context (soil, weather, yield,
irrigation, fertilizers, crops, and alerts). Any off-topic queries (coding,
entertainment, mathematics, general knowledge, etc.) are strictly rejected
with standard localized refusal messages in English, Telugu, and Hindi.
"""
import json
import logging
import re
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.models.analytics import (
    CropPrediction,
    DiseasePrediction,
    FarmAlert,
    FertilizerRecommendation,
    IrrigationRecommendation,
    WeatherRecord,
    YieldPrediction,
)
from app.models.farm import Farm
from app.models.soil_record import SoilRecord

logger = logging.getLogger(__name__)

# Ideal soil ranges used only to interpret stored values (not to invent data)
_NUTRIENT_RANGES = {
    "nitrogen": (120, 180),
    "phosphorus": (20, 40),
    "potassium": (60, 120),
    "ph": (6.0, 7.5),
}

# Standard localized refusal messages
REFUSAL_MESSAGES = {
    "en": (
        "I'm your AgriAI agricultural assistant. I can help only with agriculture, "
        "farming, crops, soil, irrigation, fertilizers, farming-related weather, "
        "yield, and other agricultural topics. Please ask me an agriculture-related question."
    ),
    "te": (
        "నేను AgriAI వ్యవసాయ సహాయకుడిని. నేను వ్యవసాయం, పంటలు, నేల, నీటిపారుదల, ఎరువులు, "
        "వ్యవసాయానికి సంబంధించిన వాతావరణం, దిగుబడి మరియు ఇతర వ్యవసాయ అంశాల గురించి మాత్రమే "
        "సహాయం చేయగలను. దయచేసి వ్యవసాయానికి సంబంధించిన ప్రశ్న అడగండి."
    ),
    "hi": (
        "मैं AgriAI कृषि सहायक हूँ। मैं केवल खेती, फसल, मिट्टी, सिंचाई, उर्वरक, "
        "कृषि से संबंधित मौसम, उपज और अन्य कृषि विषयों में सहायता कर सकता हूँ। "
        "कृपया कृषि से संबंधित प्रश्न पूछें।"
    ),
}

# Fast off-topic patterns (strictly non-agricultural queries)
OFF_TOPIC_PATTERNS = [
    r"\b(python|javascript|typescript|java|c\+\+|c#|html|css|sql|react|vue|angular|fastapi|django|flask|docker|kubernetes|git|github|debug code|syntax error|write a script|write a function|write code|code snippet|algorithm|recursion|regex|binary search|leetcode)\b",
    r"\b(movie|cinema|actor|actress|hollywood|bollywood|tollywood|song|sing a song|lyrics|music album|video game|playstation|xbox|netflix|anime|marvel|dc comics|superman|batman|spiderman|celebrity|gossip)\b",
    r"\b(tell me a joke|tell a joke|tell me a story|write a poem|funny joke|flirt|are you single|who is your creator|who are you dating)\b",
    r"\b(who is the president of|who won the election|prime minister of|political party|cricket match|ipl|world cup|football match|fifa|messi|ronaldo|bitcoin|crypto|ethereum|blockchain|forex trading|stock trading|nasdaq|wall street)\b",
    r"\b(quantum physics|theory of relativity|speed of light|black hole|string theory|integrate x\^2|derivative of|solve the equation|math homework|write an essay on)\b",
]

# Agriculture safety keywords that override off-topic detection if mixed
AGRI_SAFETY_KEYWORDS = [
    "crop", "crops", "farm", "farming", "farmer", "agriculture", "agricultural", "soil",
    "npk", "nitrogen", "phosphorus", "potassium", "ph", "fertilizer", "fertilizers",
    "irrigation", "water", "yield", "pesticide", "fungicide", "weed", "harvest", "paddy",
    "rice", "wheat", "cotton", "maize", "corn", "millet", "sugarcane", "chilli", "seeds",
    "tractor", "compost", "manure", "monsoon", "rainfall", "weather", "mandi", "msp",
    "apmc", "kisan", "rythu", "kheti", "fasal", "mitti", "bhumi", "paani", "varsham",
    "neellu", "eruvulu", "rogaalu", "keetakaalu", "dhanyam", "digubadi"
]


class AssistantService:
    def answer(
        self,
        db: Session,
        farm_id: int,
        user_id: int,
        question: str,
        language: str = "en",
        crop: Optional[str] = None,
    ) -> Dict:
        lang = (language or "en").lower().strip()
        if lang not in ("en", "te", "hi"):
            lang = "en"

        q = (question or "").strip()
        if not q:
            greeting = {
                "en": "Hello! I am your AgriAI agricultural assistant. How can I help with your crops or farm today?",
                "te": "నమస్కారం! నేను మీ AgriAI వ్యవసాయ సహాయకుడిని. ఈరోజు మీ పంటలు లేదా వ్యవసాయానికి నేను ఎలా సహాయపడగలను?",
                "hi": "नमस्ते! मैं आपका AgriAI कृषि सहायक हूँ। आज मैं आपकी फसलों या खेत में कैसे मदद कर सकता हूँ?",
            }.get(lang, REFUSAL_MESSAGES["en"])
            return {
                "answer": greeting,
                "context_summary": {},
                "demo_mode": False,
                "language": lang,
            }

        # 1. Fast boundary check: Is it definitely off-topic?
        if self._is_strictly_off_topic(q):
            return {
                "answer": REFUSAL_MESSAGES.get(lang, REFUSAL_MESSAGES["en"]),
                "context_summary": {},
                "demo_mode": False,
                "language": lang,
            }

        # 2. Gather active farm context
        context = self._gather_context(db, farm_id, user_id, crop=crop)
        summary = context["summary"]

        # 3. Call Groq AI Assistant
        groq_answer = self._ask_groq(q, summary, lang, crop)
        if groq_answer:
            # Check if model produced a refusal or off-topic response
            clean_answer = self._normalize_refusal_if_needed(groq_answer, lang)
            return {
                "answer": clean_answer,
                "context_summary": summary,
                "demo_mode": False,
                "language": lang,
            }

        # 4. Fallback: Context-grounded rule-based engine
        fallback_answer = self._match_rule(q.lower(), context, lang)
        return {
            "answer": fallback_answer,
            "context_summary": summary,
            "demo_mode": True,  # Fallback to rule engine
            "language": lang,
        }

    # ------------------------------------------------------------------ #
    # Domain guardrails
    # ------------------------------------------------------------------ #
    def _is_strictly_off_topic(self, q: str) -> bool:
        q_lower = q.lower()
        # If any agriculture safety keyword is present, do not reject automatically
        if any(w in q_lower for w in AGRI_SAFETY_KEYWORDS):
            return False

        # If it matches explicitly non-agri regexes, reject immediately
        for pat in OFF_TOPIC_PATTERNS:
            if re.search(pat, q_lower, re.IGNORECASE):
                return True

        return False

    def _normalize_refusal_if_needed(self, answer: str, lang: str) -> str:
        # If the LLM returned a refusal phrase or apology for non-agri topic, standardize it
        indicators = [
            "only with agriculture", "only help with agriculture", "strictly agriculture",
            "not related to agriculture", "వ్యవసాయానికి సంబంధించిన", "వ్యవసాయ అంశాల గురించి మాత్రమే",
            "केवल खेती", "कृषि से संबंधित", "I cannot help with coding", "I cannot write code"
        ]
        if any(ind in answer for ind in indicators) and len(answer) < 300:
            return REFUSAL_MESSAGES.get(lang, REFUSAL_MESSAGES["en"])
        return answer

    # ------------------------------------------------------------------ #
    # Groq LLM integration
    # ------------------------------------------------------------------ #
    def _ask_groq(
        self, question: str, summary: Dict, language: str, crop: Optional[str]
    ) -> Optional[str]:
        api_key = settings.GROQ_API_KEY
        if not api_key:
            logger.warning("GROQ_API_KEY is not configured. Falling back to rule engine.")
            return None

        lang_meta = {
            "en": ("English", "Latin script"),
            "te": ("Telugu", "Telugu script (తెలుగు)"),
            "hi": ("Hindi", "Devanagari script (हिन्दी)"),
        }.get(language, ("English", "Latin script"))

        target_lang, target_script = lang_meta
        refusal_sample = REFUSAL_MESSAGES.get(language, REFUSAL_MESSAGES["en"])

        system_prompt = f"""You are AgriAI Assistant, an advanced, highly specialized AI Agricultural Advisor for Indian farmers and agricultural practitioners.

CRITICAL INSTRUCTIONS:
1. STRICTLY AGRICULTURE-ONLY:
You are allowed to discuss ONLY topics related to:
- Agriculture, agronomy, farming practices, and crop management
- Soil science, soil nutrients (NPK, micronutrients), soil pH, organic matter, and soil fertility
- Crop recommendation, seasonal planning (Kharif, Rabi, Zaid), crop rotations, and intercropping
- Irrigation systems, water conservation, scheduling, and drought/flood mitigation
- Fertilizer application (organic, chemical, biofertilizers), application dosage, and soil amendments
- Plant protection: insect pests, bacterial/fungal/viral diseases, weeds, and Integrated Pest Management (IPM)
- Harvest timing, post-harvest drying, storage, and processing
- Agricultural economics: crop cost of cultivation, yield optimization, market/mandi prices, MSP, and government farmer schemes (e.g., PM-Kisan, PMFBY)
- Weather forecasts and climatic impact on standing crops
- Farm machinery, precision agriculture, and sustainable farm management

2. OFF-TOPIC REJECTION:
If the user asks ANY query that is not strictly related to agriculture/farming (for example: software programming, writing code, general entertainment, movies, celebrities, jokes, riddles, non-agricultural science/math homework, cryptocurrency, general politics, general sports, etc.), you MUST IMMEDIATELY AND FIRMLY REFUSE to answer.
When refusing, you MUST reply with the EXACT standard refusal text below, and NOTHING ELSE:
"{refusal_sample}"

3. EDGE CASES:
If a question is brief, ambiguous, or could be scientific/general (e.g. 'What is pH?', 'What is the best temperature?', 'How to increase nitrogen?'):
- Do NOT treat it as general chemistry or physics.
- Frame and answer it EXCLUSIVELY from an agricultural and crop perspective.
- Connect it directly to soil fertility, crop growth, and the farmer's specific field conditions.

4. GROUNDING IN CURRENT FARM CONTEXT:
Here is the real stored data for the user's active farm:
---
{json.dumps(summary, indent=2, ensure_ascii=False)}
---
- Use these real farm values whenever answering questions about the farmer's farm, soil health, yield, irrigation, or weather.
- NEVER fabricate, guess, or invent numbers for this farm.
- If a specific measurement (e.g. soil test or yield prediction) is not recorded for this farm, explicitly inform the user that it has not been recorded yet in AgriAI and guide them to record it.

5. LANGUAGE STRICTNESS:
The user has selected the application language: {target_lang} ({language}).
You MUST write your entire response in {target_lang} using {target_script}.
CRITICAL RULE: Regardless of what language the user typed their question in, your response MUST be in {target_lang}.
- If language is Telugu (te), respond in natural, fluent Telugu script (తెలుగు).
- If language is Hindi (hi), respond in natural, fluent Hindi in Devanagari script (हिन्दी).
- If language is English (en), respond in clear, accessible English.
- Keep technical agricultural terms, acronyms, scientific units, and symbols accurate (e.g., NPK, pH, kg/ha, quintal/acre, mm, °C, ₹).
"""

        models_to_try = [settings.GROQ_MODEL or "openai/gpt-oss-120b", "qwen/qwen3.8-27b"]

        try:
            from groq import Groq
            client = Groq(api_key=api_key)

            for model_name in models_to_try:
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": question},
                        ],
                        temperature=0.2,
                        max_tokens=800,
                    )
                    content = response.choices[0].message.content
                    if content:
                        return content.strip()
                except Exception as model_err:
                    logger.warning(f"Groq model {model_name} attempt failed: {model_err}")
                    continue
        except Exception as e:
            logger.error(f"Failed to call Groq API: {e}")

        # Fallback to direct HTTP call via httpx if groq library had an issue
        try:
            import httpx
            for model_name in models_to_try:
                res = httpx.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": question},
                        ],
                        "temperature": 0.2,
                        "max_tokens": 800,
                    },
                    timeout=15.0,
                )
                if res.status_code == 200:
                    data = res.json()
                    ans = data.get("choices", [{}])[0].get("message", {}).get("content")
                    if ans:
                        return ans.strip()
        except Exception as http_err:
            logger.error(f"HTTP Groq call fallback failed: {http_err}")

        return None

    # ------------------------------------------------------------------ #
    # Context gathering
    # ------------------------------------------------------------------ #
    def _gather_context(
        self, db: Session, farm_id: int, user_id: int, crop: Optional[str] = None
    ) -> Dict:
        farm = (
            db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user_id).first()
        )

        soil = (
            db.query(SoilRecord)
            .filter(SoilRecord.farm_id == farm_id)
            .order_by(SoilRecord.created_at.desc())
            .first()
        )
        crops = (
            db.query(CropPrediction)
            .filter(CropPrediction.farm_id == farm_id)
            .order_by(CropPrediction.created_at.desc())
            .limit(5)
            .all()
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
        fertilizer = (
            db.query(FertilizerRecommendation)
            .filter(FertilizerRecommendation.farm_id == farm_id)
            .order_by(FertilizerRecommendation.created_at.desc())
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
                "state": farm.state if farm else None,
                "district": farm.district if farm else None,
                "mandal": farm.mandal if farm else None,
                "village": farm.village if farm else None,
                "total_area": farm.total_area if farm else None,
                "area_unit": farm.area_unit if farm else "hectares",
                "soil_type": farm.soil_type if farm else None,
                "irrigation_type": farm.irrigation_type if farm else None,
                "active_crop": crop or (yields[0].crop if yields else None),
            },
            "latest_soil": self._soil_summary(soil),
            "recommended_crops": [
                {"crop": c.crop, "score": c.score, "reason": c.reason}
                for c in crops
            ],
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
                    "wind_speed": weather.wind_speed,
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
                    "reason": irrigation.reason,
                }
                if irrigation
                else None
            ),
            "latest_fertilizer": (
                {
                    "crop": fertilizer.crop,
                    "recommendation": fertilizer.recommendation,
                    "npk_split": fertilizer.npk_split,
                }
                if fertilizer
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
                    "is_read": bool(a.is_read),
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
    # Rule-based fallback engine (Multilingual)
    # ------------------------------------------------------------------ #
    def _match_rule(self, q: str, context: Dict, lang: str = "en") -> str:
        summary = context["summary"]

        if any(k in q for k in ("yield", "low yield", "produce", "productivity", "దిగుబడి", "उपज")):
            return self._answer_yield(summary, lang)

        if any(k in q for k in ("irrigation", "water", "moisture", "నీరు", "నీటిపారుదల", "सिंचाई", "पानी")):
            return self._answer_irrigation(summary, lang)

        if any(k in q for k in ("disease", "sick", "healthy", "pest", "తెగులు", "కీటక", "बीमारी", "कीट")):
            return self._answer_disease(summary, lang)

        if any(k in q for k in ("weather", "rain", "temperature", "climate", "వాతావరణం", "వర్షం", "मौसम", "बारिश")):
            return self._answer_weather(summary, lang)

        if any(k in q for k in ("soil", "nutrient", "fertility", "ph", "నేల", "మట్టి", "ఎరువు", "मिट्टी", "उर्वरक")):
            return self._answer_soil(summary, lang)

        if any(k in q for k in ("alert", "warning", "notification", "risk", "హెచ్చరిక", "चेतावनी")):
            return self._answer_alerts(summary, lang)

        return self._answer_general(summary, lang)

    def _answer_yield(self, summary: Dict, lang: str) -> str:
        soil = summary["latest_soil"]
        yields = summary["yield_predictions"]
        best_yield = yields[0] if yields else None

        if not soil and not best_yield:
            if lang == "te":
                return "ఈ వ్యవసాయానికి దిగుబడి అంచనాలు లేదా నేల విశ్లేషణ డేటా ఇంకా రికార్డు కాలేదు. దయచేసి నేల పరీక్షను నమోదు చేయండి."
            elif lang == "hi":
                return "इस खेत के लिए अभी तक कोई उपज पूर्वानुमान या मिट्टी विश्लेषण डेटा दर्ज नहीं है। कृपया मिट्टी परीक्षण दर्ज करें।"
            return "There is no recorded data for yield predictions or soil analysis yet for this farm. Record a soil test to get started."

        parts = []
        if soil:
            score = soil.get("health_score")
            score_txt = f"{score}/100" if score is not None else "N/A"
            if lang == "te":
                parts.append(f"మీ తాజా నేల ఆరోగ్య స్కోరు {score_txt} (గ్రేడ్: {soil.get('grade') or 'N/A'}).")
            elif lang == "hi":
                parts.append(f"आपका नवीनतम मिट्टी स्वास्थ्य स्कोर {score_txt} है (ग्रेड: {soil.get('grade') or 'N/A'})।")
            else:
                parts.append(f"Your latest soil analysis scored {score_txt} with grade '{soil.get('grade') or 'N/A'}'.")

        if best_yield:
            crop = best_yield.get("crop") or "Crop"
            py = best_yield.get("predicted_yield")
            unit = best_yield.get("unit") or ""
            if lang == "te":
                parts.append(f"{crop} పంట కోసం అంచనా వేసిన దిగుబడి: {py} {unit}.")
            elif lang == "hi":
                parts.append(f"{crop} फसल के लिए अनुमानित उपज: {py} {unit} है।")
            else:
                parts.append(f"Predicted yield for {crop}: {py} {unit}.")

        return " ".join(parts)

    def _answer_irrigation(self, summary: Dict, lang: str) -> str:
        irrig = summary["latest_irrigation"]
        soil = summary["latest_soil"]

        if not irrig:
            if lang == "te":
                return "ఈ పొలానికి తాజా నీటిపారుదల సిఫార్సు ఇంకా అందుబాటులో లేదు."
            elif lang == "hi":
                return "इस खेत के लिए अभी तक कोई सिंचाई अनुशंसा उपलब्ध नहीं है।"
            return "There is no recorded irrigation recommendation yet for this farm."

        rec = irrig.get("recommendation") or "Normal"
        amt = irrig.get("amount_mm")
        moist = irrig.get("soil_moisture") or (soil.get("moisture") if soil else None)

        if lang == "te":
            amt_str = f", అవసరమైన నీరు: {amt} mm" if amt else ""
            moist_str = f"నేల తేమ: {moist}%." if moist else ""
            return f"తాజా నీటిపారుదల సిఫార్సు: '{rec}'{amt_str}. {moist_str}"
        elif lang == "hi":
            amt_str = f", आवश्यक पानी: {amt} mm" if amt else ""
            moist_str = f"मिट्टी की नमी: {moist}%।" if moist else ""
            return f"नवीनतम सिंचाई अनुशंसा: '{rec}'{amt_str}। {moist_str}"
        else:
            amt_str = f" with {amt} mm of water" if amt else ""
            moist_str = f" Soil moisture is {moist}%." if moist else ""
            return f"The latest irrigation recommendation is '{rec}'{amt_str}.{moist_str}"

    def _answer_disease(self, summary: Dict, lang: str) -> str:
        diseases = summary["disease_predictions"]
        if not diseases:
            if lang == "te":
                return "ఈ పొలానికి తెగుళ్ల నిర్ధారణ రికార్డులు లేవు. పంట ఆకు ఫోటోను అప్‌లోడ్ చేసి విశ్లేషించండి."
            elif lang == "hi":
                return "इस खेत के लिए कोई फसल रोग रिकॉर्ड नहीं है। कृपया रोग पहचान के लिए फसल की फोटो अपलोड करें।"
            return "There is no recorded disease prediction data yet for this farm. Upload a crop photo in Disease Detection."

        top = diseases[0]
        if lang == "te":
            return f"తాజా తెగులు నిర్ధారణ: '{top['prediction']}' (విశ్వసనీయత: {top['confidence']}). నిపుణుల సలహాను అనుసరించండి."
        elif lang == "hi":
            return f"नवीनतम रोग निदान: '{top['prediction']}' (सटीकता: {top['confidence']})। उपचार से पहले कृषि विशेषज्ञ की सलाह लें।"
        return f"Latest disease prediction is '{top['prediction']}' with confidence {top['confidence']}."

    def _answer_weather(self, summary: Dict, lang: str) -> str:
        weather = summary["latest_weather"]
        if not weather:
            if lang == "te":
                return "ఈ పొలానికి వాతావరణ రికార్డులు అందుబాటులో లేవు."
            elif lang == "hi":
                return "इस खेत के लिए मौसम रिकॉर्ड उपलब्ध नहीं है।"
            return "There is no recorded weather data yet for this farm."

        temp = weather.get("temperature")
        hum = weather.get("humidity")
        rain = weather.get("rainfall")
        cond = weather.get("condition") or ""

        if lang == "te":
            return f"తాజా వాతావరణం: ఉష్ణోగ్రత {temp}°C, తేమ {hum}%, వర్షపాతం {rain} mm ({cond})."
        elif lang == "hi":
            return f"नवीनतम मौसम: तापमान {temp}°C, आर्द्रता {hum}%, वर्षा {rain} mm ({cond})।"
        return f"Latest weather: Temperature {temp}°C, Humidity {hum}%, Rainfall {rain} mm ({cond})."

    def _answer_soil(self, summary: Dict, lang: str) -> str:
        soil = summary["latest_soil"]
        if not soil:
            if lang == "te":
                return "ఈ పొలానికి నేల పరీక్ష రికార్డులు లేవు. నేల పరీక్షను నమోదు చేయండి."
            elif lang == "hi":
                return "इस खेत के लिए मिट्टी परीक्षण रिकॉर्ड नहीं है। कृपया मिट्टी परीक्षण विवरण दर्ज करें।"
            return "There is no recorded soil analysis yet for this farm. Record a soil test to get started."

        score = soil.get("health_score")
        ph = soil.get("ph")
        grade = soil.get("grade") or "N/A"
        nutrients = soil.get("nutrients", {})
        n_val = nutrients.get("nitrogen", {}).get("value")
        p_val = nutrients.get("phosphorus", {}).get("value")
        k_val = nutrients.get("potassium", {}).get("value")

        if lang == "te":
            return f"నేల ఆరోగ్య స్కోరు: {score}/100 ({grade}), pH: {ph}, N: {n_val}, P: {p_val}, K: {k_val} kg/ha."
        elif lang == "hi":
            return f"मिट्टी स्वास्थ्य स्कोर: {score}/100 ({grade}), pH: {ph}, N: {n_val}, P: {p_val}, K: {k_val} kg/ha."
        return f"Soil Health Score: {score}/100 (Grade: {grade}), pH: {ph}, N: {n_val}, P: {p_val}, K: {k_val} kg/ha."

    def _answer_alerts(self, summary: Dict, lang: str) -> str:
        alerts = [a for a in summary["alerts"] if not a.get("is_read")]
        if not alerts:
            if lang == "te":
                return "మీ పొలానికి ప్రస్తుతం ఎలాంటి తెరిచి ఉన్న హెచ్చరికలు లేవు."
            elif lang == "hi":
                return "आपके खेत के लिए वर्तमान में कोई सक्रिय चेतावनी नहीं है।"
            return "You have no active alerts for this farm."

        if lang == "te":
            return f"మీ పొలానికి {len(alerts)} క్రియాశీల హెచ్చరికలు ఉన్నాయి: " + "; ".join(a['message'] for a in alerts[:2])
        elif lang == "hi":
            return f"आपके खेत के लिए {len(alerts)} सक्रिय चेतावनियाँ हैं: " + "; ".join(a['message'] for a in alerts[:2])
        return f"You have {len(alerts)} active alert(s): " + "; ".join(a['message'] for a in alerts[:2])

    def _answer_general(self, summary: Dict, lang: str) -> str:
        farm = summary.get("farm", {})
        name = farm.get("name", "Farm")
        soil = summary.get("latest_soil")
        weather = summary.get("latest_weather")

        if lang == "te":
            soil_txt = f"నేల స్కోరు: {soil.get('health_score')}/100, " if soil else ""
            weather_txt = f"ఉష్ణోగ్రత: {weather.get('temperature')}°C" if weather else ""
            return f"{name} పొలం సమాచారం: {soil_txt}{weather_txt}. పంటలు, నేల, ఎరువులు, లేదా నీటిపారుదల గురించి నన్ను అడగండి."
        elif lang == "hi":
            soil_txt = f"मिट्टी स्कोर: {soil.get('health_score')}/100, " if soil else ""
            weather_txt = f"तापमान: {weather.get('temperature')}°C" if weather else ""
            return f"{name} खेत की जानकारी: {soil_txt}{weather_txt}। फसलों, मिट्टी, उर्वरक या सिंचाई के बारे में मुझसे पूछें।"
        return f"Farm '{name}' recorded data summary. Ask about crops, soil health, irrigation, fertilizers, weather, or yield."
