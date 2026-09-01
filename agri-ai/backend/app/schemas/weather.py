from pydantic import BaseModel
from typing import List
from datetime import datetime


class WeatherCurrentResponse(BaseModel):
    temperature: float
    humidity: int
    wind_speed: float
    rainfall: float
    condition: str
    source: str
    demo_mode: bool
    recorded_at: datetime


class DailyForecast(BaseModel):
    date: str
    temp_min: float
    temp_max: float
    humidity: int
    rainfall_probability: int
    condition: str


class WeatherForecastResponse(BaseModel):
    forecast: List[DailyForecast]
    source: str
    demo_mode: bool
