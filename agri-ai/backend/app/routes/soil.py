from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.soil import SoilAnalysisRequest, SoilAnalysisResponse
from app.services.soil import SoilAnalysisService
from app.utils.security import get_current_user
from app.models.soil_record import SoilRecord

router = APIRouter(prefix="/api/soil", tags=["soil"])
service = SoilAnalysisService()


@router.post("/analyze", response_model=SoilAnalysisResponse)
def analyze_soil(
    data: SoilAnalysisRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Verify ownership
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    features = {
        "nitrogen": data.nitrogen,
        "phosphorus": data.phosphorus,
        "potassium": data.potassium,
        "ph": data.ph,
        "organic_carbon": data.organic_carbon,
        "moisture": data.moisture,
    }

    result = service.analyze(features)

    # Persist
    record = SoilRecord(
        farm_id=data.farm_id,
        nitrogen=data.nitrogen,
        phosphorus=data.phosphorus,
        potassium=data.potassium,
        ph=data.ph,
        organic_carbon=data.organic_carbon,
        moisture=data.moisture,
        health_score=result["health_score"],
        grade=result["grade"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    result["id"] = record.id
    return result
