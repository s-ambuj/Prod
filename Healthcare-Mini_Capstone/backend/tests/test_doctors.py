import pytest

@pytest.mark.asyncio
async def test_get_all_doctors(client):
    response = await client.get("/api/v1/doctors")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_approve_doctor(client):
    login_response = await client.post("/api/v1/auth/login", json={
        "email": "admin@healthcare.com",
        "password": "admin123"
    })
    token = login_response.json()["access_token"]
    response = await client.get(
        "/api/v1/admin/doctors/pending",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
