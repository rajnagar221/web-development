import json

with open('full_songs_generated.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

result_map = data['map']
all_songs = data['songs']

# Update db.json
with open('db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

db['songs'] = all_songs

with open('db.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=4)

print("Updated backend/db.json with full songs!")

# Generate JS code for frontend/js/modules/api.js
js_code = "const FALLBACK_SONGS_MAP = {\n"
for folder, songs in result_map.items():
    js_code += f'  "{folder}": [\n'
    for s in songs:
        js_code += f'    {{ id: "{s["id"]}", title: {json.dumps(s["title"])}, artist: {json.dumps(s["artist"])}, cover_image: {json.dumps(s["cover_image"])}, url: {json.dumps(s["url"])}, folder: "{s["folder"]}" }},\n'
    js_code += '  ],\n'
js_code += "};\n"

with open('api_fallback_map.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Generated api_fallback_map.js for frontend!")
