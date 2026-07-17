import { API_BASE_URL } from './config.js';
import { state } from './state.js';
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

// ==================== NOW PLAYING SIDEBAR DATA & CONTROL ====================
const ARTIST_BIOS = {
  "ncs": "NoCopyrightSounds is a British music label and organization. Founded in 2011, it showcases royalty-free electronic music from artists globally.",
  "karan aujla": "Karan Aujla is a globally acclaimed Punjabi singer, rapper, and songwriter. Known for his chart-topping hits like 'Softly' and 'Making Memories'.",
  "daily mix": "A customized daily mix of your favorite tracks, tailored recommendations, and trending new releases.",
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

export function updateSongInfo(track, autoOpenSidebar = false) {
  const title = track.title || "Unknown Title";
  const songInfo = getElement(".songinfo");
  if (songInfo) songInfo.textContent = title;

  const songArtistEl = getElement(".songartist");
  if (songArtistEl) songArtistEl.textContent = track.artist || "Unknown Artist";

  const sidebar = getElement(".rightSidebar");
  const mainGrid = getElement(".main-grid");
  const nowPlayingCard = getElement("#nowPlayingCard");

  if (autoOpenSidebar) {
    if (sidebar) sidebar.style.display = "flex";
    if (mainGrid) mainGrid.classList.add("sidebar-active");
    const toggleBtn = getElement("#nowPlayingToggleBtn");
    if (toggleBtn) toggleBtn.style.display = "inline-flex";
  }

  if (nowPlayingCard) nowPlayingCard.style.display = "flex";

  const art = getElement("#playbarArt");
  const sideArt = getElement("#nowPlayingArt");
  const nowTitle = getElement("#nowPlayingTitle");
  const nowArtist = getElement("#nowPlayingArtist");
  const artistImg = getElement("#sidebarArtistImg");
  const artistName = getElement("#sidebarArtistName");
  const sidebarHeaderTitle = getElement("#sidebarHeaderTitle");
  const artistBio = getElement("#sidebarArtistBio");

  // Enable buttons in now playing card once track starts
  const shareBtn = getElement(".share-btn");
  const sidebarFavoriteBtn = getElement("#sidebarFavoriteBtn");
  if (shareBtn) shareBtn.removeAttribute("disabled");
  if (sidebarFavoriteBtn) sidebarFavoriteBtn.removeAttribute("disabled");

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
  setImageSrcWithFallback(artistImg, coverUrl);

  if (sideArt) sideArt.classList.remove("placeholder-art");
  if (artistImg) artistImg.classList.remove("placeholder-art");

  if (nowTitle) nowTitle.textContent = title;
  if (nowArtist) nowArtist.textContent = resolvedArtist;
  if (artistName) artistName.textContent = resolvedArtist;
  
  if (sidebarHeaderTitle && state.allAlbums) {
    const album = state.allAlbums.find((a) => a.folder === state.currentFolder);
    sidebarHeaderTitle.textContent = album ? album.title : "Now Playing";
  }

  if (artistBio) {
    artistBio.textContent = getArtistBio(resolvedArtist);
  }

  updatePlaybarLikeButton();
  updateSidebarLikeButton();
  updateCredits(state.currentFolder, resolvedArtist);
}

export function setupSidebarEvents() {
  const mainGrid = getElement(".main-grid");
  const sidebar = getElement(".rightSidebar");
  if (mainGrid) mainGrid.classList.add("sidebar-active");
  if (sidebar) sidebar.style.display = "flex";



  // Handle all Follow buttons (Main artist & credits list)
  document.querySelectorAll(".follow-pill-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isFollowing = btn.classList.contains("following");
      if (isFollowing) {
        btn.classList.remove("following");
        btn.textContent = "Follow";
        showToast("Unfollowed artist");
      } else {
        btn.classList.add("following");
        btn.textContent = "Following";
        showToast("Following artist ✔");
      }
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

  const closeSidebarBtn = getElement(".close-sidebar");
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", () => {
      const idlePromoCard = getElement("#idlePromoCard");
      const nowPlayingCard = getElement("#nowPlayingCard");
      if (nowPlayingCard) nowPlayingCard.style.display = "none";
      if (idlePromoCard) idlePromoCard.style.display = "flex";
      
      const sidebar = getElement(".rightSidebar");
      if (sidebar) sidebar.style.display = "none";
      const mainGrid = getElement(".main-grid");
      if (mainGrid) mainGrid.classList.remove("sidebar-active");
    });
  }

  // Toggle button in topbar header-right
  const toggleBtn = getElement("#nowPlayingToggleBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const sidebar = getElement(".rightSidebar");
      const mainGrid = getElement(".main-grid");
      if (sidebar && mainGrid) {
        const isHidden = window.getComputedStyle(sidebar).display === "none";
        if (isHidden) {
          sidebar.style.display = "flex";
          mainGrid.classList.add("sidebar-active");
        } else {
          sidebar.style.display = "none";
          mainGrid.classList.remove("sidebar-active");
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
  const cardContainer = getElement(".cardContainer");
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
    songs = (loadedSongs || []).map(track => ({ folder, track }));
  } catch (error) {
    console.error("Failed to load folder songs:", error);
  }

  if (songs.length === 0) {
    albumDetailView.innerHTML = `<div style="padding: 40px; text-align: center; color: #b3b3b3;">No tracks found for this album.</div>`;
    return;
  }

  // Render album details and tracklist
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
          <span class="logo-text-small" style="color: #1db954; font-weight: 700;">Musify</span> • ${songs.length} songs
        </div>
      </div>
    </div>

    <div class="album-actions-bar">
      <button class="play-btn-large" id="detailPlayBtn" title="Play Playlist">
        <svg viewBox="0 0 24 24" fill="#000" width="28" height="28" style="margin-left: 2px;"><polygon points="5,3 19,12 5,21"/></svg>
      </button>
    </div>

    <div class="tracklist-container">
      <table class="tracklist-table">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th class="col-title">Title</th>
            <th class="col-album">Album</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          ${songs.map((songItem, index) => {
            const track = songItem.track;
            const title = track.title;
            const artist = track.artist;
            const likedClass = isTrackLiked(songItem.folder, track.id) ? "liked" : "";
            const isActive = state.currentTrack && track.id === state.currentTrack.id && songItem.folder === state.currentFolder ? "active" : "";
            return `
            <tr class="track-row ${isActive}" data-index="${index}">
              <td class="col-num">
                <span class="num">${index + 1}</span>
                <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5,3 19,12 5,21"/></svg>
              </td>
              <td class="col-title">
                <div class="track-info">
                  <div class="track-name">${title}</div>
                  <div class="track-artist">${artist}</div>
                </div>
              </td>
              <td class="col-album">${albumTitle}</td>
              <td class="col-actions">
                <button class="favorite-btn ${likedClass}" title="Save to Liked Songs">
                  <svg viewBox="0 0 24 24" fill="${likedClass ? '#1db954' : 'none'}" stroke="${likedClass ? '#1db954' : '#b3b3b3'}" stroke-width="2" width="20" height="20">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </td>
            </tr>
            `;
          }).join("")}
        </tbody>
      </table>
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
        toggleLikeTrack(song.folder, song.track.id, true);
        const isLiked = isTrackLiked(song.folder, song.track.id);
        favBtn.classList.toggle("liked", isLiked);
        favBtn.querySelector("svg").setAttribute("fill", isLiked ? "#1db954" : "none");
        favBtn.querySelector("svg").setAttribute("stroke", isLiked ? "#1db954" : "#b3b3b3");
      });
    }
  });
}

