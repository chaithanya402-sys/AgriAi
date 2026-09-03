from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.soil import SoilAnalysisRequest, SoilAnalysisResponse
from app.services.soil import SoilAnalysisService
from app.utils.security import get_current_user
from app.models.soil_record import SoilRecord

from datetime import datetime
from app.services import agricultural_dataset_service as ads
from app.services import village_soil_service as vss

router = APIRouter(prefix="/api/soil", tags=["soil"])
service = SoilAnalysisService()


@router.get("/farm/{farm_id}")
def get_farm_soil(
    farm_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Retrieve village-level soil parameters for a specific farm.
    Priority: coordinate match → village → mandal → district.
    Falls back to the crop-yield Excel dataset if village data unavailable.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Resolve location from farm
    loc = ads.resolve_location(farm_id=farm.id, db=db)
    state   = farm.state or loc.get("state")
    district = farm.district or loc.get("district")
    mandal  = getattr(farm, "mandal", None)
    village = getattr(farm, "village", None)
    lat = farm.latitude or loc.get("lat")
    lon = farm.longitude or loc.get("lon")

    # ── Try village-level dataset first (105k records) ──────────────────────
    if vss.is_available() and district:
        vsoil = vss.get_village_soil(
            district=district,
            mandal=mandal,
            village=village,
            lat=lat,
            lon=lon,
        )
        if vsoil.get("found"):
            features = {
                "nitrogen":       vsoil.get("nitrogen") or 0,
                "phosphorus":     vsoil.get("phosphorus") or 0,
                "potassium":      vsoil.get("potassium") or 0,
                "ph":             vsoil.get("ph") or 7.0,
                "organic_carbon": vsoil.get("organicCarbon") or 0,
                "moisture":       50,   # moisture not in this dataset
            }
            analysis = service.analyze(features)

            return {
                "farmId":         farm.id,
                "farmName":       farm.name,
                "state":          state,
                "district":       vsoil.get("district", district),
                "mandal":         vsoil.get("mandal") or mandal,
                "village":        vsoil.get("village") or village,
                "ph":             vsoil.get("ph"),
                "ec":             vsoil.get("ec"),
                "organicCarbon":  vsoil.get("organicCarbon"),
                "nitrogen":       vsoil.get("nitrogen"),
                "phosphorus":     vsoil.get("phosphorus"),
                "potassium":      vsoil.get("potassium"),
                "sulfur":         vsoil.get("sulfur"),
                "zinc":           vsoil.get("zinc"),
                "iron":           vsoil.get("iron"),
                "copper":         vsoil.get("copper"),
                "manganese":      vsoil.get("manganese"),
                "boron":          vsoil.get("boron"),
                "soilType":       vsoil.get("soilType"),
                "croppingSeason": vsoil.get("croppingSeason"),
                "fertilityIndex": vsoil.get("fertilityIndex"),
                "advisory":       vsoil.get("advisory"),
                "dataSource":     vsoil.get("dataSource", "Village-level soil data"),
                "matchLevel":     vsoil.get("matchLevel", 4),
                "recordCount":    vsoil.get("recordCount", 0),
                "lastUpdated":    datetime.utcnow().isoformat() + "Z",
                "found":          True,
                # analysis
                "healthScore":    analysis["health_score"],
                "grade":          analysis["grade"],
                "nutrients":      analysis["nutrients"],
                "recommendations": analysis["recommendations"],
                "explanation":    analysis["explanation"],
            }

    # ── Fallback to crop-yield Excel dataset (district level) ───────────────
    if not state or not district:
        return {
            "farmId":   farm.id,
            "farmName": farm.name,
            "found":    False,
            "message":  "Soil data is not available for this location.",
        }

    soil = ads.get_soil_data(state, district)
    if not soil.get("found"):
        return {
            "farmId":   farm.id,
            "farmName": farm.name,
            "state":    state,
            "district": district,
            "found":    False,
            "message":  "Soil data is not available for this location.",
        }

    features = {
        "nitrogen":       soil["nitrogen"],
        "phosphorus":     soil["phosphorus"],
        "potassium":      soil["potassium"],
        "ph":             soil["ph"],
        "organic_carbon": 0,
        "moisture":       soil["moisture"],
    }
    analysis = service.analyze(features)

    return {
        "farmId":          farm.id,
        "farmName":        farm.name,
        "state":           state,
        "district":        district,
        "mandal":          mandal,
        "village":         village,
        "nitrogen":        soil["nitrogen"],
        "phosphorus":      soil["phosphorus"],
        "potassium":       soil["potassium"],
        "ph":              soil["ph"],
        "organicCarbon":   "Not available",
        "moisture":        soil["moisture"],
        "soilTypes":       soil.get("soil_types", []),
        "irrigationTypes": soil.get("irrigation_types", []),
        "lastUpdated":     datetime.utcnow().isoformat() + "Z",
        "dataSource":      f"District-level estimate: {state} - {district}",
        "matchLevel":      4,
        "found":           True,
        "healthScore":     analysis["health_score"],
        "grade":           analysis["grade"],
        "nutrients":       analysis["nutrients"],
        "recommendations": analysis["recommendations"],
        "explanation":     analysis["explanation"],
    }


@router.get("/village-lookup")
def village_soil_lookup(
    district: str = Query(...),
    mandal: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    user: User = Depends(get_current_user),
):
    """Direct village-level soil lookup without a farm."""
    if not vss.is_available():
        raise HTTPException(status_code=503, detail="Village soil dataset not available.")
    return vss.get_village_soil(district=district, mandal=mandal, village=village, lat=lat, lon=lon)


@router.get("/districts")
def list_districts(user: User = Depends(get_current_user)):
    """List all districts available in the village soil dataset."""
    return {"districts": vss.get_districts()}


@router.get("/mandals")
def list_mandals(
    district: str = Query(...),
    user: User = Depends(get_current_user),
):
    """List mandals for a given district."""
    return {"mandals": vss.get_mandals_for_district(district)}


@router.get("/villages")
def list_villages(
    district: str = Query(...),
    mandal: str = Query(...),
    user: User = Depends(get_current_user),
):
    """List villages for a given district + mandal."""
    return {"villages": vss.get_villages_for_mandal(district, mandal)}


@router.post("/analyze", response_model=SoilAnalysisResponse)
def analyze_soil(
    data: SoilAnalysisRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    features = {
        "nitrogen":       data.nitrogen,
        "phosphorus":     data.phosphorus,
        "potassium":      data.potassium,
        "ph":             data.ph,
        "organic_carbon": data.organic_carbon,
        "moisture":       data.moisture,
    }

    result = service.analyze(features)

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
