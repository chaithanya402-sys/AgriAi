"""Fertilizer recommendation service.

Target NPK per crop is derived from the real dataset (mean applied N/P/K for
that crop via app.data_loader). delta = target - current; only nutrients below
target are recommended. All values are COMPUTED from the inputs and dataset.
"""
from typing import Optional

from app import data_loader


class FertilizerService:
    DISCLAIMER = (
        "Recommendations supplement, not replace, local agricultural experts, "
        "soil testing, and product labels."
    )

    def recommend(self, crop: str, n: float, p: float, k: float, ph: Optional[float] = None) -> dict:
        s = data_loader.get_crop(crop)
        targets = data_loader.npk_targets(crop)
        current = {"N": n, "P": p, "K": k}

        recommended = []
        for nutrient in ["N", "P", "K"]:
            delta = round(targets[nutrient] - current[nutrient], 1)
            if delta > 0:
                recommended.append({
                    "nutrient": nutrient,
                    "current": current[nutrient],
                    "target": targets[nutrient],
                    "delta": delta,
                })

        return {
            "crop": crop,
            "recommended": recommended,
            "npk_ratio": self._npk_ratio(targets),
            "guidance": self._guidance(crop, current, targets, ph, recommended, s),
            "disclaimer": self.DISCLAIMER,
            "demo_mode": True,
        }

    def _npk_ratio(self, targets: dict) -> str:
        vals = [targets["N"], targets["P"], targets["K"]]
        base = min(v for v in vals if v > 0)
        return ":".join(str(round(v / base)) for v in vals)

    def _guidance(self, crop, current, targets, ph, recommended, s) -> str:
        lines = []
        if recommended:
            names = ", ".join(r["nutrient"] for r in recommended)
            lines.append(
                f"{names} are below the dataset-derived target for {crop}; apply the "
                "indicated delta (kg/ha)."
            )
        else:
            lines.append(
                f"Soil NPK for {crop} is at or above the dataset-derived target; no "
                "additional application recommended at this time."
            )
        if s and s.get("top_fertilizer"):
            lines.append(
                f"Commonly applied in the dataset: {s['top_fertilizer'][0]}."
            )
        if ph is not None:
            if ph < 5.7:
                lines.append(
                    "Soil pH is low — consider liming to improve nutrient availability."
                )
            elif ph > 8.0:
                lines.append(
                    "Soil pH is high — nutrients may be less available; consider a pH management plan."
                )
        lines.append("Targets derive from the CropYield dataset; verify with a soil test.")
        return " ".join(lines)
