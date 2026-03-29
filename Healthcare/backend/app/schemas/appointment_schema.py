from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AppointmentBase(BaseModel):
    doctor_id: str
    appointment_time: datetime
    reason: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    appointment_time: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AppointmentStatusUpdate(BaseModel):
    status: str

class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    patient_id: str
    doctor_id: str
    appointment_time: datetime
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None

class AppointmentListResponse(BaseModel):
    appointments: list[AppointmentResponse]
    total: int
