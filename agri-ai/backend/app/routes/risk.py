from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.analytics import FarmAlert
from app.schemas.risk import RiskAssessmentResponse, RiskRequest
from app.services.risk import RiskAssessmentService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/risk", tags=["risk"])
service = RiskAssessmentService()

# Fire an alert only when overall risk is at least Moderate.
ALERT_THRESHOLD = 55

SEVERITY_BY_LEVEL = {"Low": "info", "Moderate": "warning", "High": "danger", "Critical": "danger"}


@router.post("/assess", response_model=RiskAssessmentResponse)
def assess_risk(
    data: RiskRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    result = service.assess(
        weather=data.weather_risk,
        soil_health=data.soil_health_score,
        water=data.water_availability,
        disease=data.disease_risk,
        price=data.price_volatility,
        crop=data.crop,
    )

    if result["overall_risk"] >= ALERT_THRESHOLD:
        top = ", ".join(result["top_risks"]) if result["top_risks"] else "General"
        message = (
            f"Farm risk level is {result['level']} ({result['overall_risk']}/100). "
            f"Top risk factors: {top}."
        )
        alert = FarmAlert(
            farm_id=data.farm_id,
            user_id=user.id,
            alert_type="risk",
            severity=SEVERITY_BY_LEVEL.get(result["level"], "warning"),
            message=message,
        )
        db.add(alert)
        db.commit()

    return RiskAssessmentResponse(
        overall_risk=result["overall_risk"],
        level=result["level"],
        breakdown=result["breakdown"],
        top_risks=result["top_risks"],
        recommendations=result["recommendations"],
        demo_mode=result["demo_mode"],
    )
