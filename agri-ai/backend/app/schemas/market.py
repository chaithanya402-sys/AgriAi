from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MarketPriceItem(BaseModel):
    crop: str
    market: str
    price_per_tonne: float
    currency: str = "INR"
    source: str  # "live" or "demo"
    demo_mode: bool
    date: datetime


class MarketPricesResponse(BaseModel):
    prices: List[MarketPriceItem]
    as_of: datetime
    demo_mode: bool
