from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth_schema import LoginRequest, RegisterRequest, LoginResponse, RegisterResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user

router = APIRouter()

class AuthController:
    @staticmethod
    async def register(request: RegisterRequest):
        auth_service = AuthService()
        result = await auth_service.register(
            name=request.name,
            email=request.email,
            password=request.password,
            role=request.role
        )
        return result

    @staticmethod
    async def login(request: LoginRequest):
        auth_service = AuthService()
        result = await auth_service.login(
            email=request.email,
            password=request.password
        )
        return result

    @staticmethod
    async def get_current_user_info(current_user: dict):
        auth_service = AuthService()
        return await auth_service.get_current_user(str(current_user["_id"]))
