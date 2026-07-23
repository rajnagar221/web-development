const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:'
);

export const API_BASE_URL = isLocal ? "http://localhost:8000" : "https://web-development-8f9t.onrender.com";

export const SONGS_API_URL = `${API_BASE_URL}/api/songs`;
export const STATIC_SONGS_URL = `${API_BASE_URL}/songs`;
export const FOLDERS = [
  "ncs",
  "karan aujla",
  "daily mix",
  "diljit",
  "honey singh",
  "instagram trending",
  "vibes songs",
  "ap dillhon",
  "talwinder"
];

