const API_BASE_URL = "http://localhost:8000";
const SONGS_API_URL = `${API_BASE_URL}/api/songs`;
const STATIC_SONGS_URL = `${API_BASE_URL}/songs`;
const FOLDERS = [
  "ncs",
  "karan aujla",
  "daily mix",
  "Diljit",
  "honey singh",
  "instagram trending",
  "vibes songs",
  "Ap dillhon",
  "talwinder"
];

// ==================== STATE ====================
let currentSong = new Audio();
let songs = [];
let displaySongs = [];
let currFolder = "";
let currentFolder = "";
let currentTrack = "";
let likedSongs = new Set();
let showLikedSongs = false;
let isRepeat = false;
let isShuffle = false;

// ==================== UTILS ====================
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getElement(selector) {
  return document.querySelector(selector);
}

// ==================== LIKED SONGS ====================
function loadLikedSongs() {
  try {
    const saved = localStorage.getItem("likedSongs");
    likedSongs = new Set(saved ? JSON.parse(saved) : []);
  } catch {
    likedSongs = new Set();
  }
}

function saveLikedSongs() {
  localStorage.setItem("likedSongs", JSON.stringify(Array.from(likedSongs)));
}

function getLikedSongObjects() {
  return Array.from(likedSongs).map((item) => {
    const [folder, track] = item.split("|");
    return { folder, track };
  });
}

function isTrackLiked(folder, track) {
  return likedSongs.has(`${folder}|${track}`);
}

function toggleLikeTrack(folder, track, shouldRender = true) {
  const key = `${folder}|${track}`;
  if (likedSongs.has(key)) {
    likedSongs.delete(key);
    showToast("Removed from Liked Songs");
  } else {
    likedSongs.add(key);
    showToast("Added to Liked Songs ❤");
  }
  saveLikedSongs();
  updatePlaybarLikeButton();
  updateSidebarLikeButton();
  if (shouldRender) renderSongList();
}

// ==================== PLAY BUTTON SVG ====================
function updatePlayButton(isPlaying) {
  const playButton = document.getElementById("play");
  if (!playButton) return;
  if (isPlaying) {
    // Pause icon - two vertical bars
    playButton.innerHTML = `<svg viewBox="0 0 24 24" fill="#000" width="18" height="18">
      <rect x="6" y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>`;
  } else {
    // Play icon - triangle
    playButton.innerHTML = `<svg viewBox="0 0 24 24" fill="#000" width="18" height="18">
      <polygon points="5,3 19,12 5,21"/>
    </svg>`;
  }
}

