import urllib.parse
import requests
import base64
from fastapi import APIRouter, HTTPException
from app.database import songs_collection

# Safe optional import of jiosaavnpy
try:
    from jiosaavnpy import JioSaavn
    from jiosaavnpy.functions import Functions
    jiosaavn_client = JioSaavn()
    fn_decrypter = Functions()
except Exception as _import_err:
    jiosaavn_client = None
    fn_decrypter = None
    print(f"[Warning] jiosaavnpy package not active ({_import_err}). Using direct API fallbacks.")

router = APIRouter()

def _decrypt_stream_url(enc_url: str) -> dict:
    if fn_decrypter:
        try:
            return fn_decrypter.decrypt_stream_url(enc_url, True)
        except Exception:
            pass
    try:
        from Crypto.Cipher import DES
        cipher = DES.new(b"38586bea", DES.MODE_ECB)
        enc_bytes = base64.b64decode(enc_url.strip())
        dec_bytes = cipher.decrypt(enc_bytes)
        padding_len = dec_bytes[-1]
        if isinstance(padding_len, int) and 1 <= padding_len <= 8:
            dec_bytes = dec_bytes[:-padding_len]
        dec_str = dec_bytes.decode('utf-8', errors='ignore').strip()
        high_url = dec_str.replace("_96.mp3", "_320.mp3").replace("_160.mp3", "_320.mp3")
        med_url = dec_str.replace("_96.mp3", "_160.mp3")
        return {
            "very_high_quality": high_url,
            "high_quality": dec_str,
            "medium_quality": med_url,
            "low_quality": dec_str
        }
    except Exception as e:
        print(f"Fallback decryption error: {e}")
        return {}


HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
}

def _is_network_error(exc: Exception) -> bool:
    err_str = str(exc)
    return any(keyword in err_str for keyword in [
        "NameResolutionError", "getaddrinfo failed", "Failed to resolve",
        "Max retries exceeded", "ConnectionError", "ConnectTimeout", "SSLError"
    ]) or isinstance(exc, (requests.exceptions.ConnectionError, requests.exceptions.Timeout))

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
    Returns (songs, is_offline).
    """
    songs = []
    is_offline = False
    try:
        url = f"https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&q={urllib.parse.quote(query)}"
        resp = requests.get(url, headers=HEADERS, timeout=4)
        if resp.ok:
            data = resp.json()
            results = data.get("results", [])
            for s in results:
                more = s.get("more_info", {})
                enc_url = more.get("encrypted_media_url")
                if not enc_url:
                    continue
                try:
                    streams = _decrypt_stream_url(enc_url)
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
        if _is_network_error(e):
            is_offline = True
            print(f"[Network Warning] JioSaavn API offline or host resolution failed.")
        else:
            print(f"Direct JioSaavn API search error: {e}")
    return songs, is_offline

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
    Uses a multi-tier fallback pipeline with offline DB fallback to guarantee songs.
    """
    try:
        formatted_songs = []
        seen_ids = set()

        # Step 1: Direct JioSaavn HTTP API + DES Decryption (Primary & Most Reliable)
        direct_results, is_offline = _get_direct_saavn_songs(query)
        for song in direct_results:
            if song["id"] not in seen_ids:
                seen_ids.add(song["id"])
                formatted_songs.append(song)

        # Step 2: jiosaavnpy client fallback if online and direct API returned low results
        if not is_offline and len(formatted_songs) < 3 and jiosaavn_client:
            try:
                results = jiosaavn_client.search_songs(query)
                for song in results:
                    formatted = _format_saavn_song(song)
                    if formatted and formatted["id"] not in seen_ids:
                        seen_ids.add(formatted["id"])
                        formatted_songs.append(formatted)
            except Exception as e:
                if _is_network_error(e):
                    is_offline = True
                else:
                    print(f"jiosaavnpy client search error: {e}")

        # Step 3: Fuzzy iTunes lookup -> JioSaavn stream resolution (if online & low results)
        if not is_offline and len(formatted_songs) < 3:
            try:
                itunes_res = requests.get(
                    f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=6",
                    timeout=3
                )
                if itunes_res.ok:
                    itunes_data = itunes_res.json().get("results", [])
                    for item in itunes_data:
                        t_name = item.get("trackName")
                        a_name = item.get("artistName")
                        if not t_name:
                            continue
                        
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
                if not _is_network_error(itunes_err):
                    print(f"iTunes fuzzy fallback error: {itunes_err}")

        # Step 4: Local Database Fallback (MongoDB / local db.json) when offline or online API returns empty
        if not formatted_songs:
            try:
                local_songs = list(songs_collection.find({
                    "$or": [
                        {"title": {"$regex": query, "$options": "i"}},
                        {"artist": {"$regex": query, "$options": "i"}},
                        {"album": {"$regex": query, "$options": "i"}},
                        {"folder": {"$regex": query, "$options": "i"}}
                    ]
                }, {"_id": 0}))
                for s in local_songs:
                    song_id = str(s.get("id") or s.get("_id") or s.get("title"))
                    if song_id not in seen_ids:
                        seen_ids.add(song_id)
                        formatted_songs.append({
                            "id": song_id,
                            "title": _clean_text(s.get("title", "Unknown Title")),
                            "artist": _clean_text(s.get("artist", "Unknown Artist")),
                            "album": _clean_text(s.get("album", "Single")),
                            "duration": int(s.get("duration") or 180),
                            "cover_image": s.get("cover_image") or "img/music.svg",
                            "url": s.get("url") or s.get("file_path") or "",
                            "folder": s.get("folder", "search")
                        })
            except Exception as db_err:
                print(f"Local DB fallback search error: {db_err}")

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
        direct, is_offline = _get_direct_saavn_songs(query_str)
        if direct and direct[0].get("url"):
            return {
                "success": True,
                "url": direct[0]["url"],
                "duration": direct[0]["duration"],
                "title": direct[0]["title"],
                "artist": direct[0]["artist"],
                "cover_image": direct[0].get("cover_image")
            }

        # Step 2: jiosaavn_client fallback if online
        if not is_offline and jiosaavn_client:
            try:
                results = jiosaavn_client.search_songs(query_str)
                if results:
                    formatted = _format_saavn_song(results[0])
                    if formatted and formatted.get("url"):
                        return {
                            "success": True,
                            "url": formatted["url"],
                            "duration": formatted["duration"],
                            "title": formatted["title"],
                            "artist": formatted["artist"],
                            "cover_image": formatted.get("cover_image")
                        }
            except Exception as exc:
                if not _is_network_error(exc):
                    print(f"Error resolving full song for {title}: {exc}")
    except Exception as e:
        if not _is_network_error(e):
            print(f"Error resolving full song for {title}: {e}")

