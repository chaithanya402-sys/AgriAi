"""Notification service. Returns FarmAlerts scoped to the current user's farms."""
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.analytics import FarmAlert
from app.models.farm import Farm


class NotificationService:
    def _ensure_weather_alerts(self, db: Session, user_id: int):
        """Generate timely weather alerts for user's farms if none were generated recently."""
        try:
            farms = db.query(Farm).filter(Farm.user_id == user_id).all()
            if not farms:
                return

            from app.services.weather import WeatherService
            weather_svc = WeatherService()
            now = datetime.now(timezone.utc)
            since = now - timedelta(hours=24)

            for farm in farms:
                # Check if any weather alert was created for this farm in the last 24h
                existing = (
                    db.query(FarmAlert)
                    .filter(
                        FarmAlert.user_id == user_id,
                        FarmAlert.farm_id == farm.id,
                        FarmAlert.alert_type == "weather",
                        FarmAlert.created_at >= since,
                    )
                    .first()
                )
                if existing:
                    continue

                lat = farm.latitude or 18.1898
                lon = farm.longitude or 83.3884

                try:
                    curr = weather_svc.current(lat, lon)
                    fore = weather_svc.forecast(lat, lon)
                except Exception:
                    continue

                temp = curr.get("temperature", 32)
                cond = curr.get("condition", "Clear sky")
                humid = curr.get("humidity", 50)
                wind = curr.get("wind_speed", 8)
                rainfall = curr.get("rainfall", 0)

                # 1. Temperature advisory
                if temp >= 32:
                    db.add(FarmAlert(
                        farm_id=farm.id,
                        user_id=user_id,
                        alert_type="weather",
                        severity="warning",
                        message=f"High Heat Alert ({temp}°C): Daytime high temperature recorded at {farm.name}. Ensure adequate irrigation during early morning or evening to mitigate heat stress.",
                        is_read=0,
                    ))
                elif temp <= 14:
                    db.add(FarmAlert(
                        farm_id=farm.id,
                        user_id=user_id,
                        alert_type="weather",
                        severity="warning",
                        message=f"Cold Weather Advisory ({temp}°C): Low temperatures detected at {farm.name}. Protect sensitive crops from cold drafts.",
                        is_read=0,
                    ))
                else:
                    db.add(FarmAlert(
                        farm_id=farm.id,
                        user_id=user_id,
                        alert_type="weather",
                        severity="info",
                        message=f"Favorable Conditions: Mild temperature ({temp}°C) and {cond.lower()} at {farm.name}. Good conditions for crop vegetative growth.",
                        is_read=0,
                    ))

                # 2. Precipitation / Rain advisory
                rain_chance = 0
                if fore.get("forecast") and len(fore["forecast"]) > 0:
                    rain_chance = fore["forecast"][0].get("rainfall_probability", 0)

                if rainfall > 0 or rain_chance >= 35 or "rain" in cond.lower() or "drizzle" in cond.lower():
                    db.add(FarmAlert(
                        farm_id=farm.id,
                        user_id=user_id,
                        alert_type="weather",
                        severity="info",
                        message=f"Precipitation Advisory: {cond} with {rain_chance}% rain probability for {farm.name}. Postpone nitrogen top-dressing to prevent nutrient runoff.",
                        is_read=0,
                    ))
                else:
                    db.add(FarmAlert(
                        farm_id=farm.id,
                        user_id=user_id,
                        alert_type="weather",
                        severity="info",
                        message=f"Spraying Advisory: Wind speed is {wind} km/h with low rain risk at {farm.name}. Optimal window for nutrient spraying and pest scouting.",
                        is_read=0,
                    ))

                # 3. Humidity advisory
                if humid >= 75:
                    db.add(FarmAlert(
                        farm_id=farm.id,
                        user_id=user_id,
                        alert_type="weather",
                        severity="warning",
                        message=f"High Humidity Alert ({humid}%): High humidity detected at {farm.name}. Increased susceptibility for fungal leaf blast—inspect canopy leaves.",
                        is_read=0,
                    ))

            db.commit()
        except Exception:
            db.rollback()

    def list_for_user(
        self, db: Session, user_id: int, filter_type: Optional[str] = None
    ) -> List[FarmAlert]:
        """Return FarmAlerts for the user's farms, newest first."""
        self._ensure_weather_alerts(db, user_id)
        farm_ids = [
            fid for (fid,) in db.query(Farm.id).filter(Farm.user_id == user_id).all()
        ]
        query = db.query(FarmAlert).filter(FarmAlert.user_id == user_id)
        if farm_ids:
            query = query.filter(FarmAlert.farm_id.in_(farm_ids))
        if filter_type:
            query = query.filter(FarmAlert.alert_type == filter_type)
        return query.order_by(FarmAlert.created_at.desc()).all()

    def unread_count(self, db: Session, user_id: int) -> int:
        self._ensure_weather_alerts(db, user_id)
        farm_ids = [
            fid for (fid,) in db.query(Farm.id).filter(Farm.user_id == user_id).all()
        ]
        query = db.query(FarmAlert).filter(
            FarmAlert.user_id == user_id, FarmAlert.is_read == 0
        )
        if farm_ids:
            query = query.filter(FarmAlert.farm_id.in_(farm_ids))
        return query.count()

    def mark_read(self, db: Session, alert: FarmAlert) -> FarmAlert:
        alert.is_read = 1
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert
