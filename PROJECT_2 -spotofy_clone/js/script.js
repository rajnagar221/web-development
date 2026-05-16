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
let displaySongs = [];
let currFolder = "";
let currentFolder = "";
let currentTrack = "";
let likedSongs = new Set();
let showLikedSongs = false;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function loadLikedSongs() {
  try {
    const saved = localStorage.getItem("likedSongs");
    likedSongs = new Set(saved ? JSON.parse(saved) : []);
  } catch {
    likedSongs = new Set();
  }
}

function saveLikedSongs() {
  localStorage.setItem("likedSongs", JSON.stringify(Array.from(likedSongs)));
}

function getLikedSongObjects() {
  return Array.from(likedSongs).map((item) => {
    const [folder, track] = item.split("|");
    return { folder, track };
  });
}

function isTrackLiked(folder, track) {
  return likedSongs.has(`${folder}|${track}`);
}

function toggleLikeTrack(folder, track, shouldRender = true) {
  const key = `${folder}|${track}`;
  if (likedSongs.has(key)) {
    likedSongs.delete(key);
  } else {
    likedSongs.add(key);
  }
  saveLikedSongs();
  updatePlaybarLikeButton();
  if (shouldRender) {
    renderSongList();
  }
}

function updatePlaybarLikeButton() {
  const button = getElement("#favoritePlaybarBtn");
  if (!button) return;
  const hasTrack = currentTrack && currentFolder;
  button.disabled = !hasTrack;
  button.classList.toggle("liked", hasTrack && isTrackLiked(currentFolder, currentTrack));
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
  updatePlaybarLikeButton();
}

function updateTimeDisplay() {
  const songTime = getElement(".songtime");
  const progressCircle = getElement(".circle");
  if (!songTime || !progressCircle || isNaN(currentSong.duration)) return;

  songTime.textContent = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
  progressCircle.style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
}

function buildSongUrl(folder, track) {
  const fileName = track.split("/").pop();
  return `${STATIC_SONGS_URL}/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`;
}

function updateLibraryButtons() {
  const likedBtn = getElement("#likedSongsBtn");
  const allBtn = getElement("#allSongsBtn");
  if (likedBtn) likedBtn.classList.toggle("active", showLikedSongs);
  if (allBtn) allBtn.classList.toggle("active", !showLikedSongs);
}

function renderSongList() {
  const songListContainer = getElement(".songList ul");
  if (!songListContainer) return;

  const currentItems = showLikedSongs ? getLikedSongObjects() : displaySongs;

  if (currentItems.length === 0) {
    const message = showLikedSongs ? "No liked songs yet." : "No songs found in this folder.";
    songListContainer.innerHTML = `<li class="empty-song-list">${message}</li>`;
    updateLibraryButtons();
    return;
  }

  songListContainer.innerHTML = currentItems
    .map(({ folder, track }) => {
      const title = decodeURIComponent(track).replace(/\.mp3$/i, "");
      const likedClass = isTrackLiked(folder, track) ? "liked" : "";
      return `
        <li data-folder="${folder}" data-file="${track}">
          <img class="invert" width="34" src="img/music.svg" alt="song icon">
          <div class="info">
            <div>${title}</div>
            <div>${folder}</div>
          </div>
          <div class="item-actions">
            <button type="button" class="favorite-btn ${likedClass}" title="Toggle like">❤</button>
            <div class="playnow">
              <span>Play</span>
              <img class="invert" src="img/play.svg" alt="play icon">
            </div>
          </div>
        </li>`;
    })
    .join("");

  Array.from(document.querySelectorAll(".songList li")).forEach((item) => {
    const track = item.getAttribute("data-file");
    const folder = item.getAttribute("data-folder");
    const playButton = item.querySelector(".playnow");
    const favButton = item.querySelector(".favorite-btn");

    item.addEventListener("click", () => {
      if (track && folder) {
        playMusic(track, folder);
      }
    });

    if (playButton) {
      playButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!track || !folder) return;
        if (track === currentTrack && folder === currentFolder && !currentSong.paused) {
          togglePlayback();
        } else {
          playMusic(track, folder);
        }
      });
    }

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

  showLikedSongs = false;
  displaySongs = songs.map((track) => ({ folder: currFolder, track }));
  renderSongList();
  return songs;
}

