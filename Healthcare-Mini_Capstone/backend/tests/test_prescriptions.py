import pytest

@pytest.mark.asyncio
async def test_get_my_prescriptions(client):
    login_response = await client.post("/api/v1/auth/login", json={
        "email": "patient@healthcare.com",
        "password": "patient123"
    })
    token = login_response.json()["access_token"]
    response = await client.get(
        "/api/v1/patients/prescriptions/my",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_doctor_prescriptions(client):
    login_response = await client.post("/api/v1/auth/login", json={
        "email": "doctor@healthcare.com",
        "password": "doctor123"
    })
    token = login_response.json()["access_token"]
    response = await client.get(
        "/api/v1/doctors/prescriptions/my",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
