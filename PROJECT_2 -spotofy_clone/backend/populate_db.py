import os
import json
from pymongo import MongoClient
from datetime import datetime

# Connect to MongoDB
try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    print("[OK] MongoDB Connected Successfully")
    db = client["spotify_clone"]
except Exception as e:
    print(f"[WARNING] MongoDB Connection Error: {e}. Seeding local JSON database instead...")
    from app.database import JSONDatabase
    db = JSONDatabase(os.path.join(os.path.dirname(__file__), "db.json"))

songs_collection = db["songs"]
playlists_collection = db["playlists"]
albums_collection = db["albums"]

# Clear existing data
songs_collection.delete_many({})
playlists_collection.delete_many({})
albums_collection.delete_many({})

# Base path for songs
songs_base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "songs"))

# Playlist data
playlists_data = [
    {
        "name": "Daily mix",
        "description": "mix songs",
        "songs": []
    },
]
# Function to get artist name from folder
def get_artist_from_folder(folder_name):
    artist_map = {
        "ncs": "NCS",
        "karan aujla": "Karan Aujla",
        "daily mix": "Various Artists",
        "Diljit": "Diljit Dosanjh",
        "honey singh": "Honey Singh",
        "instagram trending": "Various Artists",
        "vibes songs": "Various Artists",
        "Ap dillhon": "AP Dhillon",
        "talwinder": "Talwinder"
    }
    return artist_map.get(folder_name, "Unknown Artist")

# Function to get genre from folder
def get_genre_from_folder(folder_name):
    genre_map = {
        "ncs": "Electronic",
        "karan aujla": "Hip-Hop/Rap",
        "daily mix": "Mixed",
        "Diljit": "Hip-Hop/Rap",
        "honey singh": "Hip-Hop/Rap",
        "instagram trending": "Pop",
        "vibes songs": "Mixed",
        "Ap dillhon": "Hip-Hop/Rap",
        "talwinder": "Hip-Hop/Rap"
    }
    return genre_map.get(folder_name, "Unknown")

# Scan and add songs
song_ids = []
folders = ["ncs", "karan aujla", "daily mix", "Diljit", "honey singh", "instagram trending", "vibes songs", "Ap dillhon", "talwinder"]

for folder in folders:
    folder_path = os.path.join(songs_base_path, folder)
    if not os.path.exists(folder_path):
        print(f"Folder not found: {folder_path}")
        continue

    # Read playlist info
    info_file = os.path.join(folder_path, "info.json")
    playlist_info = {}
    if os.path.exists(info_file):
        try:
            with open(info_file, 'r', encoding='utf-8') as f:
                playlist_info = json.load(f)
        except:
            print(f"Could not read info.json for {folder}")

    # Save album data to MongoDB
    # Find cover image - support jpg, png, webp, etc.
    cover_image = playlist_info.get('cover_image', None)
    if not cover_image:
        cover_path = os.path.join(folder_path, 'cover.jpg')
        if not os.path.exists(cover_path):
            # Find any image file
            image_files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.png', '.webp', '.jpeg', '.gif'))]
            if image_files:
                cover_image = image_files[0]
            else:
                cover_image = 'cover.jpg'  # fallback
        else:
            cover_image = 'cover.jpg'
    
    album_data = {
        "folder": folder,
        "title": playlist_info.get("title", folder),
        "description": playlist_info.get("description", f"Enjoy songs from {folder}"),
        "cover_image": f"/songs/{folder}/{cover_image}"
    }
    albums_collection.insert_one(album_data)
    print(f"Added album: {album_data['title']}")

    # Get all MP3 files
    mp3_files = [f for f in os.listdir(folder_path) if f.endswith('.mp3')]

    for mp3_file in mp3_files:
        song_data = {
            "title": mp3_file.replace('.mp3', ''),
            "artist": get_artist_from_folder(folder),
            "album": playlist_info.get("title", folder),
            "duration": None,  # Will be calculated when played
            "file_path": f"/songs/{folder}/{mp3_file}",
            "genre": get_genre_from_folder(folder),
            "cover_image": f"/songs/{folder}/{cover_image}",
            "folder": folder
        }

        # Insert song
        result = songs_collection.insert_one(song_data)
        song_id = str(result.inserted_id)
        song_ids.append(song_id)

        print(f"Added song: {song_data['title']} by {song_data['artist']}")

# Create playlists
for i, playlist_data in enumerate(playlists_data):
    # Assign some songs to each playlist (for demo purposes)
    start_idx = i * 2
    end_idx = min(start_idx + 3, len(song_ids))
    playlist_data["songs"] = song_ids[start_idx:end_idx]

    result = playlists_collection.insert_one(playlist_data)
    print(f"Created playlist: {playlist_data['name']}")

print(f"\n[OK] Successfully added {len(song_ids)} songs to MongoDB")
print(f"[OK] Successfully created {len(playlists_data)} playlists")
print(f"[OK] Successfully added {len(folders)} albums")

# Close connection
client.close()