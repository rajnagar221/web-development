const hostname = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
const protocol = typeof window !== 'undefined' && window.location ? window.location.protocol : '';
const port = typeof window !== 'undefined' && window.location ? window.location.port : '';

// Detect local loopback or local private network IP addresses
const isLocalHost = (
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '::1' ||
  hostname === '[::1]' ||
  protocol === 'file:' ||
  /^192\.168\.\d+\.\d+$/.test(hostname) ||
  /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname)
);

// Check if frontend is being served directly by the backend server
const isBackendServing = (port === '8000' || hostname.includes('onrender.com'));

export const API_BASE_URL = isBackendServing
  ? (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : 'http://localhost:8000')
  : (isLocalHost
      ? `http://${hostname || 'localhost'}:8000`
      : "https://web-development-8f9t.onrender.com"
    );

export const SONGS_API_URL = `${API_BASE_URL}/api/songs`;
export const STATIC_SONGS_URL = `${API_BASE_URL}/songs`;
export const FOLDERS = [
  "karan aujla",
  "diljit",
  "honey singh",
  "ap dillhon",
  "talwinder",
  "sidhu moose wala",
  "arijit singh",
  "daily mix",
  "instagram trending",
  "vibes songs"
];

