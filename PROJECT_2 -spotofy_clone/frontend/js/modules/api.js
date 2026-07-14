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

// Map Deezer album format to UI compatible format
export async function fetchAlbums(searchTerm = "arijit") {
  const albumsData = await fetchDeezerSearch(searchTerm, 'album');
  return albumsData.map(album => ({
    folder: album.id.toString(), // We use Deezer album ID as the folder
    title: album.title,
    description: album.artist ? album.artist.name : "Unknown Artist",
    cover_image: album.cover_medium || album.cover || "img/music.svg"
  }));
}

// Map Deezer album tracks to UI compatible format
export async function fetchSongs(albumId) {
  const albumData = await fetchDeezerAlbum(albumId);
  if (!albumData || !albumData.tracks || !albumData.tracks.data) return [];
  
  return albumData.tracks.data.map(track => ({
    id: track.id.toString(),
    title: track.title,
    artist: track.artist ? track.artist.name : "Unknown Artist",
    cover_image: albumData.cover_medium || albumData.cover || "img/music.svg",
    url: track.preview // Deezer provides 30s previews
  }));
}
