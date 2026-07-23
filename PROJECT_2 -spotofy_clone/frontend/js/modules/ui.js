import { API_BASE_URL } from './config.js';
import { state, saveFollowedArtists } from './state.js';
import { formatTime, getElement } from './utils.js';
import { isTrackLiked, getLikedSongObjects, toggleLikeState } from './storage.js';
import { fetchAlbums } from './api.js';
// Late-binding wrappers to break circular dependency with audio.js
let audioModule = null;
async function getAudioModule() {
  if (!audioModule) {
    audioModule = await import('./audio.js');
  }
  return audioModule;
}

export async function playMusic(track, folder) {
  const audio = await getAudioModule();
  return audio.playMusic(track, folder);
}

export async function loadFolderSongs(folder) {
  const audio = await getAudioModule();
  return audio.loadFolderSongs(folder);
}

// ==================== TOAST ====================
export function showToast(message, duration = 2400) {
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

// ==================== PLAY BUTTON SVG ====================
export function updatePlayButton(isPlaying) {
  const playButton = document.getElementById("play");
  if (!playButton) return;
  if (isPlaying) {
    playButton.innerHTML = `<svg viewBox="0 0 24 24" fill="#000" width="18" height="18">
      <rect x="6" y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>`;
  } else {
    playButton.innerHTML = `<svg viewBox="0 0 24 24" fill="#000" width="18" height="18">
      <polygon points="5,3 19,12 5,21"/>
    </svg>`;
  }
}

export function updatePlaybarLikeButton() {
  const button = getElement("#favoritePlaybarBtn");
  if (!button) return;
  const hasTrack = state.currentTrack && state.currentFolder;
  button.disabled = !hasTrack;
  const isLiked = hasTrack && isTrackLiked(state.currentFolder, state.currentTrack);
  button.classList.toggle("liked", isLiked);
  button.innerHTML = isLiked
    ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="#1db954" stroke="#1db954" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
}

export function updateSidebarLikeButton() {
  const button = getElement("#sidebarFavoriteBtn");
  if (!button) return;
  const isLiked = state.currentTrack && state.currentFolder && isTrackLiked(state.currentFolder, state.currentTrack);
  button.classList.toggle("liked", isLiked);
  if (isLiked) {
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="#1db954" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    button.style.color = "#1db954";
  } else {
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" stroke-width="2" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    button.style.color = "#b3b3b3";
  }
}

export function updateCredits(folder, artist) {
  const creditsList = getElement("#creditsList");
  if (!creditsList) return;

  creditsList.innerHTML = "";

  const rawArtists = (artist || "Unknown Artist").split(",").map(a => a.trim()).filter(Boolean);
  const parsedCredits = [];

  if (rawArtists.length > 0) {
    parsedCredits.push({ name: rawArtists[0], role: "Main Artist • Composer", isFollowing: true });
  }
  if (rawArtists.length > 1) {
    parsedCredits.push({ name: rawArtists[1], role: "Main Artist • Video Writer", isFollowing: false });
  }
  if (rawArtists.length > 2) {
    for (let i = 2; i < rawArtists.length; i++) {
      parsedCredits.push({ name: rawArtists[i], role: "Main Artist", isFollowing: false });
    }
  }

  if (parsedCredits.length === 1) {
    const fKey = (folder || "").toLowerCase();
    if (fKey.includes("karan aujla")) {
      parsedCredits.push({ name: "Ikky", role: "Producer • Composer", isFollowing: false });
    } else if (fKey.includes("honey singh")) {
      parsedCredits.push({ name: "Lil Golu", role: "Lyricist • Producer", isFollowing: false });
    } else if (fKey.includes("ap dhillon") || fKey.includes("ap dillhon")) {
      parsedCredits.push({ name: "Gurinder Gill", role: "Featured Artist", isFollowing: false });
    } else if (fKey.includes("ncs")) {
      parsedCredits.push({ name: "Alan Walker", role: "Producer • Remix", isFollowing: false });
    } else {
      parsedCredits.push({ name: "Musify Producer", role: "Composer • Producer", isFollowing: false });
    }
  }

  parsedCredits.forEach(credit => {
    const key = credit.name.toLowerCase().trim();
    const isFollowing = state.followedArtists.has(key);

    const item = document.createElement("div");
    item.className = "credit-item";
    item.innerHTML = `
      <div class="credit-info">
        <span class="credit-name">${credit.name}</span>
        <span class="credit-role">${credit.role}</span>
      </div>
      <button class="follow-pill-btn ${isFollowing ? 'following' : ''}" data-artist="${credit.name}">
        ${isFollowing ? 'Following' : 'Follow'}
      </button>
    `;

    const followBtn = item.querySelector(".follow-pill-btn");
    if (followBtn) {
      followBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFollowArtist(credit.name, credit.name);
      });
    }

    creditsList.appendChild(item);
  });
}

export function updateNextInQueue() {
  const nextQueueCard = getElement("#nextQueueCard");
  const nextArt = getElement("#nextQueueArt");
  const nextTitle = getElement("#nextQueueTitle");
  const nextArtist = getElement("#nextQueueArtist");

  if (!nextQueueCard || !state.displaySongs || state.displaySongs.length === 0) return;

  let currentIndex = -1;
  if (state.currentTrack) {
    currentIndex = state.displaySongs.findIndex(
      (item) => item.track.id === state.currentTrack.id
    );
  }

  let nextIndex = currentIndex + 1;
  if (nextIndex >= state.displaySongs.length) {
    nextIndex = 0;
  }

  const nextSongObj = state.displaySongs[nextIndex];
  if (nextSongObj && nextSongObj.track) {
    const track = nextSongObj.track;
    if (nextArt) nextArt.src = track.cover_image || "img/music.svg";
    if (nextTitle) nextTitle.textContent = track.title || "Next Track";
    if (nextArtist) nextArtist.textContent = track.artist || "Unknown Artist";

    nextQueueCard.onclick = () => {
      import('./audio.js').then(module => {
        module.playMusic(track, nextSongObj.folder);
      });
    };
  }
}

// ==================== NOW PLAYING SIDEBAR DATA & CONTROL ====================
const ARTIST_BIOS = {
  "ncs": "NoCopyrightSounds is a British music label and organization. Founded in 2011, it showcases royalty-free electronic music from artists globally.",
  "karan aujla": "Karan Aujla is a globally acclaimed Punjabi singer, rapper, and songwriter. Known for his chart-topping hits like 'Softly' and 'Making Memories'.",
  "arijit singh": "Arijit Singh is a legendary Indian singer and composer. Known for his soulful and romantic Bollywood hits, he is one of the most successful singers in the history of Indian music.",
  "diljit": "Diljit Dosanjh is a legendary Indian singer, actor, and television presenter. He is one of the leading figures in modern Punjabi music and Bollywood.",
  "honey singh": "Yo Yo Honey Singh is an iconic Indian rapper, music producer, and actor. He revolutionized the Punjabi pop and Bollywood rap scene.",
  "instagram trending": "A curated compilation of viral hits, trending soundbites, and the most popular background scores from social media reels.",
  "vibes songs": "Relaxing lo-fi beats, soothing acoustic covers, and atmospheric melodies perfect for late night drives and focused work.",
  "ap dillhon": "AP Dhillon is a pioneering Indo-Canadian singer and producer. He has popularized a unique blend of Punjabi vocals with synth-pop and western beats.",
  "talwinder": "Talwiinder is an independent singer-songwriter and producer known for his signature dark, melancholic Punjabi pop and moody electronic soundscapes."
};

