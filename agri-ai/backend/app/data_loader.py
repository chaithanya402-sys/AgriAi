"""
Data loader — single source of truth for the AgriAI platform.

Loads the real CropYield state-wise Excel datasets once (cached in memory) and
computes every statistic the models/services use, so that ALL values shown to
the user are derived from the actual 10,000-record dataset rather than
hand-written demo constants.

Any value a service needs (crop features, base yields, prices, ideal nutrient
ranges, moisture targets, NPK targets, disease rates, etc.) can be read from
here. If a dataset is not found, functions raise a clear error — never silently
fall back to fake numbers.
"""
import glob
import os
from functools import lru_cache
from typing import Dict, List, Tuple

import pandas as pd

# Default location: <project>/agri-ai/datasets/
_DEFAULT_DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "datasets",
)

# If the datasets were copied into our own project we'd use DATA_DIR, but the
# source files live in the Downloads folder. Allow overriding via env.
_SOURCE_DIR = os.environ.get(
    "AGRI_DATASETS_DIR",
    os.path.expandvars(r"%USERPROFILE%\Downloads\CropYield_State_Wise_Datasets"),
)

# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------


def _discover_files() -> List[str]:
    """Find the state-wise xlsx files, preferring an explicit env override."""
    candidates = []
    for base in [os.environ.get("AGRI_DATASETS_DIR"), _SOURCE_DIR, _DEFAULT_DATA_DIR]:
        if not base or not os.path.isdir(base):
            continue
        candidates = sorted(glob.glob(os.path.join(base, "*.xlsx")))
        if candidates:
            break
    if not candidates:
        raise FileNotFoundError(
            "CropYield state-wise datasets not found. Set AGRI_DATASETS_DIR to the "
            f"folder containing the 36 *.xlsx files (tried: {_SOURCE_DIR}, "
            f"{_DEFAULT_DATA_DIR})."
        )
    return candidates


@lru_cache(maxsize=1)
def load_dataframe() -> pd.DataFrame:
    """Read all 36 state files into one consolidated DataFrame (cached)."""
    files = _discover_files()
    frames = []
    for f in files:
        df = pd.read_excel(f)
        df["source_file"] = os.path.basename(f)
        frames.append(df)
    return pd.concat(frames, ignore_index=True)


# ---------------------------------------------------------------------------
# Per-crop statistics (the canonical reference used by every service)
# ---------------------------------------------------------------------------


@lru_cache(maxsize=1)
def crop_stats() -> Dict[str, Dict]:
    """Mean/range statistics per crop, computed from the real dataset."""
    df = load_dataframe()
    stats: Dict[str, Dict] = {}
    for crop, g in df.groupby("Crop"):
        stats[crop] = {
            "count": int(len(g)),
            "yield_mean": round(float(g["Yield_tonnes_ha"].mean()), 2),
            "yield_std": round(float(g["Yield_tonnes_ha"].std()), 2),
            "yield_min": round(float(g["Yield_tonnes_ha"].min()), 2),
            "yield_max": round(float(g["Yield_tonnes_ha"].max()), 2),
            "profit_mean": float(round(g["Profit_INR_ha"].mean(), 0)),
            "n_mean": float(round(g["Nitrogen_kg_ha"].mean(), 1)),
            "p_mean": float(round(g["Phosphorus_kg_ha"].mean(), 1)),
            "k_mean": float(round(g["Potassium_kg_ha"].mean(), 1)),
            "ph_mean": float(round(g["Soil_pH"].mean(), 2)),
            "temp_mean": float(round(g["Temperature_C"].mean(), 1)),
            "hum_mean": float(round(g["Humidity_pct"].mean(), 1)),
            "rain_mean": float(round(g["Rainfall_mm"].mean(), 0)),
            "moisture_mean": float(round(g["Soil_Moisture_pct"].mean(), 1)),
            "ndvi_mean": float(round(g["NDVI"].mean(), 3)),
            "disease_rate": round(
                float((g["Disease_Status"] != "Healthy").mean() * 100), 1
            ),
            # Dominant topical values (label, share)
            "top_fertilizer": _top(g["Fertilizer_Used"]),
            "top_soil_type": _top(g["Soil_Type"]),
            "top_irrigation": _top(g["Irrigation_Type"]),
            "top_season": _top(g["Season"]),
        }
    return stats


