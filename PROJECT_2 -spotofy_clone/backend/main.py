from datetime import datetime, timedelta, timezone
from typing import List, Optional
import os
import requests

UTC = timezone.utc
import re
import base64
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from bson import ObjectId
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
from pymongo import MongoClient

load_dotenv()

app = FastAPI()

CLIENT_ID = os.getenv("CLIENT_ID", "")
CLIENT_SECRET = os.getenv("CLIENT_SECRET", "")

def get_music_api_headers():
    """Generate proper MusicAPI authentication headers using Basic Auth"""
    if not CLIENT_ID or not CLIENT_SECRET:
        return {"Content-Type": "application/json; charset=utf-8"}
    
    credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/json; charset=utf-8"
    }

@app.get("/api/external-search/{query}")
def external_search(query: str):
    try:
        url = "https://api.musicapi.com/search"
        headers = get_music_api_headers()
        params = {
            "q": query,
            "type": "track",
            "source": "youtube"
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)

        print("Status Code:", response.status_code)
        print("Response:", response.text)

        if response.status_code == 200:
            return {"source": "musicapi", "data": response.json()}
        else:
            return {"error": response.text}

    except Exception as e:
        return {"error": str(e)}

@app.get("/api/external-music")
def external_music():
    """Fetch music from MusicAPI or local DB"""
    try:
        url = "https://api.musicapi.com/search/introspection/search?q=believer&type=track&source=youtube"
        headers = get_music_api_headers()
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            api_results = response.json()
            return {"source": "musicapi", "data": api_results}
    except Exception as e:
        print(f"[WARNING] MusicAPI fetch failed: {e}")
    
    # Fallback to local database
    songs = list(songs_collection.find({}, {"_id": 0, "title": 1, "artist": 1, "album": 1, "folder": 1, "file_path": 1, "cover_image": 1}))
    albums = list(albums_collection.find({}, {"_id": 0}))
    return {"source": "local", "songs": songs, "albums": albums}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("[OK] MongoDB connected successfully")
    db = client["spotify_clone"]
except Exception as e:
    raise RuntimeError(f"MongoDB connection failed: {e}")

users_collection = db["users"]
songs_collection = db["songs"]
playlists_collection = db["playlists"]
albums_collection = db["albums"]

SONGS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "songs"))
if os.path.isdir(SONGS_DIR):
    app.mount("/songs", StaticFiles(directory=SONGS_DIR), name="songs")
else:
    print(f"[WARNING] Songs directory not found: {SONGS_DIR}")

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

class SignupModel(BaseModel):
    username: str
    email: str
    password: str
    phone: Optional[str] = None

class LoginModel(BaseModel):
    identifier: str
    password: str

class SongModel(BaseModel):
    title: str
    artist: str
    album: str
    duration: Optional[int]
    file_path: str
    genre: Optional[str]
    cover_image: Optional[str]
    folder: Optional[str] = None

class PlaylistModel(BaseModel):
    name: str
    description: str
    cover_image: str
    songs: List[str]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def is_valid_email(value: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value))


def normalize_phone(value: str) -> str:
    return re.sub(r"[^0-9+]", "", value)


def find_user_by_identifier(identifier: str):
    if is_valid_email(identifier):
        return users_collection.find_one({"email": identifier})
    normalized = normalize_phone(identifier)
    if normalized:
        return users_collection.find_one({"phone": normalized})
    return None


def create_access_token(data: dict) -> str:
    token_data = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data.update({"exp": expire})
    return jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)


@app.post("/signup")
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
@app.post("/login")
def login(user: LoginModel):

    db_user = find_user_by_identifier(user.identifier)

    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Update last login
    users_collection.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"last_login": datetime.now(UTC)}}
    )

    token = create_access_token({
        "sub": db_user["email"],
        "username": db_user.get("username")
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Login successful",
        "username": db_user.get("username"),
        "email": db_user.get("email"),
    }

@app.post("/google-login")
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

@app.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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

@app.get("/check-login")
def check_login(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = users_collection.find_one({"email": email})
        if not user:
            return {"is_logged_in": False}
        return {"is_logged_in": True, "username": user.get("username"), "email": email, "message": "User is logged in"}
    except JWTError:
        return {"is_logged_in": False, "message": "Invalid or expired token"}

@app.post("/logout")
def logout():
    return {"message": "Logout successful"}

@app.post("/api/songs")
def add_song(song: SongModel):
    song_data = song.dict()
    if not song_data.get("folder") and song_data.get("file_path"):
        match = re.match(r"^/songs/([^/]+)/", song_data["file_path"])
        if match:
            song_data["folder"] = match.group(1)

    result = songs_collection.insert_one(song_data)
    return {"message": "Song added successfully", "song_id": str(result.inserted_id)}

@app.get("/api/songs")
def get_all_songs():
    songs = list(songs_collection.find({}, {"_id": 0}))
    return {"songs": songs}

@app.get("/api/songs/id/{song_id}")
def get_song(song_id: str):
    try:
        song_obj_id = ObjectId(song_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid song ID format")

    song = songs_collection.find_one({"_id": song_obj_id})
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    song["_id"] = str(song["_id"])
    return song

@app.get("/api/songs/{folder}")
def get_songs_by_folder(folder: str):
    query = {
        "$or": [
            {"folder": {"$regex": f"^{re.escape(folder)}$", "$options": "i"}},
            {"album": {"$regex": f"^{re.escape(folder)}$", "$options": "i"}},
            {"file_path": {"$regex": f"/{re.escape(folder)}/", "$options": "i"}},
        ]
    }
    songs = list(songs_collection.find(query, {"file_path": 1, "_id": 0}))
    return {"songs": [os.path.basename(song["file_path"]) for song in songs if song.get("file_path")]}

@app.get("/api/albums")
def get_albums():
    albums = list(albums_collection.find({}, {"_id": 0}))
    return {"albums": albums}

@app.get("/api/playlists")
def get_playlists():
    playlists = []
    for playlist in playlists_collection.find({}, {"_id": 0}):
        song_details = []
        for song_id in playlist.get("songs", []):
            song = songs_collection.find_one({"_id": ObjectId(song_id)})
            if song:
                song["_id"] = str(song["_id"])
                song_details.append(song)
        playlist["songs"] = song_details
        playlists.append(playlist)
    return {"playlists": playlists}

@app.post("/api/playlists")
def create_playlist(playlist: PlaylistModel):
    result = playlists_collection.insert_one(playlist.dict())
    return {"message": "Playlist created successfully", "playlist_id": str(result.inserted_id)}

@app.get("/api/search")
def search_songs(query: str):
    song_results = list(songs_collection.find({
        "$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"artist": {"$regex": query, "$options": "i"}},
            {"album": {"$regex": query, "$options": "i"}},
        ]
    }, {"_id": 0}))

    playlist_results = list(playlists_collection.find({
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
        ]
    }, {"_id": 0}))

    return {"songs": song_results, "playlists": playlist_results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
