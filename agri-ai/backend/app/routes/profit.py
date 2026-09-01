from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.schemas.profit import ProfitRequest, ProfitResponse
from app.services.profit import ProfitCalculator
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/profit", tags=["profit"])
service = ProfitCalculator()


@router.post("/calculate", response_model=ProfitResponse)
def calculate_profit(
    data: ProfitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    return service.calculate(data)
