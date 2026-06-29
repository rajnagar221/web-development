from app.jwt_config import decode_token
from app import config
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from jose import JWTError, jwt
from app.database import users_collection
from app.models import SignupModel, LoginModel
from app.jwt_config import create_access_token, decode_token,verify_token

from app.auth import (
    hash_password,
    verify_password,
    find_user_by_identifier,
    oauth2_scheme,
    normalize_phone
)

UTC = timezone.utc
router = APIRouter()

@router.post("/signup")
def signup(user: SignupModel):
    # Check email
    existing_email = users_collection.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="User already exists with this email")

    # Check phone
    if user.phone:
        normalized_phone = normalize_phone(user.phone)
        if len(normalized_phone) < 10:
            raise HTTPException(status_code=400, detail="Enter valid phone number")

        existing_phone = users_collection.find_one({"phone": normalized_phone})
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    else:
        normalized_phone = None

    # Password validation
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Insert user
    result = users_collection.insert_one({
        "username": user.username,
        "email": user.email,
        "phone": normalized_phone,
        "password": hash_password(user.password),
        "created_at": datetime.utcnow(),
        "last_login": None
    })

    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }

@router.post("/login")
def login(user: LoginModel):
    login_identifier = (user.username or user.identifier or "").strip()

    if not login_identifier:
        raise HTTPException(status_code=400, detail="Email or phone is required")

    db_user = find_user_by_identifier(login_identifier)

    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Update last login
    users_collection.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"last_login": datetime.now(UTC)}}
    )
    token = create_access_token({"sub": db_user["email"], "username": db_user.get("username")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Login successful",
        "username": db_user.get("username"),
        "email": db_user.get("email"),
    }

@router.post("/google-login")
def google_login():
    email = "google-demo@musify.com"
    db_user = users_collection.find_one({"email": email})
    if not db_user:
        result = users_collection.insert_one({
            "username": "Google User",
            "email": email,
            "phone": None,
            "password": hash_password("google-demo-password"),
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
        })
        db_user = users_collection.find_one({"_id": result.inserted_id})

    users_collection.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"last_login": datetime.now(UTC)}},
    )

    token = create_access_token({"sub": db_user["email"], "username": db_user.get("username")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Google login successful",
        "username": db_user.get("username"),
    }

@router.post("/spotify-login")
def spotify_login():
    email = "spotify-demo@musify.com"
    db_user = users_collection.find_one({"email": email})
    if not db_user:
        result = users_collection.insert_one({
            "username": "Spotify User",
            "email": email,
            "phone": None,
            "password": hash_password("spotify-demo-password"),
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
        })
        db_user = users_collection.find_one({"_id": result.inserted_id})

    users_collection.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"last_login": datetime.now(UTC)}},
    )

    token = create_access_token({"sub": db_user["email"], "username": db_user.get("username")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Spotify login successful",
        "username": db_user.get("username"),
    }

@router.post("/apple-login")
def apple_login():
    email = "apple-demo@musify.com"
    db_user = users_collection.find_one({"email": email})
    if not db_user:
        result = users_collection.insert_one({
            "username": "Apple User",
            "email": email,
            "phone": None,
            "password": hash_password("apple-demo-password"),
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
        })
        db_user = users_collection.find_one({"_id": result.inserted_id})

    users_collection.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"last_login": datetime.now(UTC)}},
    )

    token = create_access_token({"sub": db_user["email"], "username": db_user.get("username")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Apple login successful",
        "username": db_user.get("username"),
    }

@router.get("/profile")
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": user.get("username"),
        "email": user.get("email"),
        "user_id": str(user.get("_id")),
        "last_login": user.get("last_login"),
    }

@router.get("/check-login")
def check_login(token: str = Depends(oauth2_scheme)):
    try:
        payload = verify_token(token)
        email = payload.get("sub")
        user = users_collection.find_one({"email": email})
        if not user:
            return {"is_logged_in": False}
        return {"is_logged_in": True, "username": user.get("username"), "email": email, "message": "User is logged in"}
    except JWTError:
        return {"is_logged_in": False, "message": "Invalid or expired token"}

@router.post("/logout")
def logout():
    return {"message": "Logout successful"}
