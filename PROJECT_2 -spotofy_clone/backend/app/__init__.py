import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Import Routers
from app.routers.auth import router as auth_router
from app.routers.songs import router as songs_router
from app.routers.albums import router as albums_router
from app.routers.playlists import router as playlists_router
from app.routers.search import router as search_router
from app.routers.deezer import router as deezer_router
from app.routers.saavn import router as saavn_router

app = FastAPI(title="Musify API")

# Add CORSMiddleware allowing all origins (local, file://, hosted domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(songs_router)
app.include_router(albums_router)
app.include_router(playlists_router)
app.include_router(search_router)
app.include_router(deezer_router)
app.include_router(saavn_router)

# Locate Frontend directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_dir = os.path.join(os.path.dirname(base_dir), "frontend")

# Serve frontend HTML pages on GET requests
@app.get("/")
@app.get("/index.html")
def serve_home():
    idx_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(idx_path):
        return FileResponse(idx_path)
    return {"message": "Music Player Backend is active.", "status": "running"}

@app.get("/login")
@app.get("/login.html")
def serve_login():
    login_path = os.path.join(frontend_dir, "login.html")
    if os.path.exists(login_path):
        return FileResponse(login_path)
    return {"message": "Login page not found"}

@app.get("/signup")
@app.get("/signup.html")
def serve_signup():
    signup_path = os.path.join(frontend_dir, "signup.html")
    if os.path.exists(signup_path):
        return FileResponse(signup_path)
    return {"message": "Signup page not found"}

@app.get("/profile")
@app.get("/profile.html")
def serve_profile():
    profile_path = os.path.join(frontend_dir, "profile.html")
    if os.path.exists(profile_path):
        return FileResponse(profile_path)
    return {"message": "Profile page not found"}

@app.get("/account")
@app.get("/account.html")
def serve_account():
    acc_path = os.path.join(frontend_dir, "account.html")
    if os.path.exists(acc_path):
        return FileResponse(acc_path)
    return {"message": "Account page not found"}

@app.get("/settings")
@app.get("/settings.html")
def serve_settings():
    sett_path = os.path.join(frontend_dir, "settings.html")
    if os.path.exists(sett_path):
        return FileResponse(sett_path)
    return {"message": "Settings page not found"}

# Mount frontend static directories (css, js, img, songs, etc.)
if os.path.exists(frontend_dir):
    for folder in ["css", "js", "img", "songs"]:
        folder_path = os.path.join(frontend_dir, folder)
        if os.path.exists(folder_path):
            app.mount(f"/{folder}", StaticFiles(directory=folder_path), name=folder)


