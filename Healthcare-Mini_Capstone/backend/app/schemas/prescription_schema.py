from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class MedicineSchema(BaseModel):
    name: str
    dosage: str
    days: int
    instructions: Optional[str] = None

class PrescriptionBase(BaseModel):
    appointment_id: str
    notes: Optional[str] = None
    medicines: List[MedicineSchema]

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(BaseModel):
    notes: Optional[str] = None
    medicines: Optional[List[MedicineSchema]] = None

class PrescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    appointment_id: str
    doctor_id: str
    patient_id: str
    notes: Optional[str] = None
    medicines: List[MedicineSchema]
    created_at: datetime
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None

class PrescriptionListResponse(BaseModel):
    prescriptions: list[PrescriptionResponse]
    total: int
