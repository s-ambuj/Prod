from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class DoctorBase(BaseModel):
    name: str
    email: str
    specialization: str

class DoctorCreate(DoctorBase):
    password: str
    experience: int = 0
    availability: List[str] = []
    bio: Optional[str] = None

class DoctorUpdate(BaseModel):
    specialization: Optional[str] = None
    experience: Optional[int] = None
    availability: Optional[List[str]] = None
    bio: Optional[str] = None

class DoctorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    specialization: str
    experience: int
    availability: List[str]
    rating: float
    total_reviews: int
    bio: Optional[str] = None
    is_approved: bool

class DoctorProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    specialization: str
    experience: int
    availability: List[str]
    rating: float
    total_reviews: int
    bio: Optional[str] = None

class DoctorAvailabilityUpdate(BaseModel):
    availability: List[str]

class DoctorListResponse(BaseModel):
    doctors: list[DoctorResponse]
    total: int
