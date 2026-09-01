from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.yield_prediction import YieldPredictionRequest, YieldPredictionResponse
from app.services.yield_prediction import YieldPredictionService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/predict", tags=["yield"])
service = YieldPredictionService()


@router.post("/yield", response_model=YieldPredictionResponse)
def predict_yield(
    data: YieldPredictionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    features = {
        "nitrogen": data.nitrogen,
        "phosphorus": data.phosphorus,
        "potassium": data.potassium,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "ph": data.ph,
        "rainfall": data.rainfall,
    }
    result = service.predict(data.crop, features)
    result["area"] = data.area
    result["crop"] = result.get("crop", data.crop)
    return result
