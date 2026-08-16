export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function getElement(selector) {
  return document.querySelector(selector);
}

export function isSameTrack(t1, t2) {
  if (!t1 || !t2) return false;
  const track1 = t1.track || t1;
  const track2 = t2.track || t2;

  if (!track1 || !track2) return false;

  if (track1.id && track2.id) {
    if (String(track1.id) === String(track2.id)) return true;
    if (String(track1.id) !== String(track2.id)) return false;
  }

  const title1 = (track1.title || "").trim().toLowerCase();
  const title2 = (track2.title || "").trim().toLowerCase();
  if (!title1 || !title2 || title1 !== title2) return false;

  const artist1 = (track1.artist || "").trim().toLowerCase();
  const artist2 = (track2.artist || "").trim().toLowerCase();

  if (artist1 && artist2) {
    return artist1 === artist2 || artist1.includes(artist2) || artist2.includes(artist1);
  }

  return true;
}

