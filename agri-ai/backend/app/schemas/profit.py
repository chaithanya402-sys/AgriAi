from pydantic import BaseModel
from typing import List, Optional, Dict


class ProfitRequest(BaseModel):
    """Profit calculation inputs.

    NOTE on cost fields: seed_cost, fertilizer_cost, labor_cost,
    irrigation_cost, pesticide_cost and other_costs are all PER-HA amounts in
    the currency of ``price_per_unit`` (INR by convention). They are multiplied
    by ``area_ha`` to obtain total cost. ``expected_yield_per_ha`` is also
    per-ha, and ``price_per_unit`` is the unit price so that
    total_revenue = area_ha * expected_yield_per_ha * price_per_unit.
    """
    farm_id: int
    crop: str
    area_ha: float
    expected_yield_per_ha: Optional[float] = None
    price_per_unit: Optional[float] = None
    seed_cost: Optional[float] = None
    fertilizer_cost: Optional[float] = None
    labor_cost: Optional[float] = None
    irrigation_cost: Optional[float] = None
    pesticide_cost: Optional[float] = None
    other_costs: Optional[float] = None


class ProfitResponse(BaseModel):
    total_revenue: float
    total_cost: float
    gross_profit: float
    profit_per_ha: float
    margin_pct: float
    breakdown: Dict
    demo_mode: bool
    disclaimer: str
