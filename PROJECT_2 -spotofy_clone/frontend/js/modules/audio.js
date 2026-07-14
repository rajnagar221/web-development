import { STATIC_SONGS_URL } from './config.js';
import { state } from './state.js';
import { fetchSongs } from './api.js';
import {
  updatePlayButton,
  updateAlbumPlayIcons,
  updateSongInfo,
  updatePlaybarLikeButton,
  updateTimeDisplay,
  renderSongList,
  updateVolumeIcon,
  showToast,
  toggleLikeTrack,
  addRecentlyPlayed
} from './ui.js';
import { getElement } from './utils.js';


export function buildSongUrl(folder, track) {
  // Not used with iTunes API as track.url is the previewUrl directly, but kept for compatibility just in case
  return track.url || "";
}

export function getCurrentSongIndex() {
  if (!state.currentTrack) return -1;
  return state.displaySongs.findIndex(
    (item) => item.folder === state.currentFolder && item.track.id === state.currentTrack.id
  );
}

export async function loadFolderSongs(folder) {
  state.currFolder = folder;
  try {
    state.songs = await fetchSongs(folder);
  } catch (error) {
    console.error("Error fetching songs from :", error);
    state.songs = [];
  }
  state.showLikedSongs = false;
  state.displaySongs = state.songs.map((track) => ({ folder: state.currFolder, track }));
  renderSongList();
  return state.songs;
}

export function togglePlayback(track, folder) {
  if (track && (!state.currentTrack || track.id !== state.currentTrack.id || folder !== state.currentFolder)) {
    playMusic(track, folder);
    return;
  }

  if (!state.currentSong.src) {
    if (state.displaySongs.length > 0) {
      playMusic(state.displaySongs[0].track, state.displaySongs[0].folder);
    }
    return;
  }

  if (!state.currentSong.paused) {
    state.currentSong.pause();
    updatePlayButton(false);
    updateAlbumPlayIcons();
  } else {
    state.currentSong.play().catch((err) => console.warn("Playback failed:", err));
    updatePlayButton(true);
    updateAlbumPlayIcons();
  }
}

export function playMusic(track, folder = state.currFolder) {
  if (!track || !folder) return;

  const nowPlayingCard = document.querySelector("#nowPlayingCard");
  if (nowPlayingCard) nowPlayingCard.style.display = "flex";

  // If same track already playing, just resume
  if (state.currentTrack && track.id === state.currentTrack.id && folder === state.currentFolder && state.currentSong.src) {
    if (state.currentSong.paused) {
      state.currentSong.play().catch((err) => console.warn("Playback failed:", err));
      updatePlayButton(true);
      updateAlbumPlayIcons();
    }
    return;
  }

  state.currentTrack = track;
  state.currentFolder = folder;
  state.currFolder = folder;

  // Add to recent songs live
  addRecentlyPlayed(track, folder);

  // Immediately update UI before load completes
  updateSongInfo(track, true);
  updatePlaybarLikeButton();
  updatePlayButton(true);

  if (track.url) {
    state.currentSong.src = track.url;
  } else {
    // fallback if missing
    state.currentSong.src = buildSongUrl(folder, track);
  }
  state.currentSong.volume = (() => {
    const vol = document.getElementById("volumeRange");
    return vol ? Number(vol.value) / 100 : 0.8;
  })();
  state.currentSong.load();
  const playPromise = state.currentSong.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        updatePlayButton(true);
        updateAlbumPlayIcons();
      })
      .catch((err) => {
        console.warn("Playback failed:", err);
        updatePlayButton(false);
        updateAlbumPlayIcons();
      });
  }
  updateAlbumPlayIcons();
  renderSongList();
}

export function playPreviousSong() {
  if (state.displaySongs.length === 0) return;
  const index = getCurrentSongIndex();
  const prevIndex = index > 0 ? index - 1 : state.displaySongs.length - 1;
  const item = state.displaySongs[prevIndex];
  if (item) playMusic(item.track, item.folder);
}

export function playNextSong() {
  if (state.displaySongs.length === 0) return;
  const index = getCurrentSongIndex();
  if (state.isShuffle) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * state.displaySongs.length);
    } while (randomIndex === index && state.displaySongs.length > 1);
    const item = state.displaySongs[randomIndex];
    if (item) playMusic(item.track, item.folder);
    return;
  }
  const nextIndex = (index >= 0 && index < state.displaySongs.length - 1) ? index + 1 : 0;
  const item = state.displaySongs[nextIndex];
  if (item) playMusic(item.track, item.folder);
}

// ==================== PLAYER EVENTS ====================
export function setupPlayerEvents() {
  state.currentSong.addEventListener("timeupdate", updateTimeDisplay);

  state.currentSong.addEventListener("play", () => {
    updateAlbumPlayIcons();
    updatePlayButton(true);
  });

  state.currentSong.addEventListener("pause", () => {
    updateAlbumPlayIcons();
    updatePlayButton(false);
  });

  state.currentSong.addEventListener("ended", () => {
    if (state.isRepeat) {
      state.currentSong.currentTime = 0;
      state.currentSong.play().catch(() => {});
    } else {
      playNextSong();
    }
  });

  state.currentSong.addEventListener("error", () => {
    console.error("Audio error encountered:", state.currentSong.error);
    showToast("⚠️ Error: Failed to play song");
    updatePlayButton(false);
    updateAlbumPlayIcons();
  });
}

