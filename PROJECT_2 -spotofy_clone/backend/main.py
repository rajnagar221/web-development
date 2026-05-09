from pymongo import MongoClient
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import hashlib

app = FastAPI()

# ===================== CORS =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production me specific URL likhna
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== MongoDB =====================
try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ MongoDB Connected Successfully")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")
    print("MongoDB should be running on localhost:27017")

db = client["spotify_clone"]
users_collection = db["users"]

# ===================== JWT Config =====================
SECRET_KEY = "my_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ===================== Models =====================
class SignupModel(BaseModel):
    username: str
    email: str
    password: str

class LoginModel(BaseModel):
    email: str
    password: str

# ===================== Helper Functions =====================
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ===================== Signup =====================
@app.post("/signup")
def signup(user: SignupModel):
    try:
        # Check if user already exists
        existing_user = users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists with this email")

        # Validate password length
        if len(user.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

        # Insert user into database
        result = users_collection.insert_one({
            "username": user.username,
            "email": user.email,
            "password": hash_password(user.password),
            "created_at": datetime.utcnow(),
            "last_login": None
        })

        return {
            "message": "User created successfully",
            "user_id": str(result.inserted_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup error: {str(e)}")

# ===================== Login =====================
@app.post("/login")
def login(user: LoginModel):
    try:
        db_user = users_collection.find_one({"email": user.email})
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Update last login time
        users_collection.update_one(
            {"email": user.email},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        token = create_access_token({"sub": user.email, "username": db_user.get("username")})

        return {
            "access_token": token,
            "token_type": "bearer",
            "message": "Login successful ✅",
            "username": db_user.get("username")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

# ===================== Get Current User =====================
@app.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = users_collection.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "username": user.get("username"),
            "email": user.get("email"),
            "user_id": str(user.get("_id")),
            "last_login": user.get("last_login")
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ===================== Check Login Status =====================
@app.get("/check-login")
def check_login(token: str = None):
    if not token:
        return {"is_logged_in": False, "message": "No token provided"}
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = users_collection.find_one({"email": email})
        
        return {
            "is_logged_in": True,
            "username": user.get("username"),
            "email": email,
            "message": "User is logged in ✅"
        }
    except JWTError:
        return {"is_logged_in": False, "message": "Invalid or expired token"}
    except Exception as e:
        return {"is_logged_in": False, "message": f"Error: {str(e)}"}

# ===================== Logout =====================
@app.post("/logout")
def logout():
    return {"message": "Logout successful ✅"}
