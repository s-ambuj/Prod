from datetime import datetime
from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.repositories.prescription_repository import PrescriptionRepository
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.user_repository import UserRepository
from app.models.user_model import UserRole


class PrescriptionService:
    def __init__(self):
        self.prescription_repo = PrescriptionRepository()
        self.appointment_repo = AppointmentRepository()
        self.user_repo = UserRepository()

    async def create(self, data: Dict[str, Any], doctor_id: str) -> Dict[str, Any]:
        appointment = await self.appointment_repo.get_by_id(data["appointment_id"])
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )

        if appointment["doctor_id"] != doctor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to create prescription for this appointment"
            )

        existing_prescription = await self.prescription_repo.get_by_appointment(data["appointment_id"])
        if existing_prescription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prescription already exists for this appointment"
            )

        prescription_data = {
            "appointment_id": data["appointment_id"],
            "doctor_id": doctor_id,
            "patient_id": appointment["patient_id"],
            "notes": data.get("notes"),
            "medicines": data["medicines"],
            "created_at": datetime.utcnow()
        }

        prescription_id = await self.prescription_repo.create(prescription_data)
        
        await self.appointment_repo.update_status(data["appointment_id"], "completed")
        
        return {"id": prescription_id, "message": "Prescription created successfully"}

    async def get_by_patient(self, patient_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        prescriptions = await self.prescription_repo.get_by_patient(patient_id, skip, limit)
        return await self._enrich_prescriptions(prescriptions)

    async def get_by_doctor(self, doctor_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        prescriptions = await self.prescription_repo.get_by_doctor(doctor_id, skip, limit)
        return await self._enrich_prescriptions(prescriptions)

    async def get_by_id(self, prescription_id: str, user_id: str, user_role: str) -> Dict[str, Any]:
        prescription = await self.prescription_repo.get_by_id(prescription_id)
        if not prescription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prescription not found"
            )

        if user_role == UserRole.PATIENT and prescription["patient_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this prescription"
            )

        if user_role == UserRole.DOCTOR and prescription["doctor_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this prescription"
            )

        return await self._enrich_prescription(prescription)

    async def _enrich_prescriptions(self, prescriptions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        enriched = []
        for prescription in prescriptions:
            enriched.append(await self._enrich_prescription(prescription))
        return enriched

    async def _enrich_prescription(self, prescription: Dict[str, Any]) -> Dict[str, Any]:
        doctor = await self.user_repo.get_by_id(prescription["doctor_id"])
        patient = await self.user_repo.get_by_id(prescription["patient_id"])
        
        prescription["doctor_name"] = doctor["name"] if doctor else "Unknown"
        prescription["patient_name"] = patient["name"] if patient else "Unknown"
        return prescription