// ==================== CONTROL BUTTONS ====================
export function setupControlButtons() {
  const playButton = document.getElementById("play");
  const previousButton = document.getElementById("previous");
  const nextButton = document.getElementById("next");
  const shuffleButton = document.getElementById("shuffle");
  const repeatButton = document.getElementById("repeat");
  const favoritePlaybarBtn = getElement("#favoritePlaybarBtn");
  const seekbar = getElement(".seekbar");
  const volumeRange = document.getElementById("volumeRange");

  // ---- Favorite ----
  if (favoritePlaybarBtn) {
    favoritePlaybarBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!state.currentTrack || !state.currentFolder) return;
      toggleLikeTrack(state.currentFolder, state.currentTrack);
    });
  }

  // ---- Play/Pause ----
  if (playButton) {
    playButton.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlayback();
    });
  }

  // ---- Previous ----
  if (previousButton) {
    previousButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.currentSong.currentTime > 3) {
        state.currentSong.currentTime = 0;
        updateTimeDisplay();
      } else {
        playPreviousSong();
      }
    });
  }

  // ---- Next ----
  if (nextButton) {
    nextButton.addEventListener("click", (e) => {
      e.stopPropagation();
      playNextSong();
    });
  }

  // ---- Shuffle ----
  if (shuffleButton) {
    shuffleButton.addEventListener("click", () => {
      state.isShuffle = !state.isShuffle;
      shuffleButton.classList.toggle("active-control", state.isShuffle);
      shuffleButton.style.opacity = state.isShuffle ? "1" : "0.6";
      showToast(state.isShuffle ? "Shuffle On 🔀" : "Shuffle Off");
    });
  }

  // ---- Repeat ----
  if (repeatButton) {
    repeatButton.addEventListener("click", () => {
      state.isRepeat = !state.isRepeat;
      repeatButton.classList.toggle("active-control", state.isRepeat);
      repeatButton.style.opacity = state.isRepeat ? "1" : "0.6";
      showToast(state.isRepeat ? "Repeat On 🔁" : "Repeat Off");
    });
  }

  // ---- Seekbar click ----
  if (seekbar) {
    seekbar.addEventListener("click", (event) => {
      if (isNaN(state.currentSong.duration) || !state.currentSong.duration) return;
      const rect = seekbar.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / seekbar.clientWidth;
      state.currentSong.currentTime = state.currentSong.duration * Math.max(0, Math.min(1, percent));
      updateTimeDisplay();
    });

    // Seekbar drag
    const circle = getElement(".circle");
    if (circle) {
      let dragging = false;
      circle.addEventListener("pointerdown", (e) => {
        dragging = true;
        e.target.setPointerCapture(e.pointerId);
      });
      window.addEventListener("pointerup", () => { dragging = false; });
      window.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const rect = seekbar.getBoundingClientRect();
        let pct = (e.clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        if (!isNaN(state.currentSong.duration) && state.currentSong.duration) {
          state.currentSong.currentTime = state.currentSong.duration * pct;
          updateTimeDisplay();
        }
      });
    }
  }

  // ---- Volume ----
  if (volumeRange) {
    const updateVol = (val) => {
      const percent = Math.max(0, Math.min(100, Number(val)));
      const volRatio = percent / 100;
      state.currentSong.volume = volRatio;
      updateVolumeIcon(volRatio);
      volumeRange.style.background = `linear-gradient(to right, #1db954 0%, #1db954 ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%, rgba(255, 255, 255, 0.2) 100%)`;
    };

    updateVol(volumeRange.value);
    volumeRange.addEventListener("input", (e) => updateVol(e.target.value));
    volumeRange.addEventListener("change", (e) => updateVol(e.target.value));
  }

  // Volume icon mute toggle
  const queueBtn = getElement("#queueBtn");
  if (queueBtn) {
    queueBtn.addEventListener("click", () => {
      if (volumeRange) {
        const vol = state.currentSong.volume;
        if (vol > 0) {
          queueBtn.dataset.lastVol = vol;
          state.currentSong.volume = 0;
          volumeRange.value = 0;
          updateVolumeIcon(0);
        } else {
          const lastVol = parseFloat(queueBtn.dataset.lastVol || "0.8");
          state.currentSong.volume = lastVol;
          volumeRange.value = lastVol * 100;
          updateVolumeIcon(lastVol);
        }
      }
    });
  }
}

// ==================== KEYBOARD SHORTCUTS ====================
export function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    if (e.code === "Space") {
      e.preventDefault();
      togglePlayback();
    } else if (e.code === "ArrowRight") {
      playNextSong();
    } else if (e.code === "ArrowLeft") {
      playPreviousSong();
    } else if (e.code === "ArrowUp") {
      e.preventDefault();
      const vol = document.getElementById("volumeRange");
      if (vol) {
        vol.value = Math.min(100, Number(vol.value) + 5);
        state.currentSong.volume = Number(vol.value) / 100;
        updateVolumeIcon(state.currentSong.volume);
      }
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      const vol = document.getElementById("volumeRange");
      if (vol) {
        vol.value = Math.max(0, Number(vol.value) - 5);
        state.currentSong.volume = Number(vol.value) / 100;
        updateVolumeIcon(state.currentSong.volume);
      }
    }
  });
}

