from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.repositories.doctor_repository import DoctorRepository
from app.repositories.appointment_repository import AppointmentRepository
from app.models.user_model import UserRole


class DoctorService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.doctor_repo = DoctorRepository()
        self.appointment_repo = AppointmentRepository()

    async def create_doctor_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        user = await self.user_repo.get_by_id(user_id)
        if not user or user["role"] != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        existing_profile = await self.doctor_repo.get_by_user_id(user_id)
        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor profile already exists"
            )

        profile_data["user_id"] = user_id
        profile_data["created_at"] = datetime.utcnow()
        profile_data["updated_at"] = datetime.utcnow()

        profile_id = await self.doctor_repo.create(profile_data)
        return {"id": profile_id, "message": "Doctor profile created successfully"}

    async def get_doctor_profile(self, user_id: str) -> Dict[str, Any]:
        user = await self.user_repo.get_by_id(user_id)
        if not user or user["role"] != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        profile = await self.doctor_repo.get_by_user_id(user_id)
        
        # Return default profile data if profile doesn't exist yet
        if not profile:
            return {
                "id": None,
                "user_id": user_id,
                "name": user["name"],
                "email": user["email"],
                "specialization": "General Medicine",
                "experience": 0,
                "availability": [],
                "rating": 0.0,
                "total_reviews": 0,
                "bio": None,
                "is_approved": user.get("is_approved", False)
            }

        return {
            "id": str(profile["_id"]),
            "user_id": profile["user_id"],
            "name": user["name"],
            "email": user["email"],
            "specialization": profile.get("specialization", "General Medicine"),
            "experience": profile.get("experience", 0),
            "availability": profile.get("availability", []),
            "rating": profile.get("rating", 0.0),
            "total_reviews": profile.get("total_reviews", 0),
            "bio": profile.get("bio"),
            "is_approved": user.get("is_approved", False)
        }

    async def get_all_doctors(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        doctors = await self.user_repo.get_by_role(UserRole.DOCTOR, skip, limit)
        result = []
        for doctor in doctors:
            if doctor.get("is_approved", False):
                profile = await self.doctor_repo.get_by_user_id(str(doctor["_id"]))
                result.append({
                    "id": str(doctor["_id"]),
                    "name": doctor["name"],
                    "email": doctor["email"],
                    "specialization": profile.get("specialization", "") if profile else "",
                    "experience": profile.get("experience", 0) if profile else 0,
                    "rating": profile.get("rating", 0.0) if profile else 0.0,
                    "is_approved": doctor.get("is_approved", False)
                })
        return result

    async def update_doctor_profile(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        success = await self.doctor_repo.update_by_user_id(user_id, update_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update doctor profile"
            )
        return {"message": "Doctor profile updated successfully"}

    async def update_availability(self, user_id: str, availability: List[str]) -> Dict[str, Any]:
        return await self.update_doctor_profile(user_id, {"availability": availability})

    async def get_doctor_appointments(self, doctor_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if status:
            appointments = await self.appointment_repo.get_by_status(status)
            appointments = [a for a in appointments if a["doctor_id"] == doctor_id]
        else:
            appointments = await self.appointment_repo.get_by_doctor(doctor_id)

        enriched = []
        for appointment in appointments:
            patient = await self.user_repo.get_by_id(appointment["patient_id"])
            appointment["patient_name"] = patient["name"] if patient else "Unknown"
            enriched.append(appointment)

        return enriched

    async def approve_doctor(self, doctor_id: str) -> Dict[str, Any]:
        doctor = await self.user_repo.get_by_id(doctor_id)
        if not doctor or doctor["role"] != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        success = await self.user_repo.approve_user(doctor_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to approve doctor"
            )

        return {"message": "Doctor approved successfully"}

    async def get_pending_doctors(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        doctors = await self.user_repo.get_pending_doctors(skip, limit)
        return [{
            "id": str(doctor["_id"]),
            "name": doctor["name"],
            "email": doctor["email"],
            "role": doctor["role"],
            "is_approved": doctor.get("is_approved", False)
        } for doctor in doctors]
