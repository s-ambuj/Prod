from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

class DoctorProfileModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    specialization: str
    experience: int = 0
    availability: List[str] = []
    rating: float = 0.0
    total_reviews: int = 0
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DoctorProfileCreate(BaseModel):
    user_id: str
    specialization: str
    experience: int = 0
    availability: List[str] = []
    bio: Optional[str] = None

class DoctorProfileUpdate(BaseModel):
    specialization: Optional[str] = None
    experience: Optional[int] = None
    availability: Optional[List[str]] = None
    bio: Optional[str] = None

class DoctorProfileInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")
    user_id: str
    specialization: str
    experience: int
    availability: List[str]
    rating: float
    total_reviews: int
    bio: Optional[str] = None