function updatePlaybarLikeButton() {
  const button = getElement("#favoritePlaybarBtn");
  if (!button) return;
  const hasTrack = currentTrack && currentFolder;
  button.disabled = !hasTrack;
  const isLiked = hasTrack && isTrackLiked(currentFolder, currentTrack);
  button.classList.toggle("liked", isLiked);
  button.innerHTML = isLiked
    ? `<svg viewBox="0 0 24 24" fill="#1db954" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" stroke-width="2" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
}

// ==================== SIDEBAR ====================
function updateSidebarLikeButton() {
  const button = getElement("#sidebarFavoriteBtn");
  if (!button) return;
  const isLiked = currentTrack && currentFolder && isTrackLiked(currentFolder, currentTrack);
  button.classList.toggle("liked", isLiked);
  if (isLiked) {
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="#1db954" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    button.style.color = "#1db954";
  } else {
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" stroke-width="2" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    button.style.color = "#b3b3b3";
  }
}

function updateCredits(folder, artist) {
  const creditArtist1 = getElement("#creditArtist1");
  const creditRole1 = getElement("#creditRole1");
  const creditArtist2 = getElement("#creditArtist2");
  const creditRole2 = getElement("#creditRole2");
  if (!creditArtist1) return;

  const artists = artist.split(",").map((a) => a.trim());
  if (artists.length > 0) {
    creditArtist1.textContent = artists[0];
    creditRole1.textContent = "Main Artist";
  }
  if (artists.length > 1) {
    creditArtist2.textContent = artists[1];
    creditRole2.textContent = "Main Artist";
    if (creditArtist2.parentNode) creditArtist2.parentNode.style.display = "flex";
  } else {
    if (folder && folder.toLowerCase().includes("karan aujla")) {
      creditArtist2.textContent = "Ikky";
      creditRole2.textContent = "Producer";
    } else if (folder && folder.toLowerCase().includes("ncs")) {
      creditArtist2.textContent = "Alan Walker";
      creditRole2.textContent = "Producer / Composer";
    } else {
      creditArtist2.textContent = "Various Artists";
      creditRole2.textContent = "Collaborator";
    }
  }
}

function updateSongInfo(track) {
  const title = decodeURIComponent(track.split("/").pop()).replace(/\.mp3$/i, "");
  const songInfo = getElement(".songinfo");
  if (songInfo) songInfo.textContent = title;

  // Update songartist in playbar
  const songArtistEl = getElement(".songartist");

  // Show right sidebar when a song starts playing
  const sidebar = getElement(".rightSidebar");
  if (sidebar) sidebar.style.display = "flex";

  const art = getElement("#playbarArt");
  const sideArt = getElement("#nowPlayingArt");
  const nowTitle = getElement("#nowPlayingTitle");
  const nowArtist = getElement("#nowPlayingArtist");
  const artistImg = getElement("#sidebarArtistImg");
  const artistName = getElement("#sidebarArtistName");
  const sidebarHeaderTitle = getElement("#sidebarHeaderTitle");

  // Resolve artist & cover from album data
  let resolvedArtist = currentFolder || "Unknown artist";
  let coverPath = `songs/${currentFolder}/cover.jpg`;

  if (window.allAlbums && currentFolder) {
    const album = window.allAlbums.find(
      (a) => a.folder.toLowerCase() === currentFolder.toLowerCase()
    );
    if (album) {
      if (album.description) resolvedArtist = album.description;
      if (album.cover_image) {
        coverPath = album.cover_image;
        if (coverPath.startsWith("/")) coverPath = coverPath.substring(1);
      }
    }
  }

  const coverUrl = `${API_BASE_URL}/${coverPath}`;
  if (art) art.src = coverUrl;
  if (sideArt) sideArt.src = coverUrl;
  if (artistImg) artistImg.src = coverUrl;
  if (nowTitle) nowTitle.textContent = title;
  if (nowArtist) nowArtist.textContent = resolvedArtist;
  if (artistName) artistName.textContent = resolvedArtist;
  if (sidebarHeaderTitle) sidebarHeaderTitle.textContent = title;
  if (songArtistEl) songArtistEl.textContent = resolvedArtist;

  updatePlaybarLikeButton();
  updateSidebarLikeButton();
  updateCredits(currentFolder, resolvedArtist);
}

function setupSidebarEvents() {
  const sidebarFavoriteBtn = getElement("#sidebarFavoriteBtn");
  if (sidebarFavoriteBtn) {
    sidebarFavoriteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!currentTrack || !currentFolder) return;
      toggleLikeTrack(currentFolder, currentTrack);
    });
  }

  const closeSidebarBtn = getElement(".close-sidebar");
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", () => {
      const sidebar = getElement(".rightSidebar");
      if (sidebar) sidebar.style.display = "none";
    });
  }
}

// ==================== TIME DISPLAY ====================
function updateTimeDisplay() {
  const current = formatTime(currentSong.currentTime);
  const total = isNaN(currentSong.duration) ? "00:00" : formatTime(currentSong.duration);

  const currentSmall = getElement(".current-time");
  const durationSmall = getElement(".duration");
  if (currentSmall) currentSmall.textContent = current;
  if (durationSmall) durationSmall.textContent = total;

  if (isNaN(currentSong.duration) || !currentSong.duration) return;
  const pct = (currentSong.currentTime / currentSong.duration) * 100;

  const progressCircle = getElement(".circle");
  if (progressCircle) progressCircle.style.left = `${pct}%`;

  const progressBar = getElement(".seekbar .progress");
  if (progressBar) progressBar.style.width = `${pct}%`;
}

// ==================== SONG URL ====================
function buildSongUrl(folder, track) {
  const fileName = track.split("/").pop();
  return `${STATIC_SONGS_URL}/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`;
}

// ==================== LIBRARY ====================
function updateLibraryButtons() {
  const likedBtn = getElement("#likedSongsBtn");
  const allBtn = getElement("#allSongsBtn");
  if (likedBtn) likedBtn.classList.toggle("active", showLikedSongs);
  if (allBtn) allBtn.classList.toggle("active", !showLikedSongs);
}

function renderSongList() {
  const songListContainer = getElement(".songList ul");
  if (!songListContainer) return;

  const currentItems = showLikedSongs ? getLikedSongObjects() : displaySongs;

  if (currentItems.length === 0) {
    const message = showLikedSongs ? "No liked songs yet." : "No songs found.";
    songListContainer.innerHTML = `<li class="empty-song-list">${message}</li>`;
    updateLibraryButtons();
    return;
  }

  songListContainer.innerHTML = currentItems
    .map(({ folder, track }) => {
      const title = decodeURIComponent(track).replace(/\.mp3$/i, "");
      const likedClass = isTrackLiked(folder, track) ? "liked" : "";
      const isActive = track === currentTrack && folder === currentFolder ? "playing" : "";
      return `
        <li data-folder="${folder}" data-file="${track}" class="${isActive}">
          <div class="info">
            <div class="song-title">${title}</div>
            <div class="song-artist">${folder}</div>
          </div>
          <div class="item-actions">
            <button type="button" class="favorite-btn ${likedClass}" title="Toggle like">
              <svg viewBox="0 0 24 24" fill="${likedClass ? '#1db954' : 'none'}" stroke="${likedClass ? '#1db954' : '#b3b3b3'}" stroke-width="2" width="14" height="14"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <div class="playnow">
              <svg viewBox="0 0 24 24" fill="#1db954" width="14" height="14"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
          </div>
        </li>`;
    })
    .join("");

  Array.from(document.querySelectorAll(".songList li")).forEach((item) => {
    const track = item.getAttribute("data-file");
    const folder = item.getAttribute("data-folder");

    item.addEventListener("click", () => {
      if (track && folder) playMusic(track, folder);
    });

    const favButton = item.querySelector(".favorite-btn");
    if (favButton) {
      favButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!track || !folder) return;
        toggleLikeTrack(folder, track);
      });
    }
  });

  updateLibraryButtons();
}

// ==================== SONGS API ====================
async function getSongs(folder) {
  currFolder = folder;
  try {
    const response = await fetch(`${SONGS_API_URL}/${encodeURIComponent(folder)}`);
    if (!response.ok) throw new Error(`Failed to load songs for ${folder}`);
    const data = await response.json();
    songs = Array.isArray(data.songs) ? data.songs : [];
  } catch (error) {
    console.error("Error fetching songs:", error);
    songs = [];
  }
  showLikedSongs = false;
  displaySongs = songs.map((track) => ({ folder: currFolder, track }));
  renderSongList();
  return songs;
}

async function loadExternalMusic() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/external-music`);
    await res.json();
  } catch (e) {
    // silent fail
  }
}
loadExternalMusic();

