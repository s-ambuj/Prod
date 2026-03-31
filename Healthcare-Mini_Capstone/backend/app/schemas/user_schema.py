from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str = "patient"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    role: str
    is_approved: bool
    is_active: bool
    created_at: datetime

class UserProfileResponse(UserResponse):
    pass

class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int
