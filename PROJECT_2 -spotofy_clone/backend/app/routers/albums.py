from app.jwt_config import verify_token
from fastapi import APIRouter
from app.database import albums_collection
from fastapi import Depends, HTTPException

router = APIRouter()

@router.get("/api/albums")
def get_albums(token=Depends(verify_token)):
    """Gets all albums"""
    if token["error"]:
        raise HTTPException(status_code=401, detail=token["error"])
    albums = list(albums_collection.find({}, {"_id": 0}))   
    return {"albums": albums}
