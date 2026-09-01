# Training ML Models for AgriAI

AgriAI ships with `DEMO_MODE=true` and clearly-labeled mock models. To use real
trained models, set `DEMO_MODE=false` and place trained files in `backend/models/`.
The service layer auto-detects them — no API or frontend changes required.

## Yield Prediction (XGBoost / sklearn)

```python
import pandas as pd
import joblib
from xgboost import XGBRegressor

df = pd.read_csv("datasets/yield_data.csv")
features = ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"]
X, y = df[features], df["yield_tonnes_per_ha"]

model = XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.1)
model.fit(X, y)

joblib.dump(model, "backend/models/yield_prediction.pkl")
```

## Crop Recommendation

Train a label-encoder + classifier on crop suitability data and export to
`backend/models/crop_recommendation.pkl`. The service expects a pickled object
with a compatible interface (see `app/ml/real_models.py`).

## Disease Detection (TensorFlow / MobileNetV2)

```python
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2

base = MobileNetV2(include_top=False, input_shape=(224, 224, 3), pooling="avg")
# ... add your classification head and training loop ...
model.save("backend/models/disease_model.keras")
```

The service loads `models/disease_model.keras` when `DEMO_MODE=false`. Until that
file exists, it falls back to the demo classifier without crashing.

## Python virtual environment note

Create a dedicated venv for training (TensorFlow can be heavy):

```bash
cd backend
python -m venv .venv-train
.venv-train/Scripts/pip install -r requirements.txt
```