// ==================== ALBUMS ====================
async function displayAlbums() {
  const cardContainer = getElement(".cardContainer");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE_URL}/api/albums`);
    if (!response.ok) throw new Error("Failed to load albums");
    const data = await response.json();
    const albums = data.albums || [];
    window.allAlbums = albums;

    for (const album of albums) {
      const imagePath = album.cover_image
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");
      const imageUrl = `${API_BASE_URL}${imagePath}`;
      cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card">
          <div class="card-image-wrapper">
            <img src="${imageUrl}" alt="${album.title}" class="card-img" onerror="this.src='songs/ncs/cover.jpg';">
            <div class="play" onclick="event.stopPropagation();">
              <svg viewBox="0 0 24 24" fill="#000" width="18" height="18"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
            <span class="spotify-overlay-logo">
              <svg viewBox="0 0 24 24" fill="#1DB954" width="14" height="14"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-1.007-.333.075-.664-.135-.74-.467-.075-.332.136-.663.468-.74 3.86-.88 7.153-.51 9.82 1.13.292.18.382.566.205.86zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.847-.107-.972-.52-.125-.413.108-.847.52-.972 3.67-1.114 8.24-.57 11.35 1.344.366.226.486.707.26 1.07zm.107-2.846C14.524 8.762 9.018 8.58 5.836 9.545c-.51.155-1.044-.137-1.2-.647-.156-.51.137-1.044.647-1.2 3.676-1.115 9.742-.907 13.684 1.433.46.273.61.87.338 1.33-.273.46-.87.61-1.33.338z"/></svg>
            </span>
          </div>
          <h2>${album.title}</h2>
          <p>${album.description}</p>
        </div>`;
    }
  } catch (error) {
    console.warn("Could not load albums:", error);
  }

  attachAlbumEvents();
  updateAlbumPlayIcons();
}

