class UserRole:
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class AppointmentStatus:
    BOOKED = "booked"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class ApprovalStatus:
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

COLLECTION_USERS = "users"
COLLECTION_DOCTOR_PROFILES = "doctor_profiles"
COLLECTION_APPOINTMENTS = "appointments"
COLLECTION_PRESCRIPTIONS = "prescriptions"
