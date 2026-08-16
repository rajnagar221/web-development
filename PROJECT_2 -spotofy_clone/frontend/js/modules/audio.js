import { STATIC_SONGS_URL, API_BASE_URL } from './config.js';
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
  toggleLikeTrack
} from './ui.js';
import { getElement, isSameTrack } from './utils.js';


export function buildSongUrl(folder, track) {
  // Not used with iTunes API as track.url is the previewUrl directly, but kept for compatibility just in case
  return track.url || "";
}

export function getCurrentSongIndex() {
  if (!state.currentTrack || !state.displaySongs || state.displaySongs.length === 0) return -1;
  return state.displaySongs.findIndex((item) => isSameTrack(item, state.currentTrack));
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
  if (track && (!state.currentTrack || !isSameTrack(track, state.currentTrack) || folder !== state.currentFolder)) {
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

export async function playMusic(track, folder = state.currFolder || "search") {
  if (!track) return;
  folder = folder || track.folder || state.currFolder || "search";

  // nowPlayingCard display handled via user toggle

  // If same track already playing, just resume
  if (state.currentTrack && isSameTrack(track, state.currentTrack) && folder === state.currentFolder && state.currentSong.src) {
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

  // Immediately update UI before load completes
  updateSongInfo(track, true);
  updatePlaybarLikeButton();
  updatePlayButton(true);

  // Check if track URL is missing or a 30s preview needing full track resolution
  const isPreviewUrl = (!track.url && !track.file_path) ||
                       (typeof track.url === 'string' && (
                          track.url.includes("apple.com") ||
                          track.url.includes("itunes") ||
                          track.url.includes("audio-ssl") ||
                          track.url.includes("mzstatic") ||
                          track.url.includes("preview") ||
                          track.url.includes("dzcdn.net")
                       ));

  if (isPreviewUrl) {
    try {
      showToast("🔎 Resolving full song audio...");
      const res = await fetch(`${API_BASE_URL}/api/fullsongs/resolve?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist || '')}`);
      if (res.ok) {
        const fullData = await res.json();
        if (fullData.success && fullData.url) {
          track.url = fullData.url;
          track.duration = fullData.duration || track.duration || 180;
          if (fullData.cover_image && (!track.cover_image || track.cover_image === "img/music.svg")) {
            track.cover_image = fullData.cover_image;
          }
          updateSongInfo(track, true);
          showToast("🎵 Full song loaded");
        }
      }
    } catch (resolveErr) {
      console.warn("Full song auto-resolution attempt failed, using existing URL:", resolveErr);
    }
  }

  const audioSrc = track.url || track.file_path || buildSongUrl(folder, track);
  if (!audioSrc) {
    showToast("⚠️ Song audio URL unavailable");
    return;
  }

  // Stop any currently playing audio stream completely before starting new song
  try {
    state.currentSong.pause();
    state.currentSong.currentTime = 0;
  } catch (e) {}

  state.currentSong.src = audioSrc;
  
  if (state.wavesurfer) {
    state.wavesurfer.load(state.currentSong.src);
  } else {
    state.currentSong.load();
  }

  state.currentSong.volume = (() => {
    const vol = document.getElementById("volumeRange");
    return vol ? Number(vol.value) / 100 : 1.0;
  })();

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
  if (!state.displaySongs || state.displaySongs.length === 0) return;
  if (state.currentSong && state.currentSong.currentTime > 3) {
    state.currentSong.currentTime = 0;
    updateTimeDisplay();
    return;
  }
  const index = getCurrentSongIndex();
  const prevIndex = index > 0 ? index - 1 : state.displaySongs.length - 1;
  const item = state.displaySongs[prevIndex];
  if (item) playMusic(item.track, item.folder);
}

export async function playNextSong() {
  if (!state.displaySongs || state.displaySongs.length === 0) return;
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

  // Autoplay / Radio: Fetch and append similar songs when queue reaches the end
  if ((index < 0 || index >= state.displaySongs.length - 1) && !state.isRepeat) {
    const currTrack = state.currentTrack;
    if (currTrack) {
      try {
        const queryParam = state.currentSearchQuery || "";
        const titleParam = currTrack.title || "";
        const artistParam = currTrack.artist || "";
        
        let recommendedTracks = [];
        try {
          const res = await fetch(`${API_BASE_URL}/api/fullsongs/recommend?title=${encodeURIComponent(titleParam)}&artist=${encodeURIComponent(artistParam)}&query=${encodeURIComponent(queryParam)}`);
          if (res.ok) {
            const data = await res.json();
            recommendedTracks = data.songs || [];
          }
        } catch (e) {}

        if (recommendedTracks.length === 0) {
          const extraSongs = await fetchSongs("karan aujla");
          recommendedTracks = extraSongs || [];
        }
        
        if (recommendedTracks.length > 0) {
          const existingIds = new Set(state.displaySongs.map(item => String(item.track ? (item.track.id || item.track.title) : '')));
          const newItems = [];
          
          recommendedTracks.forEach(t => {
            const tid = String(t.id || t.title);
            if (!existingIds.has(tid)) {
              existingIds.add(tid);
              newItems.push({ folder: t.folder || 'radio', track: t });
            }
          });
          
          if (newItems.length > 0) {
            state.displaySongs.push(...newItems);
            showToast("📻 Musify Autoplay: Playing next similar songs...");
            const targetIdx = index >= 0 ? index + 1 : 0;
            const nextItem = state.displaySongs[targetIdx] || state.displaySongs[0];
            if (nextItem) {
              playMusic(nextItem.track, nextItem.folder);
              return;
            }
          }
        }
      } catch (recErr) {
        console.warn("Autoplay radio fetch attempt failed:", recErr);
      }
    }
  }

  const nextIndex = (index >= 0 && index < state.displaySongs.length - 1) ? index + 1 : 0;
  const item = state.displaySongs[nextIndex];
  if (item) playMusic(item.track, item.folder);
}

// ==================== PLAYER EVENTS ====================
export function setupPlayerEvents() {
  const seekbar = getElement("#spotifySeekbar");

  state.currentSong.addEventListener("timeupdate", updateTimeDisplay);

  if (seekbar) {
    seekbar.addEventListener("input", (e) => {
      if (state.currentSong.duration) {
        const val = parseFloat(e.target.value);
        state.currentSong.currentTime = (val / 100) * state.currentSong.duration;
        updateTimeDisplay();
      }
    });
  }

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

  state.currentSong.addEventListener("error", async () => {
    console.error("Audio error encountered:", state.currentSong.error);
    
    // Auto-recovery attempt: try to resolve full song stream dynamically
    const track = state.currentTrack;
    if (track && !track._retryResolved) {
      track._retryResolved = true;
      try {
        showToast("🔄 Re-connecting audio stream...");
        const res = await fetch(`${API_BASE_URL}/api/fullsongs/resolve?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist || '')}`);
        if (res.ok) {
          const fullData = await res.json();
          if (fullData.success && fullData.url && fullData.url !== state.currentSong.src) {
            track.url = fullData.url;
            state.currentSong.src = fullData.url;
            state.currentSong.load();
            const p = state.currentSong.play();
            if (p) {
              p.then(() => {
                updatePlayButton(true);
                updateAlbumPlayIcons();
                showToast("🎵 Playing audio");
              }).catch(() => {});
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Stream auto-recovery failed:", err);
      }
    }

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

  // Seekbar drag (WaveSurfer handles seeking natively)
  if (seekbar) {
    seekbar.style.display = 'none'; // Hide old seekbar just in case it wasn't removed properly
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

  // Volume icon mute toggle button (#volumeMuteBtn)
  const volumeMuteBtn = getElement("#volumeMuteBtn");
  if (volumeMuteBtn) {
    volumeMuteBtn.addEventListener("click", () => {
      if (volumeRange) {
        const vol = state.currentSong.volume;
        if (vol > 0) {
          volumeMuteBtn.dataset.lastVol = vol;
          state.currentSong.volume = 0;
          volumeRange.value = 0;
          updateVolumeIcon(0);
        } else {
          const lastVol = parseFloat(volumeMuteBtn.dataset.lastVol || "1.0");
          state.currentSong.volume = lastVol;
          volumeRange.value = lastVol * 100;
          updateVolumeIcon(lastVol);
        }
      }
    });
  }

  // Queue button (#queueBtn) opens Now Playing sidebar / queue view
  const queueBtn = getElement("#queueBtn");
  if (queueBtn) {
    queueBtn.addEventListener("click", () => {
      const nowPlayingBtn = getElement("#nowPlayingToggleBtn");
      if (nowPlayingBtn) nowPlayingBtn.click();
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