ONLINE_VIBE_POOLS = {
    "old": [
        "90s hindi romantic hits", "kishore kumar classic hits", "lata mangeshkar retro songs",
        "kumar sanu 90s songs", "80s 90s bollywood classics", "rd burman hit songs",
        "alka yagnik romantic hits", "mohammad rafi evergreen", "mukesh classic ghazals"
    ],
    "trending": [
        "top trending hindi songs 2024", "latest punjabi party hits", "viral reels trending songs",
        "bollywood chartbusters 2024", "top indian pop songs", "new punjabi chartbusters",
        "latest romantic bollywood", "top reels audio 2024"
    ],
    "lofi": [
        "punjabi lofi songs", "hindi lofi chill beats", "aesthetic lofi songs",
        "late night lofi hindi", "slowed reverb hindi hits"
    ],
    "romantic": [
        "arijit singh romantic hits", "shreya ghoshal love songs", "pritam romantic hits",
        "atif aslam love songs", "jubin nautiyal hits"
    ],
    "party": [
        "badshah party hits", "yo yo honey singh party", "top edm gaming beats",
        "high energy gym punjabi", "party mashup 2024"
    ]
}

@router.get("/api/fullsongs/recommend")
def recommend_full_songs(title: str = "", artist: str = "", query: str = ""):
    """
    Spotify-style Global Online Radio Recommendation Engine.
    Fetches FRESH random songs directly from online JioSaavn/iTunes APIs across the web.
    """
    try:
        import random
        combined = f"{query} {title} {artist}".strip().lower()
        search_queries = []

        # Determine Vibe Pool
        if any(k in combined for k in ["old", "90s", "80s", "retro", "kishore", "lata", "rafi", "mukesh", "ghazal", "classic", "kumar sanu", "alka"]):
            search_queries = random.sample(ONLINE_VIBE_POOLS["old"], min(3, len(ONLINE_VIBE_POOLS["old"])))

        elif any(k in combined for k in ["trending", "viral", "reels", "top", "latest", "chartbuster", "bad newz", "tauba"]):
            search_queries = random.sample(ONLINE_VIBE_POOLS["trending"], min(3, len(ONLINE_VIBE_POOLS["trending"])))

        elif any(k in combined for k in ["lofi", "lo-fi", "chill", "vibes", "midnight", "relax"]):
            search_queries = random.sample(ONLINE_VIBE_POOLS["lofi"], min(3, len(ONLINE_VIBE_POOLS["lofi"])))

        elif any(k in combined for k in ["sad", "love", "romantic", "dil"]):
            search_queries = random.sample(ONLINE_VIBE_POOLS["romantic"], min(3, len(ONLINE_VIBE_POOLS["romantic"])))

        elif artist and artist.lower() not in ["unknown artist", "artist", "ncs"]:
            primary_artist = artist.split(",")[0].strip()
            search_queries = [
                f"{primary_artist} top songs",
                f"best of {primary_artist}",
                f"{primary_artist} hit songs",
                f"songs like {primary_artist}"
            ]
        else:
            # Random global mix from trending & romantic pools
            all_pools = ONLINE_VIBE_POOLS["trending"] + ONLINE_VIBE_POOLS["romantic"] + ONLINE_VIBE_POOLS["party"]
            search_queries = random.sample(all_pools, min(3, len(all_pools)))

        recommended = []
        seen_ids = set()
        title_lower = title.lower().strip()

        # Execute online queries across JioSaavn
        for q in search_queries:
            online_results, is_offline = _get_direct_saavn_songs(q)
            if not online_results and not is_offline and jiosaavn_client:
                # Client fallback
                try:
                    res = jiosaavn_client.search_songs(q)
                    for r in res:
                        fmt = _format_saavn_song(r)
                        if fmt:
                            online_results.append(fmt)
                except Exception:
                    pass

            for s in online_results:
                s_title = s.get("title", "").lower().strip()
                if s["id"] not in seen_ids and s_title != title_lower and s.get("url"):
                    seen_ids.add(s["id"])
                    recommended.append(s)
                if len(recommended) >= 15:
                    break
            if len(recommended) >= 15:
                break

        # Shuffle recommended list for fresh random feel
        random.shuffle(recommended)
        return {"songs": recommended}
    except Exception as e:
        print(f"Error in recommend_full_songs: {e}")
        return {"songs": []}