function attachAlbumEvents() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const playBtn = card.querySelector(".play");
    const folder = card.dataset.folder;

    if (playBtn) {
      playBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!folder) return;
        if (folder !== currFolder) {
          await getSongs(folder);
          if (songs.length > 0) playMusic(songs[0], folder);
        } else {
          if (!currentSong.src || currentSong.paused) {
            if (!songs.length) await getSongs(folder);
            if (songs.length > 0) playMusic(songs[0], folder);
          } else {
            currentSong.pause();
            updatePlayButton(false);
            updateAlbumPlayIcons();
          }
        }
      });
    }

    card.addEventListener("click", async () => {
      if (!folder) return;
      const loadedSongs = await getSongs(folder);
      if (loadedSongs && loadedSongs.length > 0) playMusic(loadedSongs[0], folder);
    });
  });
}

window.scrollRow = function (btn, dir) {
  const wrapper = btn.parentNode;
  if (!wrapper) return;
  const row = wrapper.querySelector(".horizontal-row, .cardContainer");
  if (row) row.scrollBy({ left: dir * 420, behavior: "smooth" });
};

// ==================== PLAYBACK ====================
function getCurrentSongIndex() {
  return displaySongs.findIndex(
    (item) => item.folder === currentFolder && item.track === currentTrack
  );
}

function updateAlbumPlayIcons() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const playBtn = card.querySelector(".play");
    if (!playBtn) return;
    const folder = card.dataset.folder;
    const isThisPlaying = folder === currFolder && currentSong.src && !currentSong.paused;
    playBtn.innerHTML = isThisPlaying
      ? `<svg viewBox="0 0 24 24" fill="#000" width="18" height="18"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="#000" width="18" height="18"><polygon points="5,3 19,12 5,21"/></svg>`;
  });
}

function togglePlayback(track, folder) {
  if (track && (track !== currentTrack || folder !== currentFolder)) {
    playMusic(track, folder);
    return;
  }

  if (!currentSong.src) {
    if (displaySongs.length > 0) {
      playMusic(displaySongs[0].track, displaySongs[0].folder);
    }
    return;
  }

  if (!currentSong.paused) {
    currentSong.pause();
    updatePlayButton(false);
    updateAlbumPlayIcons();
  } else {
    currentSong.play().catch((err) => console.warn("Playback failed:", err));
    updatePlayButton(true);
    updateAlbumPlayIcons();
  }
}

function playMusic(track, folder = currFolder) {
  if (!track || !folder) return;

  // If same track already playing, just resume
  if (track === currentTrack && folder === currentFolder && currentSong.src) {
    if (currentSong.paused) {
      currentSong.play().catch((err) => console.warn("Playback failed:", err));
      updatePlayButton(true);
      updateAlbumPlayIcons();
    }
    return;
  }

  currentTrack = track;
  currentFolder = folder;
  currFolder = folder;

  // Immediately update UI before load completes
  updateSongInfo(track);
  updatePlaybarLikeButton();
  updatePlayButton(true);

  currentSong.src = buildSongUrl(folder, track);
  currentSong.volume = (() => {
    const vol = document.getElementById("volumeRange");
    return vol ? Number(vol.value) / 100 : 0.8;
  })();
  currentSong.load();
  currentSong.play().catch((err) => console.warn("Playback failed:", err));
  updateAlbumPlayIcons();
  renderSongList();
}

function playPreviousSong() {
  if (displaySongs.length === 0) return;
  const index = getCurrentSongIndex();
  const prevIndex = index > 0 ? index - 1 : displaySongs.length - 1;
  const item = displaySongs[prevIndex];
  if (item) playMusic(item.track, item.folder);
}