export function getArtistBio(folder) {
  if (!folder) return "Play a track from your library to see details and bio.";
  const key = folder.toLowerCase().trim();
  return ARTIST_BIOS[key] || "Popular tracks, daily mixes, and custom artist compilations.";
}

export function updateSongInfo(track, autoOpenSidebar = true) {
  const title = track.title || "Unknown Title";
  const songInfo = getElement(".songinfo");
  if (songInfo) songInfo.textContent = title;

  const songArtistEl = getElement(".songartist");
  if (songArtistEl) songArtistEl.textContent = track.artist || "Unknown Artist";

  const sidebar = getElement(".rightSidebar");
  const mainGrid = getElement(".main-grid");

  if (autoOpenSidebar && sidebar && mainGrid) {
    sidebar.style.display = "flex";
    mainGrid.classList.add("sidebar-active");
  }

  const art = getElement("#playbarArt");
  const sideArt = getElement("#nowPlayingArt");
  const nowTitle = getElement("#nowPlayingTitle");
  const nowArtist = getElement("#nowPlayingArtist");
  const sidebarHeaderTitle = getElement("#sidebarHeaderTitle");

  let resolvedArtist = track.artist || "Unknown Artist";
  let coverUrl = track.cover_image || "img/music.svg";

  const setImageSrcWithFallback = (imgEl, primary) => {
    if (!imgEl) return;
    imgEl.onerror = () => {
      imgEl.src = "img/music.svg";
    };
    imgEl.src = primary;
  };

  setImageSrcWithFallback(art, coverUrl);
  setImageSrcWithFallback(sideArt, coverUrl);

  if (nowTitle) nowTitle.textContent = title;
  if (nowArtist) nowArtist.textContent = resolvedArtist;

  if (sidebarHeaderTitle) {
    let headerText = "Now Playing";
    if (state.allAlbums) {
      const album = state.allAlbums.find((a) => a.folder === state.currentFolder);
      if (album) {
        headerText = `${album.title}`;
      } else if (state.currentFolder) {
        headerText = `${state.currentFolder.charAt(0).toUpperCase() + state.currentFolder.slice(1)} Popular`;
      }
    }
    sidebarHeaderTitle.textContent = headerText;
  }

  updatePlaybarLikeButton();
  updateSidebarLikeButton();
  updateCredits(state.currentFolder, resolvedArtist);
  updateNextInQueue();
}

export function setupSidebarEvents() {
  const mainGrid = getElement(".main-grid");
  if (mainGrid) mainGrid.classList.remove("sidebar-active");



  // Handle all Follow buttons (Main artist & credits list)
  document.querySelectorAll(".follow-pill-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parent = btn.closest(".credit-item, .artist-card, .album-header");
      const name = parent ? parent.innerText.split("\n")[0] : state.currentFolder;
      toggleFollowArtist(state.currentFolder || name, name);
    });
  });

  const sidebarFavoriteBtn = getElement("#sidebarFavoriteBtn");
  if (sidebarFavoriteBtn) {
    sidebarFavoriteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!state.currentTrack || !state.currentFolder) return;
      toggleLikeTrack(state.currentFolder, state.currentTrack);
    });
  }

  const sidebarDownloadBtn = getElement("#sidebarDownloadBtn");
  const idleDownloadBtn = getElement("#idleDownloadBtn");
  const openInstallModal = (e) => {
    if (e) e.stopPropagation();
    const modal = getElement("#installAppModal");
    if (modal) modal.classList.remove("hidden");
  };

  if (sidebarDownloadBtn) sidebarDownloadBtn.addEventListener("click", openInstallModal);
  if (idleDownloadBtn) idleDownloadBtn.addEventListener("click", openInstallModal);

  const closeInstallModalBtn = getElement("#closeInstallAppModalBtn");
  if (closeInstallModalBtn) {
    closeInstallModalBtn.addEventListener("click", () => {
      const modal = getElement("#installAppModal");
      if (modal) modal.classList.add("hidden");
    });
  }

  const closeSidebarBtn = getElement(".close-sidebar");
  if (closeSidebarBtn) {
    closeSidebarBtn.style.display = "none";
  }

  // Toggle button in topbar / playbar (Spotify Sidebar View icon [ > | ])
  const toggleBtn = getElement("#nowPlayingToggleBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const sidebar = getElement(".rightSidebar");
      const mainGrid = getElement(".main-grid");
      if (sidebar && mainGrid) {
        const isHidden = !mainGrid.classList.contains("sidebar-active");
        if (isHidden) {
          sidebar.style.display = "flex";
          mainGrid.classList.add("sidebar-active");
          toggleBtn.classList.add("active");
        } else {
          sidebar.style.display = "none";
          mainGrid.classList.remove("sidebar-active");
          toggleBtn.classList.remove("active");
        }
      }
    });
  }

  // Close right sidebar close button (mobile)
  const closeRightBtn = getElement(".close-right");
  if (closeRightBtn) {
    closeRightBtn.addEventListener("click", () => {
      const sidebar = getElement(".rightSidebar");
      const mainGrid = getElement(".main-grid");
      if (sidebar && mainGrid) {
        sidebar.style.display = "none";
        mainGrid.classList.remove("sidebar-active");
      }
    });
  }

  // Fullscreen button for Now Playing Card
  const fullscreenBtn = getElement("#fullscreenNowPlayingBtn");
  const nowPlayingCard = getElement("#nowPlayingCard");
  if (fullscreenBtn && nowPlayingCard) {
    fullscreenBtn.addEventListener("click", () => {
      nowPlayingCard.classList.toggle("fullscreen-mode");
    });
  }
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

// ==================== TIME DISPLAY ====================
export function updateTimeDisplay() {
  const current = formatTime(state.currentSong.currentTime);
  const total = isNaN(state.currentSong.duration) || !state.currentSong.duration ? "0:00" : formatTime(state.currentSong.duration);

  const currentSmall = getElement(".current-time");
  const durationSmall = getElement(".duration");
  if (currentSmall) currentSmall.textContent = current;
  if (durationSmall) durationSmall.textContent = total;

  if (isNaN(state.currentSong.duration) || !state.currentSong.duration) return;
  const pct = (state.currentSong.currentTime / state.currentSong.duration) * 100;

  const seekbar = getElement("#spotifySeekbar");
  if (seekbar) {
    seekbar.value = pct;
    seekbar.style.setProperty("--pct", `${pct}%`);
    seekbar.style.background = `linear-gradient(to right, #ffffff ${pct}%, rgba(255, 255, 255, 0.25) ${pct}%)`;
  }
}

