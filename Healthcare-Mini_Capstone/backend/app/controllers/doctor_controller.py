from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.core.dependencies import get_current_user, doctor_role
from app.services.doctor_service import DoctorService
from app.services.appointment_service import AppointmentService
from app.services.prescription_service import PrescriptionService
from app.schemas.prescription_schema import PrescriptionCreate
from app.schemas.doctor_schema import DoctorAvailabilityUpdate

router = APIRouter()

class DoctorController:
    @staticmethod
    async def get_all_doctors(skip: int, limit: int):
        doctor_service = DoctorService()
        return await doctor_service.get_all_doctors(skip, limit)

    @staticmethod
    async def get_doctor_profile(current_user: dict):
        doctor_service = DoctorService()
        return await doctor_service.get_doctor_profile(str(current_user["_id"]))

    @staticmethod
    async def update_availability(data: DoctorAvailabilityUpdate, current_user: dict):
        doctor_service = DoctorService()
        return await doctor_service.update_availability(
            str(current_user["_id"]),
            data.availability
        )

    @staticmethod
    async def get_my_appointments(skip: int, limit: int, current_user: dict):
        appointment_service = AppointmentService()
        return await appointment_service.get_by_doctor(
            str(current_user["_id"]), skip, limit
        )

    @staticmethod
    async def update_appointment_status(appointment_id: str, status: str, current_user: dict):
        appointment_service = AppointmentService()
        return await appointment_service.update_status(
            appointment_id=appointment_id,
            status=status,
            user_id=str(current_user["_id"]),
            user_role="doctor"
        )

    @staticmethod
    async def create_prescription(data: PrescriptionCreate, current_user: dict):
        prescription_service = PrescriptionService()
        return await prescription_service.create(
            data=data.model_dump(),
            doctor_id=str(current_user["_id"])
        )

    @staticmethod
    async def get_my_prescriptions(skip: int, limit: int, current_user: dict):
        prescription_service = PrescriptionService()
        return await prescription_service.get_by_doctor(
            str(current_user["_id"]), skip, limit
        )
