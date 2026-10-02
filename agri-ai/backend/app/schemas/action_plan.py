from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChecklistItemResponse(BaseModel):
    id: int
    item_key: Optional[str] = None
    name: str
    spec: Optional[str] = None
    description: Optional[str] = None
    sort_order: int = 0
    completed: bool = False


class ActionStepResponse(BaseModel):
    id: int
    crop_name: str
    step_number: int
    title: str
    description: Optional[str] = None
    timeframe: Optional[str] = None
    stage: Optional[str] = None
    youtube_video_id: str
    youtube_title: Optional[str] = None
    youtube_duration: Optional[str] = None
    learn_points: List[str] = []
    why_explanation: Optional[str] = None
    tutorial_watched: bool = False
    tutorial_watched_at: Optional[datetime] = None
    status: str = "pending"  # pending, in_progress, completed
    completed_at: Optional[datetime] = None
    checklists: List[ChecklistItemResponse] = []


class TutorialProgressRequest(BaseModel):
    farm_id: int
    crop_name: str


class ChecklistToggleRequest(BaseModel):
    farm_id: int
    crop_name: str
    completed: bool


class StepCompleteRequest(BaseModel):
    farm_id: int
    crop_name: str


class ActionPlanProgressResponse(BaseModel):
    farm_id: int
    crop_name: str
    completed_steps: int
    total_steps: int
    percent: int
    active_step: int
