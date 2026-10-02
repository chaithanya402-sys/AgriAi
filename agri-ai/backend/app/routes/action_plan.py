from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from typing import List, Dict

from app.config.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.services.action_plan import ActionPlanService
from app.schemas.action_plan import (
    ActionStepResponse,
    TutorialProgressRequest,
    ChecklistToggleRequest,
    StepCompleteRequest,
    ActionPlanProgressResponse,
)

router = APIRouter(prefix="/api/action-plan", tags=["action-plan"])
service = ActionPlanService()


@router.get("/steps", response_model=List[ActionStepResponse])
def get_action_plan_steps(
    crop: str = Query("Soybean"),
    farm_id: int = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retrieve 7-step Farm Action Plan with YouTube video IDs and user completion progress."""
    return service.get_steps_for_crop(db, user.id, farm_id, crop)


@router.post("/steps/{step_id}/tutorial-progress")
def record_tutorial_progress(
    step_id: int = Path(...),
    data: TutorialProgressRequest = ...,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Records tutorial watched state on YT.PlayerState.ENDED. Does not mark farm work complete."""
    return service.record_tutorial_watched(db, user.id, data.farm_id, data.crop_name, step_id)


@router.post("/steps/{step_id}/checklist/{item_id}")
def toggle_checklist_item(
    step_id: int = Path(...),
    item_id: int = Path(...),
    data: ChecklistToggleRequest = ...,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Toggles checklist task completion in the database."""
    return service.toggle_checklist_item(
        db, user.id, data.farm_id, data.crop_name, step_id, item_id, data.completed
    )


@router.post("/steps/{step_id}/complete")
def complete_action_step(
    step_id: int = Path(...),
    data: StepCompleteRequest = ...,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Backend-validated step completion: verifies farm ownership and all required checklist items."""
    return service.complete_step(db, user.id, data.farm_id, data.crop_name, step_id)


@router.get("/progress", response_model=ActionPlanProgressResponse)
def get_action_plan_progress(
    farm_id: int = Query(...),
    crop: str = Query("Soybean"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Returns progress ratio (e.g. 0/7, 43%) and active step."""
    return service.get_progress_summary(db, user.id, farm_id, crop)
