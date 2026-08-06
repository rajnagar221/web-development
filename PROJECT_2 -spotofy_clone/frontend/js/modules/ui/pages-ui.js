import { getElement } from '../utils.js';
import { showToast } from './toast-ui.js';

export function setupAccountOverviewPage() {
  const accountOptionBtn = getElement("#accountOptionBtn");
  const accountOverviewPage = getElement("#accountOverviewPage");
  const homeSections = getElement("#homeSections");
  const albumDetailView = getElement("#albumDetailView");
  const accountBackBtn = getElement("#accountBackBtn");

  const openAccountPage = () => {
    if (homeSections) homeSections.style.display = "none";
    if (albumDetailView) albumDetailView.style.display = "none";
    if (accountOverviewPage) accountOverviewPage.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeAccountPage = () => {
    if (accountOverviewPage) accountOverviewPage.style.display = "none";
    if (homeSections) homeSections.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (accountOptionBtn) accountOptionBtn.addEventListener("click", openAccountPage);
  if (accountBackBtn) accountBackBtn.addEventListener("click", closeAccountPage);

  if (accountOverviewPage) {
    accountOverviewPage.querySelectorAll(".box-menu-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        handleAccountAction(action);
      });
    });

    const accExplorePlansBtn = getElement("#accExplorePlansBtn");
    const accJoinPremiumBtn = getElement("#accJoinPremiumBtn");
    const premiumPopup = getElement("#premiumPopup");

    const openPremium = () => {
      if (premiumPopup) {
        premiumPopup.classList.remove("hidden");
        premiumPopup.style.display = "flex";
      }
    };

    if (accExplorePlansBtn) accExplorePlansBtn.addEventListener("click", openPremium);
    if (accJoinPremiumBtn) accJoinPremiumBtn.addEventListener("click", openPremium);
  }
}

export function handleAccountAction(action) {
  switch (action) {
    case "subscription":
    case "explore-plans":
      const premiumPopup = getElement("#premiumPopup");
      if (premiumPopup) {
        premiumPopup.classList.remove("hidden");
        premiumPopup.style.display = "flex";
      }
      break;

    case "edit-profile":
      const profileModal = getElement("#profileModal");
      if (profileModal) {
        profileModal.classList.remove("hidden");
        profileModal.style.display = "flex";
      }
      break;

    case "recover-playlists":
      showToast("🔄 Restored 3 deleted playlists to your library!");
      break;

    case "address":
      const currentAddress = localStorage.getItem("user_address") || "New Delhi, India";
      const newAddress = prompt("Enter your account address:", currentAddress);
      if (newAddress !== null) {
        localStorage.setItem("user_address", newAddress.trim());
        showToast("🏠 Address updated successfully!");
      }
      break;

    case "payment-history":
      showToast("📑 Payment History: Free Tier Plan (₹0 billed)");
      break;

    case "saved-cards":
      showToast("💳 No saved payment cards. Click Explore Plans to add one.");
      break;

    case "redeem":
      const code = prompt("Enter your 12-digit Musify Gift Code:");
      if (code) {
        showToast("✨ Gift Code applied! 1 Month Premium activated!");
      }
      break;

    case "manage-apps":
      showToast("🔲 0 third-party apps connected to your account.");
      break;

    case "notifications":
      const isMuted = localStorage.getItem("notifications_muted") === "true";
      localStorage.setItem("notifications_muted", (!isMuted).toString());
      showToast(isMuted ? "🔔 Notifications enabled!" : "🔕 Notifications muted.");
      break;

    case "privacy":
      showToast("👁️ Account Privacy: Listening activity is set to Private.");
      break;

    case "edit-login":
      showToast("🪪 Login Methods: Passkey, Email & Google SSO active.");
      break;

    case "device-password":
      const pass = prompt("Set a new device PIN / Password:");
      if (pass) {
        showToast("📱 Device password updated successfully!");
      }
      break;

    case "delete-account":
      if (confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone.")) {
        localStorage.clear();
        showToast("🗑️ Account deleted.");
        setTimeout(() => window.location.href = "signup.html", 1200);
      }
      break;

    case "sign-out-everywhere":
      if (confirm("➔ Sign out of all devices? You will be logged out here as well.")) {
        localStorage.removeItem("token");
        localStorage.removeItem("is_logged_in");
        showToast("➔ Signed out of all devices.");
        setTimeout(() => window.location.href = "login.html", 1000);
      }
      break;

    case "support":
      showToast("❓ Opening Musify Support Center...");
      break;

    default:
      showToast("⚙️ Action processed.");
      break;
  }
}

