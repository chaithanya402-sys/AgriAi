from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.services.reports import ReportService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])
service = ReportService()

PDF_CONTENT_DISPOSITION = "attachment"


@router.post("/farm/{farm_id}")
def generate_farm_report(
    farm_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    result = service.generate_farm_report(db, farm_id, user.id)

    if result.get("pdf_available") and result.get("pdf") is not None:
        filename = f"agriai_farm_report_{farm_id}.pdf"
        headers = {
            "Content-Disposition": f'{PDF_CONTENT_DISPOSITION}; filename="{filename}"'
        }
        return StreamingResponse(
            iter([result["pdf"]]),
            media_type="application/pdf",
            headers=headers,
        )

    # graceful fallback to JSON when PDF generation is unavailable
    return JSONResponse(
        content={
            "pdf_available": False,
            "message": "PDF generation unavailable; returning summary instead.",
            "summary": result.get("summary"),
        }
    )
