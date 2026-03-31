import pytest

@pytest.mark.asyncio
async def test_register(client):
    response = await client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword",
        "role": "patient"
    })
    assert response.status_code == 201
    assert "id" in response.json()

@pytest.mark.asyncio
async def test_login(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "patient@healthcare.com",
        "password": "patient123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_get_current_user(client):
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
