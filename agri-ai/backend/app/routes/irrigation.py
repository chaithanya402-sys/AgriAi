from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.analytics import IrrigationRecommendation
from app.schemas.irrigation import IrrigationRequest, IrrigationResponse
from app.services.irrigation import IrrigationService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/irrigation", tags=["irrigation"])
service = IrrigationService()


@router.get("/recommend", response_model=IrrigationResponse)
def recommend_irrigation_get(
    farm_id: int = Query(...),
    soil_moisture: float = Query(...),
    crop: str = Query(...),
    temperature: float = Query(None),
    forecast_rainfall_mm: float = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return _recommend_and_persist(
        db, farm_id, soil_moisture, crop, temperature, forecast_rainfall_mm
    )


@router.post("/recommend", response_model=IrrigationResponse)
def recommend_irrigation_post(
    data: IrrigationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return _recommend_and_persist(
        db, data.farm_id, data.soil_moisture, data.crop,
        data.temperature, data.forecast_rainfall_mm,
    )


def _recommend_and_persist(db: Session, farm_id, soil_moisture, crop, temperature, forecast_rainfall_mm):
    result = service.recommend(soil_moisture, crop, temperature, forecast_rainfall_mm)

    record = IrrigationRecommendation(
        farm_id=farm_id,
        soil_moisture=soil_moisture,
        recommendation=result["recommendation"],
        amount_mm=result["amount_mm"],
        reason=result["reason"],
        demo_mode=int(result["demo_mode"]),
    )
    db.add(record)
    db.commit()

    return result
