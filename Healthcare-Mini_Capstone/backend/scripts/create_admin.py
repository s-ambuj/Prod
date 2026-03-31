import asyncio
import sys
import os
import argparse
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from datetime import datetime
from app.core.database import connect_db, disconnect_db
from app.core.security import get_password_hash
from app.repositories.user_repository import UserRepository

async def create_admin(email: str, name: str, password: str):
    user_repo = UserRepository()
    existing = await user_repo.get_by_email(email)
    if existing:
        print(f"Admin with email {email} already exists!")
        return
    admin_id = await user_repo.create({
        "name": name,
        "email": email,
        "password": get_password_hash(password),
        "role": "admin",
        "is_approved": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    print(f"Admin user created successfully!")
    print(f"ID: {admin_id}")
    print(f"Email: {email}")
    print(f"Name: {name}")

async def main():
    parser = argparse.ArgumentParser(description="Create admin user")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--name", required=True, help="Admin name")
    parser.add_argument("--password", required=True, help="Admin password")
    args = parser.parse_args()
    await connect_db()
    try:
        await create_admin(args.email, args.name, args.password)
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        await disconnect_db()

if __name__ == "__main__":
    asyncio.run(main())
