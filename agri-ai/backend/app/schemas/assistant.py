from typing import Dict, Optional
from pydantic import BaseModel


class AssistantRequest(BaseModel):
    farm_id: int
    question: str
    language: Optional[str] = "en"  # "en", "te", "hi"
    crop: Optional[str] = None


class AssistantResponse(BaseModel):
    answer: str
    context_summary: Dict
    demo_mode: bool
    language: Optional[str] = "en"
