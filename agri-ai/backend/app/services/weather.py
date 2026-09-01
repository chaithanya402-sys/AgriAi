"""Weather service. Proxies the OpenWeather API through the backend.

When OPENWEATHER_API_KEY is configured the real API is used (source="openweather",
demo_mode=False). When no key is present (or the call fails) a clearly-labeled
DETERMINISTIC demo forecast is returned (source="demo", demo_mode=True). The API
key is never included in any response.
"""
from datetime import datetime, timedelta, timezone
import random

import httpx

from app.config.settings import settings

OPENWEATHER_BASE = "https://api.openweathermap.org"
DEMO_CONDITIONS = ["Clear", "Partly cloudy", "Cloudy", "Light rain", "Overcast"]


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
        except Exception:
            # Fall back to demo data if the proxied call fails.
            return self._demo_current(lat, lon)

    def forecast(self, lat: float, lon: float) -> dict:
        if not self.api_key:
            return self._demo_forecast(lat, lon)
        try:
            return self._real_forecast(lat, lon)
        except Exception:
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
            "temperature": round(data["main"]["temp"], 1),
            "humidity": round(data["main"]["humidity"]),
            "wind_speed": round(data["wind"]["speed"], 1),
            "rainfall": round(rain, 1),
            "condition": data["weather"][0]["description"].capitalize(),
            "source": "openweather",
            "demo_mode": False,
            "recorded_at": datetime.now(timezone.utc),
        }

    def _real_forecast(self, lat: float, lon: float) -> dict:
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
        resp.raise_for_status()
        data = resp.json()
        forecast = []
        for day in list(data.get("daily", []))[:7]:
            dt = datetime.fromtimestamp(day["dt"], tz=timezone.utc)
            forecast.append({
                "date": dt.date().isoformat(),
                "temp_min": round(day["temp"]["min"], 1),
                "temp_max": round(day["temp"]["max"], 1),
                "humidity": round(day.get("humidity", 0)),
                "rainfall_probability": round(day.get("pop", 0) * 100),
                "condition": day["weather"][0]["description"].capitalize(),
            })
        return {"forecast": forecast, "source": "openweather", "demo_mode": False}

    # ------------------------------------------------------------ demo (demo)
    def _demo_seed(self, lat: float, lon: float) -> int:
        """Deterministic seed derived from lat/lon so the same location always
        produces the same demo series."""
        return int(round(abs(lat) * 1000)) * 100_000 + int(round(abs(lon) * 1000))

    def _demo_current(self, lat: float, lon: float) -> dict:
        # DEMO DATA: plausible current conditions generated deterministically
        # from the lat/lon seed. NOT real measurement data.
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
        # DEMO DATA: deterministic 7-day forecast generated from the lat/lon
        # seed. NOT real forecast data — for demonstration only.
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
