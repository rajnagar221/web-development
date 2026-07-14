import requests
from fastapi import APIRouter, HTTPException

router = APIRouter()
DEEZER_API_BASE = "https://api.deezer.com"

@router.get("/api/deezer/search")
def search_deezer(q: str):
    try:
        response = requests.get(f"{DEEZER_API_BASE}/search", params={"q": q}, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/deezer/search/album")
def search_deezer_album(q: str):
    try:
        response = requests.get(f"{DEEZER_API_BASE}/search/album", params={"q": q}, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/deezer/search/artist")
def search_deezer_artist(q: str):
    try:
        response = requests.get(f"{DEEZER_API_BASE}/search/artist", params={"q": q}, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/deezer/album/{album_id}")
def get_deezer_album(album_id: str):
    try:
        response = requests.get(f"{DEEZER_API_BASE}/album/{album_id}", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/deezer/artist/{artist_id}/albums")
def get_deezer_artist_albums(artist_id: str):
    try:
        response = requests.get(f"{DEEZER_API_BASE}/artist/{artist_id}/albums", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/deezer/genre")
def get_deezer_genres():
    try:
        response = requests.get(f"{DEEZER_API_BASE}/genre", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/deezer/genre/{genre_id}/artists")
def get_deezer_genre_artists(genre_id: str):
    try:
        response = requests.get(f"{DEEZER_API_BASE}/genre/{genre_id}/artists", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
