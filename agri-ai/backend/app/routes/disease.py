from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.analytics import DiseasePrediction
from app.schemas.disease import DiseasePredictionResponse
from app.services.disease import DiseaseDetectionService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/disease", tags=["disease"])
service = DiseaseDetectionService()

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
LOW_CONFIDENCE_THRESHOLD = 0.55


@router.post("/predict", response_model=DiseasePredictionResponse)
async def predict_disease(
    file: UploadFile = File(...),
    farm_id: int = Form(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    content = await file.read()

    # Validation: must be an image and within size limit.
    content_type = (file.content_type or "").lower()
    if not content_type.startswith("image/") or len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="Please upload a valid image")

    result = service.detect(content, file.filename or "upload")

    low_confidence = result["confidence"] < LOW_CONFIDENCE_THRESHOLD
    if low_confidence:
        message = "Please upload a clearer image for a more reliable result."
    else:
        message = None

    # Persist prediction.
    record = DiseasePrediction(
        farm_id=farm_id,
        prediction=result["prediction"],
        confidence=result["confidence"],
        image_name=file.filename or "upload",
        probabilities=result["probabilities"],
        demo_mode=1 if result["demo_mode"] else 0,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return DiseasePredictionResponse(
        prediction=result["prediction"],
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        is_healthy=result["is_healthy"],
        low_confidence=low_confidence,
        message=message,
        demo_mode=result["demo_mode"],
        image_processed=result["image_processed"],
    )
