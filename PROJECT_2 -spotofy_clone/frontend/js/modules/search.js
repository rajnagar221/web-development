import { FOLDERS, API_BASE_URL } from './config.js';
import { getElement } from './utils.js';
import { loadFolderSongs, playMusic } from './audio.js';
import { fetchSongs } from './api.js';
import { showToast } from './ui.js';
import { state } from './state.js';
import { toggleLikeState, isTrackLiked } from './storage.js';

const searchIconSVG = `<svg class="suggestion-icon" viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

const ALL_TRACKS_DATABASE = [
  { id: "iMzGQX6_", title: "Softly", artist: "Karan Aujla, IKKY", folder: "karan aujla", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4" },
  { id: "DF6eazs2", title: "Winning Speech", artist: "Karan Aujla, MXRCI", folder: "karan aujla", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4" },
  { id: "CVeqCCYc", title: "Tauba Tauba", artist: "Karan Aujla", folder: "karan aujla", cover_image: "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg", url: "https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4" },
  { id: "aAOXwvz-", title: "Born to Shine", artist: "Diljit Dosanjh", folder: "diljit", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg", url: "https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4" },
  { id: "nJ6Z-ayZ", title: "G.O.A.T.", artist: "Diljit Dosanjh", folder: "diljit", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg", url: "https://aac.saavncdn.com/597/ce842951d6cde3c4355046ca5e250809_320.mp4" },
  { id: "0Cu5Kha8", title: "Lemonade", artist: "Diljit Dosanjh", folder: "diljit", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg", url: "https://aac.saavncdn.com/467/c1f149509d4ee7d20c0c4474090ab5f1_320.mp4" },
  { id: "M7k5t7vw", title: "Lover", artist: "Diljit Dosanjh", folder: "diljit", cover_image: "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg", url: "https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4" },
  { id: "DWDSMHh7", title: "Blue Eyes", artist: "Yo Yo Honey Singh", folder: "honey singh", cover_image: "https://c.saavncdn.com/173/GLORY-Hindi-2024-20250117161048-500x500.jpg", url: "https://aac.saavncdn.com/144/ab475350ef2b43b75a24d3d720aaa7a4_320.mp4" },
  { id: "GbaIdJ48", title: "Desi Kalakaar", artist: "Yo Yo Honey Singh", folder: "honey singh", cover_image: "https://c.saavncdn.com/173/GLORY-Hindi-2024-20250117161048-500x500.jpg", url: "https://aac.saavncdn.com/304/f31ba5ffe986d0feb95b3059ad05f4d5_320.mp4" },
  { id: "D6K-hfED", title: "Love Dose", artist: "Yo Yo Honey Singh", folder: "honey singh", cover_image: "https://c.saavncdn.com/173/GLORY-Hindi-2024-20250117161048-500x500.jpg", url: "https://aac.saavncdn.com/304/ed6b172300cca9a418be31a511728f81_320.mp4" },
  { id: "xzUVX40K", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", folder: "ap dillhon", cover_image: "https://c.saavncdn.com/587/Thodi-Si-Daaru-Punjabi-2025-20250717063530-500x500.jpg", url: "https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4" },
  { id: "LuXIJGPC", title: "Insane", artist: "AP Dhillon", folder: "ap dillhon", cover_image: "https://c.saavncdn.com/587/Thodi-Si-Daaru-Punjabi-2025-20250717063530-500x500.jpg", url: "https://aac.saavncdn.com/851/23ba415310e4b119a8452cba3cbbf509_320.mp4" },
  { id: "fHcI5Kka", title: "With You", artist: "AP Dhillon", folder: "ap dillhon", cover_image: "https://c.saavncdn.com/587/Thodi-Si-Daaru-Punjabi-2025-20250717063530-500x500.jpg", url: "https://aac.saavncdn.com/671/50b256cc8e60dc8b0243f5e0767e8467_320.mp4" },
  { id: "295_sidhu", title: "295", artist: "Sidhu Moose Wala", folder: "sidhu moose wala", cover_image: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg", url: "https://aac.saavncdn.com/181/bbfd55734e73fce850122941aa0c1eeb_320.mp4" },
  { id: "last_ride_sidhu", title: "The Last Ride", artist: "Sidhu Moose Wala", folder: "sidhu moose wala", cover_image: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg", url: "https://aac.saavncdn.com/027/3f0447fa4ff5f04b200b3e64d04826b5_320.mp4" },
  { id: "so_high_sidhu", title: "So High", artist: "Sidhu Moose Wala, BYG BYRD", folder: "sidhu moose wala", cover_image: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg", url: "https://aac.saavncdn.com/838/0879c3a37fc68ff9caeb2405ed746816_320.mp4" },
  { id: "mk0bUMgA", title: "Khayaal", artist: "Talwiinder", folder: "talwinder", cover_image: "https://c.saavncdn.com/065/Haseen-Punjabi-2025-20250217081851-500x500.jpg", url: "https://aac.saavncdn.com/482/c9b917787fdd221283bcb11884f4184d_320.mp4" },
  { id: "U9amhr5-", title: "Dhundhala", artist: "Talwiinder", folder: "talwinder", cover_image: "https://c.saavncdn.com/065/Haseen-Punjabi-2025-20250217081851-500x500.jpg", url: "https://aac.saavncdn.com/965/212f0dd59e13c060347033940b6fc552_320.mp4" },
  { id: "6BV_9WZ_", title: "Still Rollin", artist: "Shubh", folder: "daily mix", cover_image: "https://c.saavncdn.com/713/Sicario-Punjabi-2025-20250327070227-500x500.jpg", url: "https://aac.saavncdn.com/704/7a1f8e1c5d1b963d3dadc711ee005d69_320.mp4" },
  { id: "FoOWz-cQ", title: "Cheques", artist: "Shubh", folder: "daily mix", cover_image: "https://c.saavncdn.com/713/Sicario-Punjabi-2025-20250327070227-500x500.jpg", url: "https://aac.saavncdn.com/704/1d43cfc150d1aef7c597c2a9bec1fa48_320.mp4" },
  { id: "WarSRDtF", title: "Baller", artist: "Shubh, IKKY", folder: "daily mix", cover_image: "https://c.saavncdn.com/713/Sicario-Punjabi-2025-20250327070227-500x500.jpg", url: "https://aac.saavncdn.com/489/c05a843e0d1f5c7bf3b29076f8322649_320.mp4" },
  { id: "q7nvYeRF", title: "Big Dawgs", artist: "Hanumankind", folder: "instagram trending", cover_image: "https://c.saavncdn.com/713/Sicario-Punjabi-2025-20250327070227-500x500.jpg", url: "https://aac.saavncdn.com/883/c0a119218206e3e43e2496dc0f2d8d7e_320.mp4" }
];

export async function setupSearch() {
  const searchInput = getElement("#searchInput");
  const searchContainer = getElement("#searchContainer");
  const searchResults = getElement("#searchResults");
  const searchClearBtn = getElement("#searchClearBtn");
  const clearSearchHistoryBtn = getElement("#clearSearchHistoryBtn");

  if (!searchInput || !searchResults) return;

  // Handle Search Clear Button
  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchClearBtn.style.display = "none";
      if (searchContainer) searchContainer.style.display = "none";
      searchResults.innerHTML = "";
      searchInput.focus();
    });
  }

  // Handle Clear Search History Button
  if (clearSearchHistoryBtn) {
    clearSearchHistoryBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      try {
        localStorage.removeItem("searchHistory");
      } catch (err) {
        console.warn("Failed to clear search history:", err);
      }
      searchResults.innerHTML = "";
      if (searchContainer) searchContainer.style.display = "none";
      showToast("🧹 Search history cleared");
    });
  }

  const showContainerIfText = () => {
    if (searchContainer && searchInput.value.trim().length > 0) {
      searchContainer.style.display = "block";
    }
  };

  searchInput.addEventListener("focus", showContainerIfText);
  searchInput.addEventListener("click", showContainerIfText);

  searchInput.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    searchResults.innerHTML = "";
    state.currentSearchQuery = query;

    if (searchClearBtn) {
      searchClearBtn.style.display = query.length > 0 ? "flex" : "none";
    }

    if (query.length === 0) {
      if (searchContainer) searchContainer.style.display = "none";
      return;
    }

    if (searchContainer) searchContainer.style.display = "block";

    // Show a quick loading state
    searchResults.innerHTML = `<div style="padding: 12px; color: #b3b3b3; font-size: 13px;">Searching full tracks...</div>`;

    try {
      let tracks = [];
      try {
        const res = await fetch(`${API_BASE_URL}/api/fullsongs/search?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          tracks = data.songs || [];
        }
      } catch (backendErr) {
        console.warn("Backend fullsongs search unavailable, trying direct search:", backendErr);
      }

      // Fallback to iTunes if online and backend returned empty
      if (tracks.length === 0) {
        try {
          const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`);
          if (res.ok) {
            const data = await res.json();
            const itunesTracks = (data.results || []).filter(item => item.wrapperType === 'track');
            tracks = itunesTracks.map(track => ({
              id: track.trackId.toString(),
              title: track.trackName,
              artist: track.artistName,
              cover_image: track.artworkUrl100 ? track.artworkUrl100.replace("100x100bb", "150x150bb") : "img/music.svg",
              url: track.previewUrl,
              folder: track.collectionId
            }));
          }
        } catch (itunesErr) {
          // Network connection error / offline
        }
      }

      // Offline fallback: search local ALL_TRACKS_DATABASE if still empty
      if (tracks.length === 0) {
        const qLower = query.toLowerCase();
        const localMatches = ALL_TRACKS_DATABASE.filter(item =>
          (item.title && item.title.toLowerCase().includes(qLower)) ||
          (item.artist && item.artist.toLowerCase().includes(qLower)) ||
          (item.folder && item.folder.toLowerCase().includes(qLower))
        );
        tracks = localMatches.map(t => ({
          id: t.id || `local_${t.title}`,
          title: t.title,
          artist: t.artist,
          cover_image: t.cover_image || "img/music.svg",
          url: t.url,
          folder: t.folder
        }));
      }

      if (tracks.length === 0) {
        searchResults.innerHTML = `<div style="padding: 12px; color: #b3b3b3; font-size: 13px;">No results found for "${query}"</div>`;
        return;
      }

      // Render top 3 text suggestions matching Spotify search UI
      const suggestions = [
        `${query}`,
        `${query} songs`,
        `${query} hindi songs`,
        `${query} remix`
      ];

      let html = '';

      // 1. Text suggestions
      suggestions.forEach(s => {
        const rest = s.length > query.length ? s.slice(query.length) : '';
        html += `
          <div class="search-suggestion-item" data-suggestion="${s}">
            <svg class="suggestion-icon" viewBox="0 0 24 24" fill="#b3b3b3" width="18" height="18">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span class="suggestion-text"><strong>${query}</strong>${rest}</span>
          </div>
        `;
      });

      // 2. Track results with cover image, title, subtitle, (+) button, and dynamic play/pause overlay
      tracks.forEach((track, index) => {
        const title = track.title;
        const artist = track.artist || "Unknown Artist";
        const coverUrl = track.cover_image || "img/music.svg";
        const subtitle = track.album ? `Album • ${artist}` : `Song • ${artist}`;
        const folder = track.folder || 'search';
        const isLiked = isTrackLiked(folder, track.id || title);

        const isCurrent = state.currentTrack && 
          ((state.currentTrack.id && state.currentTrack.id === track.id) || 
           (state.currentTrack.title && state.currentTrack.title === title));
        const isPlaying = isCurrent && state.currentSong && !state.currentSong.paused;

        const addIcon = isLiked ? `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#1db954">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        ` : `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        `;

        const playPauseInner = isPlaying ? `
          <div class="search-equalizer">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        ` : (isCurrent ? `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#1db954"><polygon points="5,3 19,12 5,21"/></svg>
        ` : `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><polygon points="5,3 19,12 5,21"/></svg>
        `);

        html += `
          <div class="search-track-row ${isCurrent ? 'is-current' : ''}" data-index="${index}" data-id="${track.id || ''}" data-title="${title}">
            <div class="search-track-left">
              <div class="search-track-thumb-wrapper">
                <img src="${coverUrl}" alt="${title}" class="search-track-thumb" onerror="this.src='img/music.svg';" />
                <button class="search-play-overlay-btn ${isCurrent ? 'active' : ''}" title="${isPlaying ? 'Pause' : 'Play'}" data-index="${index}">
                  ${playPauseInner}
                </button>
              </div>
              <div class="search-track-details">
                <div class="search-track-title" style="${isCurrent ? 'color: #1db954 !important;' : ''}">${title}</div>
                <div class="search-track-sub">${subtitle}</div>
              </div>
            </div>
            <button class="search-add-btn ${isLiked ? 'liked' : ''}" title="${isLiked ? 'Remove from Liked Songs' : 'Add to Library'}" data-index="${index}">
              ${addIcon}
            </button>
          </div>
        `;
      });

      searchResults.innerHTML = html;

      // Suggestion item click -> update input search
      searchResults.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          const sugText = item.dataset.suggestion;
          if (searchInput) {
            searchInput.value = sugText;
            searchInput.dispatchEvent(new Event('input'));
          }
        });
      });

      // Add button click
      searchResults.querySelectorAll('.search-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.index, 10);
          const track = tracks[idx];
          if (!track) return;
          const folder = track.folder || 'search';
          const added = toggleLikeState(folder, track);
          btn.classList.toggle('liked', added);
          btn.title = added ? 'Remove from Liked Songs' : 'Add to Library';
          btn.innerHTML = added ? `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#1db954">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ` : `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          `;
          showToast(added ? `❤ Added "${track.title}" to Liked Songs` : `Removed "${track.title}" from Liked Songs`);
        });
      });

      // Track row click / Play-pause overlay click -> play or pause music
      searchResults.querySelectorAll('.search-track-row').forEach(item => {
        item.addEventListener('click', async (e) => {
          if (e.target.closest('.search-add-btn')) return;
          try {
            const idx = parseInt(item.dataset.index, 10);
            const trackData = tracks[idx];
            if (!trackData) return;
            const folder = trackData.folder || 'search';

            const isCurrent = state.currentTrack && 
              ((state.currentTrack.id && state.currentTrack.id === trackData.id) || 
               (state.currentTrack.title && state.currentTrack.title === trackData.title));

            if (isCurrent && state.currentSong.src) {
              if (state.currentSong.paused) {
                await state.currentSong.play();
              } else {
                state.currentSong.pause();
              }
              updateSearchPlayIcons();
            } else {
              // Populate queue with all search result tracks so Next song auto-plays the search list
              state.songs = tracks;
              state.displaySongs = tracks.map(t => ({ folder: t.folder || 'search', track: t }));
              
              playMusic(trackData, folder);
              updateSearchPlayIcons();
            }
          } catch (err) {
            console.error("Error playing track from search result:", err);
          }
        });
      });

    } catch (e) {
      searchResults.innerHTML = `<div style="padding: 12px; color: #b3b3b3; font-size: 13px;">Error searching songs</div>`;
    }
  });

  // Hide search container when clicking anywhere on the website outside searchInput & searchContainer
  const handleOutsideClick = (e) => {
    if (searchContainer && searchContainer.style.display !== "none") {
      const isInsideInput = searchInput && searchInput.contains(e.target);
      const isInsideContainer = searchContainer && searchContainer.contains(e.target);
      if (!isInsideInput && !isInsideContainer) {
        searchContainer.style.display = "none";
      }
    }
  };

  document.addEventListener("pointerdown", handleOutsideClick, true);
  document.addEventListener("click", handleOutsideClick, true);
}

