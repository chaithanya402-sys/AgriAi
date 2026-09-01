"""Read-only endpoints exposing the loaded CropYield dataset statistics.

These let the frontend list the real crops/states and fetch dataset-derived
values instead of hardcoding them. All numbers come from app.data_loader
(the consolidated 10,000-record dataset).
"""
from fastapi import APIRouter
from typing import Dict, List, Optional

from app import data_loader

router = APIRouter(prefix="/api/data", tags=["data"])


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