// ==================== LIBRARY ====================
export function updateLibraryButtons() {
  const likedBtn = getElement("#likedSongsBtn");
  const allBtn = getElement("#allSongsBtn");
  const followingBtn = getElement("#followingBtn");
  if (likedBtn) likedBtn.classList.toggle("active", Boolean(state.showLikedSongs));
  if (allBtn) allBtn.classList.toggle("active", !state.showLikedSongs && !state.showFollowing);
  if (followingBtn) followingBtn.classList.toggle("active", Boolean(state.showFollowing));
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
      const likedClass = isTrackLiked(folder, track.id) ? "liked" : "";
      const isActive = state.currentTrack && track.id === state.currentTrack.id && folder === state.currentFolder ? "playing" : "";
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
    li.addEventListener("click", () => {
      const folder = li.dataset.folder;
      const fileId = li.dataset.file;
      const item = currentItems.find(i => i.folder === folder && i.track.id === fileId);
      if (item) {
        playMusic(item.track, item.folder);
      }
    });
  });

  updateLibraryButtons();
}

// ==================== ALBUMS ====================
export async function displayAlbums() {
  const cardContainer = getElement("#popularAlbumsContainer");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  try {
    const albums = await fetchAlbums();
    state.allAlbums = albums;

    for (const album of albums) {
      const imageUrl = album.cover_image || "img/music.svg";
      cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card">
          <div class="card-image-wrapper">
            <img src="${imageUrl}" alt="${album.title}" class="card-img" onerror="this.src='img/music.svg';">
            <div class="play" onclick="event.stopPropagation();">
              <svg viewBox="0 0 24 24" fill="#000" width="18" height="18"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
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

export async function renderAlbumDetailView(folder, albumTitle, albumDescription, coverUrl) {
  const homeSections = getElement("#homeSections");
  const albumDetailView = getElement("#albumDetailView");
  if (!albumDetailView || !homeSections) return;

  // Show loading spinner or clean text first
  albumDetailView.innerHTML = `<div style="padding: 40px; text-align: center; color: #b3b3b3;">Loading tracks...</div>`;
  homeSections.style.display = "none";
  albumDetailView.style.display = "block";

  let songs = [];
  try {
    const loadedSongs = await loadFolderSongs(folder);
    songs = (loadedSongs || []).map(track => {
      if (!track.cover_image || track.cover_image === "img/music.svg") {
        track.cover_image = coverUrl;
      }
      return { folder, track };
    });
  } catch (error) {
    console.error("Failed to load folder songs:", error);
  }

  if (songs.length === 0) {
    albumDetailView.innerHTML = `
    <div class="back-btn-container" id="backToHomeBtn">
      <svg viewBox="0 0 24 24" fill="#b3b3b3" width="18" height="18" style="vertical-align: middle;"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
      <span class="back-label">Back to Library</span>
    </div>

    <div class="album-detail-header">
      <img src="${coverUrl}" alt="${albumTitle}" class="album-detail-cover" onerror="this.src='img/music.svg';" />
      <div class="album-detail-info">
        <span class="eyebrow-text">PLAYLIST</span>
        <h1 class="album-detail-title">${albumTitle}</h1>
        <p class="album-detail-description">${albumDescription}</p>
        <div class="album-detail-meta">
          <span class="logo-text-small" style="color: #1db954; font-weight: 700;">Musify</span> • 0 songs
        </div>
      </div>
    </div>
    <div style="padding: 40px; text-align: center; color: #b3b3b3;">No tracks found for this album.</div>`;

    const backBtn = getElement("#backToHomeBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        albumDetailView.style.display = "none";
        homeSections.style.display = "block";
      });
    }
    return;
  }

  // Render album details and tracklist matching exact Spotify Reference Image
  albumDetailView.innerHTML = `
    <div class="spotify-album-hero" style="background: linear-gradient(180deg, #700f12 0%, #121212 100%);">
      <div class="back-btn-container" id="backToHomeBtn">
        <svg viewBox="0 0 24 24" fill="#fff" width="18" height="18" style="vertical-align: middle;"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
        <span class="back-label" style="color: #fff; font-weight: 600;">Back to Library</span>
      </div>

      <div class="album-hero-content">
        <img src="${coverUrl}" alt="${albumTitle}" class="spotify-album-cover" onerror="this.src='img/music.svg';" />
        <div class="spotify-album-info">
          <span class="album-eyebrow">Album</span>
          <h1 class="spotify-album-title">${albumTitle}</h1>
          <div class="spotify-album-meta">
            <span class="spotify-album-artists" style="font-weight: 700;">${albumDescription}</span>
            <span class="bullet-dot">•</span>
            <span>2024</span>
            <span class="bullet-dot">•</span>
            <span>${songs.length} songs</span>
          </div>
        </div>
      </div>
    </div>

    <div class="spotify-action-bar">
      <div class="action-bar-left">
        <button class="play-btn-large" id="detailPlayBtn" title="Play Playlist">
          <svg viewBox="0 0 24 24" fill="#000" width="28" height="28" style="margin-left: 2px;"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
        <div class="mini-art-pill">
          <img src="${coverUrl}" alt="mini art" onerror="this.src='img/music.svg';" />
        </div>
        <button class="action-icon-btn" title="Shuffle">
          <svg viewBox="0 0 24 24" fill="#b3b3b3" width="22" height="22"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
        </button>
        <button class="action-icon-btn" title="Save to Your Library">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button class="action-icon-btn" title="Download">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4l4 4 4-4"/></svg>
        </button>
        <button class="action-icon-btn" title="More options">
          <svg viewBox="0 0 24 24" fill="#b3b3b3" width="24" height="24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
      <div class="action-bar-right">
        <span style="font-size: 13px; color: #b3b3b3; font-weight: 600;">List</span>
        <svg viewBox="0 0 24 24" fill="#b3b3b3" width="20" height="20"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
      </div>
    </div>

    <div class="tracklist-container">
      <table class="tracklist-table">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th class="col-title">Title</th>
            <th class="col-duration" style="text-align: right; padding-right: 24px;">
              <svg viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16" style="vertical-align: middle;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            </th>
          </tr>
        </thead>
        <tbody>
          ${songs.map((songItem, index) => {
            const track = songItem.track;
            const title = track.title;
            const artist = track.artist;
            const duration = track.duration ? formatTime(track.duration) : "4:15";
            const likedClass = isTrackLiked(songItem.folder, track.id) ? "liked" : "";
            const isPlaying = state.currentSong && !state.currentSong.paused;
            const isCurrent = state.currentTrack && track.id === state.currentTrack.id && songItem.folder === state.currentFolder;
            const isActive = isCurrent ? "active" : "";
            return `
            <tr class="track-row ${isActive}" data-index="${index}">
              <td class="col-num">
                <span class="num">${index + 1}</span>
                <svg class="play-icon" viewBox="0 0 24 24" fill="#fff" width="16" height="16"><polygon points="5,3 19,12 5,21"/></svg>
                <svg class="pause-icon" viewBox="0 0 24 24" fill="#1db954" width="16" height="16"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              </td>
              <td class="col-title">
                <div class="track-info-cell">
                  <div class="track-name" style="${isCurrent ? 'color: #1db954 !important;' : ''}">${title}</div>
                  <div class="track-artist">${artist}</div>
                </div>
              </td>
              <td class="col-duration" style="text-align: right; padding-right: 24px; color: #b3b3b3; font-size: 14px;">
                <div class="col-duration-wrap">
                  <div class="row-hover-icons">
                    <button class="action-icon-btn ${likedClass}" title="Save to Liked Songs" style="padding: 2px;">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="${likedClass ? '#1db954' : 'none'}" stroke="${likedClass ? '#1db954' : '#b3b3b3'}" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                    </button>
                  </div>
                  <span class="duration-text">${duration}</span>
                  <div class="row-hover-icons">
                    <button class="action-icon-btn" title="More options" style="padding: 2px;">
                      <svg viewBox="0 0 24 24" fill="#b3b3b3" width="18" height="18"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            `;
          }).join("")}
        </tbody>
      </table>
      <div class="tracklist-bottom-spacer" style="height: 120px; width: 100%;"></div>
    </div>
  `;

  // Back button event
  const backBtn = getElement("#backToHomeBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      albumDetailView.style.display = "none";
      homeSections.style.display = "block";
    });
  }

  // Play button for entire album
  const detailPlayBtn = getElement("#detailPlayBtn");
  if (detailPlayBtn) {
    detailPlayBtn.addEventListener("click", async () => {
      if (songs.length > 0) {
        if (state.currentFolder !== folder) {
          playMusic(songs[0].track, folder);
        } else {
          if (!state.currentSong.src || state.currentSong.paused) {
            playMusic(state.currentTrack || songs[0].track, folder);
          } else {
            state.currentSong.pause();
            updatePlayButton(false);
            updateAlbumPlayIcons();
          }
        }
      }
    });
  }

  // Row selection events
  const rows = albumDetailView.querySelectorAll(".track-row");
  rows.forEach(row => {
    const idx = parseInt(row.getAttribute("data-index"), 10);
    const song = songs[idx];

    row.addEventListener("click", () => {
      playMusic(song.track, song.folder);
      rows.forEach(r => r.classList.remove("active"));
      row.classList.add("active");
    });

    // Favorite button inside row
    const favBtn = row.querySelector(".favorite-btn");
    if (favBtn) {
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleLikeTrack(song.folder, song.track, true);
        const isLiked = isTrackLiked(song.folder, song.track);
        favBtn.classList.toggle("liked", isLiked);
        const svgEl = favBtn.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("fill", isLiked ? "#1db954" : "none");
          svgEl.setAttribute("stroke", isLiked ? "#1db954" : "#b3b3b3");
        }
      });
    }
  });
}

