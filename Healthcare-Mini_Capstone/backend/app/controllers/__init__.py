from app.controllers.auth_controller import AuthController
from app.controllers.patient_controller import PatientController
from app.controllers.doctor_controller import DoctorController
from app.controllers.appointment_controller import AppointmentController
from app.controllers.prescription_controller import PrescriptionController
from app.controllers.admin_controller import AdminController

__all__ = [
    "AuthController",
    "PatientController", 
    "DoctorController",
    "AppointmentController",
    "PrescriptionController",
    "AdminController"
]
