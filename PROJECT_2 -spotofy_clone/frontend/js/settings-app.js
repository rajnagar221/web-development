// ==========================================
// MUSIFY SETTINGS PAGE LOGIC (settings.html)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Auth Guard
  const isLoggedIn = localStorage.getItem("is_logged_in") === "true" || !!localStorage.getItem("token");
  if (!isLoggedIn) {
    window.location.href = "login.html";
    return;
  }

  // 2. DOM References
  const miniAvatar = document.getElementById("miniAvatar");
  const miniUsername = document.getElementById("miniUsername");
  const logoutBtn = document.getElementById("logoutBtn");
  const toast = document.getElementById("settingsToast");

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.style.display = "none", 300);
    }, 2800);
  }

  // 3. User Badge Display
  const username = localStorage.getItem("username") || "User";
  const avatarImg = localStorage.getItem("profile_image") || "";

  const initials = username
    .split(" ")
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  if (avatarImg) {
    miniAvatar.innerHTML = `<img src="${avatarImg}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar" />`;
  } else {
    miniAvatar.textContent = initials;
  }
  if (miniUsername) miniUsername.textContent = username;

  // 4. Audio Quality Select
  const selectAudioQuality = document.getElementById("selectAudioQuality");
  if (selectAudioQuality) {
    selectAudioQuality.value = localStorage.getItem("audio_quality") || "very_high";
    selectAudioQuality.addEventListener("change", (e) => {
      localStorage.setItem("audio_quality", e.target.value);
      showToast(`🔊 Quality set to ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // 5. Language Select
  const selectLanguage = document.getElementById("selectLanguage");
  if (selectLanguage) {
    selectLanguage.value = localStorage.getItem("app_language") || "en";
    selectLanguage.addEventListener("change", (e) => {
      localStorage.setItem("app_language", e.target.value);
      showToast(`🌐 Language set to ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // 6. Toggles
  const toggleNormalize = document.getElementById("toggleNormalize");
  if (toggleNormalize) {
    toggleNormalize.checked = localStorage.getItem("normalize_volume") !== "false";
    toggleNormalize.addEventListener("change", (e) => {
      localStorage.setItem("normalize_volume", e.target.checked);
      showToast(e.target.checked ? "🎚️ Volume Normalization On" : "🎚️ Volume Normalization Off");
    });
  }

  const toggleAutoplay = document.getElementById("toggleAutoplay");
  if (toggleAutoplay) {
    toggleAutoplay.checked = localStorage.getItem("autoplay_enabled") !== "false";
    toggleAutoplay.addEventListener("change", (e) => {
      localStorage.setItem("autoplay_enabled", e.target.checked);
      showToast(e.target.checked ? "🔁 Autoplay Enabled" : "⏹️ Autoplay Disabled");
    });
  }

  const toggleCanvas = document.getElementById("toggleCanvas");
  if (toggleCanvas) {
    toggleCanvas.checked = localStorage.getItem("canvas_enabled") !== "false";
    toggleCanvas.addEventListener("change", (e) => {
      localStorage.setItem("canvas_enabled", e.target.checked);
      showToast(e.target.checked ? "🎬 Looping Canvas Enabled" : "🎬 Canvas Disabled");
    });
  }

  const toggleDesktopNotify = document.getElementById("toggleDesktopNotify");
  if (toggleDesktopNotify) {
    toggleDesktopNotify.checked = localStorage.getItem("desktop_notify") !== "false";
    toggleDesktopNotify.addEventListener("change", (e) => {
      localStorage.setItem("desktop_notify", e.target.checked);
      showToast(e.target.checked ? "🔔 Desktop Notifications Enabled" : "🔕 Notifications Disabled");
    });
  }

  const toggleMonoAudio = document.getElementById("toggleMonoAudio");
  if (toggleMonoAudio) {
    toggleMonoAudio.checked = localStorage.getItem("mono_audio") === "true";
    toggleMonoAudio.addEventListener("change", (e) => {
      localStorage.setItem("mono_audio", e.target.checked);
      showToast(e.target.checked ? "🎧 Mono Audio Active" : "🎧 Stereo Audio Active");
    });
  }

  // 7. Crossfade Slider
  const rangeCrossfade = document.getElementById("rangeCrossfade");
  const valCrossfade = document.getElementById("valCrossfade");
  if (rangeCrossfade && valCrossfade) {
    const saved = localStorage.getItem("crossfade_sec") || "0";
    rangeCrossfade.value = saved;
    valCrossfade.textContent = `${saved}s`;
    rangeCrossfade.addEventListener("input", (e) => {
      valCrossfade.textContent = `${e.target.value}s`;
      localStorage.setItem("crossfade_sec", e.target.value);
    });
  }

  // 8. Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("is_logged_in");
      window.location.href = "login.html";
    });
  }
});
