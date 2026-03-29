import pytest
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_book_appointment(client):
    login_response = await client.post("/api/v1/auth/login", json={
        "email": "patient@healthcare.com",
        "password": "patient123"
    })
    token = login_response.json()["access_token"]
    doctors_response = await client.get("/api/v1/doctors")
    doctors = doctors_response.json()
    if doctors:
        doctor_id = doctors[0]["id"]
        appointment_time = (datetime.utcnow() + timedelta(days=1)).replace(hour=10, minute=0)
        response = await client.post(
            "/api/v1/patients/appointments",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "doctor_id": doctor_id,
                "appointment_time": appointment_time.isoformat(),
                "reason": "Regular checkup"
            }
        )
        assert response.status_code == 201

@pytest.mark.asyncio
async def test_get_my_appointments(client):
    login_response = await client.post("/api/v1/auth/login", json={
        "email": "patient@healthcare.com",
        "password": "patient123"
    })
    token = login_response.json()["access_token"]
    response = await client.get(
        "/api/v1/patients/appointments/my",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
