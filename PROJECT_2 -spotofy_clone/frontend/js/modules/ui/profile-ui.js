import { getElement } from '../utils.js';
import { showToast } from './toast-ui.js';

export function refreshProfileDisplay() {
  const profileIcon = getElement("#profileIcon");
  const profileAvatar = getElement("#profileAvatar");
  const profileUsername = getElement("#profileUsername");
  const profileEmail = getElement("#profileEmail");

  const username = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "email@example.com";
  const profileImage = localStorage.getItem("profile_image");

  // Get initials
  const initials = username
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  // Update text values
  if (profileUsername) profileUsername.textContent = username;
  if (profileEmail) profileEmail.textContent = email;

  // Update profile circles (with custom image or initials)
  if (profileImage) {
    if (profileIcon) {
      profileIcon.innerHTML = `<img src="${profileImage}" alt="${username}" />`;
    }
    if (profileAvatar) {
      profileAvatar.innerHTML = `<img src="${profileImage}" alt="${username}" />`;
    }
  } else {
    if (profileIcon) {
      profileIcon.textContent = initials;
      profileIcon.innerHTML = initials; // Clear any old img element
    }
    if (profileAvatar) {
      profileAvatar.textContent = initials;
      profileAvatar.innerHTML = initials; // Clear any old img element
    }
  }
}

export function setupEditProfileModal() {
  const profileOptionBtn = getElement("#profileOptionBtn");
  const profileModal = getElement("#profileModal");
  const closeProfileModal = getElement("#closeProfileModal");
  const cancelProfileEditBtn = getElement("#cancelProfileEditBtn");
  const editProfileForm = getElement("#editProfileForm");

  const profileUsernameInput = getElement("#profileUsernameInput");
  const profileEmailInput = getElement("#profileEmailInput");
  const profileImageInput = getElement("#profileImageInput");

  const modalProfilePreviewImg = getElement("#modalProfilePreviewImg");
  const modalProfilePreviewInitials = getElement("#modalProfilePreviewInitials");
  const removeProfileImgBtn = getElement("#removeProfileImgBtn");

  let currentBase64Image = localStorage.getItem("profile_image") || "";

  // Open Modal
  if (profileOptionBtn && profileModal) {
    profileOptionBtn.addEventListener("click", () => {
      // Pre-fill inputs
      if (profileUsernameInput) profileUsernameInput.value = localStorage.getItem("username") || "User";
      if (profileEmailInput) profileEmailInput.value = localStorage.getItem("email") || "email@example.com";

      // Setup preview
      currentBase64Image = localStorage.getItem("profile_image") || "";
      updateModalPreview();

      // Show modal
      profileModal.classList.remove("hidden");

      // Close profile menu dropdown
      const profileMenu = getElement("#profileMenu");
      if (profileMenu) profileMenu.classList.remove("active");
    });
  }

  function updateModalPreview() {
    if (currentBase64Image) {
      if (modalProfilePreviewImg) {
        modalProfilePreviewImg.src = currentBase64Image;
        modalProfilePreviewImg.style.display = "block";
      }
      if (modalProfilePreviewInitials) {
        modalProfilePreviewInitials.style.display = "none";
      }
    } else {
      if (modalProfilePreviewImg) {
        modalProfilePreviewImg.style.display = "none";
        modalProfilePreviewImg.src = "";
      }
      if (modalProfilePreviewInitials) {
        const username = profileUsernameInput ? profileUsernameInput.value : "User";
        const initials = username
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0].toUpperCase())
          .slice(0, 2)
          .join("") || "U";
        modalProfilePreviewInitials.textContent = initials;
        modalProfilePreviewInitials.style.display = "flex";
      }
    }
  }

  // Handle username keyup to update preview initials on the fly
  if (profileUsernameInput) {
    profileUsernameInput.addEventListener("input", () => {
      if (!currentBase64Image) {
        updateModalPreview();
      }
    });
  }

  // Close Modal triggers
  const hideModal = () => {
    if (profileModal) profileModal.classList.add("hidden");
  };

  if (closeProfileModal) closeProfileModal.addEventListener("click", hideModal);
  if (cancelProfileEditBtn) cancelProfileEditBtn.addEventListener("click", hideModal);

  // Close Modal when clicking outside the card
  if (profileModal) {
    profileModal.addEventListener("click", (e) => {
      if (e.target === profileModal) {
        hideModal();
      }
    });
  }

  // Handle Image Upload & Conversion to Base64
  if (profileImageInput) {
    profileImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showToast("❌ Please select a valid image file.");
        return;
      }

      // Limit file size to 2MB to keep localStorage clean and fast
      if (file.size > 2 * 1024 * 1024) {
        showToast("❌ Image must be smaller than 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        currentBase64Image = event.target.result;
        updateModalPreview();
      };
      reader.readAsDataURL(file);
    });
  }

  // Remove Photo button
  if (removeProfileImgBtn) {
    removeProfileImgBtn.addEventListener("click", () => {
      currentBase64Image = "";
      if (profileImageInput) profileImageInput.value = "";
      updateModalPreview();
    });
  }

  // Form Submit
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newUsername = profileUsernameInput ? profileUsernameInput.value.trim() : "User";
      const newEmail = profileEmailInput ? profileEmailInput.value.trim() : "email@example.com";

      if (!newUsername) {
        showToast("❌ Username cannot be empty.");
        return;
      }

      // Save to localStorage
      localStorage.setItem("username", newUsername);
      localStorage.setItem("email", newEmail);
      if (currentBase64Image) {
        localStorage.setItem("profile_image", currentBase64Image);
      } else {
        localStorage.removeItem("profile_image");
      }

      // Refresh page elements
      refreshProfileDisplay();

      // Show toast message
      showToast("✅ Profile updated successfully!");

      // Hide modal
      hideModal();
    });
  }
}

export function setupProfileMenu() {
  const profileIcon = getElement("#profileIcon");
  const profileMenu = getElement("#profileMenu");
  const logoutOption = getElement("#logoutOption");
  const profileContainer = getElement(".profileContainer");

  // Initial display values on load
  refreshProfileDisplay();

  // Set up Edit Profile Modal event listeners
  setupEditProfileModal();

  const accountOptionBtn = getElement("#accountOptionBtn");
  const profileOptionBtn = getElement("#profileOptionBtn");
  const settingsOptionBtn = getElement("#settingsOptionBtn");

  if (accountOptionBtn) {
    accountOptionBtn.addEventListener("click", () => {
      window.location.href = "account.html";
    });
  }
  if (profileOptionBtn) {
    profileOptionBtn.addEventListener("click", () => {
      window.location.href = "profile.html";
    });
  }
  if (settingsOptionBtn) {
    settingsOptionBtn.addEventListener("click", () => {
      window.location.href = "settings.html";
    });
  }

  if (profileIcon && profileMenu) {
    profileIcon.addEventListener("click", (event) => {
      event.stopPropagation();
      profileMenu.classList.toggle("active");
    });
  }

  if (logoutOption) {
    logoutOption.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("is_logged_in");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("profile_image");
      window.location.href = "login.html";
    });
  }

  document.addEventListener("click", (event) => {
    if (!profileContainer || !profileMenu) return;
    if (!profileContainer.contains(event.target)) profileMenu.classList.remove("active");
  });
}

export function setupNotifications() {
  const notificationsBtn = getElement("#notificationsBtn");
  if (!notificationsBtn) return;
  notificationsBtn.addEventListener("click", () => {
    showToast("🔔 No new notifications", 2200);
  });
}
