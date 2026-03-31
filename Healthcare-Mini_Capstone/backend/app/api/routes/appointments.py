from fastapi import APIRouter, Query, Depends
from app.controllers.appointment_controller import AppointmentController
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/my")
async def get_all_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user)
):
    return await AppointmentController.get_all_appointments(skip, limit, current_user)


@router.get("/{appointment_id}")
async def get_appointment_by_id(
    appointment_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await AppointmentController.get_appointment_by_id(appointment_id, current_user)


@router.put("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    return await AppointmentController.update_appointment_status(appointment_id, status, current_user)
