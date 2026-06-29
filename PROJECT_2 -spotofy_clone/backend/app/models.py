from typing import List, Optional
from pydantic import BaseModel, EmailStr

class SignupModel(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class LoginModel(BaseModel):
    username: Optional[str] = None
    identifier: Optional[str] = None
    password: str

class SongModel(BaseModel):
    title: str
    artist: str
    album: str
    duration: Optional[int] = None
    file_path: str
    genre: Optional[str] = None
    cover_image: Optional[str] = None
    folder: Optional[str] = None

class PlaylistModel(BaseModel):
    name: str
    description: str
    cover_image: str
    songs: List[str]
