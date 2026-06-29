import re
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.database import users_collection

UTC = timezone.utc

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def is_valid_email(value: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value))

def normalize_phone(value: str) -> str:
    return re.sub(r"[^0-9+]", "", value)

def find_user_by_identifier(identifier: str):
    if not identifier:
        return None

    if is_valid_email(identifier):
        return users_collection.find_one({"email": identifier})

    normalized = normalize_phone(identifier)
    if normalized:
        return users_collection.find_one({"phone": normalized})

    return users_collection.find_one({"username": identifier})

def create_access_token(data: dict) -> str:
    token_data = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data.update({"exp": expire})
    return jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
