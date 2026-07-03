from fastapi import HTTPException
from app.jwt_config import verify_token
from fastapi import Depends
from fastapi import APIRouter
from bson import ObjectId
from app.database import playlists_collection, songs_collection
from app.models import PlaylistModel

router = APIRouter()

@router.get("/api/playlists")
def get_playlists(token=Depends(verify_token)):
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    playlists = []
    for playlist in playlists_collection.find({}, {"_id": 0}):
        song_details = []
        for song_id in playlist.get("songs", []):
            try:
                song_query_id = ObjectId(song_id)
            except Exception:
                song_query_id = song_id
            song = songs_collection.find_one({"_id": song_query_id})
            if song:
                song["_id"] = str(song["_id"])
                song_details.append(song)
        playlist["songs"] = song_details
        playlists.append(playlist)
    return {"playlists": playlists}

@router.post("/api/playlists")
def create_playlist(playlist: PlaylistModel , token=Depends(verify_token)):
    """Creates a new playlist"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    result = playlists_collection.insert_one(playlist.dict())
    return {"message": "Playlist created successfully", "playlist_id": str(result.inserted_id)}
