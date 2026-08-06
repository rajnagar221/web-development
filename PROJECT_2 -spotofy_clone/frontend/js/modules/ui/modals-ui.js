import { getElement } from '../utils.js';
import { showToast } from './toast-ui.js';

let deferredPwaPrompt = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
  });
}

export function setupPremiumPopup() {
  const exploreBtn = getElement("#explorePremiumBtn");
  const premiumPopup = getElement("#premiumPopup");
  const closePopup = getElement(".close-popup");
  const subscribeBtn = getElement("#subscribePremiumBtn");

  const openModal = () => {
    if (!premiumPopup) return;
    premiumPopup.classList.remove("hidden");
    premiumPopup.setAttribute("aria-hidden", "false");
    premiumPopup.style.display = "flex";
  };

  const closeModal = () => {
    if (!premiumPopup) return;
    premiumPopup.classList.add("hidden");
    premiumPopup.setAttribute("aria-hidden", "true");
    premiumPopup.style.display = "none";
  };

  if (exploreBtn) exploreBtn.addEventListener("click", openModal);
  if (closePopup) closePopup.addEventListener("click", closeModal);

  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      closeModal();
      showToast("🎵 Subscribed to Premium for ₹99/month!");
    });
  }

  if (premiumPopup) {
    premiumPopup.addEventListener("click", (event) => {
      if (event.target === premiumPopup) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && premiumPopup && !premiumPopup.classList.contains("hidden")) {
      closeModal();
    }
  });
}

export function setupInstallAppModal() {
  const installAppBtn = getElement("#installAppBtn");
  const installAppModal = getElement("#installAppModal");
  const closeInstallAppModalBtn = getElement("#closeInstallAppModalBtn");
  const modalDownloadAppBtn = getElement("#modalDownloadAppBtn");

  const openModal = () => {
    if (installAppModal) {
      installAppModal.classList.remove("hidden");
      installAppModal.style.display = "flex";
      installAppModal.setAttribute("aria-hidden", "false");
    }
  };

  const closeModal = () => {
    if (installAppModal) {
      installAppModal.classList.add("hidden");
      installAppModal.style.display = "none";
      installAppModal.setAttribute("aria-hidden", "true");
    }
  };

  if (installAppBtn) installAppBtn.addEventListener("click", openModal);
  if (closeInstallAppModalBtn) closeInstallAppModalBtn.addEventListener("click", closeModal);

  if (modalDownloadAppBtn) {
    modalDownloadAppBtn.addEventListener("click", async () => {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        const choice = await deferredPwaPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          showToast("✅ Musify App installed successfully!");
        } else {
          showToast("✅ Musify App is ready for Web & PWA!");
        }
        deferredPwaPrompt = null;
      } else {
        showToast("✅ Musify Web App is ready for installation!");
      }
      closeModal();
    });
  }

  if (installAppModal) {
    installAppModal.addEventListener("click", (e) => {
      if (e.target === installAppModal) closeModal();
    });
  }
}

export function triggerDesktopAppDownload() {
  showToast("✅ Musify Web App is ready to use!");
}
