import { FOLDERS } from './config.js';
import { getElement } from './utils.js';
import { loadFolderSongs, playMusic } from './audio.js';
import { fetchSongs } from './api.js';
import { showToast } from './ui.js';

const searchIconSVG = `<svg class="suggestion-icon" viewBox="0 0 24 24" fill="#b3b3b3" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

export async function setupSearch() {
  const searchInput = getElement("#searchInput");
  const searchContainer = getElement("#searchContainer");
  const searchResults = getElement("#searchResults");
  const searchClearBtn = getElement("#searchClearBtn");
  const clearSearchHistoryBtn = getElement("#clearSearchHistoryBtn");

  if (!searchInput || !searchResults) return;

  // Handle Search Clear Button (X icon inside search input)
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
    const lowerQuery = query.toLowerCase();
    searchResults.innerHTML = "";

    if (searchClearBtn) {
      searchClearBtn.style.display = query.length > 0 ? "flex" : "none";
    }

    if (query.length === 0) {
      if (searchContainer) searchContainer.style.display = "none";
      return;
    }

    if (searchContainer) searchContainer.style.display = "block";

    // --- 1. Query Suggestions (4 variations, matching Spotify style) ---
    const suggestionVariants = [
      query,
      `${query} songs`,
      `${query} playlist`,
      `best of ${query}`,
    ];

    const suggestionsHTML = suggestionVariants.map(text => `
      <div class="search-suggestion-item" data-query="${text}">
        ${searchIconSVG}
        <span class="suggestion-text">${text}</span>
      </div>
    `).join('');

    searchResults.innerHTML = suggestionsHTML;

    // Clicking a suggestion fills the input and re-triggers search
    searchResults.querySelectorAll('.search-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        searchInput.value = item.dataset.query;
        searchInput.dispatchEvent(new Event('input'));
      });
    });

    // --- 2. Track Results ---
    const results = [];
    for (const folder of FOLDERS) {
      try {
        const folderSongs = await fetchSongs(folder);
        if (!folderSongs) continue;
        folderSongs.forEach((song) => {
          const songName = decodeURIComponent(song);
          if (songName.toLowerCase().includes(lowerQuery)) {
            results.push({ title: songName.replace(/\.mp3$/i, ""), track: song, folder });
          }
        });
      } catch (error) {
        console.warn(`Search folder failed: ${folder}`, error);
      }
    }

    if (results.length === 0) return; // Keep suggestion rows visible

    // Thin divider before track results
    const divider = document.createElement('div');
    divider.style.cssText = 'height:1px;background:rgba(255,255,255,0.08);margin:2px 0;';
    searchResults.appendChild(divider);

    results.slice(0, 8).forEach((result) => {
      const coverUrl = `songs/${result.folder}/cover.jpg`;
      const folderLabel = result.folder.charAt(0).toUpperCase() + result.folder.slice(1);
      const item = document.createElement("div");
      item.className = "search-track-row";
      item.innerHTML = `
        <div class="search-track-left">
          <img src="${coverUrl}" alt="${result.title}" class="search-track-thumb" onerror="this.src='songs/ncs/cover.jpg';" />
          <div class="search-track-details">
            <div class="search-track-title">${result.title}</div>
            <div class="search-track-sub">Song • ${folderLabel}</div>
          </div>
        </div>
        <button class="search-add-btn" title="Add to Playlist" onclick="event.stopPropagation();">⊕</button>
      `;

      item.addEventListener("click", async () => {
        await loadFolderSongs(result.folder);
        playMusic(result.track, result.folder);
        if (searchContainer) searchContainer.style.display = "none";
        if (searchInput) searchInput.value = "";
        searchResults.innerHTML = "";
      });

      searchResults.appendChild(item);
    });
  });

  document.addEventListener("click", (e) => {
    const bar = document.querySelector('.header-search');
    if (bar && !bar.contains(e.target)) {
      if (searchContainer) searchContainer.style.display = "none";
    }
  });
}