export function attachAlbumEvents() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const playBtn = card.querySelector(".play");
    const folder = card.dataset.folder;
    const albumTitle = card.querySelector("h2").textContent;
    const albumDescription = card.querySelector("p").textContent;
    const coverUrl = card.querySelector("img").src;

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
  const heroUsername = getElement("#heroUsername");

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

  // Update hero panel username
  if (heroUsername) {
    heroUsername.textContent = username;
  }

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

// ==================== RECENTLY PLAYED SYSTEM ====================
export function getRecentlyPlayed() {
  try {
    const raw = localStorage.getItem("recentlyPlayed");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load recently played:", err);
  }
  return [
    { track: "01 - NCS Track", folder: "ncs", title: "NCS Mix", artist: "Alan Walker, Cartoon, Deaf Kev", coverUrl: "img/music.svg" },
    { track: "01 - Chill Vibes", folder: "vibes songs", title: "Chill Vibes", artist: "Lo-Fi, Punjabi Aesthetic", coverUrl: "img/music.svg" },
    { track: "01 - AP Dhillon", folder: "Ap dillhon", title: "AP Dhillon Hits", artist: "Ap Dhillon, Gurinder Gill", coverUrl: "img/music.svg" },
    { track: "01 - Karan Aujla", folder: "karan aujla", title: "Karan Aujla Specials", artist: "Karan Aujla, Ikky", coverUrl: "img/music.svg" },
    { track: "01 - Honey Singh", folder: "honey singh", title: "Yo Yo Honey Singh", artist: "Yo Yo Honey Singh", coverUrl: "img/music.svg" }
  ];
}

