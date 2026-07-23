import os
import json
import uuid
import re
from pymongo import MongoClient
from app.config import MONGO_URL

class JSONCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name

    def _get_data(self):
        data = self.db._load_data()
        if self.name not in data:
            data[self.name] = []
            self.db._save_data(data)
        return data[self.name]

    def _save_data(self, data):
        all_data = self.db._load_data()
        all_data[self.name] = data
        self.db._save_data(all_data)

    def find_one(self, query):
        data = self._get_data()
        for doc in data:
            if self._match(doc, query):
                return doc.copy()
        return None

    def find(self, query=None, projection=None):
        if query is None:
            query = {}
        data = self._get_data()
        results = []
        for doc in data:
            if self._match(doc, query):
                res = doc.copy()
                if projection:
                    for k, v in list(projection.items()):
                        if v == 0 and k in res:
                            del res[k]
                results.append(res)
        return results

    def insert_one(self, doc):
        data = self._get_data()
        doc_copy = doc.copy()
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        data.append(doc_copy)
        self._save_data(data)
        
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    def update_one(self, query, update):
        data = self._get_data()
        updated = False
        for doc in data:
            if self._match(doc, query):
                if "$set" in update:
                    for k, v in update["$set"].items():
                        doc[k] = v
                    updated = True
                    break
        if updated:
            self._save_data(data)
        return updated

    def delete_many(self, query):
        data = self._get_data()
        initial_len = len(data)
        data = [doc for doc in data if not self._match(doc, query)]
        if len(data) != initial_len:
            self._save_data(data)

    def _match(self, doc, query):
        for k, v in query.items():
            if k == "$or":
                match_any = False
                for sub_query in v:
                    if self._match(doc, sub_query):
                        match_any = True
                        break
                if not match_any:
                    return False
            else:
                doc_val = doc.get(k)
                if isinstance(v, re.Pattern) or hasattr(v, 'search'):
                    if not v.search(str(doc_val or "")):
                        return False
                elif isinstance(v, dict):
                    if "$regex" in v:
                        pattern = v["$regex"]
                        flags = 0
                        if "i" in v.get("$options", ""):
                            flags = re.IGNORECASE
                        if not re.search(pattern, str(doc_val or ""), flags):
                            return False
                else:
                    if str(doc_val or "").lower() != str(v or "").lower():
                        return False
        return True

class JSONDatabase:
    def __init__(self, filepath):
        self.filepath = filepath
        if not os.path.exists(self.filepath):
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump({}, f)

    def _load_data(self):
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_data(self, data):
        try:
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"Error saving database: {e}")

    def __getitem__(self, name):
        return JSONCollection(self, name)


# Initialize connection
try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=2000)
    client.admin.command("ping")
    print("[OK] MongoDB connected successfully")
    db = client["spotify_clone"]
except Exception as e:
    print(f"[WARNING] MongoDB connection failed, falling back to local JSON database. Error: {e}")
    db = JSONDatabase(os.path.join(os.path.dirname(__file__), "..", "db.json"))

users_collection = db["users"]
songs_collection = db["songs"]
playlists_collection = db["playlists"]
albums_collection = db["albums"]
