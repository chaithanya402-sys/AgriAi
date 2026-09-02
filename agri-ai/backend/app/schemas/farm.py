from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FieldCreate(BaseModel):
    name: str
    area: Optional[float] = None
    crop_type: Optional[str] = None
    current_stage: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class FieldResponse(FieldCreate):
    id: int
    farm_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FarmCreate(BaseModel):
    name: str
    location: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_area: Optional[float] = None
    area_unit: Optional[str] = "hectares"
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    description: Optional[str] = None


class FarmUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_area: Optional[float] = None
    area_unit: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    description: Optional[str] = None


class FarmResponse(BaseModel):
    id: int
    user_id: int
    name: str
    location: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_area: Optional[float] = None
    area_unit: Optional[str] = "hectares"
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    fields: List[FieldResponse] = []

    class Config:
        from_attributes = True
