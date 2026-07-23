import os
import json
from pymongo import MongoClient

# Connect to MongoDB if available, otherwise JSON database
try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    print("[OK] MongoDB Connected Successfully")
    db = client["spotify_clone"]
    is_mongo = True
except Exception as e:
    print(f"[WARNING] MongoDB Connection Error: {e}. Seeding local JSON database instead...")
    from app.database import JSONDatabase
    db = JSONDatabase(os.path.join(os.path.dirname(__file__), "db.json"))
    is_mongo = False

songs_collection = db["songs"]
playlists_collection = db["playlists"]
albums_collection = db["albums"]

# Load reference db.json data
db_json_path = os.path.join(os.path.dirname(__file__), "db.json")
if os.path.exists(db_json_path):
    with open(db_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
else:
    gen_path = os.path.join(os.path.dirname(__file__), "full_songs_generated.json")
    with open(gen_path, 'r', encoding='utf-8') as f:
        gen_data = json.load(f)
        data = {"albums": [], "songs": gen_data["songs"]}

if is_mongo:
    # Clear existing data in MongoDB
    songs_collection.delete_many({})
    playlists_collection.delete_many({})
    albums_collection.delete_many({})

    # Seed albums
    albums_list = data.get("albums", [])
    if albums_list:
        albums_collection.insert_many(albums_list)
        print(f"Added {len(albums_list)} albums to MongoDB")

    # Seed songs
    songs_list = data.get("songs", [])
    if songs_list:
        songs_collection.insert_many(songs_list)
        print(f"Added {len(songs_list)} songs to MongoDB")

    print("[OK] MongoDB successfully populated with full albums & songs dataset!")
    client.close()
else:
    print("[OK] db.json is already populated and up to date.")