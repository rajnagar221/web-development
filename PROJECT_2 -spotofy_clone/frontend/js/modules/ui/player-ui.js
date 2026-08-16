import { state } from '../state.js';
import { formatTime, getElement, isSameTrack } from '../utils.js';
import { isTrackLiked } from '../storage.js';

let searchModule = null;
async function updateSearchPlayIconsSafe() {
  try {
    if (!searchModule) searchModule = await import('../search.js');
    if (searchModule && searchModule.updateSearchPlayIcons) {
      searchModule.updateSearchPlayIcons();
    }
  } catch (err) { }
}

// ==================== PLAY BUTTON SVG ====================
export function updatePlayButton(isPlaying) {
  const playButton = document.getElementById("play");
  if (playButton) {
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
  updateSearchPlayIconsSafe();
}

export function updatePlaybarLikeButton() {
  const button = getElement("#favoritePlaybarBtn");
  if (!button) return;
  const hasTrack = state.currentTrack && state.currentFolder;
  button.disabled = !hasTrack;
  const isLiked = hasTrack && isTrackLiked(state.currentFolder, state.currentTrack);
  button.classList.toggle("liked", isLiked);
  button.innerHTML = isLiked
    ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="#1db954" stroke="#1db954" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
    : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b3b3b3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
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
  const creditsList = getElement("#creditsList");
  if (!creditsList) return;

  creditsList.innerHTML = "";

  const rawArtists = (artist || "Unknown Artist").split(",").map(a => a.trim()).filter(Boolean);
  const parsedCredits = [];

  if (rawArtists.length > 0) {
    parsedCredits.push({ name: rawArtists[0], role: "Main Artist • Composer", isFollowing: true });
  }
  if (rawArtists.length > 1) {
    parsedCredits.push({ name: rawArtists[1], role: "Main Artist • Video Writer", isFollowing: false });
  }
  if (rawArtists.length > 2) {
    for (let i = 2; i < rawArtists.length; i++) {
      parsedCredits.push({ name: rawArtists[i], role: "Main Artist", isFollowing: false });
    }
  }

  if (parsedCredits.length === 1) {
    const fKey = (folder || "").toLowerCase();
    if (fKey.includes("karan aujla")) {
      parsedCredits.push({ name: "Ikky", role: "Producer • Composer", isFollowing: false });
    } else if (fKey.includes("honey singh")) {
      parsedCredits.push({ name: "Lil Golu", role: "Lyricist • Producer", isFollowing: false });
    } else if (fKey.includes("ap dhillon") || fKey.includes("ap dillhon")) {
      parsedCredits.push({ name: "Gurinder Gill", role: "Featured Artist", isFollowing: false });
    } else {
      parsedCredits.push({ name: "Musify Producer", role: "Composer • Producer", isFollowing: false });
    }
  }

  parsedCredits.forEach(credit => {
    const key = credit.name.toLowerCase().trim();
    const isFollowing = state.followedArtists.has(key);

    const item = document.createElement("div");
    item.className = "credit-item";
    item.innerHTML = `
      <div class="credit-info">
        <span class="credit-name">${credit.name}</span>
        <span class="credit-role">${credit.role}</span>
      </div>
      <button class="follow-pill-btn ${isFollowing ? 'following' : ''}" data-artist="${credit.name}">
        ${isFollowing ? 'Following' : 'Follow'}
      </button>
    `;

    const followBtn = item.querySelector(".follow-pill-btn");
    if (followBtn) {
      followBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        import('./sidebar-ui.js').then(module => {
          module.toggleFollowArtist(credit.name, credit.name);
        });
      });
    }

    creditsList.appendChild(item);
  });
}

export function updateNextInQueue() {
  const nextQueueCard = getElement("#nextQueueCard");
  const nextArt = getElement("#nextQueueArt");
  const nextTitle = getElement("#nextQueueTitle");
  const nextArtist = getElement("#nextQueueArtist");

  if (!nextQueueCard || !state.displaySongs || state.displaySongs.length === 0) return;

  let currentIndex = -1;
  if (state.currentTrack) {
    currentIndex = state.displaySongs.findIndex(
      (item) => isSameTrack(item.track, state.currentTrack)
    );
  }

  let nextIndex = currentIndex + 1;
  if (nextIndex >= state.displaySongs.length) {
    nextIndex = 0;
  }

  const nextSongObj = state.displaySongs[nextIndex];
  if (nextSongObj && nextSongObj.track) {
    const track = nextSongObj.track;
    if (nextArt) nextArt.src = track.cover_image || "img/music.svg";
    if (nextTitle) nextTitle.textContent = track.title || "Next Track";
    if (nextArtist) nextArtist.textContent = track.artist || "Unknown Artist";

    nextQueueCard.onclick = () => {
      import('../audio.js').then(module => {
        module.playMusic(track, nextSongObj.folder);
      });
    };
  }
}

