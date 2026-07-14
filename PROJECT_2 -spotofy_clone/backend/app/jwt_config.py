from fastapi import Depends
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer , HTTPAuthorizationCredentials , HTTPBearer

# Secret Key
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")  # Change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")    
http_bearer = HTTPBearer()


# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credential: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    """Verifies a token and returns the data"""
    try:
        token_str = credential.credentials if hasattr(credential, "credentials") else credential
        payload = jwt.decode(token_str, SECRET_KEY, algorithms=[ALGORITHM])
        payload["error"] = None
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}

def hash_password(password: str):
    """Hashes a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """Verifies a password"""
    return pwd_context.verify(plain_password, hashed_password)

def decode_token(credential: str):
    """Decodes a token and returns the data"""
    try:
        payload = jwt.decode(credential, SECRET_KEY, algorithms=[ALGORITHM])
        payload["error"] = None
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}