from datetime import datetime
from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.user_repository import UserRepository
from app.models.appointment_model import AppointmentStatus
from app.models.user_model import UserRole


class AppointmentService:
    def __init__(self):
        self.appointment_repo = AppointmentRepository()
        self.user_repo = UserRepository()

    async def create(self, data: Dict[str, Any], patient_id: str) -> Dict[str, Any]:
        doctor = await self.user_repo.get_by_id(data["doctor_id"])
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        if doctor["role"] != UserRole.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected user is not a doctor"
            )

        if not doctor.get("is_approved", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor is not approved yet"
            )

        appointment_data = {
            "patient_id": patient_id,
            "doctor_id": data["doctor_id"],
            "appointment_time": data["appointment_time"],
            "reason": data.get("reason"),
            "status": AppointmentStatus.BOOKED,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        appointment_id = await self.appointment_repo.create(appointment_data)
        return {"id": appointment_id, "message": "Appointment booked successfully"}

    async def get_by_patient(self, patient_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        appointments = await self.appointment_repo.get_by_patient(patient_id, skip, limit)
        return await self._enrich_appointments(appointments)

    async def get_by_doctor(self, doctor_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        appointments = await self.appointment_repo.get_by_doctor(doctor_id, skip, limit)
        return await self._enrich_appointments(appointments)

    async def get_by_id(self, appointment_id: str) -> Dict[str, Any]:
        appointment = await self.appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        return await self._enrich_appointment(appointment)

    async def update_status(self, appointment_id: str, status: str, user_id: str, user_role: str) -> Dict[str, Any]:
        appointment = await self.appointment_repo.get_by_id(appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        if user_role == UserRole.DOCTOR and appointment["doctor_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this appointment"
            )

        if user_role == UserRole.PATIENT and appointment["patient_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this appointment"
            )

        success = await self.appointment_repo.update_status(appointment_id, status)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update appointment"
            )

        return {"message": "Appointment status updated successfully"}

    async def _enrich_appointments(self, appointments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        enriched = []
        for appointment in appointments:
            enriched.append(await self._enrich_appointment(appointment))
        return enriched

    async def _enrich_appointment(self, appointment: Dict[str, Any]) -> Dict[str, Any]:
        doctor = await self.user_repo.get_by_id(appointment["doctor_id"])
        patient = await self.user_repo.get_by_id(appointment["patient_id"])
        
        appointment["doctor_name"] = doctor["name"] if doctor else "Unknown"
        appointment["patient_name"] = patient["name"] if patient else "Unknown"
        return appointment
