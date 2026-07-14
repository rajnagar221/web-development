import { FOLDERS } from './modules/config.js';
import { state } from './modules/state.js';
import { loadLikedSongs } from './modules/storage.js';
import {
  loadFolderSongs,
  setupPlayerEvents,
  setupControlButtons,
  setupKeyboardShortcuts
} from './modules/audio.js';
import {
  displayAlbums,
  updateVolumeIcon,
  setupPremiumPopup,
  setupNotifications,
  setupProfileMenu,
  setupSidebarEvents,
  setupSidebarToggle,
  setupLikedSongsButtons,
  setupHomeButton,
  renderRecentlyPlayedUI,
  setupInstallAppModal,
  setupAccountOverviewPage,
  setupSettingsPage
} from './modules/ui.js';
import { setupSearch } from './modules/search.js';
import { updateIndexAuthButtons, verifyAuthentication } from './modules/auth-core.js';

// ==================== MAIN INITIALIZATION ====================
async function init() {
  const isAuthenticated = await verifyAuthentication();
  if (!isAuthenticated) return;

  loadLikedSongs();
  setupPlayerEvents();
  setupControlButtons();
  setupSidebarToggle();
  setupLikedSongsButtons();
  setupHomeButton();
  setupPremiumPopup();
  setupNotifications();
  setupProfileMenu();
  setupSidebarEvents();
  setupInstallAppModal();
  setupAccountOverviewPage();
  setupSettingsPage();
  setupKeyboardShortcuts();
  
  await setupSearch();
  await displayAlbums();
  renderRecentlyPlayedUI();
  if (state.allAlbums && state.allAlbums.length > 0) {
    await loadFolderSongs(state.allAlbums[0].folder);
  }

  // Set initial volume
  const vol = document.getElementById("volumeRange");
  if (vol) {
    state.currentSong.volume = Number(vol.value) / 100;
    updateVolumeIcon(state.currentSong.volume);
  }

  // Fill in control icons
  const prevBtn = document.getElementById("previous");
  const nextBtn = document.getElementById("next");
  const shuffleBtn = document.getElementById("shuffle");
  const repeatBtn = document.getElementById("repeat");

  if (prevBtn) prevBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="20" height="20"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`;
  if (nextBtn) nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="20" height="20"><path d="M6 18l8.5-6L6 6v12zm2-8.14 5.09 3.64L8 17.14V9.86zM16 6h2v12h-2z"/></svg>`;
  if (shuffleBtn) shuffleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="18" height="18"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`;
  if (repeatBtn) repeatBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="#b3b3b3" width="18" height="18"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`;

  updateVolumeIcon(state.currentSong.volume);
  updateIndexAuthButtons();
}

// Start application
document.addEventListener("DOMContentLoaded", init);

// Header scroll transparent styling effect
window.addEventListener("scroll", () => {
  const header = document.querySelector(".topbar");
  if (!header) return;
  if (window.scrollY > 40) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
      .catch((err) => console.warn('Service Worker registration failed:', err));
  });
}
