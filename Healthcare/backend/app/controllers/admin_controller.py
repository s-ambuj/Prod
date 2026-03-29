from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from app.core.dependencies import admin_role
from app.services.user_service import UserService
from app.services.doctor_service import DoctorService

router = APIRouter()

class AdminController:
    @staticmethod
    async def get_all_users(skip: int, limit: int, current_user: dict):
        user_service = UserService()
        return await user_service.get_all_users(skip, limit)

    @staticmethod
    async def get_users_by_role(role: str, skip: int, limit: int, current_user: dict):
        user_service = UserService()
        return await user_service.get_users_by_role(role, skip, limit)

    @staticmethod
    async def delete_user(user_id: str, current_user: dict):
        user_service = UserService()
        return await user_service.delete_user(user_id)

    @staticmethod
    async def approve_doctor(doctor_id: str, current_user: dict):
        doctor_service = DoctorService()
        return await doctor_service.approve_doctor(doctor_id)

    @staticmethod
    async def get_pending_doctors(skip: int, limit: int, current_user: dict):
        doctor_service = DoctorService()
        return await doctor_service.get_pending_doctors(skip, limit)

    @staticmethod
    async def get_system_reports(current_user: dict):
        from app.repositories.user_repository import UserRepository
        from app.repositories.appointment_repository import AppointmentRepository
        from app.repositories.prescription_repository import PrescriptionRepository
        from app.models.user_model import UserRole
        user_repo = UserRepository()
        appointment_repo = AppointmentRepository()
        prescription_repo = PrescriptionRepository()
        all_users = await user_repo.get_all(0, 10000)
        all_appointments = await appointment_repo.get_all(0, 10000)
        all_prescriptions = await prescription_repo.get_all(0, 10000)
        total_patients = sum(1 for u in all_users if u["role"] == UserRole.PATIENT)
        total_doctors = sum(1 for u in all_users if u["role"] == UserRole.DOCTOR)
        pending_doctors = sum(1 for u in all_users if u["role"] == UserRole.DOCTOR and not u.get("is_approved", False))
        booked = sum(1 for a in all_appointments if a["status"] == "booked")
        completed = sum(1 for a in all_appointments if a["status"] == "completed")
        cancelled = sum(1 for a in all_appointments if a["status"] == "cancelled")
        return {
            "users": {
                "total": len(all_users),
                "patients": total_patients,
                "doctors": total_doctors,
                "pending_doctors": pending_doctors,
                "admins": len(all_users) - total_patients - total_doctors
            },
            "appointments": {
                "total": len(all_appointments),
                "booked": booked,
                "completed": completed,
                "cancelled": cancelled
            },
            "prescriptions": {
                "total": len(all_prescriptions)
            }
        }
