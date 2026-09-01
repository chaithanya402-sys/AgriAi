"""Irrigation recommendation service.

Soil-moisture targets per crop are the dataset mean moisture (%) for that crop
(via app.data_loader). The recommendation and water amount are COMPUTED from the
supplied soil moisture and forecast rainfall.
"""
from typing import Optional

from app import data_loader


class IrrigationService:
    DEFAULT_TARGET = 39.0  # median soil moisture across the whole dataset
    AMOUNT_FACTOR = 3.0  # mm of irrigation per percentage point of moisture deficit

    def recommend(
        self,
        soil_moisture: float,
        crop: str,
        temperature: Optional[float] = None,
        forecast_rainfall_mm: Optional[float] = None,
    ) -> dict:
        original_crop = crop
        target = data_loader.moisture_target(crop) or self.DEFAULT_TARGET

        if soil_moisture < 20:
            recommendation = "Water immediately"
        elif soil_moisture < 40:
            recommendation = "Water soon"
        elif soil_moisture <= 60:
            recommendation = "Optimal — no action"
        else:
            recommendation = "Hold off — soil already wet"

        deficit = max(0.0, target - soil_moisture)
        amount_mm = round(deficit * self.AMOUNT_FACTOR, 1)

        if forecast_rainfall_mm:
            amount_mm = round(max(0.0, amount_mm - forecast_rainfall_mm * 0.8), 1)

        reason = self._reason(
            recommendation, soil_moisture, target, amount_mm, forecast_rainfall_mm
        )
        return {
            "recommendation": recommendation,
            "amount_mm": amount_mm,
            "reason": reason,
            "crop": original_crop,
            "demo_mode": True,
        }

    def _reason(self, recommendation, soil_moisture, target, amount_mm, forecast_rainfall_mm):
        parts = [
            f"Soil moisture is {soil_moisture:.1f}% against a dataset-derived target of {target:.0f}%."
        ]
        if amount_mm > 0:
            parts.append(f"Apply approximately {amount_mm:.1f} mm of irrigation water.")
        else:
            parts.append("No additional irrigation needed at this time.")
        if forecast_rainfall_mm:
            parts.append(
                f"{forecast_rainfall_mm:.1f} mm of rainfall is forecast and has been factored into the amount."
            )
        return " ".join(parts)
