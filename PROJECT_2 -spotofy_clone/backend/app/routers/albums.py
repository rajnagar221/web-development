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
    
    query = {}
    if name:
        query["name"] = {"$regex": f".*{re.escape(name)}.*", "$options": "i"}
    if genre:
        query["genre"] = {"$regex": f".*{re.escape(genre)}.*", "$options": "i"}
    if artist:
        query["artist"] = {"$regex": f".*{re.escape(artist)}.*", "$options": "i"}
        
    albums = list(albums_collection.find(query, {"_id": 0}))   
    return {"albums": albums}