// ==================== NOW PLAYING SIDEBAR DATA & CONTROL ====================
const ARTIST_BIOS = {
  "sidhu moose wala": "Sidhu Moose Wala was an iconic Punjabi singer, rapper, and songwriter known worldwide for his powerful lyrics, hip-hop beats, and legendary hits like '295' and 'The Last Ride'.",
  "karan aujla": "Karan Aujla is a globally acclaimed Punjabi singer, rapper, and songwriter. Known for his chart-topping hits like 'Softly' and 'Making Memories'.",
  "arijit singh": "Arijit Singh is a legendary Indian singer and composer. Known for his soulful and romantic Bollywood hits, he is one of the most successful singers in the history of Indian music.",
  "diljit": "Diljit Dosanjh is a legendary Indian singer, actor, and television presenter. He is one of the leading figures in modern Punjabi music and Bollywood.",
  "honey singh": "Yo Yo Honey Singh is an iconic Indian rapper, music producer, and actor. He revolutionized the Punjabi pop and Bollywood rap scene.",
  "instagram trending": "A curated compilation of viral hits, trending soundbites, and the most popular background scores from social media reels.",
  "vibes songs": "Relaxing lo-fi beats, soothing acoustic covers, and atmospheric melodies perfect for late night drives and focused work.",
  "ap dillhon": "AP Dhillon is a pioneering Indo-Canadian singer and producer. He has popularized a unique blend of Punjabi vocals with synth-pop and western beats.",
  "talwinder": "Talwiinder is an independent singer-songwriter and producer known for his signature dark, melancholic Punjabi pop and moody electronic soundscapes."
};

