from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class NotificationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    alert_type: Optional[str] = None
    severity: Optional[str] = None
    message: Optional[str] = None
    is_read: int = 0
    created_at: Optional[datetime] = None


class NotificationListResponse(BaseModel):
    items: List[NotificationItem]
    unread_count: int
