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

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentTrack = "";

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getElement(selector) {
  return document.querySelector(selector);
}

function updatePlayButton(isPlaying) {
  const playButton = document.getElementById("play");
  if (!playButton) return;
  playButton.src = isPlaying ? "img/pause.svg" : "img/play.svg";
}

function updateSongInfo(track) {
  const songInfo = getElement(".songinfo");
  if (!songInfo) return;
  songInfo.textContent = decodeURIComponent(track.split("/").pop());
}

function updateTimeDisplay() {
  const songTime = getElement(".songtime");
  const progressCircle = getElement(".circle");
  if (!songTime || !progressCircle || isNaN(currentSong.duration)) return;

  songTime.textContent = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
  progressCircle.style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
}

function buildSongUrl(track) {
  const fileName = track.split("/").pop();
  return `${STATIC_SONGS_URL}/${encodeURIComponent(currFolder)}/${encodeURIComponent(fileName)}`;
}

function renderSongList() {
  const songListContainer = getElement(".songList ul");
  if (!songListContainer) return;

  if (songs.length === 0) {
    songListContainer.innerHTML = `<li class="empty-song-list">No songs found in this folder.</li>`;
    return;
  }

  songListContainer.innerHTML = songs
    .map((song) => {
      const title = decodeURIComponent(song).replace(/\.mp3$/i, "");
      return `
        <li data-file="${song}">
          <img class="invert" width="34" src="img/music.svg" alt="song icon">
          <div class="info">
            <div>${title}</div>
            <div>Unknown Artist</div>
          </div>
          <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play.svg" alt="play icon">
          </div>
        </li>`;
    })
    .join("");

  Array.from(document.querySelectorAll(".songList li")).forEach((item) => {
    const track = item.getAttribute("data-file");
    const playButton = item.querySelector(".playnow");

    item.addEventListener("click", () => {
      if (track) {
        playMusic(track);
      }
    });

    if (playButton) {
      playButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!track) return;
        if (track === currentTrack && !currentSong.paused) {
          togglePlayback();
        } else {
          playMusic(track);
        }
      });
    }
  });
}

async function getSongs(folder) {
  currFolder = folder;

  try {
    const response = await fetch(`${SONGS_API_URL}/${encodeURIComponent(folder)}`);
    if (!response.ok) {
      throw new Error(`Failed to load songs for ${folder}`);
    }
    const data = await response.json();
    songs = Array.isArray(data.songs) ? data.songs : [];
  } catch (error) {
    console.error("Error fetching songs:", error);
    songs = [];
  }

  renderSongList();
  return songs;
}

