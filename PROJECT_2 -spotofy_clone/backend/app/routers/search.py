from fastapi import APIRouter
from app.database import songs_collection, playlists_collection

router = APIRouter()

@router.get("/api/search")
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
