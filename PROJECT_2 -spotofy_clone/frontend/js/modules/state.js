export function getSavedFollowedArtists() {
  try {
    const saved = localStorage.getItem("followed_artists");
    if (saved) return new Set(JSON.parse(saved));
  } catch (e) {}
  return new Set(["karan aujla", "diljit", "honey singh"]);
}

export function saveFollowedArtists() {
  try {
    localStorage.setItem("followed_artists", JSON.stringify(Array.from(state.followedArtists)));
  } catch (e) {}
}

export const state = {
  currentSong: new Audio(),
  wavesurfer: null,
  songs: [],
  displaySongs: [],
  currFolder: "",
  currentFolder: "",
  currentTrack: "",
  likedSongs: new Set(),
  followedArtists: getSavedFollowedArtists(),
  showLikedSongs: false,
  showFollowing: false,
  isRepeat: false,
  isShuffle: false,
  allAlbums: []
};
