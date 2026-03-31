from fastapi import APIRouter, Query, Depends
from typing import Optional
from app.controllers.doctor_controller import DoctorController
from app.schemas.prescription_schema import PrescriptionCreate
from app.schemas.doctor_schema import DoctorAvailabilityUpdate
from app.core.dependencies import doctor_role

router = APIRouter()


@router.get("")
async def get_all_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    return await DoctorController.get_all_doctors(skip, limit)


@router.get("/profile")
async def get_doctor_profile(current_user: dict = Depends(doctor_role)):
    return await DoctorController.get_doctor_profile(current_user)


@router.put("/availability")
async def update_availability(
    data: DoctorAvailabilityUpdate,
    current_user: dict = Depends(doctor_role)
):
    return await DoctorController.update_availability(data, current_user)


@router.get("/appointments/my")
async def get_my_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(doctor_role)
):
    return await DoctorController.get_my_appointments(skip, limit, current_user)


@router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: str,
    current_user: dict = Depends(doctor_role)
):
    return await DoctorController.update_appointment_status(appointment_id, status, current_user)


@router.post("/prescriptions")
async def create_prescription(
    data: PrescriptionCreate,
    current_user: dict = Depends(doctor_role)
):
    return await DoctorController.create_prescription(data, current_user)


@router.get("/prescriptions/my")
async def get_my_prescriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(doctor_role)
):
    return await DoctorController.get_my_prescriptions(skip, limit, current_user)
