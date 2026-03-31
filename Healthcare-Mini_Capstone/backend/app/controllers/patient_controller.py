from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from app.core.dependencies import get_current_user, patient_role
from app.services.appointment_service import AppointmentService
from app.services.prescription_service import PrescriptionService
from app.schemas.appointment_schema import AppointmentCreate
from app.schemas.prescription_schema import PrescriptionResponse

router = APIRouter()

class PatientController:
    @staticmethod
    async def book_appointment(
        data: AppointmentCreate,
        current_user: dict
    ):
        appointment_service = AppointmentService()
        result = await appointment_service.create(
            data=data.model_dump(),
            patient_id=str(current_user["_id"])
        )
        return result

    @staticmethod
    async def get_my_appointments(
        skip: int,
        limit: int,
        current_user: dict
    ):
        appointment_service = AppointmentService()
        return await appointment_service.get_by_patient(
            str(current_user["_id"]), skip, limit
        )

    @staticmethod
    async def get_appointment_detail(
        appointment_id: str,
        current_user: dict
    ):
        appointment_service = AppointmentService()
        appointment = await appointment_service.get_by_id(appointment_id)
        if appointment["patient_id"] != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Not authorized")
        return appointment

    @staticmethod
    async def get_my_prescriptions(
        skip: int,
        limit: int,
        current_user: dict
    ):
        prescription_service = PrescriptionService()
        return await prescription_service.get_by_patient(
            str(current_user["_id"]), skip, limit
        )

    @staticmethod
    async def get_prescription_detail(
        prescription_id: str,
        current_user: dict
    ):
        prescription_service = PrescriptionService()
        return await prescription_service.get_by_id(
            prescription_id=prescription_id,
            user_id=str(current_user["_id"]),
            user_role="patient"
        )
