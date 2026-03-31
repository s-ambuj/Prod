from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.core.dependencies import get_current_user
from app.services.appointment_service import AppointmentService
from app.models.user_model import UserRole

router = APIRouter()

class AppointmentController:
    @staticmethod
    async def get_all_appointments(skip: int, limit: int, current_user: dict):
        appointment_service = AppointmentService()
        user_role = current_user["role"]
        user_id = str(current_user["_id"])
        if user_role == UserRole.PATIENT:
            return await appointment_service.get_by_patient(user_id, skip, limit)
        elif user_role == UserRole.DOCTOR:
            return await appointment_service.get_by_doctor(user_id, skip, limit)
        else:
            return await appointment_service.appointment_repo.get_all(skip, limit)

    @staticmethod
    async def get_appointment_by_id(appointment_id: str, current_user: dict):
        appointment_service = AppointmentService()
        appointment = await appointment_service.get_by_id(appointment_id)
        user_id = str(current_user["_id"])
        user_role = current_user["role"]
        if user_role == UserRole.PATIENT and appointment["patient_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if user_role == UserRole.DOCTOR and appointment["doctor_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        return appointment

    @staticmethod
    async def update_appointment_status(appointment_id: str, status: str, current_user: dict):
        appointment_service = AppointmentService()
        return await appointment_service.update_status(
            appointment_id=appointment_id,
            status=status,
            user_id=str(current_user["_id"]),
            user_role=current_user["role"]
        )
