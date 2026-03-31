import pytest

@pytest.mark.asyncio
async def test_get_profile(client):
    login_response = await client.post("/api/v1/auth/login", json={
        "email": "patient@healthcare.com",
        "password": "patient123"
    })
    token = login_response.json()["access_token"]
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "patient@healthcare.com"

@pytest.mark.asyncio
async def test_get_all_users_admin(client):
    login_response = await client.post("/api/v1/auth/login", json={
        "email": "admin@healthcare.com",
        "password": "admin123"
    })
    token = login_response.json()["access_token"]
    response = await client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
