from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.core.security import get_password_hash


class UserService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def get_user_by_id(self, user_id: str) -> Dict[str, Any]:
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
            "is_active": user.get("is_active", True),
            "created_at": user.get("created_at")
        }

    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if "password" in update_data:
            update_data["password"] = get_password_hash(update_data["password"])

        success = await self.user_repo.update(user_id, update_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update user"
            )

        return {"message": "User updated successfully"}

    async def delete_user(self, user_id: str) -> Dict[str, Any]:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        success = await self.user_repo.delete(user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete user"
            )

        return {"message": "User deleted successfully"}

    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        users = await self.user_repo.get_all(skip, limit)
        return [{
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_approved": user.get("is_approved", False),
            "is_active": user.get("is_active", True)
        } for user in users]

    async def get_users_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        users = await self.user_repo.get_by_role(role, skip, limit)
        return [{
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_approved": user.get("is_approved", False),
            "is_active": user.get("is_active", True)
        } for user in users]
