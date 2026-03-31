from datetime import datetime, timedelta
from typing import Optional
import re

def format_datetime(dt: datetime) -> str:
    return dt.isoformat() if dt else None

def parse_datetime(date_string: str) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
    except:
        return None

def is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_object_id(id_str: str) -> bool:
    if not id_str:
        return False
    return len(id_str) == 24 and all(c in '0123456789abcdefABCDEF' for c in id_str)

def sanitize_string(value: str) -> str:
    if not value:
        return ""
    return value.strip()

def generate_time_slots(start_hour: int = 9, end_hour: int = 17, interval_minutes: int = 30) -> list:
    slots = []
    current = datetime.now().replace(hour=start_hour, minute=0, second=0, microsecond=0)
    end = current.replace(hour=end_hour)
    while current < end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=interval_minutes)
    return slots

def calculate_age(birth_date: datetime) -> int:
    today = datetime.today()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    return age
