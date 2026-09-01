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

        # (a) Open and standardize the image.
        img = _open_image(image_bytes)
        if img is None:
            raise HTTPException(status_code=400, detail="Please upload a valid image")

        # (b) Extract simple features.
        features = _extract_features(img)

        # (c) Route between demo and real classifier.
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
