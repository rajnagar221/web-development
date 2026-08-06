import { state } from '../state.js';
import { formatTime, getElement } from '../utils.js';
import { isTrackLiked } from '../storage.js';
import { fetchAlbums } from '../api.js';
import { showToast } from './toast-ui.js';
import { updatePlayButton } from './player-ui.js';

let audioModule = null;
async function getAudioModule() {
  if (!audioModule) {
    audioModule = await import('../audio.js');
  }
  return audioModule;
}

async function playMusic(track, folder) {
  const audio = await getAudioModule();
  return audio.playMusic(track, folder);
}

async function loadFolderSongs(folder) {
  const audio = await getAudioModule();
  return audio.loadFolderSongs(folder);
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
        <button class="action-icon-btn" id="detailShuffleBtn" title="Shuffle">
          <svg viewBox="0 0 24 24" fill="#b3b3b3" width="22" height="22"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
        </button>
        <button class="action-icon-btn" id="detailSaveBtn" title="Save to Your Library">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button class="action-icon-btn" id="detailDownloadBtn" title="Download">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8m-4-4l4 4 4-4"/></svg>
        </button>
        <button class="action-icon-btn" id="detailMoreBtn" title="More options">
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
    const likedClass = isTrackLiked(songItem.folder, track.id || title) ? "liked" : "";
    const isCurrent = state.currentTrack && (track.id === state.currentTrack.id || track.title === state.currentTrack.title) && songItem.folder === state.currentFolder;
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
                    <button class="action-icon-btn favorite-btn ${likedClass}" title="Save to Liked Songs" style="padding: 2px;">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="${likedClass ? '#1db954' : 'none'}" stroke="${likedClass ? '#1db954' : '#b3b3b3'}" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                    </button>
                  </div>
                  <span class="duration-text">${duration}</span>
                  <div class="row-hover-icons">
                    <button class="action-icon-btn more-options-btn" title="More options" style="padding: 2px;">
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

  // Shuffle button for album
  const detailShuffleBtn = getElement("#detailShuffleBtn");
  if (detailShuffleBtn) {
    detailShuffleBtn.addEventListener("click", () => {
      state.isShuffle = !state.isShuffle;
      const svg = detailShuffleBtn.querySelector("svg");
      if (svg) svg.setAttribute("fill", state.isShuffle ? "#1db954" : "#b3b3b3");
      showToast(state.isShuffle ? "🔀 Shuffle turned ON" : "🔀 Shuffle turned OFF");
      if (state.isShuffle && songs.length > 0) {
        const randIdx = Math.floor(Math.random() * songs.length);
        playMusic(songs[randIdx].track, folder);
      }
    });
  }

  // Save album to library button
  const detailSaveBtn = getElement("#detailSaveBtn");
  if (detailSaveBtn) {
    detailSaveBtn.addEventListener("click", async () => {
      const historyModule = await import('./history-ui.js');
      let addedAny = false;
      songs.forEach(s => {
        if (!isTrackLiked(s.folder, s.track)) {
          historyModule.toggleLikeTrack(s.folder, s.track, false);
          addedAny = true;
        }
      });
      if (!addedAny) {
        songs.forEach(s => historyModule.toggleLikeTrack(s.folder, s.track, false));
        showToast(`Removed "${albumTitle}" from Liked Songs`);
      } else {
        showToast(`❤ Saved "${albumTitle}" (${songs.length} songs) to Liked Songs`);
      }
      renderAlbumDetailView(folder, albumTitle, albumDescription, coverUrl);
    });
  }

  // Download album button
  const detailDownloadBtn = getElement("#detailDownloadBtn");
  if (detailDownloadBtn) {
    detailDownloadBtn.addEventListener("click", () => {
      showToast(`⚡ Album "${albumTitle}" saved for offline listening!`);
    });
  }

  // More options button for album
  const detailMoreBtn = getElement("#detailMoreBtn");
  if (detailMoreBtn) {
    detailMoreBtn.addEventListener("click", () => {
      try {
        navigator.clipboard?.writeText(window.location.href);
      } catch (err) { }
      showToast(`🔗 Copied album link to clipboard!`);
    });
  }

  // Row selection events
  const rows = albumDetailView.querySelectorAll(".track-row");
  rows.forEach(row => {
    const idx = parseInt(row.getAttribute("data-index"), 10);
    const song = songs[idx];

    row.addEventListener("click", (e) => {
      if (e.target.closest('.favorite-btn') || e.target.closest('.more-options-btn')) return;
      playMusic(song.track, song.folder);
      rows.forEach(r => r.classList.remove("active"));
      row.classList.add("active");
    });

    // Favorite button inside row
    const favBtn = row.querySelector(".favorite-btn");
    if (favBtn) {
      favBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const historyModule = await import('./history-ui.js');
        historyModule.toggleLikeTrack(song.folder, song.track, true);
        const isLiked = isTrackLiked(song.folder, song.track);
        favBtn.classList.toggle("liked", isLiked);
        const svgEl = favBtn.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("fill", isLiked ? "#1db954" : "none");
          svgEl.setAttribute("stroke", isLiked ? "#1db954" : "#b3b3b3");
        }
      });
    }

    // More options button inside row
    const moreRowBtn = row.querySelector(".more-options-btn");
    if (moreRowBtn) {
      moreRowBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showToast(`🎵 Options for "${song.track.title}"`);
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
