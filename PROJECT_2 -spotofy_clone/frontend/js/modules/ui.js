// Unified UI Module Entrypoint & Re-exporter
// Modularized into single-responsibility sub-modules under ./ui/

export { showToast } from './ui/toast-ui.js';

export {
  updatePlayButton,
  updatePlaybarLikeButton,
  updateSidebarLikeButton,
  updateCredits,
  updateNextInQueue,
  ALL_ARTISTS_MAP,
  getArtistBio,
  updateSongInfo,
  updateTimeDisplay,
  updateVolumeIcon
} from './ui/player-ui.js';

export {
  displayAlbums,
  renderAlbumDetailView,
  attachAlbumEvents,
  updateAlbumPlayIcons
} from './ui/albums-ui.js';

export {
  setupSidebarEvents,
  toggleFollowArtist,
  renderFollowingList,
  setupHomeButton,
  setupSidebarToggle,
  setupLikedSongsButtons
} from './ui/sidebar-ui.js';

export {
  refreshProfileDisplay,
  setupEditProfileModal,
  setupProfileMenu,
  setupNotifications
} from './ui/profile-ui.js';

export {
  setupAccountOverviewPage,
  handleAccountAction,
  setupSettingsPage
} from './ui/pages-ui.js';

export {
  setupPremiumPopup,
  setupInstallAppModal,
  triggerDesktopAppDownload
} from './ui/modals-ui.js';

export {
  toggleLikeTrack,
  renderSongList,
  getRecentlyPlayed,
  addRecentlyPlayed,
  renderRecentlyPlayedUI
} from './ui/history-ui.js';

export { updateLibraryButtons } from './ui/player-ui.js';

// Backward compatibility audio wrappers
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
