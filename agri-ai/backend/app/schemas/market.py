from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class MarketPriceItem(BaseModel):
    crop: str
    market: str
    price_per_tonne: float
    currency: str = "INR"
    source: str
    demo_mode: bool
    date: datetime

    # Rich Granular AP AgMarket Fields
    modal_price_rs_qtl: Optional[float] = None
    min_price_rs_qtl: Optional[float] = None
    max_price_rs_qtl: Optional[float] = None
    arrival_quantity_qtl: Optional[float] = None
    unit_of_price: Optional[str] = "Quintal (100 kg)"
    variety: Optional[str] = None
    grade: Optional[str] = None
    district: Optional[str] = None
    mandal: Optional[str] = None
    village: Optional[str] = None
    region: Optional[str] = None
    market_type: Optional[str] = None
    commodity_group: Optional[str] = None
    price_trend: Optional[str] = None
    trading_channel: Optional[str] = None
    reporting_date: Optional[str] = None
    msp_benchmark: Optional[float] = None
    msp_diff_pct: Optional[float] = None


class MarketPricesResponse(BaseModel):
    prices: List[MarketPriceItem]
    as_of: datetime
    demo_mode: bool
    total: Optional[int] = None
    page: Optional[int] = None
    limit: Optional[int] = None
    total_pages: Optional[int] = None


class DistrictSummaryItem(BaseModel):
    district: str
    commodity_name: str
    record_count: int
    total_arrivals_qtl: float
    avg_modal_price_rs_qtl: float
    min_trade_price: float
    max_trade_price: float


class MSPBenchmarkItem(BaseModel):
    commodity_name: str
    commodity_group: str
    msp_price_rs_qtl: float
    support_mechanism: str
    standard_unit: str
    avg_market_price_rs_qtl: Optional[float] = None
    min_market_price_rs_qtl: Optional[float] = None
    max_market_price_rs_qtl: Optional[float] = None
    diff_pct: Optional[float] = None
    status: str


class MarketDistrictInfo(BaseModel):
    district: str
    region: Optional[str] = None
    record_count: int
    market_count: int
    commodity_count: int
    total_arrivals_qtl: float


class MarketCommodityInfo(BaseModel):
    commodity_name: str
    commodity_group: str
    record_count: int
    avg_modal_price_rs_qtl: float
    min_price_rs_qtl: float
    max_price_rs_qtl: float
    total_arrivals_qtl: float
