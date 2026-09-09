"""AP Market Prices Dataset Service.

Loads, indexes, and caches the comprehensive Andhra Pradesh Agricultural Marketing
dataset (12,500 granular mandi/market records, district summaries, and MSP benchmarks).
"""
import logging
import math
import os
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple

import httpx
import pandas as pd

logger = logging.getLogger(__name__)

# Centroids for all 26 Andhra Pradesh districts for instant offline-safe coordinate resolution
AP_DISTRICT_COORDINATES: Dict[str, Tuple[float, float]] = {
    "Alluri Sitharama Raju (ASR)": (18.0833, 82.6667),
    "Anakapalli": (17.6913, 83.0039),
    "Ananthapuramu": (14.6819, 77.6006),
    "Annamayya": (14.0560, 78.7521),
    "Bapatla": (15.9042, 80.4674),
    "Chittoor": (13.2172, 79.1003),
    "Dr. B.R. Ambedkar Konaseema": (16.5787, 82.0061),
    "East Godavari": (17.0005, 81.8040),
    "Eluru": (16.7107, 81.0952),
    "Guntur": (16.3067, 80.4365),
    "Kakinada": (16.9891, 82.2475),
    "Krishna": (16.1800, 81.1300),
    "Kurnool": (15.8281, 78.0373),
    "NTR District": (16.5062, 80.6480),
    "Nandyal": (15.4776, 78.4836),
    "Nellore (SPSR Nellore)": (14.4426, 79.9865),
    "Palnadu": (16.2359, 80.0497),
    "Parvathipuram Manyam": (18.7797, 83.4286),
    "Prakasam": (15.5057, 80.0499),
    "Sri Sathya Sai": (14.1670, 77.8115),
    "Srikakulam": (18.2969, 83.8968),
    "Tirupati": (13.6288, 79.4192),
    "Visakhapatnam": (17.6868, 83.2185),
    "Vizianagaram": (18.1067, 83.3956),
    "West Godavari": (16.5400, 81.5200),
    "YSR Kadapa": (14.4673, 78.8242),
}


def _haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def _match_district_series(series: pd.Series, district_query: str) -> pd.Series:
    """Flexible district matching supporting exact, alias, and substring matches."""
    if not district_query or district_query.strip().lower() in ("all", ""):
        return pd.Series(True, index=series.index)
    q = district_query.strip().lower()
    # 1. Exact match
    mask = series.str.lower() == q
    if mask.any():
        return mask
    # 2. Substring match
    mask = series.str.lower().str.contains(q, regex=False)
    if mask.any():
        return mask
    # 3. Token match for aliases (e.g., 'Nellore' matches 'Nellore (SPSR Nellore)')
    tokens = [t for t in q.replace("(", " ").replace(")", " ").replace("-", " ").split() if len(t) >= 4]
    for t in tokens:
        m = series.str.lower().str.contains(t, regex=False)
        if m.any():
            return m
    return pd.Series(False, index=series.index)