export function attachAlbumEvents() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    if (card.dataset.listenerBound) return;
    card.dataset.listenerBound = "true";

    const playBtn = card.querySelector(".play");
    const folder = card.dataset.folder;
    let albumTitle = card.querySelector("h2") ? card.querySelector("h2").textContent.trim() : "";
    let albumDescription = card.querySelector("p") ? card.querySelector("p").textContent.trim() : "";
    let coverUrl = card.querySelector("img") ? card.querySelector("img").src : "img/music.svg";

    if (folder && state.allAlbums) {
      const matchedAlbum = state.allAlbums.find(a => a.folder.toLowerCase() === folder.toLowerCase());
      if (matchedAlbum) {
        if (matchedAlbum.title) {
          albumTitle = matchedAlbum.title;
        }
        if (matchedAlbum.description) {
          albumDescription = matchedAlbum.description;
        }
        if (matchedAlbum.cover_image && matchedAlbum.cover_image !== "img/music.svg") {
          const imgEl = card.querySelector("img");
          if (imgEl && imgEl.src.includes("img/music.svg")) {
            imgEl.src = matchedAlbum.cover_image;
          }
          coverUrl = matchedAlbum.cover_image;
        }
      }
    }

    if (playBtn) {
      playBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!folder) return;
        if (folder !== state.currFolder) {
          const loaded = await loadFolderSongs(folder);
          if (loaded && loaded.length > 0) playMusic(loaded[0], folder);
        } else {
          if (!state.currentSong.src) {
            if (!state.songs.length) await loadFolderSongs(folder);
            if (state.songs.length > 0) playMusic(state.songs[0], folder);
          } else if (state.currentSong.paused) {
            state.currentSong.play().catch(e => console.warn(e));
            updatePlayButton(true);
            updateAlbumPlayIcons();
          } else {
            state.currentSong.pause();
            updatePlayButton(false);
            updateAlbumPlayIcons();
          }
        }
      });
    }

    card.addEventListener("click", async () => {
      if (!folder) return;
      renderAlbumDetailView(folder, albumTitle, albumDescription, coverUrl);
    });
  });
}

export function updateAlbumPlayIcons() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const playBtn = card.querySelector(".play");
    if (!playBtn) return;
    const folder = card.dataset.folder;
    const isThisPlaying = folder === state.currFolder && state.currentSong.src && !state.currentSong.paused;
    playBtn.innerHTML = isThisPlaying
      ? `<svg viewBox="0 0 24 24" fill="#000" width="18" height="18"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="#000" width="18" height="18"><polygon points="5,3 19,12 5,21"/></svg>`;
  });

  const detailPlayBtn = getElement("#detailPlayBtn");
  if (detailPlayBtn) {
    const isCurrentPlaying = state.currentSong.src && !state.currentSong.paused;
    detailPlayBtn.innerHTML = isCurrentPlaying
      ? `<svg viewBox="0 0 24 24" fill="#000" width="28" height="28"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="#000" width="28" height="28" style="margin-left: 2px;"><polygon points="5,3 19,12 5,21"/></svg>`;
  }
}

// ==================== VOLUME ICON ====================
export function updateVolumeIcon(vol) {
  const queueBtn = getElement("#queueBtn");
  if (!queueBtn) return;
  if (vol === 0) {
    queueBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  } else if (vol < 0.5) {
    queueBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  } else {
    queueBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  }
}

// ==================== PREMIUM POPUP ====================
export function setupPremiumPopup() {
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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && premiumPopup && !premiumPopup.classList.contains("hidden")) {
      closeModal();
    }
  });
}

// ==================== NOTIFICATIONS ====================
export function setupNotifications() {
  const notificationsBtn = getElement("#notificationsBtn");
  if (!notificationsBtn) return;
  notificationsBtn.addEventListener("click", () => {
    showToast("🔔 No new notifications", 2200);
  });
}

// ==================== PROFILE MENU ====================
// ==================== PROFILE MENU & EDITOR ====================
export function refreshProfileDisplay() {
  const profileIcon = getElement("#profileIcon");
  const profileAvatar = getElement("#profileAvatar");
  const profileUsername = getElement("#profileUsername");
  const profileEmail = getElement("#profileEmail");

  const username = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "email@example.com";
  const profileImage = localStorage.getItem("profile_image");

  // Get initials
  const initials = username
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  // Update text values
  if (profileUsername) profileUsername.textContent = username;
  if (profileEmail) profileEmail.textContent = email;

  // Update profile circles (with custom image or initials)
  if (profileImage) {
    if (profileIcon) {
      profileIcon.innerHTML = `<img src="${profileImage}" alt="${username}" />`;
    }
    if (profileAvatar) {
      profileAvatar.innerHTML = `<img src="${profileImage}" alt="${username}" />`;
    }
  } else {
    if (profileIcon) {
      profileIcon.textContent = initials;
      profileIcon.innerHTML = initials; // Clear any old img element
    }
    if (profileAvatar) {
      profileAvatar.textContent = initials;
      profileAvatar.innerHTML = initials; // Clear any old img element
    }
  }
}

