import urllib.parse
from fastapi import APIRouter, HTTPException
from jiosaavnpy import JioSaavn

router = APIRouter()
jiosaavn_client = JioSaavn()

@router.get("/api/fullsongs/search")
def search_full_songs(query: str):
    """
    Searches JioSaavn for full-length songs (2-5+ minutes)
    Returns list of songs with high quality audio stream URLs
    """
    try:
        results = jiosaavn_client.search_songs(query)
        formatted_songs = []
        for song in results:
            stream_urls = song.get("stream_urls", {})
            audio_url = (
                stream_urls.get("very_high_quality") or
                stream_urls.get("high_quality") or
                stream_urls.get("medium_quality") or
                stream_urls.get("low_quality") or ""
            )
            if not audio_url:
                continue

            # Cover thumbnail - pick largest image available
            thumbnails = song.get("thumbnails", [])
            cover_image = "img/music.svg"
            if isinstance(thumbnails, list) and len(thumbnails) > 0:
                cover_image = thumbnails[-1].get("link") or thumbnails[-1].get("url") or cover_image
            elif isinstance(thumbnails, dict):
                cover_image = thumbnails.get("high") or thumbnails.get("500x500") or cover_image

            formatted_songs.append({
                "id": str(song.get("track_id", song.get("title"))),
                "title": song.get("title", "Unknown Title"),
                "artist": song.get("primary_artists") or song.get("artist") or "Unknown Artist",
                "album": song.get("album_name") or "Single",
                "duration": int(song.get("duration", 0)),
                "cover_image": cover_image,
                "url": audio_url,
                "folder": song.get("album_name", "search")
            })

        return {"songs": formatted_songs}
    except Exception as e:
        print(f"Error searching JioSaavn songs: {e}")
        return {"songs": []}
