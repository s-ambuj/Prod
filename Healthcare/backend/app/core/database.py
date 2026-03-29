from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"Connected to MongoDB at {settings.MONGODB_URL}")

async def disconnect_db():
    global client
    if client:
        client.close()
        client = None
        print("Disconnected from MongoDB")

def get_database():
    if client is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return client[settings.DATABASE_NAME]

def get_collection(collection_name: str):
    return get_database()[collection_name]
