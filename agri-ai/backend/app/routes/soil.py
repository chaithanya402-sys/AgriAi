from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.soil import SoilAnalysisRequest, SoilAnalysisResponse
from app.services.soil import SoilAnalysisService
from app.utils.security import get_current_user
from app.models.soil_record import SoilRecord

from datetime import datetime
from app.services import agricultural_dataset_service as ads

router = APIRouter(prefix="/api/soil", tags=["soil"])
service = SoilAnalysisService()


@router.get("/farm/{farm_id}")
def get_farm_soil(
    farm_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retrieve real dataset-based soil parameters and analysis for a specific farm."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Resolve location from farm coordinates or location
    loc = ads.resolve_location(farm_id=farm.id, db=db)
    state = loc.get("state")
    district = loc.get("district")
    lat = loc.get("lat") or farm.latitude
    lon = loc.get("lon") or farm.longitude

    if not state or not district:
        return {
            "farmId": farm.id,
            "farmName": farm.name,
            "latitude": lat,
            "longitude": lon,
            "found": False,
            "message": "Soil data is not available for this location.",
        }

    soil = ads.get_soil_data(state, district)
    if not soil.get("found"):
        return {
            "farmId": farm.id,
            "farmName": farm.name,
            "latitude": lat,
            "longitude": lon,
            "state": state,
            "district": district,
            "found": False,
            "message": "Soil data is not available for this location.",
        }

    # Analyze soil metrics for health score, grade, and nutrient status
    features = {
        "nitrogen": soil["nitrogen"],
        "phosphorus": soil["phosphorus"],
        "potassium": soil["potassium"],
        "ph": soil["ph"],
        "organic_carbon": 0,
        "moisture": soil["moisture"],
    }
    analysis = service.analyze(features)

    return {
        "farmId": farm.id,
        "farmName": farm.name,
        "latitude": lat,
        "longitude": lon,
        "state": state,
        "district": district,
        "nitrogen": soil["nitrogen"],
        "phosphorus": soil["phosphorus"],
        "potassium": soil["potassium"],
        "ph": soil["ph"],
        "organicCarbon": "Not available",
        "moisture": soil["moisture"],
        "soilTypes": soil.get("soil_types", []),
        "irrigationTypes": soil.get("irrigation_types", []),
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "source": f"Excel Dataset: {state} - {district}",
        "found": True,
        "healthScore": analysis["health_score"],
        "grade": analysis["grade"],
        "nutrients": analysis["nutrients"],
        "recommendations": analysis["recommendations"],
        "explanation": analysis["explanation"],
    }


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
