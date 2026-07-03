import re
import os
from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import songs_collection
from app.models import SongModel
from app.jwt_config import verify_token
from fastapi import Depends, HTTPException

router = APIRouter()

@router.post("/api/songs")
def add_song(song: SongModel, token=Depends(verify_token)):
    """Adds a new song"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    song_data = song.dict()
    if not song_data.get("folder") and song_data.get("file_path"):
        match = re.match(r"^/songs/([^/]+)/", song_data["file_path"])
        if match:
            song_data["folder"] = match.group(1)

    result = songs_collection.insert_one(song_data)
    return {"message": "Song added successfully", "song_id": str(result.inserted_id)}

@router.get("/api/songs")
def get_all_songs(token=Depends(verify_token)):
    """Gets all songs"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    songs = list(songs_collection.find({}, {"_id": 0}))
    return {"songs": songs}

@router.get("/api/songs/id/{song_id}")
def get_song(song_id: str, token=Depends(verify_token)):
    """Gets a specific song"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    try:
        song_obj_id = ObjectId(song_id)
    except Exception:
        song_obj_id = song_id

    song = songs_collection.find_one({"_id": song_obj_id})
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    song["_id"] = str(song["_id"])
    return song

@router.get("/api/songs/{folder}")
def get_songs_by_folder(folder: str,token=Depends(verify_token)):
    """Gets songs by folder"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    query = {
        "$or": [
            {"folder": {"$regex": f"^{re.escape(folder)}$", "$options": "i"}},
            {"album": {"$regex": f"^{re.escape(folder)}$", "$options": "i"}},
            {"file_path": {"$regex": f"/{re.escape(folder)}/", "$options": "i"}},
        ]
    }
    songs = list(songs_collection.find(query, {"file_path": 1, "_id": 0}))
    return {"songs": [os.path.basename(song["file_path"]) for song in songs if song.get("file_path")]}
