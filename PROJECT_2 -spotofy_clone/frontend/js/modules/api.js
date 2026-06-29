import { API_BASE_URL, SONGS_API_URL } from './config.js';

export async function fetchSongs(folder) {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const response = await fetch(`${SONGS_API_URL}/${encodeURIComponent(folder)}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error(`Failed to load songs for ${folder}`);
  const data = await response.json();
  return Array.isArray(data.songs) ? data.songs : [];
}

export async function fetchExternalMusic() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const res = await fetch(`${API_BASE_URL}/api/external-music`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (e) {
    // silent fail
    return null;
  }
}

export async function fetchAlbums() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const response = await fetch(`${API_BASE_URL}/api/albums`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Failed to load albums");
  const data = await response.json();
  return data.albums || [];
}
