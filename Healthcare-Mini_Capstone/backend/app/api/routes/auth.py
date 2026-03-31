from fastapi import APIRouter, status, Depends
from app.controllers.auth_controller import AuthController
from app.schemas.auth_schema import LoginRequest, RegisterRequest
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    return await AuthController.register(request)

@router.post("/login")
async def login(request: LoginRequest):
    return await AuthController.login(request)

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return await AuthController.get_current_user_info(current_user)
