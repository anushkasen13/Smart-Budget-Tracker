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
    response = client.post("/auth/register", json={"name": "Test User", "username": username, "phone": phone, "password": password})
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
    created = client.post("/auth/register", json={"name": "Phone User", "username": username, "phone": phone, "password": password})
    assert created.status_code == 201
    response = client.post("/auth/login", json={"identifier": phone, "password": password})
    assert response.status_code == 200
    assert response.json()["username"] == username


def test_duplicate_user_id_is_rejected():
    username = f"dupe_{uuid4().hex[:12]}"
    body = {"name": "Another User", "username": username, "password": "AnotherStrongPassword2026!"}
    assert client.post("/auth/register", json=body).status_code == 201
    assert client.post("/auth/register", json=body).status_code == 409


def test_registration_rejects_short_password():
    response = client.post("/auth/register", json={"name": "Weak Password", "username": f"weak_{uuid4().hex[:12]}", "password": "short"})
    assert response.status_code == 422
