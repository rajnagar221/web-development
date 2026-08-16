import { state } from '../state.js';
import { getElement, isSameTrack } from '../utils.js';
import { isTrackLiked, getLikedSongObjects, toggleLikeState } from '../storage.js';
import { showToast } from './toast-ui.js';
import { updatePlaybarLikeButton, updateSidebarLikeButton, updateLibraryButtons } from './player-ui.js';

let audioModule = null;
async function getAudioModule() {
  if (!audioModule) {
    audioModule = await import('../audio.js');
  }
  return audioModule;
}

export function toggleLikeTrack(folder, track, shouldRender = true) {
  const added = toggleLikeState(folder, track);
  showToast(added ? "Added to Liked Songs ❤" : "Removed from Liked Songs");
  updatePlaybarLikeButton();
  updateSidebarLikeButton();
  if (shouldRender) {
    if (state.showLikedSongs) {
      state.displaySongs = getLikedSongObjects();
    }
    renderSongList();
  }
}

export function renderSongList() {
  const songListContainer = getElement(".songList ul");
  if (!songListContainer) return;

  const currentItems = state.showLikedSongs ? getLikedSongObjects() : state.displaySongs;

  if (currentItems.length === 0) {
    const message = state.showLikedSongs ? "No liked songs yet." : "No songs found.";
    songListContainer.innerHTML = `<li class="empty-song-list">${message}</li>`;
    updateLibraryButtons();
    return;
  }

  songListContainer.innerHTML = currentItems
    .map(({ folder, track }) => {
      const title = track.title || "Unknown Title";
      const artist = track.artist || "Unknown Artist";
      const isActive = state.currentTrack && isSameTrack(track, state.currentTrack) && folder === state.currentFolder ? "playing" : "";
      return `
        <li data-folder="${folder}" data-file="${track.id}" class="${isActive}">
          <div class="info">
            <div class="song-title">${title}</div>
            <div class="song-artist">${artist}</div>
          </div>
          <div class="play-btn">
            <svg viewBox="0 0 24 24" fill="#1db954" width="20" height="20">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          </div>
        </li>
      `;
    })
    .join("");

  Array.from(songListContainer.children).forEach((li) => {
    li.addEventListener("click", async () => {
      const folder = li.dataset.folder;
      const fileId = li.dataset.file;
      const item = currentItems.find(i => i.folder === folder && i.track.id === fileId);
      if (item) {
        const audio = await getAudioModule();
        audio.playMusic(item.track, item.folder);
      }
    });
  });

  updateLibraryButtons();
}

export function getRecentlyPlayed() {
  return [];
}

export function addRecentlyPlayed(track, folder) {
  // Recently played feature disabled
}

export function renderRecentlyPlayedUI(items = []) {
  // Recently played feature disabled - preserves static home layout
}
