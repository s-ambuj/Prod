from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

class Medicine(BaseModel):
    name: str
    dosage: str
    days: int
    instructions: Optional[str] = None

class PrescriptionModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[str] = Field(None, alias="_id")
    appointment_id: str
    doctor_id: str
    patient_id: str
    notes: Optional[str] = None
    medicines: List[Medicine] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrescriptionCreate(BaseModel):
    appointment_id: str
    notes: Optional[str] = None
    medicines: List[Medicine]

class PrescriptionUpdate(BaseModel):
    notes: Optional[str] = None
    medicines: Optional[List[Medicine]] = None

class PrescriptionInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")
    appointment_id: str
    doctor_id: str
    patient_id: str
    notes: Optional[str] = None
    medicines: List[Medicine]
    created_at: datetime
