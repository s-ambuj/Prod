from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDBClient:
    client: AsyncIOMotorClient = None

    @classmethod
    async def connect(cls):
        cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
        print(f"Connected to MongoDB at {settings.MONGODB_URL}")

    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
            print("Disconnected from MongoDB")

    @classmethod
    def get_database(cls):
        return cls.client[settings.DATABASE_NAME]

    @classmethod
    def get_collection(cls, collection_name: str):
        return cls.get_database()[collection_name]

def get_database():
    return MongoDBClient.get_database()

def get_collection(collection_name: str):
    return MongoDBClient.get_collection(collection_name)
