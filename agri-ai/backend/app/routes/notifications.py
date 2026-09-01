from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.analytics import FarmAlert
from app.schemas.notification import NotificationItem, NotificationListResponse
from app.services.notifications import NotificationService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])
service = NotificationService()


def _get_owned_alert(db: Session, alert_id: int, user: User) -> FarmAlert:
    """Fetch an alert and confirm it belongs to a farm owned by the user."""
    alert = db.query(FarmAlert).filter(FarmAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Notification not found")
    farm = (
        db.query(Farm).filter(Farm.id == alert.farm_id, Farm.user_id == user.id).first()
    )
    if not farm:
        raise HTTPException(status_code=404, detail="Notification not found")
    return alert


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    items = service.list_for_user(db, user.id, filter_type=type)
    return NotificationListResponse(
        items=[NotificationItem.model_validate(a) for a in items],
        unread_count=service.unread_count(db, user.id),
    )


@router.post("/read-all", response_model=NotificationListResponse)
def mark_all_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm_ids = [
        fid for (fid,) in db.query(Farm.id).filter(Farm.user_id == user.id).all()
    ]
    query = db.query(FarmAlert).filter(FarmAlert.user_id == user.id)
    if farm_ids:
        query = query.filter(FarmAlert.farm_id.in_(farm_ids))
    query.update({FarmAlert.is_read: 1}, synchronize_session=False)
    db.commit()
    items = service.list_for_user(db, user.id)
    return NotificationListResponse(
        items=[NotificationItem.model_validate(a) for a in items],
        unread_count=0,
    )


@router.post("/{alert_id}/read", response_model=NotificationItem)
def mark_read(
    alert_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    alert = _get_owned_alert(db, alert_id, user)
    return service.mark_read(db, alert)


@router.delete("/{alert_id}")
def delete_notification(
    alert_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    alert = _get_owned_alert(db, alert_id, user)
    db.delete(alert)
    db.commit()
    return {"message": "Notification deleted", "id": alert_id}
