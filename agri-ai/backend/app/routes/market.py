from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.analytics import MarketPrice
from app.schemas.market import (
    MarketPricesResponse,
    MarketPriceItem,
    DistrictSummaryItem,
    MSPBenchmarkItem,
    MarketDistrictInfo,
    MarketCommodityInfo,
)
from app.services.market import MarketService
from app.utils.security import get_optional_current_user

router = APIRouter(prefix="/api/market", tags=["market"])
service = MarketService()


@router.get("/prices", response_model=MarketPricesResponse)
def get_market_prices(
    crop: Optional[str] = Query(None, description="Commodity or crop name filter"),
    district: Optional[str] = Query(None, description="District filter (e.g. Guntur, Krishna)"),
    commodity_group: Optional[str] = Query(None, description="Group (Cereals, Pulses, Commercial, etc.)"),
    market_type: Optional[str] = Query(None, description="Market type (APMC Yard, Rythu Bazar, etc.)"),
    price_trend: Optional[str] = Query(None, description="Trend filter: Bullish, Stable, Bearish"),
    trading_channel: Optional[str] = Query(None, description="Channel: e-NAM, APMC, Rythu Bazar, FPO"),
    search: Optional[str] = Query(None, description="Free text search on commodity, market, village, etc."),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=500, description="Items per page"),
    sort_by: str = Query("reporting_date", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user),
):
    """Retrieve granular real mandi market rates with filtering, searching, and pagination."""
    data = service.get_prices(
        crop=crop,
        district=district,
        commodity_group=commodity_group,
        market_type=market_type,
        price_trend=price_trend,
        trading_channel=trading_channel,
        search=search,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    items = [MarketPriceItem(**item) for item in data["prices"]]

    return MarketPricesResponse(
        prices=items,
        as_of=data["as_of"],
        demo_mode=data.get("demo_mode", False),
        total=data.get("total", len(items)),
        page=data.get("page", page),
        limit=data.get("limit", limit),
        total_pages=data.get("total_pages", 1),
    )


@router.get("/summary")
def get_market_summary(
    district: Optional[str] = Query(None, description="District filter to scope KPI metrics"),
) -> Dict[str, Any]:
    """Retrieve high-level KPI metrics, trends, and market distributions (optionally scoped to a district)."""
    return service.get_summary(district=district)


@router.get("/districts", response_model=List[MarketDistrictInfo])
def get_market_districts():
    """Retrieve all districts available in the market price intelligence dataset."""
    return service.get_districts()


@router.get("/commodities", response_model=List[MarketCommodityInfo])
def get_market_commodities():
    """Retrieve distinct commodities with price spans and arrival aggregates."""
    return service.get_commodities()


@router.get("/district-summary", response_model=List[DistrictSummaryItem])
def get_district_commodity_summary(
    district: Optional[str] = Query(None, description="District filter"),
    crop: Optional[str] = Query(None, description="Crop filter"),
    limit: int = Query(200, ge=1, le=1000, description="Limit rows"),
):
    """Retrieve aggregated district-level commodity arrivals and trade price indices."""
    return service.get_district_summary(district=district, crop=crop, limit=limit)


@router.get("/msp", response_model=List[MSPBenchmarkItem])
def get_msp_benchmarks(
    district: Optional[str] = Query(None, description="Optional district filter for local MSP comparisons"),
):
    """Retrieve official MSP benchmarks and safety floor comparisons with current market rates."""
    return service.get_msp_benchmarks(district=district)


@router.get("/resolve-location")
def resolve_market_location(
    lat: float = Query(..., description="Latitude from GPS"),
    lon: float = Query(..., description="Longitude from GPS"),
) -> Dict[str, Any]:
    """Resolve GPS coordinates directly to one of AP's 26 districts for live market filtering."""
    return service.resolve_location(lat=lat, lon=lon)

