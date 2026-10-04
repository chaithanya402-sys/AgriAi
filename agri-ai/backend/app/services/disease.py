"""Disease detection service. Routes to demo or real Keras model based on DEMO_MODE."""
import io
from typing import Dict

import numpy as np
from fastapi import HTTPException
from PIL import Image, ImageFilter

from app.config.settings import settings
from app.ml import demo_models

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB
TARGET_SIZE = (224, 224)


class DiseaseDetectionService:
    def __init__(self):
        self._keras_model = None
        self._keras_loaded = False
        # Only attempt a real model load when not in demo mode.
        self._model_path = "models/disease_model.keras"

    def detect(self, image_bytes: bytes, filename: str) -> Dict:
        """
        Process an image into a disease prediction.

        - Standardizes the image to 224x224 (RGB).
        - Extracts simple heuristic features (mean channels, variance, edge
          density) — no TensorFlow needed in demo mode.
        - In DEMO_MODE uses demo_models.classify_disease over those features.
        - Otherwise tries to load models/disease_model.keras; falls back to the
          demo classifier (demo_mode=True) if the model is unavailable, so this
          never crashes.
        """
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Please upload a valid image")

        if not _looks_like_image(image_bytes):
            raise HTTPException(status_code=400, detail="Please upload a valid image")

        # (a) First, attempt real image classification using Google Gemini Multimodal Vision AI
        if getattr(settings, "GEMINI_API_KEY", None):
            gemini_result = self._predict_with_gemini(image_bytes, filename)
            if gemini_result is not None:
                return gemini_result

        # (b) Open and standardize the image.
        img = _open_image(image_bytes)
        if img is None:
            raise HTTPException(status_code=400, detail="Please upload a valid image")

        # (c) Extract simple features.
        features = _extract_features(img)

        # (d) Route between demo and real classifier.
        if not settings.DEMO_MODE:
            result = self._predict_with_keras(img, features)
            if result is not None:
                return result

        # Demo classifier (also the fallback when DEMO_MODE=false lacks a model).
        demo_result = demo_models.classify_disease(features)
        return {
            "prediction": demo_result["prediction"],
            "confidence": demo_result["confidence"],
            "probabilities": demo_result["probabilities"],
            "is_healthy": demo_result["is_healthy"],
            "demo_mode": True,
            "image_processed": True,
        }

    def _predict_with_gemini(self, image_bytes: bytes, filename: str) -> Dict:
        """Analyze plant leaf with Gemini Multimodal Vision AI using the provided API key."""
        api_key = getattr(settings, "GEMINI_API_KEY", None)
        if not api_key:
            return None

        import base64
        import requests
        import json

        # Infer mime type
        mime_type = "image/jpeg"
        lower = filename.lower()
        if lower.endswith(".png"):
            mime_type = "image/png"
        elif lower.endswith(".webp"):
            mime_type = "image/webp"

        b64_data = base64.b64encode(image_bytes).decode("utf-8")

        prompt = """You are an expert plant pathologist and agronomist.
Analyze this agricultural crop image.
Perform a clinical disease and health evaluation:
1. Detect the crop/plant species (e.g. Rice, Maize, Tomato, Cotton, Soybean, Wheat, etc.).
2. Determine whether it is Healthy or has a disease, pest damage, or nutrient deficiency.
3. Provide the specific diagnosis or condition name (e.g. "Healthy", "Rice Blast", "Bacterial Leaf Blight", "Northern Corn Leaf Blight", "Yellow Mosaic Virus", "Powdery Mildew", "Early Blight", etc.).
4. Provide a confidence score between 0.50 and 0.99.
5. Provide a probability breakdown for the top 4-5 related conditions (must sum to approximately 1.0).
6. Provide a concise, clear description of observed symptoms or healthy foliage characteristics.
7. Provide 3-4 actionable treatment or prevention steps suitable for farmers (organic or chemical recommendations with exact dosages where applicable).

Respond strictly in valid JSON matching this format:
{
  "prediction": "Condition Name",
  "crop_detected": "Crop Name",
  "confidence": 0.95,
  "is_healthy": false,
  "probabilities": {
    "Primary Diagnosis": 0.90,
    "Alternative 1": 0.05,
    "Alternative 2": 0.03,
    "Healthy": 0.02
  },
  "description": "Observed symptoms on foliage...",
  "treatment": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ]
}"""

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": b64_data}}
                ]
            }],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }

        # Multi-model cascade for fast & resilient response
        models_to_try = [
            "gemini-3.5-flash",
            "gemini-3.8-flash",
            "gemini-flash-latest",
            "gemini-3.7-flash",
        ]

        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                res = requests.post(url, json=payload, timeout=25)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text)

                        pred = str(parsed.get("prediction", "Unknown")).strip()
                        conf = float(parsed.get("confidence", 0.92))
                        is_healthy = bool(parsed.get("is_healthy", "healthy" in pred.lower()))
                        probs = parsed.get("probabilities", {})
                        if not probs:
                            probs = {pred: conf}
                            if is_healthy:
                                probs["Leaf Blight"] = round(1.0 - conf, 3)
                            else:
                                probs["Healthy"] = round(1.0 - conf, 3)

                        desc = str(parsed.get("description", ""))
                        treat = list(parsed.get("treatment", []))
                        crop_det = str(parsed.get("crop_detected", ""))

                        return {
                            "prediction": pred,
                            "confidence": round(conf, 4),
                            "probabilities": probs,
                            "is_healthy": is_healthy,
                            "description": desc,
                            "treatment": treat,
                            "crop_detected": crop_det,
                            "ai_model": model,
                            "demo_mode": False,
                            "image_processed": True,
                        }
            except Exception:
                continue

        return None


    def _predict_with_keras(self, img: Image.Image, features: Dict) -> Dict:
        """Attempt a real Keras prediction; return None on any failure."""
        try:
            if not self._keras_loaded:
                try:
                    import tensorflow as tf

                    self._keras_model = tf.keras.models.load_model(self._model_path)
                    self._keras_loaded = True
                except Exception:
                    # Model file missing or TensorFlow unavailable — fall back.
                    return None

            if self._keras_model is None:
                return None

            import tensorflow as tf

            arr = np.asarray(img, dtype=np.float32) / 255.0
            batch = np.expand_dims(arr, axis=0)
            preds = self._keras_model.predict(batch, verbose=0)[0]
            class_index = int(np.argmax(preds))
            confidence = float(preds[class_index])
            classes = demo_models.KNOWN_CLASSES
            label = classes[class_index] if class_index < len(classes) else "Unknown"
            return {
                "prediction": label,
                "confidence": round(confidence, 4),
                "probabilities": {c: round(float(p), 4) for c, p in zip(classes, preds)},
                "is_healthy": label == "Healthy",
                "demo_mode": False,
                "image_processed": True,
            }
        except Exception:
            # Never crash — fall back to demo classifier.
            return None


def _open_image(image_bytes: bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert("RGB")
        img = img.resize(TARGET_SIZE)
        return img
    except Exception:
        return None


def _looks_like_image(image_bytes: bytes) -> bool:
    """Reject files that PIL cannot identify as a real image."""
    try:
        with Image.open(io.BytesIO(image_bytes)) as im:
            im.verify()
        return True
    except Exception:
        return False


def _extract_features(img: Image.Image) -> Dict:
    """Simple heuristic features computed without any ML framework."""
    arr = np.asarray(img, dtype=np.float32) / 255.0  # (224, 224, 3)

    # Edge density via PIL's FIND_EDGES filter.
    edges = np.asarray(img.convert("L").filter(ImageFilter.FIND_EDGES), dtype=np.float32)
    edge_ratio = float(np.count_nonzero(edges > 60) / edges.size)

    mean_rgb = arr.mean(axis=(0, 1))
    return {
        "mean_red": float(mean_rgb[0]),
        "mean_green": float(mean_rgb[1]),
        "mean_blue": float(mean_rgb[2]),
        "variance": float(arr.var()),
        "size": TARGET_SIZE[0] * TARGET_SIZE[1],
        "edges": edge_ratio,
    }