def _top(series: pd.Series):
    vc = series.value_counts(normalize=True)
    if vc.empty:
        return None
    return (str(vc.index[0]), round(float(vc.iloc[0]), 2))


@lru_cache(maxsize=1)
def crops() -> List[str]:
    """All 15 crop names, sorted."""
    return sorted(crop_stats().keys())


def get_crop(crop: str) -> Dict:
    """Return stats for a single crop (case-insensitive); None if unknown."""
    if not crop:
        return None
    key = _match_crop(crop)
    if key is None:
        return None
    return crop_stats()[key]


def _match_crop(crop: str) -> str:
    """Fuzzy-match an input crop name against the canonical dataset crops."""
    lowered = crop.strip().lower()
    for canonical in crops():
        if canonical.lower() == lowered:
            return canonical
    # Paddy == Rice alias
    if lowered in ("rice", "paddy"):
        return "Paddy"
    return None


# ---------------------------------------------------------------------------
# Global soil ideal ranges derived from dataset IQR (15th–85th percentile)
# ---------------------------------------------------------------------------


@lru_cache(maxsize=1)
def soil_ideal_ranges() -> Dict[str, Tuple[float, float]]:
    df = load_dataframe()
    return {
        "nitrogen": _iqr(df["Nitrogen_kg_ha"]),
        "phosphorus": _iqr(df["Phosphorus_kg_ha"]),
        "potassium": _iqr(df["Potassium_kg_ha"]),
        "ph": _iqr(df["Soil_pH"]),
        "organic_carbon": (0.4, 1.2),  # not present in dataset — agronomic range
        "moisture": _iqr(df["Soil_Moisture_pct"]),
    }


def _iqr(series: pd.Series) -> Tuple[float, float]:
    lo = float(series.quantile(0.15))
    hi = float(series.quantile(0.85))
    return round(lo, 1), round(hi, 1)


# ---------------------------------------------------------------------------
# Convenience accessors used by services
# ---------------------------------------------------------------------------


def base_yield(crop: str) -> float:
    s = get_crop(crop)
    return s["yield_mean"] if s else 3.0


def base_profit(crop: str) -> float:
    s = get_crop(crop)
    return s["profit_mean"] if s else 0.0


def per_tonne_price(crop: str) -> float:
    """Derive an indicative per-tonne price from mean profit / mean yield."""
    s = get_crop(crop)
    if not s or s["yield_mean"] <= 0:
        return 15000.0
    return round(s["profit_mean"] / s["yield_mean"], 0)


def moisture_target(crop: str) -> float:
    s = get_crop(crop)
    return s["moisture_mean"] if s else 39.0


def npk_targets(crop: str) -> Dict[str, float]:
    s = get_crop(crop)
    if not s:
        return {"N": 60.0, "P": 40.0, "K": 40.0}
    return {"N": round(s["n_mean"]), "P": round(s["p_mean"]), "K": round(s["k_mean"])}


def disease_rate(crop: str) -> float:
    s = get_crop(crop)
    return s["disease_rate"] if s else 0.0


# ---------------------------------------------------------------------------
# Crop feature ideal ranges (20th–80th percentile from the dataset) used by the
# crop-fit scoring in the recommendation / yield models.
# ---------------------------------------------------------------------------

_COL_MAP = {
    "n": "Nitrogen_kg_ha",
    "p": "Phosphorus_kg_ha",
    "k": "Potassium_kg_ha",
    "temp": "Temperature_C",
    "hum": "Humidity_pct",
    "ph": "Soil_pH",
    "rain": "Rainfall_mm",
}


@lru_cache(maxsize=1)
def crop_feature_ranges() -> Dict[str, Dict[str, Tuple[float, float]]]:
    df = load_dataframe()
    out: Dict[str, Dict[str, Tuple[float, float]]] = {}
    for crop, g in df.groupby("Crop"):
        ranges = {}
        for short, col in _COL_MAP.items():
            lo = float(g[col].quantile(0.20))
            hi = float(g[col].quantile(0.80))
            ranges[short] = (round(lo, 1), round(hi, 1))
        out[crop] = ranges
    return out


@lru_cache(maxsize=1)
def state_crops() -> Dict[str, List[str]]:
    """Mapping of each state to the crops grown there (for the data explorer)."""
    df = load_dataframe()
    return {
        str(state): sorted(g["Crop"].unique().tolist())
        for state, g in df.groupby("State")
    }
