import { API_BASE_URL } from './config.js';

export async function fetchDeezerSearch(query, type = 'track') {
  try {
    const url = `${API_BASE_URL}/api/deezer/search${type !== 'track' ? '/' + type : ''}?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load Deezer ${type} search`);
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error("Deezer search fetch error:", err);
    return [];
  }
}

export async function fetchDeezerAlbum(albumId) {
  try {
    const url = `${API_BASE_URL}/api/deezer/album/${albumId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load Deezer album");
    return await response.json();
  } catch (err) {
    console.error("Deezer album fetch error:", err);
    return null;
  }
}

export async function fetchDeezerArtistAlbums(artistId) {
  try {
    const url = `${API_BASE_URL}/api/deezer/artist/${artistId}/albums`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load Deezer artist albums");
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error("Deezer artist albums fetch error:", err);
    return [];
  }
}

const FALLBACK_ALBUMS = [
  { folder: "karan aujla", title: "Karan Aujla Hits", description: "Best of Karan Aujla, Ikky & Deep Jandu", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg" },
  { folder: "diljit", title: "Diljit Dosanjh Essentials", description: "Lover, GOAT & Punjabi Blockbusters", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg" },
  { folder: "honey singh", title: "Yo Yo Honey Singh", description: "Desi Kalakaar, Blue Eyes & Classic Hits", cover_image: "https://c.saavncdn.com/173/GLORY-Hindi-2024-20250117161048-500x500.jpg" },
  { folder: "ap dillhon", title: "AP Dhillon & Gurinder Gill", description: "Brown Munde, Excuses & Insane Hits", cover_image: "https://c.saavncdn.com/587/Thodi-Si-Daaru-Punjabi-2025-20250717063530-500x500.jpg" },
  { folder: "talwinder", title: "Talwinder Melodies", description: "Deep Vibe, Dhundhala & Aesthetic Hits", cover_image: "https://c.saavncdn.com/065/Haseen-Punjabi-2025-20250217081851-500x500.jpg" },
  { folder: "sidhu moose wala", title: "Sidhu Moose Wala Legends", description: "295, The Last Ride & Punjabi Hip-Hop", cover_image: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg" },
  { folder: "arijit singh", title: "Arijit Singh Essentials", description: "Chaleya, Tum Hi Ho & Romantic Blockbusters", cover_image: "https://c.saavncdn.com/450/Gehra-Hua-From-Dhurandhar-Hindi-2025-20251205154217-500x500.jpg" },
  { folder: "vibes songs", title: "Chill Punjabi Lo-Fi", description: "Relaxing Beats, Late Night Punjabi Vibes", cover_image: "https://c.saavncdn.com/682/Punjabi-Chill-Vibes-Punjabi-2024-20240726152838-500x500.jpg" },
  { folder: "instagram trending", title: "Reels Viral Hits", description: "Soundtracks trending on Reels & TikTok", cover_image: "https://c.saavncdn.com/713/Sicario-Punjabi-2025-20250327070227-500x500.jpg" }
];

const FALLBACK_SONGS_MAP = {
  "karan aujla": [
    { id: "iMzGQX6_", title: "Softly", artist: "Karan Aujla, IKKY", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4", folder: "karan aujla" },
    { id: "DF6eazs2", title: "Winning Speech", artist: "Karan Aujla, MXRCI, Seshnolan", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4", folder: "karan aujla" },
    { id: "CVeqCCYc", title: "Tauba Tauba", artist: "Karan Aujla", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4", folder: "karan aujla" },
    { id: "vLSaC03b", title: "For A Reason", artist: "Karan Aujla, IKKY", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/621/59d7b22aeaa69bd8158c1852e0b556d3_320.mp4", folder: "karan aujla" },
    { id: "gwX71Dmc", title: "Wavy", artist: "Karan Aujla, Jay Trak", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/178/9af31095a56a0a124dee89ef89ffee5a_320.mp4", folder: "karan aujla" },
    { id: "X1qxz-Cc", title: "Boyfriend", artist: "Karan Aujla, IKKY", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/621/895e14c38bf774a0122eef2528b39272_320.mp4", folder: "karan aujla" }
  ],
  "arijit singh": [
    {
      "id": "arijit1",
      "title": "Chaleya",
      "artist": "Arijit Singh, Shilpa Rao",
      "album": "Jawan",
      "duration": 200,
      "cover_image": "https://c.saavncdn.com/450/Gehra-Hua-From-Dhurandhar-Hindi-2025-20251205154217-500x500.jpg",
      "url": "https://aac.saavncdn.com/348/182e01df0ecb4b39b56317bc2d2e1967_320.mp4",
      "file_path": "https://aac.saavncdn.com/348/182e01df0ecb4b39b56317bc2d2e1967_320.mp4",
      "folder": "arijit singh"
    },
    {
      "id": "arijit2",
      "title": "Tum Hi Ho",
      "artist": "Arijit Singh",
      "album": "Aashiqui 2",
      "duration": 262,
      "cover_image": "https://c.saavncdn.com/450/Gehra-Hua-From-Dhurandhar-Hindi-2025-20251205154217-500x500.jpg",
      "url": "https://aac.saavncdn.com/152/e0e0a5ccfb83e58c9735d6480b0051ec_320.mp4",
      "file_path": "https://aac.saavncdn.com/152/e0e0a5ccfb83e58c9735d6480b0051ec_320.mp4",
      "folder": "arijit singh"
    }
  ],
  "diljit": [
    { id: "M7k5t7vw", title: "Lover", artist: "Diljit Dosanjh", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg", url: "https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4", folder: "diljit" },
    { id: "nJ6Z-ayZ", title: "G.O.A.T.", artist: "Diljit Dosanjh", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg", url: "https://aac.saavncdn.com/597/ce842951d6cde3c4355046ca5e250809_320.mp4", folder: "diljit" },
    { id: "0Cu5Kha8", title: "Lemonade", artist: "Diljit Dosanjh", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg", url: "https://aac.saavncdn.com/467/c1f149509d4ee7d20c0c4474090ab5f1_320.mp4", folder: "diljit" },
    { id: "aAOXwvz-", title: "Born to Shine", artist: "Diljit Dosanjh", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg", url: "https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4", folder: "diljit" }
  ],
  "honey singh": [
    { id: "DWDSMHh7", title: "YoYo", artist: "R.S. Chauhan", cover_image: "https://c.saavncdn.com/173/GLORY-Hindi-2024-20250117161048-500x500.jpg", url: "https://aac.saavncdn.com/144/ab475350ef2b43b75a24d3d720aaa7a4_320.mp4", folder: "honey singh" },
    { id: "GbaIdJ48", title: "Desi Kalakaar", artist: "Yo Yo Honey Singh", cover_image: "https://c.saavncdn.com/173/GLORY-Hindi-2024-20250117161048-500x500.jpg", url: "https://aac.saavncdn.com/304/f31ba5ffe986d0feb95b3059ad05f4d5_320.mp4", folder: "honey singh" },
    { id: "D6K-hfED", title: "Love Dose", artist: "Yo Yo Honey Singh", cover_image: "https://c.saavncdn.com/173/GLORY-Hindi-2024-20250117161048-500x500.jpg", url: "https://aac.saavncdn.com/304/ed6b172300cca9a418be31a511728f81_320.mp4", folder: "honey singh" }
  ],
  "ap dillhon": [
    { id: "xzUVX40K", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", cover_image: "https://c.saavncdn.com/587/Thodi-Si-Daaru-Punjabi-2025-20250717063530-500x500.jpg", url: "https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4", folder: "ap dillhon" },
    { id: "LuXIJGPC", title: "Insane", artist: "AP Dhillon", cover_image: "https://c.saavncdn.com/587/Thodi-Si-Daaru-Punjabi-2025-20250717063530-500x500.jpg", url: "https://aac.saavncdn.com/851/23ba415310e4b119a8452cba3cbbf509_320.mp4", folder: "ap dillhon" },
    { id: "fHcI5Kka", title: "With You", artist: "AP Dhillon", cover_image: "https://c.saavncdn.com/587/Thodi-Si-Daaru-Punjabi-2025-20250717063530-500x500.jpg", url: "https://aac.saavncdn.com/671/50b256cc8e60dc8b0243f5e0767e8467_320.mp4", folder: "ap dillhon" }
  ],
  "sidhu moose wala": [
    { id: "295_sidhu", title: "295", artist: "Sidhu Moose Wala", cover_image: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg", url: "https://aac.saavncdn.com/181/bbfd55734e73fce850122941aa0c1eeb_320.mp4", folder: "sidhu moose wala" },
    { id: "last_ride_sidhu", title: "The Last Ride", artist: "Sidhu Moose Wala, Wazir Patar", cover_image: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg", url: "https://aac.saavncdn.com/027/3f0447fa4ff5f04b200b3e64d04826b5_320.mp4", folder: "sidhu moose wala" },
    { id: "so_high_sidhu", title: "So High", artist: "Sidhu Moose Wala, BYG BYRD", cover_image: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg", url: "https://aac.saavncdn.com/838/0879c3a37fc68ff9caeb2405ed746816_320.mp4", folder: "sidhu moose wala" }
  ],
  "talwinder": [
    { id: "mk0bUMgA", title: "Khayaal", artist: "Talwiinder", cover_image: "https://c.saavncdn.com/065/Haseen-Punjabi-2025-20250217081851-500x500.jpg", url: "https://aac.saavncdn.com/482/c9b917787fdd221283bcb11884f4184d_320.mp4", folder: "talwinder" },
    { id: "U9amhr5-", title: "Dhundhala", artist: "Talwiinder", cover_image: "https://c.saavncdn.com/065/Haseen-Punjabi-2025-20250217081851-500x500.jpg", url: "https://aac.saavncdn.com/965/212f0dd59e13c060347033940b6fc552_320.mp4", folder: "talwinder" }
  ],
  "vibes songs": [
    { id: "B4NcKCxa", title: "softly lofi", artist: "Aiden Yoo", cover_image: "https://c.saavncdn.com/682/Punjabi-Chill-Vibes-Punjabi-2024-20240726152838-500x500.jpg", url: "https://aac.saavncdn.com/621/50001be791999fcce90dcb3449494985_320.mp4", folder: "vibes songs" },
    { id: "y4MGaPi7", title: "Pasoori (Lofi Mix)", artist: "Unico Vibe A1", cover_image: "https://c.saavncdn.com/682/Punjabi-Chill-Vibes-Punjabi-2024-20240726152838-500x500.jpg", url: "https://aac.saavncdn.com/534/75e8cece32fe2949149c721b86a201a7_320.mp4", folder: "vibes songs" }
  ],
  "instagram trending": [
    { id: "CVeqCCYc", title: "Tauba Tauba", artist: "Karan Aujla", cover_image: "https://c.saavncdn.com/713/Sicario-Punjabi-2025-20250327070227-500x500.jpg", url: "https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4", folder: "instagram trending" },
    { id: "q7nvYeRF", title: "Big Dawgs", artist: "Hanumankind, Kalmi", cover_image: "https://c.saavncdn.com/713/Sicario-Punjabi-2025-20250327070227-500x500.jpg", url: "https://aac.saavncdn.com/883/c0a119218206e3e43e2496dc0f2d8d7e_320.mp4", folder: "instagram trending" },
    { id: "DF6eazs2", title: "Winning Speech", artist: "Karan Aujla, MXRCI, Seshnolan", cover_image: "https://c.saavncdn.com/713/Sicario-Punjabi-2025-20250327070227-500x500.jpg", url: "https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4", folder: "instagram trending" }
  ]
};

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

export async function fetchAlbums(searchTerm = "") {
  try {
    let url = `${API_BASE_URL}/api/albums`;
    if (searchTerm) {
      url += `?name=${encodeURIComponent(searchTerm)}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch local albums`);
    const data = await response.json();
    const fetched = (data.albums || []).map(album => {
      let cover = album.cover_image || "img/music.svg";
      if (cover !== "img/music.svg" && !cover.startsWith("http")) {
        cover = API_BASE_URL + (cover.startsWith("/") ? "" : "/") + cover;
      }
      return {
        folder: album.folder,
        title: album.title,
        description: album.description || "Unknown",
        cover_image: cover
      };
    });
    return fetched.length > 0 ? fetched : FALLBACK_ALBUMS;
  } catch (err) {
    console.warn("Local albums fetch fallback used:", err.message);
    return FALLBACK_ALBUMS;
  }
}

export async function fetchSongs(folder) {
  try {
    const url = `${API_BASE_URL}/api/songs?folder=${encodeURIComponent(folder)}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch local songs`);
    const data = await response.json();


    const result = (data.songs || []).map(song => {
      let cover = song.cover_image || "img/music.svg";
      if (cover !== "img/music.svg" && !cover.startsWith("http")) {
        cover = API_BASE_URL + (cover.startsWith("/") ? "" : "/") + cover;
      }
      let songUrl = song.file_path || song.url || "";
      if (songUrl && !songUrl.startsWith("http")) {
        songUrl = API_BASE_URL + (songUrl.startsWith("/") ? "" : "/") + songUrl;
      }

      return {
        id: song._id || song.id || song.title,
        title: song.title,
        artist: song.artist || "Unknown Artist",
        album: song.album || folder,
        cover_image: cover,
        url: songUrl,
        folder: song.folder || folder
      };
    });

    if (result.length > 0) return result;
  } catch (err) {
    console.warn("Local songs fetch fallback used for folder:", folder);
  }

  const key = folder ? folder.toLowerCase().trim() : "";
  if (FALLBACK_SONGS_MAP[key]) {
    return FALLBACK_SONGS_MAP[key];
  }
  // Try finding matching key partially
  for (const k in FALLBACK_SONGS_MAP) {
    if (k.includes(key) || key.includes(k)) {
      return FALLBACK_SONGS_MAP[k];
    }
  }
  return FALLBACK_SONGS_MAP["daily mix"] || [];
}