async function loadExternalMusic() {
    let res = await fetch(`${API_BASE_URL}/api/external-music`);
    let data = await res.json();
    console.log(data);
}

loadExternalMusic();

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
            playMusic(songs[0], folder);
          }
        } else {
          if (!currentSong.src || currentSong.paused) {
            if (!songs.length) {
              await getSongs(folder);
            }
            if (songs.length > 0) {
              playMusic(songs[0], folder);
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
  return displaySongs.findIndex((item) => item.folder === currentFolder && item.track === currentTrack);
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

function togglePlayback(track, folder) {
  if (track && (track !== currentTrack || folder !== currentFolder)) {
    playMusic(track, folder);
    return;
  }

  if (!currentSong.src) {
    if (track) {
      playMusic(track, folder);
    } else if (displaySongs.length > 0) {
      const nextItem = displaySongs[0];
      playMusic(nextItem.track, nextItem.folder);
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

function playMusic(track, folder = currFolder) {
  if (!track || !folder) return;
  if (track === currentTrack && folder === currentFolder && currentSong.src) {
    if (currentSong.paused) {
      currentSong.play().catch((err) => console.warn("Playback failed:", err));
      updatePlayButton(true);
      updateAlbumPlayIcons();
    }
    return;
  }

  currentTrack = track;
  currentFolder = folder;
  currFolder = folder;
  currentSong.src = buildSongUrl(folder, track);
  currentSong.load();
  updateSongInfo(track);
  updatePlaybarLikeButton();
  currentSong.play().catch((err) => console.warn("Playback failed:", err));
  updatePlayButton(true);
  updateAlbumPlayIcons();
}

function playPreviousSong() {
  const index = getCurrentSongIndex();
  if (index > 0) {
    const item = displaySongs[index - 1];
    if (item) {
      playMusic(item.track, item.folder);
    }
  }
}

function playNextSong() {
  const index = getCurrentSongIndex();
  if (index >= 0 && index < displaySongs.length - 1) {
    const item = displaySongs[index + 1];
    if (item) {
      playMusic(item.track, item.folder);
    }
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
  const favoritePlaybarBtn = getElement("#favoritePlaybarBtn");
  const seekbar = getElement(".seekbar");
  const volumeRange = getElement(".range input");

  if (favoritePlaybarBtn) {
    favoritePlaybarBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!currentTrack || !currentFolder) return;
      toggleLikeTrack(currentFolder, currentTrack);
    });
  }

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

function setupLikedSongsButtons() {
  const likedSongsBtn = getElement("#likedSongsBtn");
  const allSongsBtn = getElement("#allSongsBtn");

  if (likedSongsBtn) {
    likedSongsBtn.addEventListener("click", () => {
      showLikedSongs = true;
      displaySongs = getLikedSongObjects();
      renderSongList();
    });
  }

  if (allSongsBtn) {
    allSongsBtn.addEventListener("click", () => {
      showLikedSongs = false;
      displaySongs = songs.map((track) => ({ folder: currFolder, track }));
      renderSongList();
    });
  }
}

function setupHomeButton() {
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => window.location.reload());
  }
}

function setupProfileMenu() {
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
    if (!profileContainer.contains(event.target)) {
      profileMenu.classList.remove("active");
    }
  });
}

async function main() {
  loadLikedSongs();
  setupPlayerEvents();
  setupControlButtons();
  setupSidebarToggle();
  setupLikedSongsButtons();
  setupHomeButton();
  setupProfileMenu();
  await setupSearch();
  await displayAlbums();
  await getSongs(FOLDERS[0]);
}

main();
