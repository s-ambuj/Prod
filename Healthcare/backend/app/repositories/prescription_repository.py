from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.core.database import get_collection


class PrescriptionRepository:
    def __init__(self):
        self.collection = get_collection("prescriptions")

    async def create(self, prescription_data: Dict[str, Any]) -> str:
        result = await self.collection.insert_one(prescription_data)
        return str(result.inserted_id)

    async def get_by_id(self, prescription_id: str) -> Optional[Dict[str, Any]]:
        try:
            result = await self.collection.find_one({"_id": ObjectId(prescription_id)})
            if result:
                result["_id"] = str(result["_id"])
            return result
        except:
            return None

    async def get_by_patient(self, patient_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.collection.find({"patient_id": patient_id}).sort("created_at", -1).skip(skip).limit(limit)
        results = []
        async for document in cursor:
            document["_id"] = str(document["_id"])
            results.append(document)
        return results

    async def get_by_doctor(self, doctor_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.collection.find({"doctor_id": doctor_id}).sort("created_at", -1).skip(skip).limit(limit)
        results = []
        async for document in cursor:
            document["_id"] = str(document["_id"])
            results.append(document)
        return results

    async def get_by_appointment(self, appointment_id: str) -> Optional[Dict[str, Any]]:
        result = await self.collection.find_one({"appointment_id": appointment_id})
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

    async def update(self, prescription_id: str, update_data: Dict[str, Any]) -> bool:
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(prescription_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False

    async def delete(self, prescription_id: str) -> bool:
        try:
            result = await self.collection.delete_one({"_id": ObjectId(prescription_id)})
            return result.deleted_count > 0
        except:
            return False
