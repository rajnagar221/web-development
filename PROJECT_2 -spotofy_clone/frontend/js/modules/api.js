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
    return (data.albums || []).map(album => ({
      folder: album.folder,
      title: album.title,
      description: album.description || "Unknown",
      cover_image: album.cover_image || "img/music.svg"
    }));
  } catch (err) {
    console.error("Local albums fetch error:", err);
    return [];
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
    
    return (data.songs || []).map(song => ({
      id: song._id || song.title,
      title: song.title,
      artist: song.artist || "Unknown Artist",
      cover_image: song.cover_image || "img/music.svg",
      url: song.file_path, // local URL path to the song
      folder: song.folder
    }));
  } catch (err) {
    console.error("Local songs fetch error:", err);
    return [];
  }
}
