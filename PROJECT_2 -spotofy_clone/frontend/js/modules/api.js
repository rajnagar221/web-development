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
  { folder: "Diljit", title: "Diljit Dosanjh Essentials", description: "Lover, GOAT & Punjabi Blockbusters", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg" },
  { folder: "honey singh", title: "Yo Yo Honey Singh", description: "Desi Kalakaar, Blue Eyes & Classic Hits", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b3/b5/d9/b3b5d986-7f6d-a860-b8aa-769e1eef1a92/8902894356299_cover.jpg/500x500bb.jpg" },
  { folder: "Ap dillhon", title: "AP Dhillon & Gurinder Gill", description: "Brown Munde, Excuses & Insane Hits", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/ac/00/5aac005f-9403-70e4-bce0-cf452017476e/197189606472.jpg/500x500bb.jpg" },
  { folder: "talwinder", title: "Talwinder Melodies", description: "Deep Vibe, Dhundhala & Aesthetic Hits", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4d/62/fd/4d62fd50-5bb8-4449-7a07-27a749dbde66/25UMGIM53708.rgb.jpg/500x500bb.jpg" },
  { folder: "ncs", title: "Electronic NCS Mix", description: "Faded, Specter & High Energy Gaming Beats", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/e7/c2/46e7c2f3-19b0-8d25-971b-a8b378916a87/artwork.jpg/500x500bb.jpg" },
  { folder: "vibes songs", title: "Chill Punjabi Lo-Fi", description: "Relaxing Beats, Late Night Punjabi Vibes", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3f/d2/f9/3fd2f999-c2c2-4fe6-ecc3-1d30f38904bd/859777326048_cover.jpg/500x500bb.jpg" },
  { folder: "instagram trending", title: "Reels Viral Hits", description: "Soundtracks trending on Reels & TikTok", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/33/58/1a/33581a2a-1b7d-e139-5cb8-0feb931981c9/Lohri3000.jpg/500x500bb.jpg" },
  { folder: "daily mix", title: "Shubh Essentials", description: "Top class hits by Shubh, Arjan Dhillon & Punjabi blockbusters", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/48/4f/3c/484f3c19-fdab-1fa8-fdb4-c7de79852d12/197189603969.jpg/500x500bb.jpg" }
];

const FALLBACK_SONGS_MAP = {
  "karan aujla": [
    { id: "ka1", title: "For A Reason", artist: "Karan Aujla & Ikky", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/88/c6/5b/88c65b26-c766-69d3-2603-4857e66903d4/mzaf_7154011662261729475.plus.aac.p.m4a", folder: "karan aujla" },
    { id: "ka2", title: "Wavy", artist: "Karan Aujla & Jay Trak", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cd/df/5a/cddf5a8c-464e-3958-cf4a-7fac9e490aa5/5063616597178_cover.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6e/d7/12/6ed71252-5ea1-e750-c32f-b022e6847471/mzaf_15658604173507661184.plus.aac.p.m4a", folder: "karan aujla" },
    { id: "ka3", title: "Boyfriend", artist: "Karan Aujla & Ikky", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/64/5b/2b/645b2b11-1249-3ff3-e3af-c02189159868/mzaf_17613725717610713218.plus.aac.p.m4a", folder: "karan aujla" }
  ],
  "daily mix": [
    { id: "dm1", title: "Still Rollin", artist: "Shubh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dc/46/a9/dc46a9c9-794e-2d7a-1afb-97eb4ae0fff6/197188915704.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/66/8a/04/668a0423-3b9e-10af-9118-af173fb5a127/mzaf_18037249437587947297.plus.aac.p.m4a", folder: "daily mix" },
    { id: "dm2", title: "Cheques", artist: "Shubh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dc/46/a9/dc46a9c9-794e-2d7a-1afb-97eb4ae0fff6/197188915704.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5f/e9/8a/5fe98aa5-660a-2f91-b53d-558fdb9ef50b/mzaf_5845186979219129320.plus.aac.p.m4a", folder: "daily mix" },
    { id: "dm3", title: "Baller", artist: "Shubh & Ikky", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/e9/bd/93/e9bd9316-75a6-bc15-aebe-c737037bedf0/196925634489.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/cb/e0/c2/cbe0c24e-8fac-7f72-3ffc-6e13befbcb5f/mzaf_4386570819969846370.plus.aac.p.m4a", folder: "daily mix" },
    { id: "dm4", title: "No Love", artist: "Shubh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a7/b3/80/a7b380b9-9e29-1642-566e-d1ca4b920886/196776912972.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/ce/d5/f5/ced5f5a3-0d78-6262-a00b-acf4c48bd231/mzaf_314082565532823013.plus.aac.p.m4a", folder: "daily mix" }
  ],
  "diljit": [
    { id: "dd1", title: "Lover", artist: "Diljit Dosanjh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/93/e3/37/93e3371a-2895-c8b5-5d9c-bd247bd08a0d/mzaf_7867375267026725890.plus.aac.p.m4a", folder: "Diljit" },
    { id: "dd2", title: "G.O.A.T.", artist: "Diljit Dosanjh", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/21/5a/ef/215aefc6-7f41-0f72-76c2-48df92ee4333/mzaf_16104868461877478051.plus.aac.p.m4a", folder: "Diljit" }
  ],
  "ncs": [
    { id: "ncs1", title: "Faded", artist: "Alan Walker", cover_image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/e7/c2/46e7c2f3-19b0-8d25-971b-a8b378916a87/artwork.jpg/500x500bb.jpg", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bf/25/74/bf257404-515c-66f8-45e0-1c39c87895ab/mzaf_7302482390886895874.plus.aac.p.m4a", folder: "ncs" }
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
      let songUrl = song.file_path || "";
      if (songUrl && !songUrl.startsWith("http")) {
        songUrl = API_BASE_URL + (songUrl.startsWith("/") ? "" : "/") + songUrl;
      }

      return {
        id: song._id || song.title,
        title: song.title,
        artist: song.artist || "Unknown Artist",
        cover_image: cover,
        url: songUrl,
        folder: song.folder
      };
    });

    if (result.length > 0) return result;
  } catch (err) {
    console.warn("Local songs fetch fallback used for folder:", folder);
  }

  const key = folder ? folder.toLowerCase().trim() : "";
  return FALLBACK_SONGS_MAP[key] || FALLBACK_SONGS_MAP["daily mix"] || [];
}
