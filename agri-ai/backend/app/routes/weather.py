from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.weather import WeatherCurrentResponse, WeatherForecastResponse
from app.services.weather import WeatherService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/weather", tags=["weather"])
service = WeatherService()


@router.get("/current", response_model=WeatherCurrentResponse)
def get_current_weather(
    lat: float,
    lon: float,
    user: User = Depends(get_current_user),
):
    return service.current(lat, lon)


@router.get("/forecast", response_model=WeatherForecastResponse)
def get_weather_forecast(
    lat: float,
    lon: float,
    user: User = Depends(get_current_user),
):
    return service.forecast(lat, lon)
