from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config import database
from app.models import user, farm  # noqa: F401 (register models)
from app.routes import (
    auth, farms, soil, crop, yield_prediction,
    fertilizer, irrigation, weather, disease, risk, market, profit,
    optimize, assistant, notifications, reports, data,
)
from app.utils.security import get_current_user
from app.models.user import User

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    version=settings.APP_VERSION,
    description="AI-powered crop yield prediction and farm optimization platform",
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Create tables
    database.Base.metadata.create_all(bind=database.engine)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "demo_mode": settings.DEMO_MODE,
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "demo_mode": settings.DEMO_MODE}


@app.get("/api/dashboard")
def dashboard(user: User = Depends(get_current_user)):
    """Protected stub route — real data wired in Phase 2+."""
    return {
        "status": "ok",
        "message": f"Welcome, {user.name}",
        "farm_count": len(user.farms),
        "demo_mode": settings.DEMO_MODE,
    }


# Include routers
app.include_router(auth.router)
app.include_router(farms.router)
app.include_router(soil.router)
app.include_router(crop.router)
app.include_router(yield_prediction.router)
app.include_router(fertilizer.router)
app.include_router(irrigation.router)
app.include_router(weather.router)
app.include_router(disease.router)
app.include_router(risk.router)
app.include_router(market.router)
app.include_router(profit.router)
app.include_router(optimize.router)
app.include_router(assistant.router)
app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(data.router)
