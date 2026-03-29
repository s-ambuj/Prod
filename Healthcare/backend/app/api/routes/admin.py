from fastapi import APIRouter, Query, Depends
from app.controllers.admin_controller import AdminController
from app.core.dependencies import admin_role

router = APIRouter()


@router.get("/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(admin_role)
):
    return await AdminController.get_all_users(skip, limit, current_user)


@router.get("/users/{role}")
async def get_users_by_role(
    role: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(admin_role)
):
    return await AdminController.get_users_by_role(role, skip, limit, current_user)


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(admin_role)):
    return await AdminController.delete_user(user_id, current_user)


@router.put("/doctors/{doctor_id}/approve")
async def approve_doctor(doctor_id: str, current_user: dict = Depends(admin_role)):
    return await AdminController.approve_doctor(doctor_id, current_user)


@router.get("/doctors/pending")
async def get_pending_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(admin_role)
):
    return await AdminController.get_pending_doctors(skip, limit, current_user)


@router.get("/reports")
async def get_system_reports(current_user: dict = Depends(admin_role)):
    return await AdminController.get_system_reports(current_user)
