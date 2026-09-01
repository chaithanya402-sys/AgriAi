"""Market Intelligence service.

Returns real market prices derived from the dataset (mean profit / mean yield
per crop) when no live API key is configured. All values are from the actual
CropYield dataset, labeled source="dataset" everywhere they surface.
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional

import httpx
from app.config.settings import settings
from app import data_loader

_DEMO_CURRENCY = "INR"


def _dataset_prices(crop: Optional[str] = None) -> List[Dict]:
    """Build price rows from the real dataset per-crop averages."""
    prices = []
    crops = [crop] if crop else data_loader.crops()
    for c in crops:
        s = data_loader.get_crop(c)
        if not s:
            continue
        prices.append({
            "crop": c,
            "market": "Dataset average ({} districts)".format(s["count"]),
            "price_per_tonne": data_loader.per_tonne_price(c),
            "profit_per_ha": s["profit_mean"],
            "currency": _DEMO_CURRENCY,
            "source": "dataset",
            "demo_mode": False,
            "date": datetime.now(timezone.utc),
        })
    return prices


class MarketService:
    def __init__(self):
        self.api_key = settings.MARKET_API_KEY

    def get_prices(self, crop: Optional[str] = None) -> dict:
        if self.api_key:
            try:
                prices = self._fetch_live(crop)
                if prices is not None:
                    return {"prices": prices, "as_of": datetime.now(timezone.utc), "demo_mode": False}
            except Exception:
                pass
        return self._dataset_prices(crop)

    def _fetch_live(self, crop: Optional[str]):
        params = {"api_key": self.api_key}
        if crop:
            params["crop"] = crop
        resp = httpx.get("https://api.example.in/market/prices", params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        items = data.get("prices", [])
        prices = [
            {
                "crop": p.get("crop"),
                "market": p.get("market", "Unknown Market"),
                "price_per_tonne": float(p.get("price_per_tonne", 0)),
                "currency": p.get("currency", "INR"),
                "source": "live",
                "demo_mode": False,
                "date": datetime.now(timezone.utc),
            }
            for p in items
            if p.get("crop") and p.get("price_per_tonne") is not None
        ]
        if not prices:
            return None
        return prices

    def _dataset_prices(self, crop: Optional[str]) -> dict:
        now = datetime.now(timezone.utc)
        prices = _dataset_prices(crop)
        return {"prices": prices, "as_of": now, "demo_mode": False}