function playNextSong() {
  if (displaySongs.length === 0) return;
  const index = getCurrentSongIndex();
  if (isShuffle) {
    let randomIndex;
    do { randomIndex = Math.floor(Math.random() * displaySongs.length); }
    while (randomIndex === index && displaySongs.length > 1);
    const item = displaySongs[randomIndex];
    if (item) playMusic(item.track, item.folder);
    return;
  }
  const nextIndex = (index >= 0 && index < displaySongs.length - 1) ? index + 1 : 0;
  const item = displaySongs[nextIndex];
  if (item) playMusic(item.track, item.folder);
}

// ==================== PLAYER EVENTS ====================
function setupPlayerEvents() {
  currentSong.addEventListener("timeupdate", updateTimeDisplay);

  currentSong.addEventListener("play", () => {
    updateAlbumPlayIcons();
    updatePlayButton(true);
  });

  currentSong.addEventListener("pause", () => {
    updateAlbumPlayIcons();
    updatePlayButton(false);
  });

  currentSong.addEventListener("ended", () => {
    if (isRepeat) {
      currentSong.currentTime = 0;
      currentSong.play().catch(() => {});
    } else {
      playNextSong();
    }
  });

  currentSong.addEventListener("error", () => {
    console.warn("Audio error, trying next song");
    playNextSong();
  });
}

// ==================== CONTROL BUTTONS ====================
function setupControlButtons() {
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
      if (!currentTrack || !currentFolder) return;
      toggleLikeTrack(currentFolder, currentTrack);
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
      // If more than 3s in, restart. Else previous
      if (currentSong.currentTime > 3) {
        currentSong.currentTime = 0;
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
      isShuffle = !isShuffle;
      shuffleButton.classList.toggle("active-control", isShuffle);
      shuffleButton.style.opacity = isShuffle ? "1" : "0.6";
      showToast(isShuffle ? "Shuffle On 🔀" : "Shuffle Off");
    });
  }

  // ---- Repeat ----
  if (repeatButton) {
    repeatButton.addEventListener("click", () => {
      isRepeat = !isRepeat;
      repeatButton.classList.toggle("active-control", isRepeat);
      repeatButton.style.opacity = isRepeat ? "1" : "0.6";
      showToast(isRepeat ? "Repeat On 🔁" : "Repeat Off");
    });
  }

  // ---- Seekbar click ----
  if (seekbar) {
    seekbar.addEventListener("click", (event) => {
      if (isNaN(currentSong.duration) || !currentSong.duration) return;
      const rect = seekbar.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / seekbar.clientWidth;
      currentSong.currentTime = currentSong.duration * Math.max(0, Math.min(1, percent));
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
        if (!isNaN(currentSong.duration) && currentSong.duration) {
          currentSong.currentTime = currentSong.duration * pct;
          updateTimeDisplay();
        }
      });
    }
  }

  // ---- Volume ----
  if (volumeRange) {
    // Set initial volume
    currentSong.volume = Number(volumeRange.value) / 100;

    volumeRange.addEventListener("input", (event) => {
      const vol = Number(event.target.value) / 100;
      currentSong.volume = vol;
      updateVolumeIcon(vol);
    });
  }

  // Volume icon mute toggle
  const queueBtn = getElement("#queueBtn");
  if (queueBtn) {
    queueBtn.addEventListener("click", () => {
      if (volumeRange) {
        const vol = currentSong.volume;
        if (vol > 0) {
          queueBtn.dataset.lastVol = vol;
          currentSong.volume = 0;
          volumeRange.value = 0;
          updateVolumeIcon(0);
        } else {
          const lastVol = parseFloat(queueBtn.dataset.lastVol || "0.8");
          currentSong.volume = lastVol;
          volumeRange.value = lastVol * 100;
          updateVolumeIcon(lastVol);
        }
      }
    });
  }
}

function updateVolumeIcon(vol) {
  const queueBtn = getElement("#queueBtn");
  if (!queueBtn) return;
  if (vol === 0) {
    queueBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  } else if (vol < 0.5) {
    queueBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm7-.17v6.34L9.83 13H7v-2h2.83L12 8.83z"/></svg>`;
  } else {
    queueBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  }
}

