from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.core.database import get_collection


class UserRepository:
    def __init__(self):
        self.collection = get_collection("users")

    async def create(self, user_data: Dict[str, Any]) -> str:
        result = await self.collection.insert_one(user_data)
        return str(result.inserted_id)

    async def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            result = await self.collection.find_one({"_id": ObjectId(user_id)})
            if result:
                result["_id"] = str(result["_id"])
            return result
        except:
            return None

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        result = await self.collection.find_one({"email": email})
        if result:
            result["_id"] = str(result["_id"])
        return result

    async def get_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.collection.find({"role": role}).skip(skip).limit(limit)
        results = []
        async for document in cursor:
            document["_id"] = str(document["_id"])
            results.append(document)
        return results

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.collection.find().skip(skip).limit(limit)
        results = []
        async for document in cursor:
            document["_id"] = str(document["_id"])
            results.append(document)
        return results

    async def update(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = await self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False

    async def delete(self, user_id: str) -> bool:
        try:
            result = await self.collection.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except:
            return False

    async def approve_user(self, user_id: str) -> bool:
        return await self.update(user_id, {"is_approved": True})

    async def get_pending_doctors(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.collection.find({
            "role": "doctor",
            "is_approved": False
        }).skip(skip).limit(limit)
        results = []
        async for document in cursor:
            document["_id"] = str(document["_id"])
            results.append(document)
        return results
