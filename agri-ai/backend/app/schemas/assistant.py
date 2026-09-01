from typing import Dict, Optional
from pydantic import BaseModel


class AssistantRequest(BaseModel):
    farm_id: int
    question: str


class AssistantResponse(BaseModel):
    answer: str
    context_summary: Dict
    demo_mode: bool
