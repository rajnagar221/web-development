import base64
import requests
from fastapi import APIRouter
from app.config import CLIENT_ID, CLIENT_SECRET
from app.database import songs_collection, albums_collection

router = APIRouter()

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

@router.get("/api/external-search/{query}")
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

@router.get("/api/external-music")
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
