"""Profit calculator service.

When a yield or price input is None, the dataset's mean yield / derived price
for that crop is substituted and ``demo_mode`` is set True. All derived values
come from the real CropYield dataset via app.data_loader.
"""
from typing import Dict, Optional
from app.schemas.profit import ProfitRequest
from app import data_loader

DISCLAIMER = "Estimates supplement local expert advice and actual market conditions."

# DEMO typical per-ha costs (INR) per crop-group. Used ONLY when the client does
# not supply a per-ha cost. Illustrative placeholders.
_DEMO_DEFAULT_COSTS: Dict[str, Dict[str, float]] = {
    "default": {
        "seed": 8000.0,
        "fertilizer": 12000.0,
        "labor": 10000.0,
        "irrigation": 6000.0,
        "pesticide": 5000.0,
        "other": 4000.0,
    },
}

_COST_KEYS = ["seed", "fertilizer", "labor", "irrigation", "pesticide", "other"]
_COST_FIELD = {
    "seed": "seed_cost",
    "fertilizer": "fertilizer_cost",
    "labor": "labor_cost",
    "irrigation": "irrigation_cost",
    "pesticide": "pesticide_cost",
    "other": "other_costs",
}


class ProfitCalculator:
    def calculate(self, data: ProfitRequest) -> Dict:
        demo_mode = False
        costs = {k: getattr(data, _COST_FIELD[k]) for k in _COST_KEYS}

        defaults = _DEMO_DEFAULT_COSTS.get(data.crop.lower(), _DEMO_DEFAULT_COSTS["default"])
        for key in _COST_KEYS:
            if costs[key] is None:
                costs[key] = defaults[key]
                demo_mode = True

        cost_per_ha = sum(costs.values())

        # Fill yield / price from the dataset if the client did not provide them.
        expected_yield = data.expected_yield_per_ha
        price = data.price_per_unit
        if expected_yield is None:
            expected_yield = data_loader.base_yield(data.crop)
            demo_mode = True
        if price is None:
            price = data_loader.per_tonne_price(data.crop)
            demo_mode = True

        total_revenue = data.area_ha * expected_yield * price
        total_cost = cost_per_ha * data.area_ha
        gross_profit = total_revenue - total_cost
        profit_per_ha = gross_profit / data.area_ha if data.area_ha else 0.0
        margin_pct = (gross_profit / total_revenue) * 100 if total_revenue > 0 else 0.0

        breakdown = {
            "revenue": {
                "area_ha": data.area_ha,
                "expected_yield_per_ha": expected_yield,
                "price_per_unit": price,
            },
            "costs": {
                "cost_per_ha": cost_per_ha,
                **{f"{k}_cost_per_ha": costs[k] for k in _COST_KEYS},
                "total_cost": total_cost,
            },
        }

        return {
            "total_revenue": round(total_revenue, 2),
            "total_cost": round(total_cost, 2),
            "gross_profit": round(gross_profit, 2),
            "profit_per_ha": round(profit_per_ha, 2),
            "margin_pct": round(margin_pct, 2),
            "breakdown": breakdown,
            "demo_mode": demo_mode,
            "disclaimer": DISCLAIMER,
        }
