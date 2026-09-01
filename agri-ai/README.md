# AgriAI — AI-Powered Crop Yield Prediction & Farm Optimization

AgriAI is a production-grade full-stack platform for smart farming. It follows the
workflow **Predict → Explain → Optimize → Act**, combining soil analysis, crop
recommendation, yield prediction, irrigation & fertilizer intelligence, disease
detection, market data, risk assessment, and optimization into one dashboard.

> **Honesty principle:** Every metric shown (yield, confidence, risk, price, profit,
> improvement %) comes from a **real calculation**, a **real model**, or is clearly
> labeled as **DEMO data**. No metric is ever fabricated. When `DEMO_MODE=true`, a
> clearly-labeled mock model with the same interface as the real model is used, so
> swapping in a trained model requires no API or frontend changes.

---

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React + Vite + TypeScript + Tailwind CSS + shadcn/ui-style components + Recharts + React Router |
| Backend  | Python + FastAPI + Pydantic + Uvicorn |
| ML       | Pandas, NumPy, scikit-learn, XGBoost, TensorFlow/Keras (disease) |
| DB       | PostgreSQL (falls back to SQLite in dev without API changes) |
| Auth     | JWT + hashed passwords (bcrypt), protected routes |

## Project Structure

```
agri-ai/
├── frontend/src/{components,pages,layouts,hooks,services,types,utils}, App.tsx
├── backend/app/{routes,models,schemas,services,ml,utils,config}, main.py
├── backend/models/      # saved .pkl / .keras files go here
├── datasets/
├── notebooks/
├── docs/
├── README.md
└── docker-compose.yml
```

---

## Quick Start (Recommended: Docker)

```bash
docker-compose up --build
```

Then open http://localhost:5173. The app boots with `DEMO_MODE=true` and an SQLite/Postgres
database, so you can register and explore immediately with demo data clearly labeled.

---

## Local Development

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

- API docs at http://localhost:8000/docs
- Health check: http://localhost:8000/api/health
- Default DB is SQLite (`agriai.db`). To use Postgres, set `DATABASE_URL` in `.env`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend at
`http://localhost:8000`, so the frontend never talks to external services directly.

---

## Demo Mode vs Real Models

Set `DEMO_MODE=false` in `backend/.env` to use trained models. The service layer
(`app/services/*`) selects between `app/ml/demo_models.py` (mock, clearly labeled)
and `app/ml/real_models.py` (loads trained files from `backend/models/`) using the
**same interface** — no API or frontend changes needed.

| Module | Demo (labeled) | Real model file |
|--------|----------------|-----------------|
| Crop Recommendation | heuristic fit scoring | `models/crop_recommendation.pkl` |
| Yield Prediction | interpretive formula | `models/yield_prediction.pkl` |
| Disease Detection | feature heuristic | `models/disease_model.keras` (MobileNetV2) |

### Training

Training scripts live in `notebooks/`. Export trained models to `backend/models/`:

```python
import joblib
joblib.dump(model, "backend/models/yield_prediction.pkl")
```

See [docs/TRAINING.md](docs/TRAINING.md) for details.

---

## Configuration

Keys and secrets live **only** in the backend. All third-party calls (weather, market)
are proxied through FastAPI — **never** in frontend code. Ship `.env.example`, never a
real `.env` with keys.

| Var | Purpose |
|-----|---------|
| `DEMO_MODE` | `true` = labeled mock models; `false` = load trained models |
| `DATABASE_URL` | `sqlite:///./agriai.db` (dev) or Postgres DSN |
| `SECRET_KEY` | JWT signing secret — **change in production** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime |
| `OPENWEATHER_API_KEY` | Optional — enables live weather (proxied) |
| `MARKET_API_KEY` | Optional — enables live market data (proxied) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |

---

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Farmer registration |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Current user |
| GET/POST/PUT/DELETE | `/api/farms` | Farm CRUD |
| GET/POST/DELETE | `/api/farms/{id}/fields` | Field CRUD |
| POST | `/api/soil/analyze` | Soil health score + nutrient status |
| POST | `/api/crop/recommend` | Ranked crop recommendations + explainable AI |
| POST | `/api/predict/yield` | Yield prediction + feature importance |
| POST | `/api/fertilizer/recommend` | Fertilizer recommendation (+ disclaimer) |
| GET/POST | `/api/irrigation/recommend` | Irrigation advice from moisture + forecast |
| GET | `/api/weather/current`, `/api/weather/forecast` | Weather (proxied or demo) |
| POST | `/api/disease/predict` | Image-based disease detection |
| POST | `/api/risk/assess` | Risk dashboard |
| GET | `/api/market/prices` | Market intelligence |
| POST | `/api/profit/calculate` | Profit calculator |
| POST | `/api/optimize/plan` | Optimization engine |
| POST | `/api/assistant/ask` | Context-grounded AI assistant |
| GET | `/api/notifications` | Notifications (read/delete/filter) |
| POST | `/api/reports/farm/{id}` | Downloadable PDF farm report |

---

## Product Workflow: Predict → Explain → Optimize → Act

1. **Predict** — Soil analysis, crop recommendation, yield prediction.
2. **Explain** — Feature-importance bars and per-nutrient status make every result interpretable.
3. **Optimize** — Irrigation, fertilizer, and a current-vs-optimized plan comparison with
   **computed** improvement percentages.
4. **Act** — Risk alerts, notifications, and a downloadable PDF report support decisions.

### Decision-support disclaimer

Any fertilizer/pesticide/disease/treatment output includes: *"This supplements, not
replaces, local agricultural experts, soil testing, and product labels."* AgriAI is a
decision-support tool, not a substitute for professional agronomic advice.

---

## License

For educational and demonstration use.
