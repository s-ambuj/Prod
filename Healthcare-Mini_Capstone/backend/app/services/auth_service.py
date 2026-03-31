from datetime import datetime
from fastapi import HTTPException, status
from app.core.security import verify_password, get_password_hash, create_access_token
from app.repositories.user_repository import UserRepository
from app.models.user_model import UserRole


class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def register(self, name: str, email: str, password: str, role: str):
        existing_user = await self.user_repo.get_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        hashed_password = get_password_hash(password)
        
        is_approved = role == UserRole.PATIENT
        
        user_data = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
            "is_approved": is_approved,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        user_id = await self.user_repo.create(user_data)
        return {"id": user_id, "message": "User registered successfully"}

    async def login(self, email: str, password: str):
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is inactive"
            )

        if user["role"] == UserRole.DOCTOR and not user.get("is_approved", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor account pending approval"
            )

        access_token = create_access_token(
            data={"sub": str(user["_id"]), "role": user["role"], "email": user["email"]}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "is_approved": user.get("is_approved", False)
            }
        }

    async def get_current_user(self, user_id: str):
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_approved": user.get("is_approved", False),
            "is_active": user.get("is_active", True)
        }
