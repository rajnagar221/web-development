import { API_BASE_URL } from './config.js';
import { state } from './state.js';
import { formatTime, getElement } from './utils.js';
import { isTrackLiked, getLikedSongObjects, toggleLikeState } from './storage.js';
import { fetchAlbums } from './api.js';
import { playMusic, loadFolderSongs } from './audio.js';

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
    ? `<svg viewBox="0 0 24 24" fill="#1db954" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" stroke-width="2" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
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

export function updateSongInfo(track) {
  const title = decodeURIComponent(track.split("/").pop()).replace(/\.mp3$/i, "");
  const songInfo = getElement(".songinfo");
  if (songInfo) songInfo.textContent = title;

  const songArtistEl = getElement(".songartist");

  const sidebar = getElement(".rightSidebar");
  if (sidebar) sidebar.style.display = "flex";

  const art = getElement("#playbarArt");
  const sideArt = getElement("#nowPlayingArt");
  const nowTitle = getElement("#nowPlayingTitle");
  const nowArtist = getElement("#nowPlayingArtist");
  const artistImg = getElement("#sidebarArtistImg");
  const artistName = getElement("#sidebarArtistName");
  const sidebarHeaderTitle = getElement("#sidebarHeaderTitle");

  let resolvedArtist = state.currentFolder || "Unknown artist";
  let coverPath = `songs/${state.currentFolder}/cover.jpg`;

  if (state.allAlbums && state.currentFolder) {
    const album = state.allAlbums.find(
      (a) => a.folder.toLowerCase() === state.currentFolder.toLowerCase()
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
  updateCredits(state.currentFolder, resolvedArtist);
}

export function setupSidebarEvents() {
  const sidebarFavoriteBtn = getElement("#sidebarFavoriteBtn");
  if (sidebarFavoriteBtn) {
    sidebarFavoriteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!state.currentTrack || !state.currentFolder) return;
      toggleLikeTrack(state.currentFolder, state.currentTrack);
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

export function toggleLikeTrack(folder, track, shouldRender = true) {
  const added = toggleLikeState(folder, track);
  showToast(added ? "Added to Liked Songs ❤" : "Removed from Liked Songs");
  updatePlaybarLikeButton();
  updateSidebarLikeButton();
  if (shouldRender) renderSongList();
}

// ==================== TIME DISPLAY ====================
export function updateTimeDisplay() {
  const current = formatTime(state.currentSong.currentTime);
  const total = isNaN(state.currentSong.duration) ? "00:00" : formatTime(state.currentSong.duration);

  const currentSmall = getElement(".current-time");
  const durationSmall = getElement(".duration");
  if (currentSmall) currentSmall.textContent = current;
  if (durationSmall) durationSmall.textContent = total;

  if (isNaN(state.currentSong.duration) || !state.currentSong.duration) return;
  const pct = (state.currentSong.currentTime / state.currentSong.duration) * 100;

  const progressCircle = getElement(".circle");
  if (progressCircle) progressCircle.style.left = `${pct}%`;

  const progressBar = getElement(".seekbar .progress");
  if (progressBar) progressBar.style.width = `${pct}%`;
}

// ==================== LIBRARY ====================
export function updateLibraryButtons() {
  const likedBtn = getElement("#likedSongsBtn");
  const allBtn = getElement("#allSongsBtn");
  if (likedBtn) likedBtn.classList.toggle("active", state.showLikedSongs);
  if (allBtn) allBtn.classList.toggle("active", !state.showLikedSongs);
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
      const title = decodeURIComponent(track).replace(/\.mp3$/i, "");
      const likedClass = isTrackLiked(folder, track) ? "liked" : "";
      const isActive = track === state.currentTrack && folder === state.currentFolder ? "playing" : "";
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

// ==================== ALBUMS ====================
export async function displayAlbums() {
  const cardContainer = getElement(".cardContainer");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  try {
    const albums = await fetchAlbums();
    state.allAlbums = albums;

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

export function attachAlbumEvents() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const playBtn = card.querySelector(".play");
    const folder = card.dataset.folder;

    if (playBtn) {
      playBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!folder) return;
        if (folder !== state.currFolder) {
          await loadFolderSongs(folder);
          if (state.songs.length > 0) playMusic(state.songs[0], folder);
        } else {
          if (!state.currentSong.src || state.currentSong.paused) {
            if (!state.songs.length) await loadFolderSongs(folder);
            if (state.songs.length > 0) playMusic(state.songs[0], folder);
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
      const loadedSongs = await loadFolderSongs(folder);
      if (loadedSongs && loadedSongs.length > 0) playMusic(loadedSongs[0], folder);
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
export function setupProfileMenu() {
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

  if (likedSongsBtn) {
    likedSongsBtn.addEventListener("click", () => {
      state.showLikedSongs = true;
      state.displaySongs = getLikedSongObjects();
      renderSongList();
    });
  }

  if (allSongsBtn) {
    allSongsBtn.addEventListener("click", () => {
      state.showLikedSongs = false;
      state.displaySongs = state.songs.map((track) => ({ folder: state.currFolder, track }));
      renderSongList();
    });
  }
}

// ==================== HOME BUTTON ====================
export function setupHomeButton() {
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.addEventListener("click", () => window.location.reload());
}

// ==================== SCROLL ROW FUNCTION ====================
window.scrollRow = function (btn, dir) {
  const wrapper = btn.parentNode;
  if (!wrapper) return;
  const row = wrapper.querySelector(".horizontal-row, .cardContainer");
  if (row) row.scrollBy({ left: dir * 420, behavior: "smooth" });
};
