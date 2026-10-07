def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Jane Developer",
            "email": "jane@example.com",
            "password": "strongPassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Jane Developer"
    assert data["email"] == "jane@example.com"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data

def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Alex Clone",
            "email": test_user.email,
            "password": "anotherpassword123"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

def test_register_invalid_email(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Invalid Email User",
            "email": "not-an-email",
            "password": "validPassword123"
        }
    )
    assert response.status_code == 422

def test_register_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Short Password",
            "email": "short@example.com",
            "password": "123"
        }
    )
    assert response.status_code == 422

def test_login_success(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "securepassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user.email

def test_login_wrong_password(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "incorrectpassword"
        }
    )
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()

def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "ghost@doesnotexist.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401

def test_get_current_user_profile(client, auth_headers, test_user):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email
    assert data["name"] == test_user.name

def test_unauthorized_access_without_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 403 or response.status_code == 401