export function addRecentlyPlayed(track, folder) {
  if (!track || !folder) return;
  const list = getRecentlyPlayed();

  let resolvedArtist = folder;
  let coverPath = `img/music.svg`;

  if (state.allAlbums) {
    const album = state.allAlbums.find((a) => a.folder.toLowerCase() === folder.toLowerCase());
    if (album) {
      if (album.description) resolvedArtist = album.description;
      if (album.cover_image) {
        coverPath = album.cover_image;
        if (coverPath.startsWith("/")) coverPath = coverPath.substring(1);
      }
    }
  }

  const cleanTitle = decodeURIComponent(track).replace(/\.mp3$/i, "").replace(/^\d+[\s._-]+/, "");

  const newItem = {
    track,
    folder,
    title: cleanTitle || folder,
    artist: resolvedArtist,
    coverUrl: coverPath
  };

  const filtered = list.filter((item) => !(item.track === track && item.folder === folder));
  filtered.unshift(newItem);

  const updatedList = filtered.slice(0, 12);
  try {
    localStorage.setItem("recentlyPlayed", JSON.stringify(updatedList));
  } catch (err) {
    console.warn("Failed to save recently played:", err);
  }

  renderRecentlyPlayedUI(updatedList);
}

export function renderRecentlyPlayedUI(items = getRecentlyPlayed()) {
  const recentsContainer = getElement("#recentsCardContainer");
  const recentlyPlayedContainer = getElement("#recentlyPlayedCardContainer");

  const buildCardsHTML = (cardItems) => {
    return cardItems.map((item) => `
      <div class="card" data-folder="${item.folder}" data-track="${item.track}">
        <div class="card-image-wrapper">
          <img src="${item.coverUrl}" alt="${item.title}" onerror="this.src='img/music.svg';" />
          <div class="play" onclick="event.stopPropagation();">▶</div>
          <span class="spotify-overlay-logo">
            <svg viewBox="0 0 24 24" fill="#1DB954" width="14" height="14">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-1.007-.333.075-.664-.135-.74-.467-.075-.332.136-.663.468-.74 3.86-.88 7.153-.51 9.82 1.13.292.18.382.566.205.86-.002 0 0 .001 0 0zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.847-.107-.972-.52-.125-.413.108-.847.52-.972 3.67-1.114 8.24-.57 11.35 1.344.366.226.486.707.26 1.07h-.002zm.107-2.846C14.524 8.762 9.018 8.58 5.836 9.545c-.51.155-1.044-.137-1.2-.647-.156-.51.137-1.044.647-1.2 3.676-1.115 9.742-.907 13.684 1.433.46.273.61.87.338 1.33-.273.46-.87.61-1.33.338h-.01z" />
            </svg>
          </span>
        </div>
        <h2>${item.title}</h2>
        <p>${item.artist}</p>
      </div>
    `).join("");
  };

  const bindCardClicks = (container) => {
    if (!container) return;
    container.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", async () => {
        const folder = card.dataset.folder;
        const track = card.dataset.track;
        if (folder) {
          const { loadFolderSongs, playMusic } = await import('./audio.js');
          const songs = await loadFolderSongs(folder);
          
          let trackToPlay = songs[0];
          if (track) {
            const clean = (name) => name.toLowerCase().replace(/\.mp3$/i, "").trim();
            const matched = songs.find(s => clean(s) === clean(track));
            if (matched) trackToPlay = matched;
          }
          
          if (trackToPlay) playMusic(trackToPlay, folder);
        }
      });
    });
  };

  if (recentsContainer) {
    recentsContainer.innerHTML = buildCardsHTML(items.slice(0, 6));
    bindCardClicks(recentsContainer);
  }

  if (recentlyPlayedContainer) {
    recentlyPlayedContainer.innerHTML = buildCardsHTML(items.slice(0, 8));
    bindCardClicks(recentlyPlayedContainer);
  }
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
