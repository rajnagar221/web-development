import { FOLDERS, SONGS_API_URL } from './config.js';
import { getElement } from './utils.js';
import { loadFolderSongs, playMusic } from './audio.js';

export async function setupSearch() {
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
        await loadFolderSongs(result.folder);
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
