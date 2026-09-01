from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.analytics import OptimizationResult
from app.schemas.optimize import OptimizeRequest, OptimizeResponse
from app.services.optimize import OptimizationEngine
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/optimize", tags=["optimize"])
service = OptimizationEngine()


@router.post("/plan", response_model=OptimizeResponse)
def optimize_plan(
    data: OptimizeRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    result = service.plan(data)

    db.add(
        OptimizationResult(
            farm_id=data.farm_id,
            current_plan=result.current_plan.model_dump(),
            optimized_plan=result.optimized_plan.model_dump(),
            improvements=result.improvements.model_dump(),
            demo_mode=1 if result.demo_mode else 0,
        )
    )
    db.commit()

    return result