def resolve_district_from_coords(lat: float, lon: float) -> Dict[str, Any]:
    """
    Resolve GPS coordinates to one of Andhra Pradesh's 26 districts.
    Tries OpenStreetMap reverse geocoding first, matching the district name.
    Falls back to nearest AP district centroid using Haversine formula.
    """
    detected_name = None
    detected_state = None

    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
        with httpx.Client(timeout=3.0) as client:
            resp = client.get(url, headers={"User-Agent": "AgriAI-Market/1.0"})
            if resp.status_code == 200:
                data = resp.json()
                addr = data.get("address", {})
                detected_state = addr.get("state")
                detected_name = (
                    addr.get("state_district")
                    or addr.get("district")
                    or addr.get("county")
                    or addr.get("city")
                )
    except Exception as e:
        logger.debug("Reverse geocode lookup exception: %s", e)

    # If Nominatim returned a district, try to match it against AP districts
    if detected_name:
        clean_name = (
            detected_name.replace("District", "")
            .replace("district", "")
            .replace("Mandal", "")
            .replace("mandal", "")
            .strip()
            .lower()
        )
        for dist_key in AP_DISTRICT_COORDINATES.keys():
            k_clean = dist_key.lower()
            if clean_name in k_clean or any(tok in k_clean for tok in clean_name.split() if len(tok) >= 4):
                centroid = AP_DISTRICT_COORDINATES[dist_key]
                dist_km = _haversine_distance_km(lat, lon, centroid[0], centroid[1])
                return {
                    "district": dist_key,
                    "matched_district": dist_key,
                    "state": detected_state or "Andhra Pradesh",
                    "lat": lat,
                    "lon": lon,
                    "distance_km": dist_km,
                    "source": "live_reverse_geocode",
                    "is_exact_ap": True,
                    "message": f"Successfully resolved live location to {dist_key}.",
                }

    # Find closest AP district by Haversine distance
    closest_district = "Guntur"
    min_dist = float("inf")

    for dist_key, (c_lat, c_lon) in AP_DISTRICT_COORDINATES.items():
        d = _haversine_distance_km(lat, lon, c_lat, c_lon)
        if d < min_dist:
            min_dist = d
            closest_district = dist_key

    is_ap = min_dist < 120.0  # within reasonable AP proximity
    msg = (
        f"Live location mapped to nearest AP mandi district: {closest_district} ({min_dist} km away)."
        if not is_ap
        else f"Live location resolved to {closest_district}."
    )

    return {
        "district": closest_district,
        "matched_district": closest_district,
        "state": detected_state or ("Andhra Pradesh" if is_ap else "Other"),
        "lat": lat,
        "lon": lon,
        "distance_km": min_dist,
        "source": "live_proximity_centroid",
        "is_exact_ap": is_ap,
        "message": msg,
    }


_DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "datasets",
    "AP_Market_Prices.xlsx",
)

