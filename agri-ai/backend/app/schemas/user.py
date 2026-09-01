from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    location: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    fullName: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    fullName: Optional[str] = None
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    language_preference: str = "en"
    is_active: bool
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @model_validator(mode="after")
    def set_computed_fields(self):
        if not self.fullName:
            self.fullName = self.name
        if not self.status:
            self.status = "Active" if self.is_active else "Inactive"
        return self


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
