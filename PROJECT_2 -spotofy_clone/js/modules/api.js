import { API_BASE_URL, SONGS_API_URL } from './config.js';

export async function fetchSongs(folder) {
  const response = await fetch(`${SONGS_API_URL}/${encodeURIComponent(folder)}`);
  if (!response.ok) throw new Error(`Failed to load songs for ${folder}`);
  const data = await response.json();
  return Array.isArray(data.songs) ? data.songs : [];
}

export async function fetchExternalMusic() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/external-music`);
    return await res.json();
  } catch (e) {
    // silent fail
    return null;
  }
}

export async function fetchAlbums() {
  const response = await fetch(`${API_BASE_URL}/api/albums`);
  if (!response.ok) throw new Error("Failed to load albums");
  const data = await response.json();
  return data.albums || [];
}
