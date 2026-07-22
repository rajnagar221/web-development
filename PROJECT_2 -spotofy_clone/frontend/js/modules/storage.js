import { state } from './state.js';

export function loadLikedSongs() {
  try {
    const saved = localStorage.getItem("likedSongsData");
    if (saved) {
      const parsed = JSON.parse(saved);
      state.likedSongs = new Set(parsed);
    } else {
      state.likedSongs = new Set();
    }
  } catch {
    state.likedSongs = new Set();
  }
}

export function saveLikedSongs() {
  localStorage.setItem("likedSongsData", JSON.stringify(Array.from(state.likedSongs)));
}

export function isTrackLiked(folder, trackOrId) {
  const trackId = typeof trackOrId === 'object' ? (trackOrId.id || trackOrId.title) : trackOrId;
  for (const item of state.likedSongs) {
    if (typeof item === 'string') {
      if (item === `${folder}|${trackId}`) return true;
    } else if (item && item.folder === folder && (item.track.id === trackId || item.track.title === trackId)) {
      return true;
    }
  }
  return false;
}

export function toggleLikeState(folder, track) {
  const trackId = typeof track === 'object' ? (track.id || track.title) : track;
  let existingItem = null;
  
  for (const item of state.likedSongs) {
    if (typeof item === 'string') {
      if (item === `${folder}|${trackId}`) { existingItem = item; break; }
    } else if (item && item.folder === folder && (item.track.id === trackId || item.track.title === trackId)) {
      existingItem = item; break;
    }
  }

  let added = false;
  if (existingItem) {
    state.likedSongs.delete(existingItem);
    added = false;
  } else {
    const trackObj = typeof track === 'object' ? track : { id: trackId, title: trackId, artist: "Unknown Artist", cover_image: "img/music.svg", url: "", folder };
    state.likedSongs.add({ folder, track: trackObj });
    added = true;
  }
  saveLikedSongs();
  return added;
}

export function getLikedSongObjects() {
  const list = [];
  for (const item of state.likedSongs) {
    if (typeof item === 'string') {
      const [folder, trackId] = item.split("|");
      list.push({ folder, track: { id: trackId, title: trackId, artist: "Unknown Artist", cover_image: "img/music.svg", url: "", folder } });
    } else if (item && item.track) {
      list.push(item);
    }
  }
  return list;
}
