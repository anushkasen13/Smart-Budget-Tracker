from fastapi.testclient import TestClient

from main import app, SessionLocal, User

client = TestClient(app)


def test_register_login_wrong_password_and_logout():
    email = "auth-test@example.com"
    password = "CorrectHorseBatteryStaple2026!"
    response = client.post("/auth/register", json={"name": "Test User", "email": email, "password": password})
    assert response.status_code == 201
    created = response.json()
    assert created["email"] == email
    assert "password" not in created
    assert client.get("/auth/me").status_code == 200

    wrong = client.post("/auth/login", json={"email": email, "password": "DefinitelyWrongPassword123!"})
    assert wrong.status_code == 401

    client.post("/auth/logout")
    assert client.get("/auth/me").status_code == 401

    valid = client.post("/auth/login", json={"email": email, "password": password})
    assert valid.status_code == 200
    assert valid.json()["name"] == "Test User"
    assert client.get("/auth/me").status_code == 200


def test_duplicate_email_is_rejected():
    response = client.post("/auth/register", json={"name": "Another User", "email": "auth-test@example.com", "password": "AnotherStrongPassword2026!"})
    assert response.status_code == 409


def test_registration_rejects_short_password():
    response = client.post("/auth/register", json={"name": "Weak Password", "email": "weak-password@example.com", "password": "short"})
    assert response.status_code == 422
