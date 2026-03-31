from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from app.core.dependencies import get_current_user, doctor_role
from app.services.prescription_service import PrescriptionService
from app.models.user_model import UserRole

router = APIRouter()

class PrescriptionController:
    @staticmethod
    async def get_all_prescriptions(skip: int, limit: int, current_user: dict):
        prescription_service = PrescriptionService()
        user_role = current_user["role"]
        user_id = str(current_user["_id"])
        if user_role == UserRole.PATIENT:
            return await prescription_service.get_by_patient(user_id, skip, limit)
        elif user_role == UserRole.DOCTOR:
            return await prescription_service.get_by_doctor(user_id, skip, limit)
        else:
            return await prescription_service.prescription_repo.get_all(skip, limit)

    @staticmethod
    async def get_prescription_by_id(prescription_id: str, current_user: dict):
        prescription_service = PrescriptionService()
        return await prescription_service.get_by_id(
            prescription_id=prescription_id,
            user_id=str(current_user["_id"]),
            user_role=current_user["role"]
        )

    @staticmethod
    async def create_prescription(data: dict, current_user: dict):
        prescription_service = PrescriptionService()
        return await prescription_service.create(
            data=data,
            doctor_id=str(current_user["_id"])
        )
