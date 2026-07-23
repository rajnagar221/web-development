import sys, json, requests
sys.path.append('backend')

# Use JioSaavn API to fetch Arijit Singh
query = 'arijit singh'
res_raw = requests.get(f'https://saavn.dev/api/search/songs?query={query}&limit=5')
res = res_raw.json() if res_raw.status_code == 200 else None
if not res or 'data' not in res or not res['data']['results']:
    print("Failed to fetch from JioSaavn")
    sys.exit(1)

new_songs = []
for s in res['data']['results']:
    hq_url = s['downloadUrl'][-1]['link'] if s.get('downloadUrl') else None
    if not hq_url: continue
    art = s['image'][-1]['link'] if s.get('image') else ''
    new_songs.append({
        'id': s['id'],
        'title': s['name'],
        'artist': 'Arijit Singh',
        'album': s.get('album', {}).get('name', 'Single'),
        'duration': int(s.get('duration', 0)),
        'cover_image': art,
        'url': hq_url,
        'file_path': hq_url,
        'folder': 'arijit singh'
    })

print(f"Fetched {len(new_songs)} songs for Arijit Singh")

# Update db.json
db_path = 'backend/db.json'
with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Remove daily mix songs
data['songs'] = [s for s in data.get('songs', []) if s.get('folder') != 'daily mix']
data['songs'].extend(new_songs)

# Replace daily mix album
for a in data.get('albums', []):
    if a['folder'] == 'daily mix':
        a['title'] = 'Arijit Singh Hits'
        a['folder'] = 'arijit singh'
        a['description'] = 'Arijit Singh, Pritam, Shreya Ghoshal'
        a['cover_image'] = new_songs[0]['cover_image'] if new_songs else ''

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)

# Also update full_songs_generated.json just in case
gen_path = 'backend/full_songs_generated.json'
with open(gen_path, 'r', encoding='utf-8') as f:
    gen_data = json.load(f)
gen_data['songs'] = [s for s in gen_data.get('songs', []) if s.get('folder') != 'daily mix']
gen_data['songs'].extend(new_songs)
with open(gen_path, 'w', encoding='utf-8') as f:
    json.dump(gen_data, f, indent=4)

print("Updated JSON files. Now run python backend/populate_db.py to update MongoDB.")
