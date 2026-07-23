from app.jwt_config import verify_token
from fastapi import APIRouter
from app.database import albums_collection
from fastapi import Depends, HTTPException

router = APIRouter()

import re
from typing import Optional

@router.get("/api/albums")
def get_albums(
    name: Optional[str] = None,
    genre: Optional[str] = None,
    artist: Optional[str] = None,
    token=Depends(verify_token)
):
    """Gets albums with optional filtering"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    
    albums = list(albums_collection.find({}, {"_id": 0}))
    if name:
        pattern = re.compile(re.escape(name), re.IGNORECASE)
        albums = [a for a in albums if pattern.search(str(a.get("title") or a.get("name") or ""))]
    if genre:
        pattern = re.compile(re.escape(genre), re.IGNORECASE)
        albums = [a for a in albums if pattern.search(str(a.get("genre") or ""))]
    if artist:
        pattern = re.compile(re.escape(artist), re.IGNORECASE)
        albums = [a for a in albums if pattern.search(str(a.get("artist") or ""))]
        
    return {"albums": albums}
