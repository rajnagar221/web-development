from fastapi import APIRouter
from app.database import albums_collection

router = APIRouter()

@router.get("/api/albums")
def get_albums():
    albums = list(albums_collection.find({}, {"_id": 0}))
    return {"albums": albums}
