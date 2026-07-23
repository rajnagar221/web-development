import json
from jiosaavnpy import JioSaavn

api = JioSaavn()

folders_queries = {
    'karan aujla': ['Softly Karan Aujla', 'Winning Speech Karan Aujla', 'Tauba Tauba Karan Aujla', 'For A Reason Karan Aujla', 'Wavy Karan Aujla', 'Boyfriend Karan Aujla'],
    'daily mix': ['Still Rollin Shubh', 'Cheques Shubh', 'Baller Shubh', 'No Love Shubh'],
    'diljit': ['Lover Diljit Dosanjh', 'GOAT Diljit Dosanjh', 'Lemonade Diljit Dosanjh', 'Born to Shine Diljit Dosanjh'],
    'honey singh': ['Blue Eyes Yo Yo Honey Singh', 'Desi Kalakaar Yo Yo Honey Singh', 'Love Dose Yo Yo Honey Singh'],
    'ap dillhon': ['Brown Munde AP Dhillon', 'Insane AP Dhillon', 'With You AP Dhillon'],
    'ncs': ['Faded Alan Walker', 'Spectre Alan Walker', 'Invincible DEAF KEV', 'Sky High Elektronomia'],
    'talwinder': ['Khayaal Talwiinder', 'Dhundhala Talwiinder'],
    'vibes songs': ['Softly Lofi', 'Brown Munde Lofi', 'Pasoori Lofi'],
    'instagram trending': ['Tauba Tauba Karan Aujla', 'Big Dawgs Hanumankind', 'Winning Speech Karan Aujla']
}

result_map = {}
all_db_songs = []

for folder, queries in folders_queries.items():
    result_map[folder] = []
    print(f"Fetching full songs for category: {folder}")
    for q in queries:
        try:
            res = api.search_songs(q)
            if res:
                s = res[0]
                stream_urls = s.get('stream_urls', {})
                url = (stream_urls.get('very_high_quality') or 
                       stream_urls.get('high_quality') or 
                       stream_urls.get('medium_quality') or 
                       stream_urls.get('low_quality') or '')
                
                thumbnails = s.get('thumbnails', [])
                cover = 'img/music.svg'
                if isinstance(thumbnails, list) and len(thumbnails) > 0:
                    cover = thumbnails[-1].get('link') or thumbnails[-1].get('url') or cover
                elif isinstance(thumbnails, dict):
                    cover = thumbnails.get('high') or thumbnails.get('500x500') or cover

                track_item = {
                    'id': str(s.get('track_id', s.get('title'))),
                    'title': s.get('title', q),
                    'artist': s.get('primary_artists') or 'Various Artists',
                    'album': s.get('album_name') or folder,
                    'duration': int(s.get('duration', 180)),
                    'cover_image': cover,
                    'url': url,
                    'file_path': url,
                    'folder': folder
                }
                result_map[folder].append(track_item)
                all_db_songs.append(track_item)
                print(f"  [OK] {track_item['title']} - {track_item['duration']}s ({track_item['artist']})")
        except Exception as err:
            print(f"  [ERR] Failed for {q}: {err}")

with open('full_songs_generated.json', 'w', encoding='utf-8') as f:
    json.dump({'map': result_map, 'songs': all_db_songs}, f, indent=2)

print("\nDone generating full songs JSON!")
