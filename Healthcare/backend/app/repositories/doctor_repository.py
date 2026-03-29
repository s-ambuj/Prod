from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.core.database import get_collection


class DoctorRepository:
    def __init__(self):
        self.collection = get_collection("doctor_profiles")

    async def create(self, profile_data: Dict[str, Any]) -> str:
        result = await self.collection.insert_one(profile_data)
        return str(result.inserted_id)

    async def get_by_id(self, profile_id: str) -> Optional[Dict[str, Any]]:
        try:
            result = await self.collection.find_one({"_id": ObjectId(profile_id)})
            if result:
                result["_id"] = str(result["_id"])
            return result
        except:
            return None

    async def get_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        result = await self.collection.find_one({"user_id": user_id})
        if result:
            result["_id"] = str(result["_id"])
        return result

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.collection.find().skip(skip).limit(limit)
        results = []
        async for document in cursor:
            document["_id"] = str(document["_id"])
            results.append(document)
        return results

    async def update(self, profile_id: str, update_data: Dict[str, Any]) -> bool:
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = await self.collection.update_one(
                {"_id": ObjectId(profile_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False

    async def update_by_user_id(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = await self.collection.update_one(
                {"user_id": user_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False

    async def delete(self, profile_id: str) -> bool:
        try:
            result = await self.collection.delete_one({"_id": ObjectId(profile_id)})
            return result.deleted_count > 0
        except:
            return False

    async def delete_by_user_id(self, user_id: str) -> bool:
        try:
            result = await self.collection.delete_one({"user_id": user_id})
            return result.deleted_count > 0
        except:
            return False
