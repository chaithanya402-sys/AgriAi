from pydantic import BaseModel
from typing import Optional, Dict


class OptimizeRequest(BaseModel):
    farm_id: int
    crop: str
    current_yield: float  # current yield per ha
    target_cost_per_ha: float  # optional target; informational
    current_cost_per_ha: float  # current total per-ha cost
    area_ha: float
    price_per_unit: float
    current_fertilizer_cost: float
    optimized_fertilizer_cost: Optional[float] = None
    current_irrigation_cost: float
    optimized_irrigation_cost: Optional[float] = None


class Plan(BaseModel):
    yield_per_ha: float
    cost_per_ha: float
    total_cost: float
    revenue: float
    profit: float
    margin_pct: float


class Improvements(BaseModel):
    yield_pct: float
    cost_reduction_pct: float
    profit_increase_pct: float


class OptimizeResponse(BaseModel):
    current_plan: Plan
    optimized_plan: Plan
    improvements: Improvements
    summary: str
    demo_mode: bool
