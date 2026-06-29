import { state } from './state.js';

export function loadLikedSongs() {
  try {
    const saved = localStorage.getItem("likedSongs");
    state.likedSongs = new Set(saved ? JSON.parse(saved) : []);
  } catch {
    state.likedSongs = new Set();
  }
}

export function saveLikedSongs() {
  localStorage.setItem("likedSongs", JSON.stringify(Array.from(state.likedSongs)));
}

export function getLikedSongObjects() {
  return Array.from(state.likedSongs).map((item) => {
    const [folder, track] = item.split("|");
    return { folder, track };
  });
}

export function isTrackLiked(folder, track) {
  return state.likedSongs.has(`${folder}|${track}`);
}

export function toggleLikeState(folder, track) {
  const key = `${folder}|${track}`;
  let added = false;
  if (state.likedSongs.has(key)) {
    state.likedSongs.delete(key);
    added = false;
  } else {
    state.likedSongs.add(key);
    added = true;
  }
  saveLikedSongs();
  return added;
}
