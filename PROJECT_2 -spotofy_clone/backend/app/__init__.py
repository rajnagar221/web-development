import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import Routers
from app.routers.auth import router as auth_router
from app.routers.songs import router as songs_router
from app.routers.albums import router as albums_router
from app.routers.playlists import router as playlists_router
from app.routers.search import router as search_router
from app.routers.deezer import router as deezer_router
from app.routers.saavn import router as saavn_router

app = FastAPI()

# Add CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(songs_router)
app.include_router(albums_router)
app.include_router(playlists_router)
app.include_router(search_router)
app.include_router(deezer_router)
app.include_router(saavn_router)

@app.get("/")
def health():   
    return {"message": "Music Player Backend."}
