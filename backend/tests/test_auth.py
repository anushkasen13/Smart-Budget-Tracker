from fastapi.testclient import TestClient
from uuid import uuid4
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from main import app

client = TestClient(app)


def test_register_login_by_user_id_and_logout():
    username = f"user_{uuid4().hex[:12]}"
    phone = f"+9198{uuid4().int % 100000000:08d}"[:13]
    password = "CorrectHorseBatteryStaple2026!"
    response = client.post("/auth/register", json={"name": "Test User", "username": username, "contact": phone, "password": password})
    assert response.status_code == 201
    created = response.json()
    assert created["username"] == username
    assert created["phone"] == phone
    assert "password" not in created and "email" not in created
    assert client.get("/auth/me").status_code == 200

    wrong = client.post("/auth/login", json={"identifier": username, "password": "DefinitelyWrongPassword123!"})
    assert wrong.status_code == 401

    client.post("/auth/logout")
    assert client.get("/auth/me").status_code == 401

    valid = client.post("/auth/login", json={"identifier": username, "password": password})
    assert valid.status_code == 200
    assert valid.json()["name"] == "Test User"
    assert client.get("/auth/me").status_code == 200


def test_login_by_phone_number():
    username = f"phone_{uuid4().hex[:12]}"
    phone = f"+9198{uuid4().int % 100000000:08d}"[:13]
    password = "CorrectHorseBatteryStaple2026!"
    created = client.post("/auth/register", json={"name": "Phone User", "username": username, "contact": phone, "password": password})
    assert created.status_code == 201
    response = client.post("/auth/login", json={"identifier": phone, "password": password})
    assert response.status_code == 200
    assert response.json()["username"] == username


def test_duplicate_user_id_is_rejected():
    username = f"dupe_{uuid4().hex[:12]}"
    body = {"name": "Another User", "username": username, "contact": f"{username}@example.com", "password": "AnotherStrongPassword2026!"}
    assert client.post("/auth/register", json=body).status_code == 201
    assert client.post("/auth/register", json=body).status_code == 409


def test_registration_rejects_short_password():
    response = client.post("/auth/register", json={"name": "Weak Password", "username": f"weak_{uuid4().hex[:12]}", "contact": f"weak_{uuid4().hex[:8]}@example.com", "password": "short"})
    assert response.status_code == 422


def test_register_and_login_by_email_with_eight_character_password():
    username = f"email_{uuid4().hex[:12]}"
    email = f"{username}@example.com"
    password = "pass1234"
    response = client.post("/auth/register", json={"name": "Email User", "username": username, "contact": email, "password": password})
    assert response.status_code == 201
    assert response.json()["username"] == username
    client.post("/auth/logout")
    login = client.post("/auth/login", json={"identifier": email, "password": password})
    assert login.status_code == 200
    assert login.json()["name"] == "Email User"