// ==================== SEARCH ====================
async function setupSearch() {
  const searchInput = getElement("#searchInput");
  const searchContainer = getElement("#searchContainer");
  const searchResults = getElement("#searchResults");

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("focus", () => {
    if (searchContainer) searchContainer.style.display = "block";
  });

  searchInput.addEventListener("input", async (event) => {
    const query = event.target.value.toLowerCase().trim();
    searchResults.innerHTML = "";

    if (query.length === 0) {
      if (searchContainer) searchContainer.style.display = "none";
      return;
    }

    if (searchContainer) searchContainer.style.display = "block";
    const results = [];

    for (const folder of FOLDERS) {
      try {
        const response = await fetch(`${SONGS_API_URL}/${encodeURIComponent(folder)}`);
        if (!response.ok) continue;
        const data = await response.json();
        const folderSongs = Array.isArray(data.songs) ? data.songs : [];
        folderSongs.forEach((song) => {
          const songName = decodeURIComponent(song);
          if (songName.toLowerCase().includes(query)) {
            results.push({ title: songName.replace(/\.mp3$/i, ""), track: song, folder });
          }
        });
      } catch (error) {
        console.warn(`Search folder failed: ${folder}`, error);
      }
    }

    if (results.length === 0) {
      searchResults.innerHTML = `<div class="searchResult no-result">No results found for "${query}"</div>`;
      return;
    }

    results.forEach((result) => {
      const item = document.createElement("div");
      item.className = "searchResult";
      item.innerHTML = `<svg viewBox="0 0 24 24" fill="#1db954" width="14" height="14" style="margin-right:8px;flex-shrink:0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>${result.title}`;
      item.addEventListener("click", async () => {
        await getSongs(result.folder);
        playMusic(result.track);
        if (searchContainer) searchContainer.style.display = "none";
        if (searchInput) searchInput.value = "";
        searchResults.innerHTML = "";
      });
      searchResults.appendChild(item);
    });
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      if (searchContainer) searchContainer.style.display = "none";
    }
  });
}

// ==================== SIDEBAR TOGGLE ====================
function setupSidebarToggle() {
  const hamburger = getElement(".hamburger");
  const closeBtn = getElement(".close");
  const sidebar = getElement(".left");
  if (hamburger && closeBtn && sidebar) {
    hamburger.addEventListener("click", () => sidebar.classList.add("active"));
    closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
  }
}

// ==================== TOAST ====================
function showToast(message, duration = 2400) {
  const toast = getElement("#notificationToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.remove("visible");
    toast.classList.add("hidden");
  }, duration);
}

// ==================== PREMIUM POPUP ====================
function setupPremiumPopup() {
  const exploreBtn = getElement("#explorePremiumBtn");
  const premiumPopup = getElement("#premiumPopup");
  const closePopup = getElement(".close-popup");
  const subscribeBtn = getElement("#subscribePremiumBtn");

  const openModal = () => {
    if (!premiumPopup) return;
    premiumPopup.classList.remove("hidden");
    premiumPopup.setAttribute("aria-hidden", "false");
    premiumPopup.style.display = "flex";
  };

  const closeModal = () => {
    if (!premiumPopup) return;
    premiumPopup.classList.add("hidden");
    premiumPopup.setAttribute("aria-hidden", "true");
    premiumPopup.style.display = "none";
  };

  if (exploreBtn) exploreBtn.addEventListener("click", openModal);
  if (closePopup) closePopup.addEventListener("click", closeModal);

  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      closeModal();
      showToast("🎵 Subscribed to Premium for ₹99/month!");
    });
  }

  if (premiumPopup) {
    premiumPopup.addEventListener("click", (event) => {
      if (event.target === premiumPopup) closeModal();
    });
  }

  // Also handle keyboard ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && premiumPopup && !premiumPopup.classList.contains("hidden")) {
      closeModal();
    }
  });
}