# ── Load and Normalize DataFrames ─────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_raw_df() -> pd.DataFrame:
    if not os.path.isfile(_DATASET_PATH):
        logger.warning("AP Market dataset file not found at: %s", _DATASET_PATH)
        return pd.DataFrame()

    xl = pd.ExcelFile(_DATASET_PATH)
    df = pd.read_excel(xl, sheet_name="Market_Prices_Raw", header=2)
    df.columns = df.iloc[0].str.strip()
    df = df.iloc[1:].reset_index(drop=True)

    numeric_cols = [
        "Arrival_Quantity_Qtl",
        "Min_Price_Rs_Qtl",
        "Max_Price_Rs_Qtl",
        "Modal_Price_Rs_Qtl",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # String cleanup
    str_cols = [
        "Commodity_Name",
        "Commodity_Group",
        "District",
        "Mandal",
        "Village",
        "Market_Center_Name",
        "Market_Type",
        "Variety",
        "Grade",
        "Price_Trend",
        "Trading_Channel",
        "Reporting_Date",
    ]
    for col in str_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    # Search helper lowercase column
    df["_search_text"] = (
        df["Commodity_Name"]
        + " "
        + df["Market_Center_Name"]
        + " "
        + df["District"]
        + " "
        + df["Mandal"]
        + " "
        + df["Village"]
        + " "
        + df["Variety"]
        + " "
        + df["Trading_Channel"]
    ).str.lower()

    # Derived price per tonne (1 tonne = 10 quintals)
    df["Price_Per_Tonne"] = df["Modal_Price_Rs_Qtl"] * 10.0

    logger.info("Loaded AP Market Raw records: %d rows", len(df))
    return df


@lru_cache(maxsize=1)
def _load_district_summary_df() -> pd.DataFrame:
    if not os.path.isfile(_DATASET_PATH):
        return pd.DataFrame()

    xl = pd.ExcelFile(_DATASET_PATH)
    df = pd.read_excel(xl, sheet_name="District_Commodity_Summary", header=2)
    df.columns = df.iloc[0].str.strip()
    df = df.iloc[1:].reset_index(drop=True)

    for col in ["Record_Count", "Total_Arrivals_Qtl", "Avg_Modal_Price_Rs_Qtl", "Min_Trade_Price", "Max_Trade_Price"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    for col in ["District", "Commodity_Name"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    return df


@lru_cache(maxsize=1)
def _load_msp_df() -> pd.DataFrame:
    if not os.path.isfile(_DATASET_PATH):
        return pd.DataFrame()

    xl = pd.ExcelFile(_DATASET_PATH)
    df = pd.read_excel(xl, sheet_name="MSP_and_Price_Benchmarks", header=2)
    df.columns = df.iloc[0].str.strip()
    df = df.iloc[1:].reset_index(drop=True)

    if "MSP_or_Benchmark_Price_Rs_Qtl" in df.columns:
        df["MSP_or_Benchmark_Price_Rs_Qtl"] = pd.to_numeric(
            df["MSP_or_Benchmark_Price_Rs_Qtl"], errors="coerce"
        ).fillna(0)

    for col in ["Commodity_Name", "Commodity_Group", "Support_Mechanism", "Standard_Unit"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    return df


def is_available() -> bool:
    return os.path.isfile(_DATASET_PATH)


# ── Query & Filtering ─────────────────────────────────────────────────────────

def get_prices(
    crop: Optional[str] = None,
    district: Optional[str] = None,
    commodity_group: Optional[str] = None,
    market_type: Optional[str] = None,
    price_trend: Optional[str] = None,
    trading_channel: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    sort_by: str = "reporting_date",
    sort_order: str = "desc",
) -> Dict[str, Any]:
    df = _load_raw_df()
    if df.empty:
        return {"prices": [], "total": 0, "page": 1, "limit": limit, "total_pages": 0, "as_of": datetime.now(timezone.utc), "demo_mode": False}

    filtered = df

    if crop and crop.lower() != "all":
        crop_clean = crop.strip().lower()
        filtered = filtered[filtered["Commodity_Name"].str.lower().str.contains(crop_clean, na=False)]

    if district and district.lower() != "all":
        mask = _match_district_series(filtered["District"], district)
        if mask.any():
            filtered = filtered[mask]

    if commodity_group and commodity_group.lower() != "all":
        cg_clean = commodity_group.strip().lower()
        filtered = filtered[filtered["Commodity_Group"].str.lower() == cg_clean]

    if market_type and market_type.lower() != "all":
        mt_clean = market_type.strip().lower()
        filtered = filtered[filtered["Market_Type"].str.lower().str.contains(mt_clean, na=False)]

    if price_trend and price_trend.lower() != "all":
        pt_clean = price_trend.strip().lower()
        filtered = filtered[filtered["Price_Trend"].str.lower().str.contains(pt_clean, na=False)]

    if trading_channel and trading_channel.lower() != "all":
        tc_clean = trading_channel.strip().lower()
        filtered = filtered[filtered["Trading_Channel"].str.lower().str.contains(tc_clean, na=False)]

    if search:
        search_terms = search.strip().lower().split()
        for term in search_terms:
            filtered = filtered[filtered["_search_text"].str.contains(term, na=False)]

    # Sorting
    sort_col_map = {
        "reporting_date": "Reporting_Date",
        "price_per_tonne": "Price_Per_Tonne",
        "modal_price": "Modal_Price_Rs_Qtl",
        "arrival_quantity": "Arrival_Quantity_Qtl",
        "crop": "Commodity_Name",
        "district": "District",
    }
    actual_sort_col = sort_col_map.get(sort_by, "Reporting_Date")
    ascending = sort_order.lower() == "asc"
    filtered = filtered.sort_values(by=[actual_sort_col, "Modal_Price_Rs_Qtl"], ascending=[ascending, ascending])

    total_count = len(filtered)
    limit = max(1, min(limit, 500))
    page = max(1, page)
    total_pages = (total_count + limit - 1) // limit if total_count > 0 else 0

    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_df = filtered.iloc[start_idx:end_idx]

    # Pre-map MSP benchmarks
    msp_df = _load_msp_df()
    msp_dict = {}
    if not msp_df.empty:
        for _, row in msp_df.iterrows():
            comm_norm = str(row["Commodity_Name"]).split("(")[0].strip().lower()
            msp_dict[comm_norm] = float(row["MSP_or_Benchmark_Price_Rs_Qtl"])

    prices = []
    now = datetime.now(timezone.utc)
    for _, row in page_df.iterrows():
        comm = row["Commodity_Name"]
        comm_prefix = comm.split("(")[0].strip().lower()
        msp_benchmark = msp_dict.get(comm_prefix)
        modal_price = float(row["Modal_Price_Rs_Qtl"])

        msp_diff_pct = None
        if msp_benchmark and msp_benchmark > 0:
            msp_diff_pct = round(((modal_price - msp_benchmark) / msp_benchmark) * 100.0, 1)

        rep_date_str = str(row["Reporting_Date"])
        try:
            parsed_dt = datetime.strptime(rep_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except Exception:
            parsed_dt = now

        prices.append({
            "crop": comm,
            "market": row["Market_Center_Name"],
            "price_per_tonne": float(row["Price_Per_Tonne"]),
            "modal_price_rs_qtl": modal_price,
            "min_price_rs_qtl": float(row["Min_Price_Rs_Qtl"]),
            "max_price_rs_qtl": float(row["Max_Price_Rs_Qtl"]),
            "arrival_quantity_qtl": float(row["Arrival_Quantity_Qtl"]),
            "unit_of_price": row["Unit_of_Price"],
            "variety": row["Variety"],
            "grade": row["Grade"],
            "district": row["District"],
            "mandal": row["Mandal"],
            "village": row["Village"],
            "region": row.get("Region", "Andhra Pradesh"),
            "market_type": row["Market_Type"],
            "commodity_group": row["Commodity_Group"],
            "price_trend": row["Price_Trend"],
            "trading_channel": row["Trading_Channel"],
            "reporting_date": rep_date_str,
            "currency": "INR",
            "source": "AP AgMarket Mandi",
            "demo_mode": False,
            "date": parsed_dt,
            "msp_benchmark": msp_benchmark,
            "msp_diff_pct": msp_diff_pct,
        })

    return {
        "prices": prices,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "as_of": now,
        "demo_mode": False,
    }


def get_summary(district: Optional[str] = None) -> Dict[str, Any]:
    df = _load_raw_df()
    if df.empty:
        return {}

    is_district_filtered = False
    matched_district_name = None

    if district and district.lower() != "all":
        mask = _match_district_series(df["District"], district)
        if mask.any():
            df = df[mask]
            is_district_filtered = True
            matched_district_name = df["District"].iloc[0]

    total_records = len(df)
    total_arrivals = float(df["Arrival_Quantity_Qtl"].sum()) if total_records else 0.0
    avg_modal_price = float(df["Modal_Price_Rs_Qtl"].mean()) if total_records else 0.0

    trend_counts = df["Price_Trend"].value_counts().to_dict()
    bullish = int(trend_counts.get("Bullish (+)", 0))
    stable = int(trend_counts.get("Stable (=)", 0))
    bearish = int(trend_counts.get("Bearish (-)", 0))

    channel_counts = df["Trading_Channel"].value_counts().to_dict()
    market_type_counts = df["Market_Type"].value_counts().to_dict()

    # Top commodities by arrival volume
    if not df.empty:
        top_volume_df = (
            df.groupby("Commodity_Name")
            .agg(
                total_arrivals=("Arrival_Quantity_Qtl", "sum"),
                avg_price=("Modal_Price_Rs_Qtl", "mean"),
                record_count=("Market_Record_ID", "count"),
                commodity_group=("Commodity_Group", "first"),
            )
            .sort_values(by="total_arrivals", ascending=False)
            .head(8)
            .reset_index()
        )
        top_commodities = [
            {
                "commodity": row["Commodity_Name"],
                "commodity_group": row["commodity_group"],
                "total_arrivals_qtl": round(float(row["total_arrivals"]), 1),
                "avg_price_rs_qtl": round(float(row["avg_price"]), 1),
                "record_count": int(row["record_count"]),
            }
            for _, row in top_volume_df.iterrows()
        ]
    else:
        top_commodities = []

    # Top mandis by transaction count
    if not df.empty:
        top_mandis_df = (
            df.groupby(["Market_Center_Name", "District"])
            .agg(
                record_count=("Market_Record_ID", "count"),
                total_arrivals=("Arrival_Quantity_Qtl", "sum"),
                avg_price=("Modal_Price_Rs_Qtl", "mean"),
                market_type=("Market_Type", "first"),
            )
            .sort_values(by="record_count", ascending=False)
            .head(6)
            .reset_index()
        )
        top_mandis = [
            {
                "market_name": row["Market_Center_Name"],
                "district": row["District"],
                "market_type": row["market_type"],
                "record_count": int(row["record_count"]),
                "total_arrivals_qtl": round(float(row["total_arrivals"]), 1),
                "avg_price_rs_qtl": round(float(row["avg_price"]), 1),
            }
            for _, row in top_mandis_df.iterrows()
        ]
    else:
        top_mandis = []

    msp_df = _load_msp_df()
    msp_compliance_count = 0
    total_msp_applicable = 0
    if not msp_df.empty and not df.empty:
        for _, m_row in msp_df.iterrows():
            comm_prefix = str(m_row["Commodity_Name"]).split("(")[0].strip().lower()
            msp_val = float(m_row["MSP_or_Benchmark_Price_Rs_Qtl"])
            matched = df[df["Commodity_Name"].str.lower().str.startswith(comm_prefix)]
            if not matched.empty:
                total_msp_applicable += 1
                if matched["Modal_Price_Rs_Qtl"].mean() >= msp_val:
                    msp_compliance_count += 1

    date_min = str(df["Reporting_Date"].min()) if not df.empty else ""
    date_max = str(df["Reporting_Date"].max()) if not df.empty else ""

    return {
        "total_records": total_records,
        "total_arrivals_qtl": round(total_arrivals, 1),
        "avg_modal_price_rs_qtl": round(avg_modal_price, 1),
        "avg_price_per_tonne": round(avg_modal_price * 10, 1),
        "distinct_commodities": int(df["Commodity_Name"].nunique()) if not df.empty else 0,
        "distinct_districts": int(df["District"].nunique()) if not df.empty else 0,
        "distinct_markets": int(df["Market_Center_Name"].nunique()) if not df.empty else 0,
        "is_district_filtered": is_district_filtered,
        "filtered_district": matched_district_name or district if is_district_filtered else None,
        "date_range": {
            "start": date_min,
            "end": date_max,
        },
        "trends": {
            "bullish": bullish,
            "stable": stable,
            "bearish": bearish,
            "bullish_pct": round((bullish / total_records) * 100, 1) if total_records else 0,
            "stable_pct": round((stable / total_records) * 100, 1) if total_records else 0,
            "bearish_pct": round((bearish / total_records) * 100, 1) if total_records else 0,
        },
        "trading_channels": {k: int(v) for k, v in channel_counts.items()},
        "market_types": {k: int(v) for k, v in market_type_counts.items()},
        "top_commodities": top_commodities,
        "top_mandis": top_mandis,
        "msp_metrics": {
            "applicable_crops": total_msp_applicable,
            "crops_at_or_above_msp": msp_compliance_count,
            "compliance_pct": round((msp_compliance_count / total_msp_applicable) * 100, 1) if total_msp_applicable else 0,
        },
    }


def get_districts() -> List[Dict[str, Any]]:
    df = _load_raw_df()
    if df.empty:
        return []

    res = (
        df.groupby("District")
        .agg(
            region=("Region", "first"),
            record_count=("Market_Record_ID", "count"),
            market_count=("Market_Center_Name", "nunique"),
            commodity_count=("Commodity_Name", "nunique"),
            total_arrivals=("Arrival_Quantity_Qtl", "sum"),
        )
        .reset_index()
        .sort_values(by="District")
    )
    return [
        {
            "district": row["District"],
            "region": row["region"],
            "record_count": int(row["record_count"]),
            "market_count": int(row["market_count"]),
            "commodity_count": int(row["commodity_count"]),
            "total_arrivals_qtl": round(float(row["total_arrivals"]), 1),
        }
        for _, row in res.iterrows()
    ]


def get_commodities() -> List[Dict[str, Any]]:
    df = _load_raw_df()
    if df.empty:
        return []

    res = (
        df.groupby("Commodity_Name")
        .agg(
            commodity_group=("Commodity_Group", "first"),
            record_count=("Market_Record_ID", "count"),
            avg_modal_price=("Modal_Price_Rs_Qtl", "mean"),
            min_price=("Min_Price_Rs_Qtl", "min"),
            max_price=("Max_Price_Rs_Qtl", "max"),
            total_arrivals=("Arrival_Quantity_Qtl", "sum"),
        )
        .reset_index()
        .sort_values(by="Commodity_Name")
    )
    return [
        {
            "commodity_name": row["Commodity_Name"],
            "commodity_group": row["commodity_group"],
            "record_count": int(row["record_count"]),
            "avg_modal_price_rs_qtl": round(float(row["avg_modal_price"]), 1),
            "min_price_rs_qtl": round(float(row["min_price"]), 1),
            "max_price_rs_qtl": round(float(row["max_price"]), 1),
            "total_arrivals_qtl": round(float(row["total_arrivals"]), 1),
        }
        for _, row in res.iterrows()
    ]


def get_district_summary(
    district: Optional[str] = None,
    crop: Optional[str] = None,
    limit: int = 200,
) -> List[Dict[str, Any]]:
    df = _load_district_summary_df()
    if df.empty:
        return []

    filtered = df
    if district and district.lower() != "all":
        mask = _match_district_series(filtered["District"], district)
        if mask.any():
            filtered = filtered[mask]

    if crop and crop.lower() != "all":
        filtered = filtered[filtered["Commodity_Name"].str.lower().str.contains(crop.strip().lower(), na=False)]

    filtered = filtered.sort_values(by=["Total_Arrivals_Qtl", "Avg_Modal_Price_Rs_Qtl"], ascending=[False, False]).head(limit)

    return [
        {
            "district": row["District"],
            "commodity_name": row["Commodity_Name"],
            "record_count": int(row["Record_Count"]),
            "total_arrivals_qtl": round(float(row["Total_Arrivals_Qtl"]), 1),
            "avg_modal_price_rs_qtl": round(float(row["Avg_Modal_Price_Rs_Qtl"]), 1),
            "min_trade_price": round(float(row["Min_Trade_Price"]), 1),
            "max_trade_price": round(float(row["Max_Trade_Price"]), 1),
        }
        for _, row in filtered.iterrows()
    ]


def get_msp_benchmarks(district: Optional[str] = None) -> List[Dict[str, Any]]:
    df_msp = _load_msp_df()
    if df_msp.empty:
        return []

    raw_df = _load_raw_df()
    if district and district.lower() != "all":
        mask = _match_district_series(raw_df["District"], district)
        if mask.any():
            raw_df = raw_df[mask]

    items = []
    for _, row in df_msp.iterrows():
        c_name = row["Commodity_Name"]
        msp_price = float(row["MSP_or_Benchmark_Price_Rs_Qtl"])
        c_prefix = str(c_name).split("(")[0].strip().lower()

        # Compute market average
        matched = raw_df[raw_df["Commodity_Name"].str.lower().str.startswith(c_prefix)]
        avg_market_price = None
        min_market_price = None
        max_market_price = None
        status = "Not Traded"
        diff_pct = None

        if not matched.empty:
            avg_market_price = round(float(matched["Modal_Price_Rs_Qtl"].mean()), 1)
            min_market_price = round(float(matched["Min_Price_Rs_Qtl"].min()), 1)
            max_market_price = round(float(matched["Max_Price_Rs_Qtl"].max()), 1)
            diff_pct = round(((avg_market_price - msp_price) / msp_price) * 100.0, 1)
            if avg_market_price >= msp_price * 1.02:
                status = "Above MSP"
            elif avg_market_price >= msp_price * 0.98:
                status = "At MSP"
            else:
                status = "Below MSP"

        items.append({
            "commodity_name": c_name,
            "commodity_group": row["Commodity_Group"],
            "msp_price_rs_qtl": msp_price,
            "support_mechanism": row["Support_Mechanism"],
            "standard_unit": row["Standard_Unit"],
            "avg_market_price_rs_qtl": avg_market_price,
            "min_market_price_rs_qtl": min_market_price,
            "max_market_price_rs_qtl": max_market_price,
            "diff_pct": diff_pct,
            "status": status,
        })

    return items

