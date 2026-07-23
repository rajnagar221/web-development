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

from typing import Optional

@router.get("/api/songs")
def get_all_songs(
    title: Optional[str] = None,
    artist: Optional[str] = None,
    album: Optional[str] = None,
    folder: Optional[str] = None,
    token=Depends(verify_token)
):
    """Gets all songs with optional filtering"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
        
    songs = list(songs_collection.find({}, {"_id": 0}))
    
    if title:
        pattern = re.compile(re.escape(title), re.IGNORECASE)
        songs = [s for s in songs if pattern.search(str(s.get("title") or ""))]
    if artist:
        pattern = re.compile(re.escape(artist), re.IGNORECASE)
        songs = [s for s in songs if pattern.search(str(s.get("artist") or ""))]
    if album:
        pattern = re.compile(re.escape(album), re.IGNORECASE)
        songs = [s for s in songs if pattern.search(str(s.get("album") or ""))]
    if folder:
        pattern = re.compile(re.escape(folder), re.IGNORECASE)
        songs = [
            s for s in songs 
            if pattern.search(str(s.get("folder") or "")) or pattern.search(str(s.get("album") or ""))
        ]

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
def get_songs_by_folder(folder: str, token=Depends(verify_token)):
    """Gets songs by folder or album name"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    songs = list(songs_collection.find({}, {"_id": 0}))
    pattern = re.compile(re.escape(folder), re.IGNORECASE)
    filtered = [
        s for s in songs
        if pattern.search(str(s.get("folder") or "")) or
           pattern.search(str(s.get("album") or "")) or
           pattern.search(str(s.get("file_path") or ""))
    ]
    return {"songs": filtered}