// ==================== NOTIFICATIONS ====================
function setupNotifications() {
  const notificationsBtn = getElement("#notificationsBtn");
  if (!notificationsBtn) return;
  notificationsBtn.addEventListener("click", () => {
    showToast("🔔 No new notifications", 2200);
  });
}

// ==================== LIKED SONGS BUTTONS ====================
function setupLikedSongsButtons() {
  const likedSongsBtn = getElement("#likedSongsBtn");
  const allSongsBtn = getElement("#allSongsBtn");

  if (likedSongsBtn) {
    likedSongsBtn.addEventListener("click", () => {
      showLikedSongs = true;
      displaySongs = getLikedSongObjects();
      renderSongList();
    });
  }

  if (allSongsBtn) {
    allSongsBtn.addEventListener("click", () => {
      showLikedSongs = false;
      displaySongs = songs.map((track) => ({ folder: currFolder, track }));
      renderSongList();
    });
  }
}

// ==================== HOME BUTTON ====================
function setupHomeButton() {
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.addEventListener("click", () => window.location.reload());
}

// ==================== PROFILE MENU ====================
function setupProfileMenu() {
  const profileIcon = getElement("#profileIcon");
  const profileMenu = getElement("#profileMenu");
  const profileUsername = getElement("#profileUsername");
  const profileEmail = getElement("#profileEmail");
  const profileAvatar = getElement("#profileAvatar");
  const logoutOption = getElement("#logoutOption");
  const profileContainer = getElement(".profileContainer");

  const username = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "email@example.com";
  const initials = username
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  const profileIconText = getElement("#profileIcon");
  if (profileIconText) profileIconText.textContent = initials;
  if (profileUsername) profileUsername.textContent = username;
  if (profileEmail) profileEmail.textContent = email;
  if (profileAvatar) profileAvatar.textContent = initials;

  if (profileIcon && profileMenu) {
    profileIcon.addEventListener("click", (event) => {
      event.stopPropagation();
      profileMenu.classList.toggle("active");
    });
  }

  if (logoutOption) {
    logoutOption.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("is_logged_in");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      window.location.href = "login.html";
    });
  }

  document.addEventListener("click", (event) => {
    if (!profileContainer || !profileMenu) return;
    if (!profileContainer.contains(event.target)) profileMenu.classList.remove("active");
  });
}

// ==================== KEYBOARD SHORTCUTS ====================
function setupKeyboardShortcuts() {
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
        currentSong.volume = Number(vol.value) / 100;
        updateVolumeIcon(currentSong.volume);
      }
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      const vol = document.getElementById("volumeRange");
      if (vol) {
        vol.value = Math.max(0, Number(vol.value) - 5);
        currentSong.volume = Number(vol.value) / 100;
        updateVolumeIcon(currentSong.volume);
      }
    }
  });
}

// ==================== MAIN ====================
async function main() {
  loadLikedSongs();
  setupPlayerEvents();
  setupControlButtons();
  setupSidebarToggle();
  setupLikedSongsButtons();
  setupHomeButton();
  setupPremiumPopup();
  setupNotifications();
  setupProfileMenu();
  setupSidebarEvents();
  setupKeyboardShortcuts();
  await setupSearch();
  await displayAlbums();
  await getSongs(FOLDERS[0]);

  // Set initial volume icon
  const vol = document.getElementById("volumeRange");
  if (vol) {
    currentSong.volume = Number(vol.value) / 100;
    updateVolumeIcon(currentSong.volume);
  }

  // Update play button SVGs in controls
  const prevBtn = document.getElementById("previous");
  const nextBtn = document.getElementById("next");
  const shuffleBtn = document.getElementById("shuffle");
  const repeatBtn = document.getElementById("repeat");

  if (prevBtn) prevBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="20" height="20"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`;
  if (nextBtn) nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="20" height="20"><path d="M6 18l8.5-6L6 6v12zm2-8.14 5.09 3.64L8 17.14V9.86zM16 6h2v12h-2z"/></svg>`;
  if (shuffleBtn) shuffleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="18" height="18"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`;
  if (repeatBtn) repeatBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="18" height="18"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`;

  // Update volume icon initially
  updateVolumeIcon(currentSong.volume);
}

main();

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.querySelector(".topbar");
  if (!header) return;
  if (window.scrollY > 40) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
});