export function updateSearchPlayIcons() {
  const searchResults = getElement("#searchResults");
  if (!searchResults) return;

  const rows = searchResults.querySelectorAll(".search-track-row");
  rows.forEach(row => {
    const rowId = row.dataset.id;
    const rowTitle = row.dataset.title;

    let isCurrent = false;
    if (state.currentTrack) {
      if (rowId && state.currentTrack.id && String(state.currentTrack.id) === String(rowId)) {
        isCurrent = true;
      } else if (rowTitle && state.currentTrack.title && state.currentTrack.title.trim().toLowerCase() === String(rowTitle).trim().toLowerCase()) {
        isCurrent = true;
      }
    }

    const isPlaying = isCurrent && state.currentSong && !state.currentSong.paused;

    row.classList.toggle("is-current", isCurrent);

    const playBtn = row.querySelector(".search-play-overlay-btn");
    const titleEl = row.querySelector(".search-track-title");

    if (titleEl) {
      titleEl.style.color = isCurrent ? "#1db954" : "#ffffff";
    }

    if (playBtn) {
      playBtn.classList.toggle("active", isCurrent);
      playBtn.title = isPlaying ? "Pause" : "Play";

      if (isPlaying) {
        playBtn.innerHTML = `
          <div class="search-equalizer">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        `;
      } else if (isCurrent) {
        playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#1db954"><polygon points="5,3 19,12 5,21"/></svg>
        `;
      } else {
        playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><polygon points="5,3 19,12 5,21"/></svg>
        `;
      }
    }
  });
}
