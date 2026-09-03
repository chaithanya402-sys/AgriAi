"""
Village-Level Soil Data Service
================================
Loads the 105,000-record Andhra Pradesh soil dataset once (cached in memory)
and provides village → mandal → district level lookups with coordinate-based
nearest-neighbour fallback.

Priority order (as specified):
  LEVEL 1 – coordinate nearest-neighbour (≤ 0.15° ≈ 15 km)
  LEVEL 2 – State + District + Mandal + Village  (exact text match)
  LEVEL 3 – State + District + Mandal
  LEVEL 4 – State + District
"""
import logging
import math
import os
from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

logger = logging.getLogger(__name__)

_DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "datasets",
    "AP_Village_Soil_Data.xlsx",
)

# ── cached dataframe ─────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_df() -> pd.DataFrame:
    if not os.path.isfile(_DATASET_PATH):
        logger.error("Village soil dataset not found: %s", _DATASET_PATH)
        return pd.DataFrame()
    df = pd.read_excel(_DATASET_PATH)
    # Normalise text columns
    for col in ["State", "District", "Mandal", "Village", "Soil_Type_Series",
                "Cropping_Season", "Fertility_Index"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
    # Lower-case lookup columns
    df["_district_l"] = df["District"].str.lower()
    df["_mandal_l"]   = df["Mandal"].str.lower()
    df["_village_l"]  = df["Village"].str.lower()
    logger.info("Loaded village soil dataset: %d rows", len(df))
    return df


def is_available() -> bool:
    return os.path.isfile(_DATASET_PATH)


def get_districts() -> List[str]:
    df = _load_df()
    return sorted(df["District"].unique().tolist()) if not df.empty else []


# ── internal aggregation ─────────────────────────────────────────────────────

def _agg(subset: pd.DataFrame) -> Dict[str, Any]:
    """Aggregate a subset of records into a single soil data dict."""
    def m(col: str, dec: int = 2) -> Optional[float]:
        if col not in subset.columns:
            return None
        vals = pd.to_numeric(subset[col], errors="coerce").dropna()
        return round(float(vals.mean()), dec) if not vals.empty else None

    def top(col: str) -> Optional[str]:
        if col not in subset.columns:
            return None
        vc = subset[col].value_counts()
        return str(vc.index[0]) if not vc.empty else None

    return {
        "ph":         m("pH"),
        "ec":         m("EC_dS_m"),
        "organicCarbon": m("OC_pct"),
        "nitrogen":   m("Avail_N_kg_ha", 1),
        "phosphorus": m("Avail_P2O5_kg_ha", 1),
        "potassium":  m("Avail_K2O_kg_ha", 1),
        "sulfur":     m("Avail_S_ppm", 1),
        "zinc":       m("DTPA_Zn_ppm"),
        "iron":       m("DTPA_Fe_ppm", 1),
        "copper":     m("DTPA_Cu_ppm"),
        "manganese":  m("DTPA_Mn_ppm", 1),
        "boron":      m("HotWater_B_ppm"),
        "soilType":   top("Soil_Type_Series"),
        "croppingSeason": top("Cropping_Season"),
        "fertilityIndex": top("Fertility_Index"),
        "advisory":   top("Plot_Specific_Advisory"),
        "recordCount": int(len(subset)),
    }


# ── public lookup functions ───────────────────────────────────────────────────

def lookup_by_coords(lat: float, lon: float,
                     max_dist_deg: float = 0.15) -> Optional[Dict[str, Any]]:
    """Return nearest record within max_dist_deg degrees (≈15 km)."""
    df = _load_df()
    if df.empty:
        return None
    if "Latitude" not in df.columns or "Longitude" not in df.columns:
        return None

    lats = pd.to_numeric(df["Latitude"], errors="coerce")
    lons = pd.to_numeric(df["Longitude"], errors="coerce")
    valid = lats.notna() & lons.notna()
    if not valid.any():
        return None

    dist2 = (lats[valid] - lat) ** 2 + (lons[valid] - lon) ** 2
    idx = int(dist2.idxmin())
    min_dist = math.sqrt(float(dist2[idx]))
    if min_dist > max_dist_deg:
        return None

    row = df.loc[idx]
    result = _agg(df.loc[[idx]])
    result["district"] = row["District"]
    result["mandal"]   = row["Mandal"]
    result["village"]  = row["Village"]
    result["dataSource"] = "Village-level soil data"
    result["matchLevel"] = 1
    return result


def lookup_by_village(district: str, mandal: Optional[str],
                      village: Optional[str]) -> Optional[Dict[str, Any]]:
    """Text-based lookup: tries village → mandal → district in that order."""
    df = _load_df()
    if df.empty:
        return None

    d_low = district.strip().lower()
    # fuzzy district match
    mask_d = df["_district_l"].apply(lambda x: d_low in x or x in d_low)
    subset = df[mask_d]
    if subset.empty:
        return None

    # LEVEL 2 – district + mandal + village
    if mandal and village:
        m_low = mandal.strip().lower()
        v_low = village.strip().lower()
        s2 = subset[
            subset["_mandal_l"].apply(lambda x: m_low in x or x in m_low) &
            subset["_village_l"].apply(lambda x: v_low in x or x in v_low)
        ]
        if not s2.empty:
            r = _agg(s2)
            r["district"] = s2["District"].iloc[0]
            r["mandal"]   = s2["Mandal"].iloc[0]
            r["village"]  = s2["Village"].iloc[0]
            r["dataSource"] = "Village-level soil data"
            r["matchLevel"] = 2
            return r

    # LEVEL 3 – district + mandal
    if mandal:
        m_low = mandal.strip().lower()
        s3 = subset[subset["_mandal_l"].apply(lambda x: m_low in x or x in m_low)]
        if not s3.empty:
            r = _agg(s3)
            r["district"] = s3["District"].iloc[0]
            r["mandal"]   = s3["Mandal"].iloc[0]
            r["village"]  = None
            r["dataSource"] = "Mandal-level estimate"
            r["matchLevel"] = 3
            return r

    # LEVEL 4 – district only
    r = _agg(subset)
    r["district"] = subset["District"].iloc[0]
    r["mandal"]   = None
    r["village"]  = None
    r["dataSource"] = "District-level estimate"
    r["matchLevel"] = 4
    return r


def get_village_soil(
    district: str,
    mandal: Optional[str] = None,
    village: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Master lookup with full priority cascade.
    Returns dict with soil fields + dataSource + matchLevel.
    Returns {"found": False} if nothing matches.
    """
    result = None

    # Level 1 – coordinate nearest-neighbour
    if lat is not None and lon is not None:
        result = lookup_by_coords(lat, lon)

    # Level 2-4 – text match
    if result is None:
        result = lookup_by_village(district, mandal, village)

    if result is None:
        return {"found": False, "message": "No soil data found for this location."}

    result["found"] = True
    return result


def get_mandals_for_district(district: str) -> List[str]:
    df = _load_df()
    if df.empty:
        return []
    d_low = district.strip().lower()
    mask = df["_district_l"].apply(lambda x: d_low in x or x in d_low)
    return sorted(df[mask]["Mandal"].unique().tolist())


def get_villages_for_mandal(district: str, mandal: str) -> List[str]:
    df = _load_df()
    if df.empty:
        return []
    d_low = district.strip().lower()
    m_low = mandal.strip().lower()
    mask = (
        df["_district_l"].apply(lambda x: d_low in x or x in d_low) &
        df["_mandal_l"].apply(lambda x: m_low in x or x in m_low)
    )
    return sorted(df[mask]["Village"].unique().tolist())
