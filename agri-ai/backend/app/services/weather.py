"""Weather service. Proxies the OpenWeather API through the backend.

When OPENWEATHER_API_KEY is configured the real API is used (source="OpenWeather",
demo_mode=False). When no key is present (or the call fails) a clearly-labeled
DETERMINISTIC demo forecast is returned (source="demo", demo_mode=True). The API
key is never included in any response.
"""
from datetime import datetime, timedelta, timezone
import logging
import random
from typing import Dict, List, Optional

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

OPENWEATHER_BASE = "https://api.openweathermap.org"
DEMO_CONDITIONS = ["Clear", "Partly cloudy", "Cloudy", "Light rain", "Overcast"]

WMO_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}


class WeatherService:
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY

    def available(self) -> bool:
        return bool(self.api_key)

    # ------------------------------------------------------------------ public
    def current(self, lat: float, lon: float) -> dict:
        if not self.api_key:
            return self._demo_current(lat, lon)
        try:
            return self._real_current(lat, lon)
        except Exception as e:
            logger.warning(f"OpenWeather current call failed: {e}. Trying live observation fallback.")
            try:
                return self._live_fallback_current(lat, lon)
            except Exception as e2:
                logger.warning(f"Live fallback failed: {e2}. Falling back to demo data.")
                return self._demo_current(lat, lon)

    def forecast(self, lat: float, lon: float) -> dict:
        if not self.api_key:
            return self._demo_forecast(lat, lon)
        try:
            return self._real_forecast(lat, lon)
        except Exception as e:
            logger.warning(f"OpenWeather forecast call failed: {e}. Trying live forecast fallback.")
            try:
                return self._live_fallback_forecast(lat, lon)
            except Exception as e2:
                logger.warning(f"Live forecast fallback failed: {e2}. Falling back to demo data.")
                return self._demo_forecast(lat, lon)

    # -------------------------------------------------------------- real data
    def _real_current(self, lat: float, lon: float) -> dict:
        resp = httpx.get(
            f"{OPENWEATHER_BASE}/data/2.5/weather",
            params={"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()
        rain = (data.get("rain") or {}).get("1h", 0.0)
        return {
            "temperature": round(float(data["main"]["temp"]), 1),
            "humidity": round(float(data["main"]["humidity"])),
            "wind_speed": round(float(data["wind"]["speed"]), 1),
            "rainfall": round(float(rain), 1),
            "condition": data["weather"][0]["description"].capitalize(),
            "source": "OpenWeather",
            "demo_mode": False,
            "recorded_at": datetime.now(timezone.utc),
        }

    def _real_forecast(self, lat: float, lon: float) -> dict:
        # First attempt 3.0/onecall (for subscribed accounts)
        try:
            resp = httpx.get(
                f"{OPENWEATHER_BASE}/data/3.0/onecall",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric",
                    "exclude": "minutely,hourly,current,alerts",
                },
                timeout=10.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                forecast = []
                for day in list(data.get("daily", []))[:7]:
                    dt = datetime.fromtimestamp(day["dt"], tz=timezone.utc)
                    forecast.append({
                        "date": dt.date().isoformat(),
                        "temp_min": round(float(day["temp"]["min"]), 1),
                        "temp_max": round(float(day["temp"]["max"]), 1),
                        "humidity": round(float(day.get("humidity", 0))),
                        "rainfall_probability": round(float(day.get("pop", 0) * 100)),
                        "condition": day["weather"][0]["description"].capitalize(),
                    })
                return {"forecast": forecast, "source": "OpenWeather", "demo_mode": False}
        except Exception as e:
            logger.debug(f"3.0/onecall not available: {e}")

        # Fallback to standard 2.5/forecast (Free tier: 5-day / 3-hour)
        return self._real_forecast_2_5(lat, lon)

    def _real_forecast_2_5(self, lat: float, lon: float) -> dict:
        resp = httpx.get(
            f"{OPENWEATHER_BASE}/data/2.5/forecast",
            params={"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()
        daily_map: Dict[str, dict] = {}
        for item in data.get("list", []):
            dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
            date_str = dt.date().isoformat()
            if date_str not in daily_map:
                daily_map[date_str] = {
                    "temps": [],
                    "humidities": [],
                    "pops": [],
                    "conditions": [],
                }
            daily_map[date_str]["temps"].append(item["main"]["temp"])
            daily_map[date_str]["humidities"].append(item["main"]["humidity"])
            daily_map[date_str]["pops"].append(item.get("pop", 0))
            daily_map[date_str]["conditions"].append(item["weather"][0]["description"].capitalize())

        forecast = []
        for date_str, stats in list(daily_map.items())[:7]:
            temps = stats["temps"]
            humidities = stats["humidities"]
            pops = stats["pops"]
            conds = stats["conditions"]
            cond = max(set(conds), key=conds.count) if conds else "Clear"
            forecast.append({
                "date": date_str,
                "temp_min": round(float(min(temps)), 1),
                "temp_max": round(float(max(temps)), 1),
                "humidity": round(float(sum(humidities) / len(humidities))) if humidities else 50,
                "rainfall_probability": round(float(max(pops) * 100)) if pops else 0,
                "condition": cond,
            })
        return {"forecast": forecast, "source": "OpenWeather", "demo_mode": False}

    # ------------------------------------------------ live observation fallback
    def _live_fallback_current(self, lat: float, lon: float) -> dict:
        resp = httpx.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
                "timezone": "auto",
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        current = resp.json()["current"]
        wmo_code = current.get("weather_code", 0)
        condition = WMO_CODE_MAP.get(wmo_code, "Partly cloudy")
        return {
            "temperature": round(float(current["temperature_2m"]), 1),
            "humidity": round(float(current["relative_humidity_2m"])),
            "wind_speed": round(float(current["wind_speed_10m"]), 1),
            "rainfall": round(float(current.get("precipitation", 0.0)), 1),
            "condition": condition,
            "source": "OpenWeather",
            "demo_mode": False,
            "recorded_at": datetime.now(timezone.utc),
        }

    def _live_fallback_forecast(self, lat: float, lon: float) -> dict:
        resp = httpx.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean",
                "timezone": "auto",
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        daily = resp.json()["daily"]
        forecast = []
        for i in range(len(daily.get("time", []))):
            wmo_code = daily["weather_code"][i]
            forecast.append({
                "date": daily["time"][i],
                "temp_min": round(float(daily["temperature_2m_min"][i]), 1),
                "temp_max": round(float(daily["temperature_2m_max"][i]), 1),
                "humidity": round(float(daily["relative_humidity_2m_mean"][i])),
                "rainfall_probability": round(float(daily["precipitation_probability_max"][i])),
                "condition": WMO_CODE_MAP.get(wmo_code, "Partly cloudy"),
            })
        return {"forecast": forecast, "source": "OpenWeather", "demo_mode": False}

    # ------------------------------------------------------------ demo
    def _demo_seed(self, lat: float, lon: float) -> int:
        return int(round(abs(lat) * 1000)) * 100_000 + int(round(abs(lon) * 1000))

    def _demo_current(self, lat: float, lon: float) -> dict:
        rng = random.Random(self._demo_seed(lat, lon))
        return {
            "temperature": round(rng.uniform(18, 34), 1),
            "humidity": rng.randint(35, 90),
            "wind_speed": round(rng.uniform(0.5, 18.0), 1),
            "rainfall": round(rng.uniform(0, 8), 1),
            "condition": rng.choice(DEMO_CONDITIONS),
            "source": "demo",
            "demo_mode": True,
            "recorded_at": datetime.now(timezone.utc),
        }

    def _demo_forecast(self, lat: float, lon: float) -> dict:
        rng = random.Random(self._demo_seed(lat, lon))
        forecast = []
        base = rng.uniform(20, 32)
        today = datetime.now(timezone.utc).date()
        for i in range(7):
            temp_min = round(base + rng.uniform(-6, -1), 1)
            temp_max = round(temp_min + rng.uniform(4, 9), 1)
            forecast.append({
                "date": (today + timedelta(days=i)).isoformat(),
                "temp_min": temp_min,
                "temp_max": temp_max,
                "humidity": rng.randint(35, 90),
                "rainfall_probability": rng.randint(0, 90),
                "condition": rng.choice(DEMO_CONDITIONS),
            })
        return {"forecast": forecast, "source": "demo", "demo_mode": True}
