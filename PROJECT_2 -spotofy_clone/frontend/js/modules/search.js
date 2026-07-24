import { FOLDERS, API_BASE_URL } from './config.js';
import { getElement } from './utils.js';
import { loadFolderSongs, playMusic } from './audio.js';
import { fetchSongs } from './api.js';
import { showToast } from './ui.js';
import { state } from './state.js';

const searchIconSVG = `<svg class="suggestion-icon" viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

const ALL_TRACKS_DATABASE = [
  { track: "tera hone laga hu.mp3", folder: "ncs", title: "Tera Hone Laga Hu", artist: "NCS / Ajab Prem Ki Ghazab" },
  { track: "01 - Invincible.mp3", folder: "ncs", title: "Invincible", artist: "DEAF KEV" },
  { track: "02 - Sky High.mp3", folder: "ncs", title: "Sky High", artist: "Elektronomia" },
  { track: "03 - Mortals.mp3", folder: "ncs", title: "Mortals", artist: "Warriyo feat. Laura Brehm" },
  { track: "01 - Softly.mp3", folder: "karan aujla", title: "Softly", artist: "Karan Aujla, Ikky" },
  { track: "02 - Winning Speech.mp3", folder: "karan aujla", title: "Winning Speech", artist: "Karan Aujla" },
  { track: "03 - Tauba Tauba.mp3", folder: "karan aujla", title: "Tauba Tauba", artist: "Karan Aujla" },
  { track: "01 - Born to Shine.mp3", folder: "Diljit", title: "Born to Shine", artist: "Diljit Dosanjh" },
  { track: "02 - G.O.A.T..mp3", folder: "Diljit", title: "G.O.A.T.", artist: "Diljit Dosanjh" },
  { track: "03 - Lemonade.mp3", folder: "Diljit", title: "Lemonade", artist: "Diljit Dosanjh" },
  { track: "01 - Blue Eyes.mp3", folder: "honey singh", title: "Blue Eyes", artist: "Yo Yo Honey Singh" },
  { track: "02 - Desi Kalakaar.mp3", folder: "honey singh", title: "Desi Kalakaar", artist: "Yo Yo Honey Singh" },
  { track: "03 - Love Dose.mp3", folder: "honey singh", title: "Love Dose", artist: "Yo Yo Honey Singh" },
  { track: "01 - Brown Munde.mp3", folder: "Ap dillhon", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill" },
  { track: "02 - Insane.mp3", folder: "Ap dillhon", title: "Insane", artist: "AP Dhillon" },
  { track: "03 - With You.mp3", folder: "Ap dillhon", title: "With You", artist: "AP Dhillon" },
  { track: "01 - Chill Beats.mp3", folder: "vibes songs", title: "Chill Beats", artist: "Lofi Vibes" },
  { track: "02 - Midnight Lofi.mp3", folder: "vibes songs", title: "Midnight Lofi", artist: "Aesthetic Soundscapes" },
  { track: "01 - Reel Song 1.mp3", folder: "instagram trending", title: "Reel Song 1", artist: "Instagram Trending" },
  { track: "02 - Viral Vibe.mp3", folder: "instagram trending", title: "Viral Vibe", artist: "Trending Reels" },
  { track: "01 - Khayaal.mp3", folder: "talwinder", title: "Khayaal", artist: "Talwiinder" },
  { track: "02 - Dhundhala.mp3", folder: "talwinder", title: "Dhundhala", artist: "Talwiinder" }
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

  searchInput.addEventListener("focus", () => {
    if (searchContainer && searchInput.value.trim().length > 0) {
      searchContainer.style.display = "block";
    }
  });

  searchInput.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    searchResults.innerHTML = "";

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

      // Fallback to iTunes if backend returns empty
      if (tracks.length === 0) {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`);
        const data = await res.json();
        const itunesTracks = data.results.filter(item => item.wrapperType === 'track');
        tracks = itunesTracks.map(track => ({
          id: track.trackId.toString(),
          title: track.trackName,
          artist: track.artistName,
          cover_image: track.artworkUrl100 ? track.artworkUrl100.replace("100x100bb", "150x150bb") : "img/music.svg",
          url: track.previewUrl,
          folder: track.collectionId
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

      // 2. Track results with cover image, title, category/artist subtitle, and (+) button
      tracks.forEach(track => {
        const title = track.title;
        const artist = track.artist || "Unknown Artist";
        const coverUrl = track.cover_image || "img/music.svg";
        const subtitle = track.album ? `Album • ${artist}` : `Song • ${artist}`;
        const serializedTrack = encodeURIComponent(JSON.stringify(track));

        html += `
          <div class="search-track-row" data-track="${serializedTrack}" data-folder="${track.folder || 'search'}">
            <div class="search-track-left">
              <img src="${coverUrl}" alt="${title}" class="search-track-thumb" onerror="this.src='img/music.svg';" />
              <div class="search-track-details">
                <div class="search-track-title">${title}</div>
                <div class="search-track-sub">${subtitle}</div>
              </div>
            </div>
            <button class="search-add-btn" title="Add to Library" data-title="${title}">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
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
          const songTitle = btn.dataset.title || "Song";
          showToast(`❤ Added "${songTitle}" to Liked Songs`);
        });
      });

    } catch (e) {
      searchResults.innerHTML = `<div style="padding: 12px; color: #b3b3b3; font-size: 13px;">Error searching songs</div>`;
    }

    searchResults.querySelectorAll('.search-track-row').forEach(item => {
      item.addEventListener('click', async (e) => {
        if (e.target.closest('.search-add-btn')) return;
        try {
          const trackData = JSON.parse(decodeURIComponent(item.dataset.track));
          const folder = item.dataset.folder;
          
          state.songs = [trackData];
          state.displaySongs = [{ folder: folder, track: trackData }];
          
          playMusic(trackData, folder);

          if (searchContainer) searchContainer.style.display = "none";
          if (searchInput) searchInput.value = "";
          searchResults.innerHTML = "";
        } catch (err) {
          console.error("Failed to parse track from search result", err);
        }
      });
    });
  });

  document.addEventListener("click", (e) => {
    const bar = document.querySelector('.header-search');
    if (bar && !bar.contains(e.target)) {
      if (searchContainer) searchContainer.style.display = "none";
    }
  });
}
