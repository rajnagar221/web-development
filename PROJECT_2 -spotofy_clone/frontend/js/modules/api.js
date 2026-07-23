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
  { folder: "karan aujla", title: "Karan Aujla Hits", description: "Best of Karan Aujla, Ikky & Deep Jandu", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg" },
  { folder: "diljit", title: "Diljit Dosanjh Essentials", description: "Lover, GOAT & Punjabi Blockbusters", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg" },
  { folder: "honey singh", title: "Yo Yo Honey Singh", description: "Desi Kalakaar, Blue Eyes & Classic Hits", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b3/b5/d9/b3b5d986-7f6d-a860-b8aa-769e1eef1a92/8902894356299_cover.jpg/500x500bb.jpg" },
  { folder: "ap dillhon", title: "AP Dhillon & Gurinder Gill", description: "Brown Munde, Excuses & Insane Hits", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/ac/00/5aac005f-9403-70e4-bce0-cf452017476e/197189606472.jpg/500x500bb.jpg" },
  { folder: "talwinder", title: "Talwinder Melodies", description: "Deep Vibe, Dhundhala & Aesthetic Hits", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4d/62/fd/4d62fd50-5bb8-4449-7a07-27a749dbde66/25UMGIM53708.rgb.jpg/500x500bb.jpg" },
  { folder: "ncs", title: "Electronic NCS Mix", description: "Faded, Specter & High Energy Gaming Beats", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/e7/c2/46e7c2f3-19b0-8d25-971b-a8b378916a87/artwork.jpg/500x500bb.jpg" },
  { folder: "vibes songs", title: "Chill Punjabi Lo-Fi", description: "Relaxing Beats, Late Night Punjabi Vibes", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3f/d2/f9/3fd2f999-c2c2-4fe6-ecc3-1d30f38904bd/859777326048_cover.jpg/500x500bb.jpg" },
  { folder: "instagram trending", title: "Reels Viral Hits", description: "Soundtracks trending on Reels & TikTok", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/33/58/1a/33581a2a-1b7d-e139-5cb8-0feb931981c9/Lohri3000.jpg/500x500bb.jpg" },
  { folder: "arijit singh", title: "Arijit Singh Hits", description: "Arijit Singh, Pritam, Shreya Ghoshal", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/a4/a409a4eb-485a-0d85-efc2-127db835e589/8902894541701_cover.jpg/500x500bb.jpg" }
];

const FALLBACK_SONGS_MAP = {
  "karan aujla": [
    { id: "iMzGQX6_", title: "Softly", artist: "Karan Aujla, IKKY", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4", folder: "karan aujla" },
    { id: "DF6eazs2", title: "Winning Speech", artist: "Karan Aujla, MXRCI, Seshnolan", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4", folder: "karan aujla" },
    { id: "CVeqCCYc", title: "Tauba Tauba", artist: "Karan Aujla", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4", folder: "karan aujla" },
    { id: "vLSaC03b", title: "For A Reason", artist: "Karan Aujla, IKKY", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/621/59d7b22aeaa69bd8158c1852e0b556d3_320.mp4", folder: "karan aujla" },
    { id: "gwX71Dmc", title: "Wavy", artist: "Karan Aujla, Jay Trak", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/178/9af31095a56a0a124dee89ef89ffee5a_320.mp4", folder: "karan aujla" },
    { id: "X1qxz-Cc", title: "Boyfriend", artist: "Karan Aujla, IKKY", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/621/895e14c38bf774a0122eef2528b39272_320.mp4", folder: "karan aujla" }
  ],
  "arijit singh": [
    {
      "id": "arijit1",
      "title": "Chaleya",
      "artist": "Arijit Singh, Shilpa Rao",
      "album": "Jawan",
      "duration": 200,
      "cover_image": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/a4/a409a4eb-485a-0d85-efc2-127db835e589/8902894541701_cover.jpg/500x500bb.jpg",
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
      "cover_image": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/09/a4/a409a4eb-485a-0d85-efc2-127db835e589/8902894541701_cover.jpg/500x500bb.jpg",
      "url": "https://aac.saavncdn.com/152/e0e0a5ccfb83e58c9735d6480b0051ec_320.mp4",
      "file_path": "https://aac.saavncdn.com/152/e0e0a5ccfb83e58c9735d6480b0051ec_320.mp4",
      "folder": "arijit singh"
    }
  ],
  "diljit": [
    { id: "M7k5t7vw", title: "Lover", artist: "Diljit Dosanjh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4", folder: "diljit" },
    { id: "nJ6Z-ayZ", title: "G.O.A.T.", artist: "Diljit Dosanjh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/597/ce842951d6cde3c4355046ca5e250809_320.mp4", folder: "diljit" },
    { id: "0Cu5Kha8", title: "Lemonade", artist: "Diljit Dosanjh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/467/c1f149509d4ee7d20c0c4474090ab5f1_320.mp4", folder: "diljit" },
    { id: "aAOXwvz-", title: "Born to Shine", artist: "Diljit Dosanjh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4", folder: "diljit" }
  ],
  "honey singh": [
    { id: "DWDSMHh7", title: "YoYo", artist: "R.S. Chauhan", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b3/b5/d9/b3b5d986-7f6d-a860-b8aa-769e1eef1a92/8902894356299_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/144/ab475350ef2b43b75a24d3d720aaa7a4_320.mp4", folder: "honey singh" },
    { id: "GbaIdJ48", title: "Desi Kalakaar", artist: "Yo Yo Honey Singh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b3/b5/d9/b3b5d986-7f6d-a860-b8aa-769e1eef1a92/8902894356299_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/304/f31ba5ffe986d0feb95b3059ad05f4d5_320.mp4", folder: "honey singh" },
    { id: "D6K-hfED", title: "Love Dose", artist: "Yo Yo Honey Singh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b3/b5/d9/b3b5d986-7f6d-a860-b8aa-769e1eef1a92/8902894356299_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/304/ed6b172300cca9a418be31a511728f81_320.mp4", folder: "honey singh" }
  ],
  "ap dillhon": [
    { id: "xzUVX40K", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/ac/00/5aac005f-9403-70e4-bce0-cf452017476e/197189606472.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4", folder: "ap dillhon" },
    { id: "LuXIJGPC", title: "Insane", artist: "AP Dhillon", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/ac/00/5aac005f-9403-70e4-bce0-cf452017476e/197189606472.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/851/23ba415310e4b119a8452cba3cbbf509_320.mp4", folder: "ap dillhon" },
    { id: "fHcI5Kka", title: "With You", artist: "AP Dhillon", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/ac/00/5aac005f-9403-70e4-bce0-cf452017476e/197189606472.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/671/50b256cc8e60dc8b0243f5e0767e8467_320.mp4", folder: "ap dillhon" }
  ],
  "ncs": [
    { id: "1xqHQw3J", title: "Faded", artist: "Alan Walker", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/e7/c2/46e7c2f3-19b0-8d25-971b-a8b378916a87/artwork.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/981/ddf4f57d94d268001967dc60725c52ca_320.mp4", folder: "ncs" },
    { id: "UT7zhBDm", title: "The Spectre", artist: "Alan Walker", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/e7/c2/46e7c2f3-19b0-8d25-971b-a8b378916a87/artwork.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/532/b84681ac81c18c5f2ec5eb9a991dd688_320.mp4", folder: "ncs" },
    { id: "KiuA2i3W", title: "Invincible", artist: "DEAF KEV", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/e7/c2/46e7c2f3-19b0-8d25-971b-a8b378916a87/artwork.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/701/df5e8e1e5ec446af9d91d50fb9c845dd_320.mp4", folder: "ncs" }
  ],
  "talwinder": [
    { id: "mk0bUMgA", title: "Khayaal", artist: "Talwiinder", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4d/62/fd/4d62fd50-5bb8-4449-7a07-27a749dbde66/25UMGIM53708.rgb.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/482/c9b917787fdd221283bcb11884f4184d_320.mp4", folder: "talwinder" },
    { id: "U9amhr5-", title: "Dhundhala", artist: "Talwiinder", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4d/62/fd/4d62fd50-5bb8-4449-7a07-27a749dbde66/25UMGIM53708.rgb.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/965/212f0dd59e13c060347033940b6fc552_320.mp4", folder: "talwinder" }
  ],
  "vibes songs": [
    { id: "B4NcKCxa", title: "softly lofi", artist: "Aiden Yoo", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3f/d2/f9/3fd2f999-c2c2-4fe6-ecc3-1d30f38904bd/859777326048_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/621/50001be791999fcce90dcb3449494985_320.mp4", folder: "vibes songs" },
    { id: "y4MGaPi7", title: "Pasoori (Lofi Mix)", artist: "Unico Vibe A1", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3f/d2/f9/3fd2f999-c2c2-4fe6-ecc3-1d30f38904bd/859777326048_cover.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/534/75e8cece32fe2949149c721b86a201a7_320.mp4", folder: "vibes songs" }
  ],
  "instagram trending": [
    { id: "CVeqCCYc", title: "Tauba Tauba", artist: "Karan Aujla", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/33/58/1a/33581a2a-1b7d-e139-5cb8-0feb931981c9/Lohri3000.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4", folder: "instagram trending" },
    { id: "q7nvYeRF", title: "Big Dawgs", artist: "Hanumankind, Kalmi", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/33/58/1a/33581a2a-1b7d-e139-5cb8-0feb931981c9/Lohri3000.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/883/c0a119218206e3e43e2496dc0f2d8d7e_320.mp4", folder: "instagram trending" },
    { id: "DF6eazs2", title: "Winning Speech", artist: "Karan Aujla, MXRCI, Seshnolan", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/33/58/1a/33581a2a-1b7d-e139-5cb8-0feb931981c9/Lohri3000.jpg/500x500bb.jpg", url: "https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4", folder: "instagram trending" }
  ]
};

export async function fetchAlbums(searchTerm = "") {
  try {
    let url = `${API_BASE_URL}/api/albums`;
    if (searchTerm) {
      url += `?name=${encodeURIComponent(searchTerm)}`;
    }
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error("Failed to fetch local albums");
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
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error("Failed to fetch local songs");
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