async function displayAlbums() {
  const cardContainer = getElement(".cardContainer");
  if (!cardContainer) return;

  cardContainer.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE_URL}/api/albums`);
    if (!response.ok) {
      throw new Error("Failed to load albums");
    }
    const data = await response.json();
    const albums = data.albums || [];

    for (const album of albums) {
      // Properly encode the image path for URL
      const imagePath = album.cover_image.split('/').map(part => encodeURIComponent(part)).join('/');
      const imageUrl = `${API_BASE_URL}${imagePath}`;
      
      cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card">
          <div class="play" onclick="event.stopPropagation();">▶</div>
          <img src="${imageUrl}" alt="${album.title}" class="card-img" onerror="this.style.display='none';">
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
          if (songs.length > 0) {
            playMusic(songs[0]);
          }
        } else {
          if (!currentSong.src || currentSong.paused) {
            if (!songs.length) {
              await getSongs(folder);
            }
            if (songs.length > 0) {
              playMusic(songs[0]);
            }
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
      await getSongs(folder);
    });
  });
}

function getCurrentSongIndex() {
  return songs.findIndex((song) => song === currentTrack || song.split("/").pop() === currentTrack.split("/").pop());
}

function updateAlbumPlayIcons() {
  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    const playBtn = card.querySelector(".play");
    if (!playBtn) return;
    const folder = card.dataset.folder;
    if (folder === currFolder && currentSong.src && !currentSong.paused) {
      playBtn.textContent = "⏸";
    } else {
      playBtn.textContent = "▶";
    }
  });
}

function togglePlayback(track) {
  if (track && track !== currentTrack) {
    playMusic(track);
    return;
  }

  if (!currentSong.src) {
    if (track) {
      playMusic(track);
    } else if (songs.length > 0) {
      playMusic(songs[0]);
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

function playMusic(track) {
  if (!track) return;
  if (track === currentTrack && currentSong.src) {
    if (currentSong.paused) {
      currentSong.play().catch((err) => console.warn("Playback failed:", err));
      updatePlayButton(true);
      updateAlbumPlayIcons();
    }
    return;
  }

  currentTrack = track;
  currentSong.src = buildSongUrl(track);
  currentSong.load();
  updateSongInfo(track);
  currentSong.play().catch((err) => console.warn("Playback failed:", err));
  updatePlayButton(true);
  updateAlbumPlayIcons();
}

function playPreviousSong() {
  const index = getCurrentSongIndex();
  if (index > 0) {
    playMusic(songs[index - 1]);
  }
}

function playNextSong() {
  const index = getCurrentSongIndex();
  if (index >= 0 && index < songs.length - 1) {
    playMusic(songs[index + 1]);
  }
}

function setupPlayerEvents() {
  currentSong.addEventListener("loadedmetadata", () => {
    const songTime = getElement(".songtime");
    if (songTime) {
      songTime.textContent = `00:00 / ${formatTime(currentSong.duration)}`;
    }
  });

  currentSong.addEventListener("timeupdate", updateTimeDisplay);

  currentSong.addEventListener("play", () => {
    updateAlbumPlayIcons();
    updatePlayButton(true);
  });

  currentSong.addEventListener("pause", () => {
    updateAlbumPlayIcons();
    updatePlayButton(false);
  });

  currentSong.addEventListener("ended", playNextSong);
}

function setupControlButtons() {
  const playButton = document.getElementById("play");
  const previousButton = document.getElementById("previous");
  const nextButton = document.getElementById("next");
  const seekbar = getElement(".seekbar");
  const volumeRange = getElement(".range input");

  if (playButton) {
    playButton.addEventListener("click", () => {
      togglePlayback();
    });
  }

  if (previousButton) {
    previousButton.addEventListener("click", playPreviousSong);
  }

  if (nextButton) {
    nextButton.addEventListener("click", playNextSong);
  }

  if (seekbar) {
    seekbar.addEventListener("click", (event) => {
      if (isNaN(currentSong.duration) || !currentSong.duration) return;
      const target = event.currentTarget;
      const percent = event.offsetX / target.clientWidth;
      currentSong.currentTime = currentSong.duration * percent;
      updateTimeDisplay();
    });
  }

  if (volumeRange) {
    volumeRange.addEventListener("input", (event) => {
      currentSong.volume = Number(event.target.value) / 100;
    });
  }
}

async function setupSearch() {
  const searchToggle = getElement("#searchToggle");
  const searchContainer = getElement("#searchContainer");
  const searchInput = getElement("#searchInput");
  const searchResults = getElement("#searchResults");

  if (searchToggle && searchContainer) {
    searchToggle.addEventListener("click", () => {
      const isVisible = searchContainer.style.display !== "block";
      searchContainer.style.display = isVisible ? "block" : "none";
      if (isVisible && searchInput) {
        searchInput.focus();
      }
    });
  }

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", async (event) => {
    const query = event.target.value.toLowerCase().trim();
    searchResults.innerHTML = "";

    if (query.length === 0) {
      return;
    }

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
      const noResult = document.createElement("div");
      noResult.className = "searchResult";
      noResult.textContent = "No results found";
      searchResults.appendChild(noResult);
      return;
    }

    results.forEach((result) => {
      const item = document.createElement("div");
      item.className = "searchResult";
      item.textContent = `🎵 ${result.title}`;
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
}

function setupSidebarToggle() {
  const hamburger = getElement(".hamburger");
  const closeBtn = getElement(".close");
  const sidebar = getElement(".left");

  if (hamburger && closeBtn && sidebar) {
    hamburger.addEventListener("click", () => sidebar.classList.add("active"));
    closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));
  }
}

function setupHomeButton() {
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => window.location.reload());
  }
}

async function main() {
  setupPlayerEvents();
  setupControlButtons();
  setupSidebarToggle();
  setupHomeButton();
  await setupSearch();
  await displayAlbums();
  await getSongs(FOLDERS[0]);
}

main();