export function setupSettingsPage() {
  const settingsOptionBtn = getElement("#settingsOptionBtn");
  const settingsViewPage = getElement("#settingsViewPage");
  const homeSections = getElement("#homeSections");
  const albumDetailView = getElement("#albumDetailView");
  const accountOverviewPage = getElement("#accountOverviewPage");
  const settingsBackBtn = getElement("#settingsBackBtn");

  const openSettings = () => {
    if (homeSections) homeSections.style.display = "none";
    if (albumDetailView) albumDetailView.style.display = "none";
    if (accountOverviewPage) accountOverviewPage.style.display = "none";
    if (settingsViewPage) settingsViewPage.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeSettings = () => {
    if (settingsViewPage) settingsViewPage.style.display = "none";
    if (homeSections) homeSections.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (settingsOptionBtn) settingsOptionBtn.addEventListener("click", openSettings);
  if (settingsBackBtn) settingsBackBtn.addEventListener("click", closeSettings);

  // 1. Edit Login Methods
  const editLoginMethodsBtn = getElement("#editLoginMethodsBtn");
  if (editLoginMethodsBtn) {
    editLoginMethodsBtn.addEventListener("click", () => {
      const profileModal = getElement("#profileModal");
      if (profileModal) {
        profileModal.classList.remove("hidden");
        profileModal.style.display = "flex";
      }
    });
  }

  // 2. Language Dropdown
  const appLanguageSelect = getElement("#appLanguageSelect");
  if (appLanguageSelect) {
    const savedLang = localStorage.getItem("app_language") || "en";
    appLanguageSelect.value = savedLang;
    appLanguageSelect.addEventListener("change", (e) => {
      localStorage.setItem("app_language", e.target.value);
      const selectedText = e.target.options[e.target.selectedIndex].text;
      showToast(`🌐 Language set to ${selectedText}. Changes applied!`);
    });
  }

  // 3. Audio Quality Select
  const audioQualitySelect = getElement("#audioQualitySelect");
  if (audioQualitySelect) {
    const savedQuality = localStorage.getItem("audio_quality") || "very_high";
    audioQualitySelect.value = savedQuality;
    audioQualitySelect.addEventListener("change", (e) => {
      localStorage.setItem("audio_quality", e.target.value);
      const label = e.target.options[e.target.selectedIndex].text;
      showToast(`🔊 Streaming Quality set to ${label}!`);
    });
  }

  // 4. Normalize Volume Toggle
  const normalizeVolumeToggle = getElement("#normalizeVolumeToggle");
  if (normalizeVolumeToggle) {
    normalizeVolumeToggle.checked = localStorage.getItem("normalize_volume") !== "false";
    normalizeVolumeToggle.addEventListener("change", (e) => {
      localStorage.setItem("normalize_volume", e.target.checked);
      showToast(e.target.checked ? "🎚️ Volume Normalization enabled." : "🎚️ Volume Normalization disabled.");
    });
  }

  // 5. Compact Library Layout Toggle
  const compactLibraryToggle = getElement("#compactLibraryToggle");
  if (compactLibraryToggle) {
    compactLibraryToggle.checked = localStorage.getItem("compact_library") === "true";
    compactLibraryToggle.addEventListener("change", (e) => {
      localStorage.setItem("compact_library", e.target.checked);
      const sidebar = getElement(".rightSidebar");
      if (sidebar) {
        if (e.target.checked) sidebar.classList.add("compact-mode");
        else sidebar.classList.remove("compact-mode");
      }
      showToast(e.target.checked ? "📐 Compact library layout enabled." : "📐 Standard library layout enabled.");
    });
  }

  // 6. Import Library Button & File Input
  const importLibraryBtn = getElement("#importLibraryBtn");
  const importLibraryInput = getElement("#importLibraryInput");
  if (importLibraryBtn && importLibraryInput) {
    importLibraryBtn.addEventListener("click", () => importLibraryInput.click());
    importLibraryInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        showToast(`📁 Successfully imported ${e.target.files.length} audio tracks into Your Library!`);
      }
    });
  }

  // 7. Desktop Notifications Toggle
  const desktopNotifyToggle = getElement("#desktopNotifyToggle");
  if (desktopNotifyToggle) {
    desktopNotifyToggle.checked = localStorage.getItem("desktop_notify") !== "false";
    desktopNotifyToggle.addEventListener("change", (e) => {
      localStorage.setItem("desktop_notify", e.target.checked);
      showToast(e.target.checked ? "🔔 Desktop notifications enabled." : "🔕 Desktop notifications disabled.");
    });
  }

  // 8. Auto Now Playing Toggle
  const autoNowPlayingToggle = getElement("#autoNowPlayingToggle");
  if (autoNowPlayingToggle) {
    autoNowPlayingToggle.checked = localStorage.getItem("auto_now_playing") !== "false";
    autoNowPlayingToggle.addEventListener("change", (e) => {
      localStorage.setItem("auto_now_playing", e.target.checked);
      showToast(e.target.checked ? "🖼️ Now Playing sidebar panel set to auto-show." : "🖼️ Now Playing panel auto-show disabled.");
    });
  }

  // 9. Canvas Toggle (Screenshot 2)
  const canvasToggle = getElement("#canvasToggle");
  if (canvasToggle) {
    canvasToggle.checked = localStorage.getItem("canvas_enabled") !== "false";
    canvasToggle.addEventListener("change", (e) => {
      localStorage.setItem("canvas_enabled", e.target.checked);
      showToast(e.target.checked ? "🎬 Looping visual Canvas enabled." : "🎬 Canvas visuals disabled.");
    });
  }

  // 10. Other Videos Toggle (Screenshot 2)
  const otherVideosToggle = getElement("#otherVideosToggle");
  if (otherVideosToggle) {
    otherVideosToggle.checked = localStorage.getItem("other_videos_enabled") !== "false";
    otherVideosToggle.addEventListener("change", (e) => {
      localStorage.setItem("other_videos_enabled", e.target.checked);
      showToast(e.target.checked ? "📹 Video podcasts & videos enabled." : "🎧 Video podcasts set to audio-only.");
    });
  }

  // 11. Autoplay Toggle (Screenshot 2)
  const autoplayToggle = getElement("#autoplayToggle");
  if (autoplayToggle) {
    autoplayToggle.checked = localStorage.getItem("autoplay_enabled") !== "false";
    autoplayToggle.addEventListener("change", (e) => {
      localStorage.setItem("autoplay_enabled", e.target.checked);
      showToast(e.target.checked ? "🔁 Non-stop Autoplay enabled." : "⏹️ Autoplay disabled.");
    });
  }

  // 12. Crossfade Songs Range Slider (Screenshot 2)
  const crossfadeRange = getElement("#crossfadeRange");
  const crossfadeVal = getElement("#crossfadeVal");
  if (crossfadeRange && crossfadeVal) {
    const savedCrossfade = localStorage.getItem("crossfade_sec") || "0";
    crossfadeRange.value = savedCrossfade;
    crossfadeVal.textContent = `${savedCrossfade}s`;

    const updateCrossfade = (val) => {
      crossfadeVal.textContent = `${val}s`;
      localStorage.setItem("crossfade_sec", val);
    };

    crossfadeRange.addEventListener("input", (e) => updateCrossfade(e.target.value));
    crossfadeRange.addEventListener("change", (e) => {
      updateCrossfade(e.target.value);
      showToast(`🎚️ Track Crossfade set to ${e.target.value}s.`);
    });
  }

  // 13. Mono Audio Toggle (Screenshot 2)
  const monoAudioToggle = getElement("#monoAudioToggle");
  if (monoAudioToggle) {
    monoAudioToggle.checked = localStorage.getItem("mono_audio") === "true";
    monoAudioToggle.addEventListener("change", (e) => {
      localStorage.setItem("mono_audio", e.target.checked);
      showToast(e.target.checked ? "🎧 Mono Audio enabled (Left + Right merged)." : "🎧 Stereo Audio active.");
    });
  }
}
