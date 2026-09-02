from fastapi import APIRouter, Depends, Query
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app import data_loader
from app.config.database import get_db
from app.services import agricultural_dataset_service as ads

router = APIRouter(prefix="/api/data", tags=["data"])


@router.get("/location/resolve")
def resolve_location_endpoint(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    farm_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
) -> Dict:
    """Resolve location to State and District from live GPS coords or farm fallback."""
    result = ads.resolve_location(lat=lat, lon=lon, farm_id=farm_id, db=db)
    return result


@router.get("/soil-data")
def get_soil_data_endpoint(
    state: str = Query(...),
    district: str = Query(...),
) -> Dict:
    """Aggregated soil parameters for State + District from real Excel datasets."""
    return ads.get_soil_data(state, district)


@router.get("/crop-data")
def get_crop_data_endpoint(
    state: str = Query(...),
    district: str = Query(...),
) -> Dict:
    """Aggregated crop and climate parameters for State + District from real Excel datasets."""
    return ads.get_crop_data(state, district)


@router.get("/crop-recommendations")
def get_crop_recommendations_endpoint(
    state: str = Query(...),
    district: str = Query(...),
    area: float = Query(1.0),
) -> Dict:
    """Rank crops available in district based on real historical performance."""
    return ads.get_crop_recommendations(state, district, area=area)


@router.get("/yield-data")
def get_yield_data_endpoint(
    state: str = Query(...),
    district: str = Query(...),
    crop: str = Query(...),
    area: float = Query(1.0),
    season: Optional[str] = Query(None),
) -> Dict:
    """Historical average yield and expected production for State + District + Crop."""
    return ads.get_yield_data(state, district, crop, area=area, season=season)


@router.get("/crops")
def list_crops() -> Dict:
    """All crops in the dataset with their mean yield/profit and counts."""
    stats = data_loader.crop_stats()
    return {
        "crops": [
            {
                "crop": name,
                "yield_mean_tonnes_ha": stats[name]["yield_mean"],
                "profit_mean_inr_ha": stats[name]["profit_mean"],
                "count": stats[name]["count"],
                "disease_rate_pct": stats[name]["disease_rate"],
            }
            for name in sorted(stats.keys())
        ],
        "total_records": len(data_loader.load_dataframe()),
    }


@router.get("/crops/{crop}")
def get_crop(crop: str) -> Optional[Dict]:
    s = data_loader.get_crop(crop)
    if not s:
        return {"crop": crop, "found": False}
    return {"crop": data_loader._match_crop(crop), "found": True, "stats": s}


@router.get("/states")
def list_states() -> Dict:
    """Every state and the crops grown there."""
    return {"states": data_loader.state_crops(), "count": len(data_loader.state_crops())}


@router.get("/soil-ideal-ranges")
def soil_ranges() -> Dict:
    return {"ideal_ranges": data_loader.soil_ideal_ranges()}
