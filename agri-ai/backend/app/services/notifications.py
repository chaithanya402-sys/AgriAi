"""Notification service. Returns FarmAlerts scoped to the current user's farms."""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.analytics import FarmAlert
from app.models.farm import Farm


class NotificationService:
    def list_for_user(
        self, db: Session, user_id: int, filter_type: Optional[str] = None
    ) -> List[FarmAlert]:
        """Return FarmAlerts for the user's farms, newest first."""
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
