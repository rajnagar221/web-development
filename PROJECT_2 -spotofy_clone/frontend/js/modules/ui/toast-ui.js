import { getElement } from '../utils.js';

// ==================== TOAST NOTIFICATION ====================
export function showToast(message, duration = 2400) {
  const toast = getElement("#notificationToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.remove("visible");
    toast.classList.add("hidden");
  }, duration);
}
