import urllib.parse
import requests
from fastapi import APIRouter, HTTPException
from jiosaavnpy import JioSaavn
from jiosaavnpy.functions import Functions

router = APIRouter()
jiosaavn_client = JioSaavn()
fn_decrypter = Functions()

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
}

def _clean_text(text: str) -> str:
    if not text:
        return ""
    return (
        text.replace("&quot;", '"')
            .replace("&amp;", "&")
            .replace("&#039;", "'")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
    )

def _get_direct_saavn_songs(query: str):
    """
    Direct HTTP request to JioSaavn API with browser User-Agent & DES stream decryption.
    Bypasses datacenter/cloud provider IP restrictions.
    """
    songs = []
    try:
        url = f"https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&q={urllib.parse.quote(query)}"
        resp = requests.get(url, headers=HEADERS, timeout=8)
        if resp.ok:
            data = resp.json()
            results = data.get("results", [])
            for s in results:
                more = s.get("more_info", {})
                enc_url = more.get("encrypted_media_url")
                if not enc_url:
                    continue
                try:
                    streams = fn_decrypter.decrypt_stream_url(enc_url, True)
                    audio_url = (
                        streams.get("very_high_quality") or
                        streams.get("high_quality") or
                        streams.get("medium_quality") or
                        streams.get("low_quality") or ""
                    )
                    if not audio_url:
                        continue
                    
                    image = s.get("image", "")
                    if image:
                        image = image.replace("150x150", "500x500").replace("50x50", "500x500")

                    primary_artists = more.get("artistMap", {}).get("primary_artists", [])
                    artist_name = (
                        ", ".join([a.get("name") for a in primary_artists if a.get("name")])
                        if primary_artists else (more.get("singers") or s.get("subtitle") or "Unknown Artist")
                    )

                    title = _clean_text(s.get("title", ""))
                    artist_name = _clean_text(artist_name)
                    album_name = _clean_text(more.get("album") or "Single")

                    songs.append({
                        "id": str(s.get("id", title)),
                        "title": title,
                        "artist": artist_name,
                        "album": album_name,
                        "duration": int(more.get("duration") or 180),
                        "cover_image": image or "img/music.svg",
                        "url": audio_url,
                        "folder": "search"
                    })
                except Exception as dec_err:
                    print(f"Decryption error for {s.get('title')}: {dec_err}")
    except Exception as e:
        print(f"Direct JioSaavn API search error: {e}")
    return songs

def _format_saavn_song(song):
    stream_urls = song.get("stream_urls", {})
    audio_url = (
        stream_urls.get("very_high_quality") or
        stream_urls.get("high_quality") or
        stream_urls.get("medium_quality") or
        stream_urls.get("low_quality") or ""
    )
    if not audio_url:
        return None

    thumbnails = song.get("thumbnails", [])
    cover_image = "img/music.svg"
    if isinstance(thumbnails, list) and len(thumbnails) > 0:
        cover_image = thumbnails[-1].get("link") or thumbnails[-1].get("url") or cover_image
    elif isinstance(thumbnails, dict):
        cover_image = thumbnails.get("high") or thumbnails.get("500x500") or cover_image

    return {
        "id": str(song.get("track_id", song.get("title"))),
        "title": _clean_text(song.get("title", "Unknown Title")),
        "artist": _clean_text(song.get("primary_artists") or song.get("artist") or "Unknown Artist"),
        "album": _clean_text(song.get("album_name") or "Single"),
        "duration": int(song.get("duration", 180)),
        "cover_image": cover_image,
        "url": audio_url,
        "folder": song.get("album_name", "search")
    }

@router.get("/api/fullsongs/search")
def search_full_songs(query: str):
    """
    Searches JioSaavn for full-length 320kbps audio tracks (2-6+ minutes).
    Uses a multi-tier fallback pipeline to guarantee full songs.
    """
    try:
        formatted_songs = []
        seen_ids = set()

        # Step 1: Direct JioSaavn HTTP API + DES Decryption (Primary & Most Reliable)
        direct_results = _get_direct_saavn_songs(query)
        for song in direct_results:
            if song["id"] not in seen_ids:
                seen_ids.add(song["id"])
                formatted_songs.append(song)

        # Step 2: jiosaavnpy client fallback if direct API returns low results
        if len(formatted_songs) < 3:
            try:
                results = jiosaavn_client.search_songs(query)
                for song in results:
                    formatted = _format_saavn_song(song)
                    if formatted and formatted["id"] not in seen_ids:
                        seen_ids.add(formatted["id"])
                        formatted_songs.append(formatted)
            except Exception as e:
                print(f"jiosaavnpy client search error: {e}")

        # Step 3: Fuzzy iTunes lookup -> JioSaavn stream resolution (for typo/artist matching)
        if len(formatted_songs) < 3:
            try:
                itunes_res = requests.get(
                    f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=6",
                    timeout=5
                )
                if itunes_res.ok:
                    itunes_data = itunes_res.json().get("results", [])
                    for item in itunes_data:
                        t_name = item.get("trackName")
                        a_name = item.get("artistName")
                        if not t_name:
                            continue
                        
                        # Resolve full JioSaavn song stream using exact iTunes metadata
                        resolved = resolve_full_song(t_name, a_name or "")
                        if resolved and resolved.get("success") and resolved.get("url"):
                            fallback_id = str(item.get("trackId", t_name))
                            if fallback_id not in seen_ids:
                                seen_ids.add(fallback_id)
                                formatted_songs.append({
                                    "id": fallback_id,
                                    "title": resolved.get("title") or t_name,
                                    "artist": resolved.get("artist") or a_name or "Unknown Artist",
                                    "album": item.get("collectionName") or "Single",
                                    "duration": resolved.get("duration") or 180,
                                    "cover_image": item.get("artworkUrl100", "img/music.svg").replace("100x100bb", "500x500bb"),
                                    "url": resolved["url"],
                                    "folder": "search"
                                })
            except Exception as itunes_err:
                print(f"iTunes fuzzy fallback error: {itunes_err}")

        return {"songs": formatted_songs}
    except Exception as e:
        print(f"Error in search_full_songs: {e}")
        return {"songs": []}

@router.get("/api/fullsongs/resolve")
def resolve_full_song(title: str, artist: str = ""):
    """
    Resolves a full JioSaavn 320kbps audio stream for any given track title and artist.
    """
    try:
        query_str = f"{title} {artist}".strip()

        # Step 1: Direct JioSaavn HTTP Search
        direct = _get_direct_saavn_songs(query_str)
        if direct and direct[0].get("url"):
            return {
                "success": True,
                "url": direct[0]["url"],
                "duration": direct[0]["duration"],
                "title": direct[0]["title"],
                "artist": direct[0]["artist"]
            }

        # Step 2: jiosaavn_client fallback
        results = jiosaavn_client.search_songs(query_str)
        if results:
            formatted = _format_saavn_song(results[0])
            if formatted and formatted.get("url"):
                return {
                    "success": True,
                    "url": formatted["url"],
                    "duration": formatted["duration"],
                    "title": formatted["title"],
                    "artist": formatted["artist"]
                }
    except Exception as e:
        print(f"Error resolving full song for {title}: {e}")

    return {"success": False, "url": ""}