export function setupEditProfileModal() {
  const profileOptionBtn = getElement("#profileOptionBtn");
  const profileModal = getElement("#profileModal");
  const closeProfileModal = getElement("#closeProfileModal");
  const cancelProfileEditBtn = getElement("#cancelProfileEditBtn");
  const editProfileForm = getElement("#editProfileForm");

  const profileUsernameInput = getElement("#profileUsernameInput");
  const profileEmailInput = getElement("#profileEmailInput");
  const profileImageInput = getElement("#profileImageInput");

  const modalProfilePreviewImg = getElement("#modalProfilePreviewImg");
  const modalProfilePreviewInitials = getElement("#modalProfilePreviewInitials");
  const removeProfileImgBtn = getElement("#removeProfileImgBtn");

  let currentBase64Image = localStorage.getItem("profile_image") || "";

  // Open Modal
  if (profileOptionBtn && profileModal) {
    profileOptionBtn.addEventListener("click", () => {
      // Pre-fill inputs
      if (profileUsernameInput) profileUsernameInput.value = localStorage.getItem("username") || "User";
      if (profileEmailInput) profileEmailInput.value = localStorage.getItem("email") || "email@example.com";

      // Setup preview
      currentBase64Image = localStorage.getItem("profile_image") || "";
      updateModalPreview();

      // Show modal
      profileModal.classList.remove("hidden");

      // Close profile menu dropdown
      const profileMenu = getElement("#profileMenu");
      if (profileMenu) profileMenu.classList.remove("active");
    });
  }

  function updateModalPreview() {
    if (currentBase64Image) {
      if (modalProfilePreviewImg) {
        modalProfilePreviewImg.src = currentBase64Image;
        modalProfilePreviewImg.style.display = "block";
      }
      if (modalProfilePreviewInitials) {
        modalProfilePreviewInitials.style.display = "none";
      }
    } else {
      if (modalProfilePreviewImg) {
        modalProfilePreviewImg.style.display = "none";
        modalProfilePreviewImg.src = "";
      }
      if (modalProfilePreviewInitials) {
        const username = profileUsernameInput ? profileUsernameInput.value : "User";
        const initials = username
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0].toUpperCase())
          .slice(0, 2)
          .join("") || "U";
        modalProfilePreviewInitials.textContent = initials;
        modalProfilePreviewInitials.style.display = "flex";
      }
    }
  }

  // Handle username keyup to update preview initials on the fly
  if (profileUsernameInput) {
    profileUsernameInput.addEventListener("input", () => {
      if (!currentBase64Image) {
        updateModalPreview();
      }
    });
  }

  // Close Modal triggers
  const hideModal = () => {
    if (profileModal) profileModal.classList.add("hidden");
  };

  if (closeProfileModal) closeProfileModal.addEventListener("click", hideModal);
  if (cancelProfileEditBtn) cancelProfileEditBtn.addEventListener("click", hideModal);

  // Close Modal when clicking outside the card
  if (profileModal) {
    profileModal.addEventListener("click", (e) => {
      if (e.target === profileModal) {
        hideModal();
      }
    });
  }

  // Handle Image Upload & Conversion to Base64
  if (profileImageInput) {
    profileImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast("❌ Please select a valid image file.");
        return;
      }

      // Limit file size to 2MB to keep localStorage clean and fast
      if (file.size > 2 * 1024 * 1024) {
        showToast("❌ Image must be smaller than 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        currentBase64Image = event.target.result;
        updateModalPreview();
      };
      reader.readAsDataURL(file);
    });
  }

  // Remove Photo button
  if (removeProfileImgBtn) {
    removeProfileImgBtn.addEventListener("click", () => {
      currentBase64Image = "";
      if (profileImageInput) profileImageInput.value = "";
      updateModalPreview();
    });
  }

  // Form Submit
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newUsername = profileUsernameInput ? profileUsernameInput.value.trim() : "User";
      const newEmail = profileEmailInput ? profileEmailInput.value.trim() : "email@example.com";

      if (!newUsername) {
        showToast("❌ Username cannot be empty.");
        return;
      }

      // Save to localStorage
      localStorage.setItem("username", newUsername);
      localStorage.setItem("email", newEmail);
      if (currentBase64Image) {
        localStorage.setItem("profile_image", currentBase64Image);
      } else {
        localStorage.removeItem("profile_image");
      }

      // Refresh page elements
      refreshProfileDisplay();

      // Show toast message
      showToast("✅ Profile updated successfully!");

      // Hide modal
      hideModal();
    });
  }
}

export function setupProfileMenu() {
  const profileIcon = getElement("#profileIcon");
  const profileMenu = getElement("#profileMenu");
  const logoutOption = getElement("#logoutOption");
  const profileContainer = getElement(".profileContainer");

  // Initial display values on load
  refreshProfileDisplay();

  // Set up Edit Profile Modal event listeners
  setupEditProfileModal();

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
      localStorage.removeItem("profile_image");
      window.location.href = "login.html";
    });
  }

  document.addEventListener("click", (event) => {
    if (!profileContainer || !profileMenu) return;
    if (!profileContainer.contains(event.target)) profileMenu.classList.remove("active");
  });
}

// ==================== SIDEBAR TOGGLE ====================
export function setupSidebarToggle() {
  const hamburger = getElement(".hamburger");
  const closeBtn = getElement(".close");
  const sidebar = getElement(".left");
  if (hamburger && closeBtn && sidebar) {
    hamburger.addEventListener("click", () => sidebar.classList.add("active"));
    closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
  }
}

// ==================== LIKED SONGS BUTTONS ====================
export function setupLikedSongsButtons() {
  const likedSongsBtn = getElement("#likedSongsBtn");
  const allSongsBtn = getElement("#allSongsBtn");
  const arijitSinghBtn = getElement("#arijitSinghBtn");

  if (likedSongsBtn) {
    likedSongsBtn.addEventListener("click", () => {
      state.showLikedSongs = true;
      state.displaySongs = getLikedSongObjects();
      renderSongList();

      const albumDetailView = getElement("#albumDetailView");
      const homeSections = getElement("#homeSections");
      if (albumDetailView) albumDetailView.style.display = "none";
      if (homeSections) homeSections.style.display = "block";
    });
  }

  if (allSongsBtn) {
    allSongsBtn.addEventListener("click", async () => {
      state.showLikedSongs = false;
      state.showFollowing = false;
      if (!state.currFolder) {
        if (state.allAlbums && state.allAlbums.length > 0) {
          await loadFolderSongs(state.allAlbums[0].folder);
        } else {
          await loadFolderSongs("karan aujla");
        }
      } else {
        state.displaySongs = state.songs.map((track) => ({ folder: state.currFolder, track }));
        renderSongList();
      }

      const albumDetailView = getElement("#albumDetailView");
      const homeSections = getElement("#homeSections");
      if (albumDetailView) albumDetailView.style.display = "none";
      if (homeSections) homeSections.style.display = "block";
    });
  }

  const followingBtn = getElement("#followingBtn");
  if (followingBtn) {
    followingBtn.addEventListener("click", () => {
      state.showLikedSongs = false;
      state.showFollowing = true;
      renderFollowingList();

      const albumDetailView = getElement("#albumDetailView");
      const homeSections = getElement("#homeSections");
      if (albumDetailView) albumDetailView.style.display = "none";
      if (homeSections) homeSections.style.display = "block";
    });
  }
}

