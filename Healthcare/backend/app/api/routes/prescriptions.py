from fastapi import APIRouter, Query, Depends
from app.controllers.prescription_controller import PrescriptionController
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/my")
async def get_all_prescriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user)
):
    return await PrescriptionController.get_all_prescriptions(skip, limit, current_user)


@router.get("/{prescription_id}")
async def get_prescription_by_id(
    prescription_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await PrescriptionController.get_prescription_by_id(prescription_id, current_user)
