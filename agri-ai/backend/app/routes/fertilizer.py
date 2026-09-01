from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.analytics import FertilizerRecommendation
from app.schemas.fertilizer import FertilizerRequest, FertilizerResponse
from app.services.fertilizer import FertilizerService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/fertilizer", tags=["fertilizer"])
service = FertilizerService()


@router.post("/recommend", response_model=FertilizerResponse)
def recommend_fertilizer(
    data: FertilizerRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    result = service.recommend(
        data.crop, data.nitrogen, data.phosphorus, data.potassium, data.soil_ph
    )

    record = FertilizerRecommendation(
        farm_id=data.farm_id,
        crop=result["crop"],
        recommendation=result["guidance"],
        npk_split=result["recommended"],
        demo_mode=int(result["demo_mode"]),
    )
    db.add(record)
    db.commit()

    return result
