from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status

def validate_email(email: str) -> bool:
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> tuple[bool, Optional[str]]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    return True, None

def validate_appointment_time(appointment_time: datetime) -> tuple[bool, Optional[str]]:
    if appointment_time < datetime.utcnow():
        return False, "Appointment time cannot be in the past"
    hour = appointment_time.hour
    if hour < 9 or hour >= 17:
        return False, "Appointment time must be between 9 AM and 5 PM"
    return True, None

def validate_medicine(medicine: dict) -> tuple[bool, Optional[str]]:
    if not medicine.get("name"):
        return False, "Medicine name is required"
    if not medicine.get("dosage"):
        return False, "Medicine dosage is required"
    days = medicine.get("days")
    if not days or days < 1:
        return False, "Medicine days must be at least 1"
    return True, None

def validate_object_id(id_str: str, field_name: str = "id"):
    if not id_str or len(id_str) != 24:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} format"
        )

def validate_required_fields(data: dict, required_fields: list):
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Missing required fields: {', '.join(missing_fields)}"
        )
