import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from datetime import datetime, timedelta
from app.core.database import connect_db, disconnect_db
from app.core.security import get_password_hash
from app.repositories.user_repository import UserRepository
from app.repositories.doctor_repository import DoctorRepository
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.prescription_repository import PrescriptionRepository

async def seed_users():
    user_repo = UserRepository()
    admin_exists = await user_repo.get_by_email("admin@healthcare.com")
    if not admin_exists:
        await user_repo.create({
            "name": "Admin User",
            "email": "admin@healthcare.com",
            "password": get_password_hash("admin123"),
            "role": "admin",
            "is_approved": True,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        print("Created admin user")
    doctor_exists = await user_repo.get_by_email("doctor@healthcare.com")
    if not doctor_exists:
        doctor_id = await user_repo.create({
            "name": "Dr. John Smith",
            "email": "doctor@healthcare.com",
            "password": get_password_hash("doctor123"),
            "role": "doctor",
            "is_approved": True,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        doctor_repo = DoctorRepository()
        await doctor_repo.create({
            "user_id": doctor_id,
            "specialization": "Cardiologist",
            "experience": 10,
            "availability": ["09:00", "09:30", "10:00", "10:30", "11:00"],
            "rating": 4.5,
            "total_reviews": 20,
            "bio": "Experienced cardiologist with 10 years of practice",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        print("Created doctor user and profile")
    patient_exists = await user_repo.get_by_email("patient@healthcare.com")
    if not patient_exists:
        await user_repo.create({
            "name": "Jane Doe",
            "email": "patient@healthcare.com",
            "password": get_password_hash("patient123"),
            "role": "patient",
            "is_approved": True,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        print("Created patient user")

async def main():
    await connect_db()
    try:
        await seed_users()
        print("Seeding completed successfully!")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        await disconnect_db()

if __name__ == "__main__":
    asyncio.run(main())