export const ALL_ARTISTS_MAP = {
  "karan aujla": { folder: "karan aujla", name: "Karan Aujla", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/538/Making-Memories-English-2023-20230818075015-500x500.jpg" },
  "ikky": { folder: "karan aujla", name: "IKKY", subtitle: "Producer • Followed", cover: "https://c.saavncdn.com/538/Making-Memories-English-2023-20230818075015-500x500.jpg" },
  "diljit": { folder: "diljit", name: "Diljit Dosanjh", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20210822030801-500x500.jpg" },
  "diljit dosanjh": { folder: "diljit", name: "Diljit Dosanjh", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20210822030801-500x500.jpg" },
  "honey singh": { folder: "honey singh", name: "Yo Yo Honey Singh", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/304/Desi-Kalakaar-Hindi-2014-500x500.jpg" },
  "yo yo honey singh": { folder: "honey singh", name: "Yo Yo Honey Singh", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/304/Desi-Kalakaar-Hindi-2014-500x500.jpg" },
  "talwinder": { folder: "talwinder", name: "Talwiinder", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/065/Haseen-Punjabi-2025-20250217081851-500x500.jpg" },
  "ap dillhon": { folder: "ap dillhon", name: "AP Dhillon", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/671/First-of-a-Kind-From-the-Amazon-Original-Series-Punjabi-2023-20230816174154-500x500.jpg" },
  "ap dhillon": { folder: "ap dillhon", name: "AP Dhillon", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/671/First-of-a-Kind-From-the-Amazon-Original-Series-Punjabi-2023-20230816174154-500x500.jpg" },
  "pritam": { folder: "arijit singh", name: "Pritam", subtitle: "Composer • Followed", cover: "https://c.saavncdn.com/179/World-Music-Day-Best-Of-Arijit-Singh-Hindi-2024-20240620150937-500x500.jpg" },
  "sidhu moose wala": { folder: "sidhu moose wala", name: "Sidhu Moose Wala", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg" },
  "arijit singh": { folder: "arijit singh", name: "Arijit Singh", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/179/World-Music-Day-Best-Of-Arijit-Singh-Hindi-2024-20240620150937-500x500.jpg" },
  "vibes songs": { folder: "vibes songs", name: "Chill Punjabi Lo-Fi", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/682/Punjabi-Chill-Vibes-Punjabi-2024-20240726152838-500x500.jpg" },
  "instagram trending": { folder: "instagram trending", name: "Reels Viral", subtitle: "Artist • Followed", cover: "https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20240717163046-500x500.jpg" }
};

export function getArtistBio(folder) {
  if (!folder) return "Play a track from your library to see details and bio.";
  const key = folder.toLowerCase().trim();
  return ARTIST_BIOS[key] || "Popular tracks, daily mixes, and custom artist compilations.";
}

export function updateSongInfo(track, autoOpenSidebar = true) {
  const title = track.title || "Unknown Title";
  const songInfo = getElement(".songinfo");
  if (songInfo) songInfo.textContent = title;

  const songArtistEl = getElement(".songartist");
  if (songArtistEl) songArtistEl.textContent = track.artist || "Unknown Artist";

  const sidebar = getElement(".rightSidebar");
  const mainGrid = getElement(".main-grid");

  if (autoOpenSidebar && sidebar && mainGrid) {
    sidebar.style.display = "flex";
    mainGrid.classList.add("sidebar-active");
  }

  const art = getElement("#playbarArt");
  const sideArt = getElement("#nowPlayingArt");
  const nowTitle = getElement("#nowPlayingTitle");
  const nowArtist = getElement("#nowPlayingArtist");
  const sidebarHeaderTitle = getElement("#sidebarHeaderTitle");

  let resolvedArtist = track.artist || "Unknown Artist";
  let coverUrl = track.cover_image;

  if (!coverUrl || coverUrl === "img/music.svg") {
    const folderKey = (state.currentFolder || track.folder || "").toLowerCase().trim();
    const artistKey = (resolvedArtist || "").toLowerCase().trim();
    if (state.allAlbums) {
      const album = state.allAlbums.find((a) => a.folder.toLowerCase() === folderKey);
      if (album && album.cover_image && album.cover_image !== "img/music.svg") {
        coverUrl = album.cover_image;
      }
    }
    if (!coverUrl || coverUrl === "img/music.svg") {
      for (const k in ALL_ARTISTS_MAP) {
        if (artistKey.includes(k) || folderKey.includes(k)) {
          coverUrl = ALL_ARTISTS_MAP[k].cover;
          break;
        }
      }
    }
  }

  coverUrl = coverUrl || "img/music.svg";
  track.cover_image = coverUrl;

  const setImageSrcWithFallback = (imgEl, primary) => {
    if (!imgEl) return;
    imgEl.onerror = () => {
      imgEl.src = "img/music.svg";
    };
    imgEl.src = primary;
  };

  setImageSrcWithFallback(art, coverUrl);
  setImageSrcWithFallback(sideArt, coverUrl);

  if (nowTitle) nowTitle.textContent = title;
  if (nowArtist) nowArtist.textContent = resolvedArtist;

  if (sidebarHeaderTitle) {
    let headerText = "Now Playing";
    if (state.allAlbums) {
      const album = state.allAlbums.find((a) => a.folder === state.currentFolder);
      if (album) {
        headerText = `${album.title}`;
      } else if (state.currentFolder) {
        headerText = `${state.currentFolder.charAt(0).toUpperCase() + state.currentFolder.slice(1)} Popular`;
      }
    }
    sidebarHeaderTitle.textContent = headerText;
  }

  updatePlaybarLikeButton();
  updateSidebarLikeButton();
  updateCredits(state.currentFolder, resolvedArtist);
  updateNextInQueue();
}

// ==================== TIME DISPLAY ====================
export function updateTimeDisplay() {
  const current = formatTime(state.currentSong.currentTime);
  const total = isNaN(state.currentSong.duration) || !state.currentSong.duration ? "0:00" : formatTime(state.currentSong.duration);

  const currentSmall = getElement(".current-time");
  const durationSmall = getElement(".duration");
  if (currentSmall) currentSmall.textContent = current;
  if (durationSmall) durationSmall.textContent = total;

  if (isNaN(state.currentSong.duration) || !state.currentSong.duration) return;
  const pct = (state.currentSong.currentTime / state.currentSong.duration) * 100;

  const seekbar = getElement("#spotifySeekbar");
  if (seekbar) {
    seekbar.value = pct;
    seekbar.style.setProperty("--pct", `${pct}%`);
    seekbar.style.background = `linear-gradient(to right, #ffffff ${pct}%, rgba(255, 255, 255, 0.25) ${pct}%)`;
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

// ==================== LIBRARY BUTTONS ====================
export function updateLibraryButtons() {
  const likedBtn = getElement("#likedSongsBtn");
  const allBtn = getElement("#allSongsBtn");
  const followingBtn = getElement("#followingBtn");
  if (likedBtn) likedBtn.classList.toggle("active", Boolean(state.showLikedSongs));
  if (allBtn) allBtn.classList.toggle("active", !state.showLikedSongs && !state.showFollowing);
  if (followingBtn) followingBtn.classList.toggle("active", Boolean(state.showFollowing));
}

