export const state = {
  currentSong: new Audio(),
  wavesurfer: null,
  songs: [],
  displaySongs: [],
  currFolder: "",
  currentFolder: "",
  currentTrack: "",
  likedSongs: new Set(),
  showLikedSongs: false,
  isRepeat: false,
  isShuffle: false,
  allAlbums: []
};
