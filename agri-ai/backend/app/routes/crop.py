from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.crop import CropRecommendationRequest, CropRecommendationResponse
from app.services.crop import CropRecommendationService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/crop", tags=["crop"])
service = CropRecommendationService()


@router.post("/recommend", response_model=CropRecommendationResponse)
def recommend_crop(
    data: CropRecommendationRequest,
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
        "area": data.area or 1.0,
    }
    state = data.state
    district = data.district
    if not (state and district):
        from app.services import agricultural_dataset_service as ads
        loc = ads.resolve_location(farm_id=data.farm_id, db=db)
        state = loc.get("state")
        district = loc.get("district")

    return service.recommend(features, state=state, district=district)
