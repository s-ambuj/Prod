import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.core.security import get_password_hash
from app.core.database import connect_db, disconnect_db, get_database
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router

@pytest.fixture(autouse=True)
async def db_connection():
    await connect_db()
    yield
    await disconnect_db()

@pytest.fixture(autouse=True)
async def setup_test_data():
    db = get_database()
    users_collection = db["users"]
    doctor_profiles_collection = db["doctor_profiles"]
    await users_collection.delete_many({})
    await doctor_profiles_collection.delete_many({})
    admin_user = {
        "name": "Admin User",
        "email": "admin@healthcare.com",
        "password": get_password_hash("admin123"),
        "role": "admin",
        "is_approved": True,
        "is_active": True
    }
    patient_user = {
        "name": "Patient User",
        "email": "patient@healthcare.com",
        "password": get_password_hash("patient123"),
        "role": "patient",
        "is_approved": True,
        "is_active": True
    }
    doctor_user = {
        "name": "Doctor User",
        "email": "doctor@healthcare.com",
        "password": get_password_hash("doctor123"),
        "role": "doctor",
        "is_approved": True,
        "is_active": True
    }
    result = await users_collection.insert_many([admin_user, patient_user, doctor_user])
    doctor_profile = {
        "user_id": str(result.inserted_ids[2]),
        "specialization": "General Medicine",
        "qualification": "MD",
        "experience_years": 5,
        "availability": [],
        "is_approved": True
    }
    await doctor_profiles_collection.insert_one(doctor_profile)
    yield
    await users_collection.delete_many({})
    await doctor_profiles_collection.delete_many({})

@pytest.fixture
def app():
    test_app = FastAPI(title="Test App")
    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    test_app.include_router(api_router, prefix="/api/v1")
    return test_app

@pytest.fixture
async def client(app):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
