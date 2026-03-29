from fastapi import APIRouter, Depends, Query, status
from app.controllers.patient_controller import PatientController
from app.schemas.appointment_schema import AppointmentCreate
from app.core.dependencies import patient_role

router = APIRouter()


@router.post("/appointments", status_code=status.HTTP_201_CREATED)
async def book_appointment(
    data: AppointmentCreate,
    current_user: dict = Depends(patient_role)
):
    return await PatientController.book_appointment(data, current_user)


@router.get("/appointments/my")
async def get_my_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(patient_role)
):
    return await PatientController.get_my_appointments(skip, limit, current_user)


@router.get("/appointments/{appointment_id}")
async def get_appointment_detail(
    appointment_id: str,
    current_user: dict = Depends(patient_role)
):
    return await PatientController.get_appointment_detail(appointment_id, current_user)


@router.get("/prescriptions/my")
async def get_my_prescriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(patient_role)
):
    return await PatientController.get_my_prescriptions(skip, limit, current_user)


@router.get("/prescriptions/{prescription_id}")
async def get_prescription_detail(
    prescription_id: str,
    current_user: dict = Depends(patient_role)
):
    return await PatientController.get_prescription_detail(prescription_id, current_user)