export function toggleFollowArtist(artistKey, artistName = "") {
  if (!artistKey) return false;
  const key = artistKey.toLowerCase().trim();
  const isFollowing = state.followedArtists.has(key);

  if (isFollowing) {
    state.followedArtists.delete(key);
    saveFollowedArtists();
    showToast(`Unfollowed ${artistName || key}`);
  } else {
    state.followedArtists.add(key);
    saveFollowedArtists();
    showToast(`Following ${artistName || key}`);
  }

  // Real-time update UI buttons across the entire page (Credits box, sidebar, headers)
  document.querySelectorAll(".follow-pill-btn").forEach((btn) => {
    const dataArtist = (btn.getAttribute("data-artist") || "").toLowerCase().trim();
    const parent = btn.closest(".credit-item, .artist-card, .album-header");
    const nameText = parent ? parent.innerText.toLowerCase() : "";

    if (dataArtist === key || nameText.includes(key)) {
      if (state.followedArtists.has(key)) {
        btn.classList.add("following");
        btn.textContent = "Following";
      } else {
        btn.classList.remove("following");
        btn.textContent = "Follow";
      }
    }
  });

  // Always update Left Sidebar Following List in real-time
  renderFollowingList();

  return !isFollowing;
}

export function renderFollowingList() {
  const songListContainer = getElement(".songList ul");
  if (!songListContainer) return;

  const ALL_ARTISTS_MAP = {
    "karan aujla": { folder: "karan aujla", name: "Karan Aujla", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg" },
    "ikky": { folder: "karan aujla", name: "IKKY", subtitle: "Producer • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/500x500bb.jpg" },
    "diljit": { folder: "diljit", name: "Diljit Dosanjh", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg" },
    "diljit dosanjh": { folder: "diljit", name: "Diljit Dosanjh", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/86/86/97868694-9413-a543-514a-a6374469ff97/859736427250_cover.jpg/500x500bb.jpg" },
    "honey singh": { folder: "honey singh", name: "Yo Yo Honey Singh", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b3/b5/d9/b3b5d986-7f6d-a860-b8aa-769e1eef1a92/8902894356299_cover.jpg/500x500bb.jpg" },
    "yo yo honey singh": { folder: "honey singh", name: "Yo Yo Honey Singh", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b3/b5/d9/b3b5d986-7f6d-a860-b8aa-769e1eef1a92/8902894356299_cover.jpg/500x500bb.jpg" },
    "talwinder": { folder: "talwinder", name: "Talwiinder", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4d/62/fd/4d62fd50-5bb8-4449-7a07-27a749dbde66/25UMGIM53708.rgb.jpg/500x500bb.jpg" },
    "ap dillhon": { folder: "ap dillhon", name: "AP Dhillon", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/ac/00/5aac005f-9403-70e4-bce0-cf452017476e/197189606472.jpg/500x500bb.jpg" },
    "ap dhillon": { folder: "ap dillhon", name: "AP Dhillon", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/ac/00/5aac005f-9403-70e4-bce0-cf452017476e/197189606472.jpg/500x500bb.jpg" },
    "pritam": { folder: "karan aujla", name: "Pritam", subtitle: "Composer • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/b3/b5/d9/b3b5d986-7f6d-a860-b8aa-769e1eef1a92/8902894356299_cover.jpg/500x500bb.jpg" },
    "ncs": { folder: "ncs", name: "NCS Music", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/e7/c2/46e7c2f3-19b0-8d25-971b-a8b378916a87/artwork.jpg/500x500bb.jpg" },
    "vibes songs": { folder: "vibes songs", name: "Chill Punjabi Lo-Fi", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3f/d2/f9/3fd2f999-c2c2-4fe6-ecc3-1d30f38904bd/859777326048_cover.jpg/500x500bb.jpg" },
    "instagram trending": { folder: "instagram trending", name: "Reels Viral", subtitle: "Artist • Followed", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/33/58/1a/33581a2a-1b7d-e139-5cb8-0feb931981c9/Lohri3000.jpg/500x500bb.jpg" }
  };

  const followedKeys = Array.from(state.followedArtists);
  const followedList = followedKeys
    .map(k => ALL_ARTISTS_MAP[k] || { folder: k, name: k.charAt(0).toUpperCase() + k.slice(1), subtitle: "Artist • Followed", cover: "img/music.svg" });

  if (followedList.length === 0) {
    songListContainer.innerHTML = `<li class="empty-song-list" style="padding: 16px; color: #b3b3b3; font-size: 13px; text-align: center;">No followed artists yet. Follow artists to see them here!</li>`;
    updateLibraryButtons();
    return;
  }

  songListContainer.innerHTML = followedList.map((artist) => `
    <li class="song-item artist-following-item" data-folder="${artist.folder}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; cursor: pointer; border-radius: 8px; transition: background 0.2s ease;">
      <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
        <img src="${artist.cover}" alt="${artist.name}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;" onerror="this.src='img/music.svg';" />
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 700; color: #fff; font-size: 14px;">${artist.name}</span>
          <span style="font-size: 12px; color: #1db954; font-weight: 600;">${artist.subtitle}</span>
        </div>
      </div>
      <button class="unfollow-btn iconBtn" data-folder="${artist.folder}" data-name="${artist.name}" title="Unfollow artist" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #1db954; font-size: 12px; font-weight: 700; cursor: pointer; padding: 4px 10px; border-radius: 20px;">
        Following
      </button>
    </li>
  `).join("");

  songListContainer.querySelectorAll(".artist-following-item").forEach((item) => {
    item.addEventListener("click", async (e) => {
      if (e.target.classList.contains("unfollow-btn")) return;
      const folder = item.getAttribute("data-folder");
      state.showFollowing = false;
      await loadFolderSongs(folder);
      renderSongList();
    });
  });

  songListContainer.querySelectorAll(".unfollow-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const folder = btn.getAttribute("data-folder");
      const name = btn.getAttribute("data-name");
      toggleFollowArtist(folder, name);
    });
  });

  updateLibraryButtons();
}


// ==================== HOME BUTTON ====================
export function setupHomeButton() {
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener("click", (e) => {
      if (e) e.preventDefault();
      const albumDetailView = getElement("#albumDetailView");
      const homeSections = getElement("#homeSections");
      if (albumDetailView) albumDetailView.style.display = "none";
      if (homeSections) homeSections.style.display = "block";
    });
  }
}

// ==================== SCROLL ROW FUNCTION ====================
window.scrollRow = function (btn, dir) {
  const wrapper = btn.parentNode;
  if (!wrapper) return;
  const row = wrapper.querySelector(".horizontal-row, .cardContainer");
  if (row) row.scrollBy({ left: dir * 420, behavior: "smooth" });
};

// ==================== RECENTLY PLAYED SYSTEM ====================
export function getRecentlyPlayed() {
  return [];
}

export function addRecentlyPlayed(track, folder) {
  // Recently played feature disabled
}

export function renderRecentlyPlayedUI(items = []) {
  // Recently played feature disabled - preserves static home layout
}

// PWA Install Prompt Listener
let deferredPwaPrompt = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
  });
}

// ==================== INSTALL APP POPUP MODAL ====================
export function setupInstallAppModal() {
  const installAppBtn = getElement("#installAppBtn");
  const installAppModal = getElement("#installAppModal");
  const closeInstallAppModalBtn = getElement("#closeInstallAppModalBtn");
  const modalDownloadAppBtn = getElement("#modalDownloadAppBtn");

  const openModal = () => {
    if (installAppModal) {
      installAppModal.classList.remove("hidden");
      installAppModal.style.display = "flex";
      installAppModal.setAttribute("aria-hidden", "false");
    }
  };

  const closeModal = () => {
    if (installAppModal) {
      installAppModal.classList.add("hidden");
      installAppModal.style.display = "none";
      installAppModal.setAttribute("aria-hidden", "true");
    }
  };

  if (installAppBtn) installAppBtn.addEventListener("click", openModal);
  if (closeInstallAppModalBtn) closeInstallAppModalBtn.addEventListener("click", closeModal);

  if (modalDownloadAppBtn) {
    modalDownloadAppBtn.addEventListener("click", async () => {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        const choice = await deferredPwaPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          showToast("✅ Musify App installed successfully!");
        } else {
          showToast("✅ Musify App is ready for Web & PWA!");
        }
        deferredPwaPrompt = null;
      } else {
        showToast("✅ Musify Web App is ready for installation!");
      }
      closeModal();
    });
  }

  if (installAppModal) {
    installAppModal.addEventListener("click", (e) => {
      if (e.target === installAppModal) closeModal();
    });
  }
}

export function triggerDesktopAppDownload() {
  showToast("✅ Musify Web App is ready to use!");
}

// ==================== SPOTIFY ACCOUNT OVERVIEW PAGE (Screenshots 2, 3, 4, 5) ====================
export function setupAccountOverviewPage() {
  const accountOptionBtn = getElement("#accountOptionBtn");
  const accountOverviewPage = getElement("#accountOverviewPage");
  const homeSections = getElement("#homeSections");
  const albumDetailView = getElement("#albumDetailView");
  const accountBackBtn = getElement("#accountBackBtn");

  const openAccountPage = () => {
    if (homeSections) homeSections.style.display = "none";
    if (albumDetailView) albumDetailView.style.display = "none";
    if (accountOverviewPage) accountOverviewPage.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeAccountPage = () => {
    if (accountOverviewPage) accountOverviewPage.style.display = "none";
    if (homeSections) homeSections.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (accountOptionBtn) accountOptionBtn.addEventListener("click", openAccountPage);
  if (accountBackBtn) accountBackBtn.addEventListener("click", closeAccountPage);

  if (accountOverviewPage) {
    accountOverviewPage.querySelectorAll(".box-menu-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        handleAccountAction(action);
      });
    });

    const accExplorePlansBtn = getElement("#accExplorePlansBtn");
    const accJoinPremiumBtn = getElement("#accJoinPremiumBtn");
    const premiumPopup = getElement("#premiumPopup");

    const openPremium = () => {
      if (premiumPopup) {
        premiumPopup.classList.remove("hidden");
        premiumPopup.style.display = "flex";
      }
    };

    if (accExplorePlansBtn) accExplorePlansBtn.addEventListener("click", openPremium);
    if (accJoinPremiumBtn) accJoinPremiumBtn.addEventListener("click", openPremium);
  }
}

export function handleAccountAction(action) {
  switch (action) {
    case "subscription":
    case "explore-plans":
      const premiumPopup = getElement("#premiumPopup");
      if (premiumPopup) {
        premiumPopup.classList.remove("hidden");
        premiumPopup.style.display = "flex";
      }
      break;

    case "edit-profile":
      const profileModal = getElement("#profileModal");
      if (profileModal) {
        profileModal.classList.remove("hidden");
        profileModal.style.display = "flex";
      }
      break;

    case "recover-playlists":
      showToast("🔄 Restored 3 deleted playlists to your library!");
      break;

    case "address":
      const currentAddress = localStorage.getItem("user_address") || "New Delhi, India";
      const newAddress = prompt("Enter your account address:", currentAddress);
      if (newAddress !== null) {
        localStorage.setItem("user_address", newAddress.trim());
        showToast("🏠 Address updated successfully!");
      }
      break;

    case "payment-history":
      showToast("📑 Payment History: Free Tier Plan (₹0 billed)");
      break;

    case "saved-cards":
      showToast("💳 No saved payment cards. Click Explore Plans to add one.");
      break;

    case "redeem":
      const code = prompt("Enter your 12-digit Musify Gift Code:");
      if (code) {
        showToast("✨ Gift Code applied! 1 Month Premium activated!");
      }
      break;

    case "manage-apps":
      showToast("🔲 0 third-party apps connected to your account.");
      break;

    case "notifications":
      const isMuted = localStorage.getItem("notifications_muted") === "true";
      localStorage.setItem("notifications_muted", (!isMuted).toString());
      showToast(isMuted ? "🔔 Notifications enabled!" : "🔕 Notifications muted.");
      break;

    case "privacy":
      showToast("👁️ Account Privacy: Listening activity is set to Private.");
      break;

    case "edit-login":
      showToast("🪪 Login Methods: Passkey, Email & Google SSO active.");
      break;

    case "device-password":
      const pass = prompt("Set a new device PIN / Password:");
      if (pass) {
        showToast("📱 Device password updated successfully!");
      }
      break;

    case "delete-account":
      if (confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone.")) {
        localStorage.clear();
        showToast("🗑️ Account deleted.");
        setTimeout(() => window.location.href = "signup.html", 1200);
      }
      break;

    case "sign-out-everywhere":
      if (confirm("➔ Sign out of all devices? You will be logged out here as well.")) {
        localStorage.removeItem("token");
        localStorage.removeItem("is_logged_in");
        showToast("➔ Signed out of all devices.");
        setTimeout(() => window.location.href = "login.html", 1000);
      }
      break;

    case "support":
      showToast("❓ Opening Musify Support Center...");
      break;

    default:
      showToast("⚙️ Action processed.");
      break;
  }
}

// ==================== SETTINGS PAGE LOGIC (Screenshots 1 & 2) ====================
export function setupSettingsPage() {
  const settingsOptionBtn = getElement("#settingsOptionBtn");
  const settingsViewPage = getElement("#settingsViewPage");
  const homeSections = getElement("#homeSections");
  const albumDetailView = getElement("#albumDetailView");
  const accountOverviewPage = getElement("#accountOverviewPage");
  const settingsBackBtn = getElement("#settingsBackBtn");

  const openSettings = () => {
    if (homeSections) homeSections.style.display = "none";
    if (albumDetailView) albumDetailView.style.display = "none";
    if (accountOverviewPage) accountOverviewPage.style.display = "none";
    if (settingsViewPage) settingsViewPage.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeSettings = () => {
    if (settingsViewPage) settingsViewPage.style.display = "none";
    if (homeSections) homeSections.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (settingsOptionBtn) settingsOptionBtn.addEventListener("click", openSettings);
  if (settingsBackBtn) settingsBackBtn.addEventListener("click", closeSettings);

  // 1. Edit Login Methods
  const editLoginMethodsBtn = getElement("#editLoginMethodsBtn");
  if (editLoginMethodsBtn) {
    editLoginMethodsBtn.addEventListener("click", () => {
      const profileModal = getElement("#profileModal");
      if (profileModal) {
        profileModal.classList.remove("hidden");
        profileModal.style.display = "flex";
      }
    });
  }

  // 2. Language Dropdown
  const appLanguageSelect = getElement("#appLanguageSelect");
  if (appLanguageSelect) {
    const savedLang = localStorage.getItem("app_language") || "en";
    appLanguageSelect.value = savedLang;
    appLanguageSelect.addEventListener("change", (e) => {
      localStorage.setItem("app_language", e.target.value);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showToast(`🌐 Language set to ${selectedText}. Changes applied!`);
    });
  }

  // 3. Audio Quality Select
  const audioQualitySelect = getElement("#audioQualitySelect");
  if (audioQualitySelect) {
    const savedQuality = localStorage.getItem("audio_quality") || "very_high";
    audioQualitySelect.value = savedQuality;
    audioQualitySelect.addEventListener("change", (e) => {
      localStorage.setItem("audio_quality", e.target.value);
      const label = e.target.options[e.target.selectedIndex].text;
      showToast(`🔊 Streaming Quality set to ${label}!`);
    });
  }

  // 4. Normalize Volume Toggle
  const normalizeVolumeToggle = getElement("#normalizeVolumeToggle");
  if (normalizeVolumeToggle) {
    normalizeVolumeToggle.checked = localStorage.getItem("normalize_volume") !== "false";
    normalizeVolumeToggle.addEventListener("change", (e) => {
      localStorage.setItem("normalize_volume", e.target.checked);
      showToast(e.target.checked ? "🎚️ Volume Normalization enabled." : "🎚️ Volume Normalization disabled.");
    });
  }

  // 5. Compact Library Layout Toggle
  const compactLibraryToggle = getElement("#compactLibraryToggle");
  if (compactLibraryToggle) {
    compactLibraryToggle.checked = localStorage.getItem("compact_library") === "true";
    compactLibraryToggle.addEventListener("change", (e) => {
      localStorage.setItem("compact_library", e.target.checked);
      const sidebar = getElement(".rightSidebar");
      if (sidebar) {
        if (e.target.checked) sidebar.classList.add("compact-mode");
        else sidebar.classList.remove("compact-mode");
      }
      showToast(e.target.checked ? "📐 Compact library layout enabled." : "📐 Standard library layout enabled.");
    });
  }

  // 6. Import Library Button & File Input
  const importLibraryBtn = getElement("#importLibraryBtn");
  const importLibraryInput = getElement("#importLibraryInput");
  if (importLibraryBtn && importLibraryInput) {
    importLibraryBtn.addEventListener("click", () => importLibraryInput.click());
    importLibraryInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        showToast(`📁 Successfully imported ${e.target.files.length} audio tracks into Your Library!`);
      }
    });
  }

  // 7. Desktop Notifications Toggle
  const desktopNotifyToggle = getElement("#desktopNotifyToggle");
  if (desktopNotifyToggle) {
    desktopNotifyToggle.checked = localStorage.getItem("desktop_notify") !== "false";
    desktopNotifyToggle.addEventListener("change", (e) => {
      localStorage.setItem("desktop_notify", e.target.checked);
      showToast(e.target.checked ? "🔔 Desktop notifications enabled." : "🔕 Desktop notifications disabled.");
    });
  }

  // 8. Auto Now Playing Toggle
  const autoNowPlayingToggle = getElement("#autoNowPlayingToggle");
  if (autoNowPlayingToggle) {
    autoNowPlayingToggle.checked = localStorage.getItem("auto_now_playing") !== "false";
    autoNowPlayingToggle.addEventListener("change", (e) => {
      localStorage.setItem("auto_now_playing", e.target.checked);
      showToast(e.target.checked ? "🖼️ Now Playing sidebar panel set to auto-show." : "🖼️ Now Playing panel auto-show disabled.");
    });
  }

  // 9. Canvas Toggle (Screenshot 2)
  const canvasToggle = getElement("#canvasToggle");
  if (canvasToggle) {
    canvasToggle.checked = localStorage.getItem("canvas_enabled") !== "false";
    canvasToggle.addEventListener("change", (e) => {
      localStorage.setItem("canvas_enabled", e.target.checked);
      showToast(e.target.checked ? "🎬 Looping visual Canvas enabled." : "🎬 Canvas visuals disabled.");
    });
  }

  // 10. Other Videos Toggle (Screenshot 2)
  const otherVideosToggle = getElement("#otherVideosToggle");
  if (otherVideosToggle) {
    otherVideosToggle.checked = localStorage.getItem("other_videos_enabled") !== "false";
    otherVideosToggle.addEventListener("change", (e) => {
      localStorage.setItem("other_videos_enabled", e.target.checked);
      showToast(e.target.checked ? "📹 Video podcasts & videos enabled." : "🎧 Video podcasts set to audio-only.");
    });
  }

  // 11. Autoplay Toggle (Screenshot 2)
  const autoplayToggle = getElement("#autoplayToggle");
  if (autoplayToggle) {
    autoplayToggle.checked = localStorage.getItem("autoplay_enabled") !== "false";
    autoplayToggle.addEventListener("change", (e) => {
      localStorage.setItem("autoplay_enabled", e.target.checked);
      showToast(e.target.checked ? "🔁 Non-stop Autoplay enabled." : "⏹️ Autoplay disabled.");
    });
  }

  // 12. Crossfade Songs Range Slider (Screenshot 2)
  const crossfadeRange = getElement("#crossfadeRange");
  const crossfadeVal = getElement("#crossfadeVal");
  if (crossfadeRange && crossfadeVal) {
    const savedCrossfade = localStorage.getItem("crossfade_sec") || "0";
    crossfadeRange.value = savedCrossfade;
    crossfadeVal.textContent = `${savedCrossfade}s`;

    const updateCrossfade = (val) => {
      crossfadeVal.textContent = `${val}s`;
      localStorage.setItem("crossfade_sec", val);
    };

    crossfadeRange.addEventListener("input", (e) => updateCrossfade(e.target.value));
    crossfadeRange.addEventListener("change", (e) => {
      updateCrossfade(e.target.value);
      showToast(`🎚️ Track Crossfade set to ${e.target.value}s.`);
    });
  }

  // 13. Mono Audio Toggle (Screenshot 2)
  const monoAudioToggle = getElement("#monoAudioToggle");
  if (monoAudioToggle) {
    monoAudioToggle.checked = localStorage.getItem("mono_audio") === "true";
    monoAudioToggle.addEventListener("change", (e) => {
      localStorage.setItem("mono_audio", e.target.checked);
      showToast(e.target.checked ? "🎧 Mono Audio enabled (Left + Right merged)." : "🎧 Stereo Audio active.");
    });
  }
}
