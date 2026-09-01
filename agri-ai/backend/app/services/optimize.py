"""Optimization engine service.

Builds a baseline ``current_plan`` from the input values, then derives an
``optimized_plan`` using COMPUTED model estimates, and finally computes the
improvements as DIFFERENCES between the two plans. The improvement numbers are
always derived from the plan values (never template text), so changing any
input changes the output.
"""
from typing import Dict
from app.schemas.optimize import OptimizeRequest, OptimizeResponse, Plan, Improvements
from app.services.profit import DISCLAIMER

# Model estimates (labeled, not market data):
# Demo assumption: precision input management reduces per-ha cost by 8% and
# improved input timing raises yield by 8%. Both are heuristic placeholders.
_COST_REDUCTION_FACTOR = 0.92  # = 8% cost reduction
_YIELD_GAIN_FACTOR = 1.08  # = 8% yield gain


class OptimizationEngine:
    def plan(self, data: OptimizeRequest) -> OptimizeResponse:
        cur_yield = data.current_yield
        cur_cost = data.current_cost_per_ha
        area = data.area_ha
        price = data.price_per_unit

        cur_revenue = cur_yield * area * price
        cur_total_cost = cur_cost * area
        cur_profit = cur_revenue - cur_total_cost
        cur_margin = (cur_profit / cur_revenue) * 100 if cur_revenue > 0 else 0.0

        # Computed optimized values from the labeled model estimates.
        opt_cost = cur_cost * _COST_REDUCTION_FACTOR
        opt_yield = cur_yield * _YIELD_GAIN_FACTOR

        opt_revenue = opt_yield * area * price
        opt_total_cost = opt_cost * area
        opt_profit = opt_revenue - opt_total_cost
        opt_margin = (opt_profit / opt_revenue) * 100 if opt_revenue > 0 else 0.0

        current_plan = Plan(
            yield_per_ha=cur_yield,
            cost_per_ha=cur_cost,
            total_cost=round(cur_total_cost, 2),
            revenue=round(cur_revenue, 2),
            profit=round(cur_profit, 2),
            margin_pct=round(cur_margin, 2),
        )
        optimized_plan = Plan(
            yield_per_ha=opt_yield,
            cost_per_ha=opt_cost,
            total_cost=round(opt_total_cost, 2),
            revenue=round(opt_revenue, 2),
            profit=round(opt_profit, 2),
            margin_pct=round(opt_margin, 2),
        )

        # Improvements computed as differences between the two plans.
        yield_pct = ((opt_yield - cur_yield) / cur_yield * 100) if cur_yield else 0.0
        cost_reduction_pct = ((cur_cost - opt_cost) / cur_cost * 100) if cur_cost else 0.0
        profit_increase_pct = ((opt_profit - cur_profit) / cur_profit * 100) if cur_profit else 0.0

        improvements = Improvements(
            yield_pct=round(yield_pct, 2),
            cost_reduction_pct=round(cost_reduction_pct, 2),
            profit_increase_pct=round(profit_increase_pct, 2),
        )

        summary = (
            f"Optimizing {data.crop} over {area} ha: yield "
            f"{current_plan.yield_per_ha:.2f} -> {optimized_plan.yield_per_ha:.2f} t/ha "
            f"(+{improvements.yield_pct}%), cost/ha "
            f"{current_plan.cost_per_ha:.2f} -> {optimized_plan.cost_per_ha:.2f} "
            f"(-{improvements.cost_reduction_pct}%), profit "
            f"{current_plan.profit:.2f} -> {optimized_plan.profit:.2f} "
            f"(+{improvements.profit_increase_pct}%). {DISCLAIMER}"
        )

        return OptimizeResponse(
            current_plan=current_plan,
            optimized_plan=optimized_plan,
            improvements=improvements,
            summary=summary,
            demo_mode=True,
        )
