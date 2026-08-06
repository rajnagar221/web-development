import { state, saveFollowedArtists } from '../state.js';
import { getElement } from '../utils.js';
import { showToast } from './toast-ui.js';
import { ALL_ARTISTS_MAP, updateLibraryButtons } from './player-ui.js';

let historyModule = null;
async function getHistoryModule() {
  if (!historyModule) {
    historyModule = await import('./history-ui.js');
  }
  return historyModule;
}

let audioModule = null;
async function getAudioModule() {
  if (!audioModule) {
    audioModule = await import('../audio.js');
  }
  return audioModule;
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
    sidebarFavoriteBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!state.currentTrack || !state.currentFolder) return;
      const history = await getHistoryModule();
      history.toggleLikeTrack(state.currentFolder, state.currentTrack);
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

  const followedKeys = Array.from(state.followedArtists);
  const seenNames = new Set();
  const followedList = [];

  for (const k of followedKeys) {
    const info = ALL_ARTISTS_MAP[k] || { folder: k, name: k.charAt(0).toUpperCase() + k.slice(1), subtitle: "Artist", cover: "img/music.svg" };
    const normName = info.name.toLowerCase().trim();
    if (!seenNames.has(normName)) {
      seenNames.add(normName);
      followedList.push(info);
    }
  }

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
          <span style="font-size: 12px; color: #b3b3b3; font-weight: 500;">Artist</span>
        </div>
      </div>
    </li>
  `).join("");

  songListContainer.querySelectorAll(".artist-following-item").forEach((item) => {
    item.addEventListener("click", async (e) => {
      const folder = item.getAttribute("data-folder");
      state.showFollowing = false;
      const audio = await getAudioModule();
      await audio.loadFolderSongs(folder);
      const history = await getHistoryModule();
      history.renderSongList();
    });
  });

  updateLibraryButtons();
}

export function setupHomeButton() {
  const homeBtn = document.getElementById("homeBtn");
  const brandLogo = document.querySelector(".sidebar-brand");

  const resetToHome = (e) => {
    if (e) e.preventDefault();
    const albumDetailView = getElement("#albumDetailView");
    const homeSections = getElement("#homeSections");
    const accountOverviewPage = getElement("#accountOverviewPage");
    const settingsViewPage = getElement("#settingsViewPage");

    if (accountOverviewPage) accountOverviewPage.style.display = "none";
    if (settingsViewPage) settingsViewPage.style.display = "none";
    if (albumDetailView) albumDetailView.style.display = "none";
    if (homeSections) homeSections.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (homeBtn) homeBtn.addEventListener("click", resetToHome);
  if (brandLogo) brandLogo.addEventListener("click", resetToHome);
}

export function setupSidebarToggle() {
  const hamburger = getElement(".hamburger");
  const closeBtn = getElement(".close");
  const sidebar = getElement(".left");
  if (hamburger && closeBtn && sidebar) {
    hamburger.addEventListener("click", () => sidebar.classList.add("active"));
    closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
  }
}

export function setupLikedSongsButtons() {
  const likedSongsBtn = getElement("#likedSongsBtn");
  const allSongsBtn = getElement("#allSongsBtn");
  const followingBtn = getElement("#followingBtn");

  if (likedSongsBtn) {
    likedSongsBtn.addEventListener("click", async () => {
      const history = await getHistoryModule();
      const storage = await import('../storage.js');
      state.showLikedSongs = true;
      state.displaySongs = storage.getLikedSongObjects();
      history.renderSongList();

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
      const audio = await getAudioModule();
      const history = await getHistoryModule();
      if (!state.currFolder) {
        if (state.allAlbums && state.allAlbums.length > 0) {
          await audio.loadFolderSongs(state.allAlbums[0].folder);
        } else {
          await audio.loadFolderSongs("karan aujla");
        }
      } else {
        state.displaySongs = state.songs.map((track) => ({ folder: state.currFolder, track }));
        history.renderSongList();
      }

      const albumDetailView = getElement("#albumDetailView");
      const homeSections = getElement("#homeSections");
      if (albumDetailView) albumDetailView.style.display = "none";
      if (homeSections) homeSections.style.display = "block";
    });
  }

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

// Global helper for scroll row buttons
if (typeof window !== "undefined") {
  window.scrollRow = function (btn, dir) {
    const wrapper = btn.parentNode;
    if (!wrapper) return;
    const row = wrapper.querySelector(".horizontal-row, .cardContainer");
    if (row) row.scrollBy({ left: dir * 420, behavior: "smooth" });
  };
}
