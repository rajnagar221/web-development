// ==========================================
// MUSIFY PROFILE PAGE LOGIC (profile.html)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Auth Guard
  const isLoggedIn = localStorage.getItem("is_logged_in") === "true" || !!localStorage.getItem("token");
  if (!isLoggedIn) {
    window.location.href = "login.html";
    return;
  }

  // 2. DOM References
  const profileAvatarHero = document.getElementById("profileAvatarHero");
  const profileUsernameHero = document.getElementById("profileUsernameHero");
  const profileEmailHero = document.getElementById("profileEmailHero");
  const displayUsernameVal = document.getElementById("displayUsernameVal");
  const displayEmailVal = document.getElementById("displayEmailVal");

  const miniAvatar = document.getElementById("miniAvatar");
  const miniUsername = document.getElementById("miniUsername");

  const editProfileModal = document.getElementById("editProfileModal");
  const openEditModalBtn = document.getElementById("openEditModalBtn");
  const editNameBtn = document.getElementById("editNameBtn");
  const editEmailBtn = document.getElementById("editEmailBtn");
  const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");

  const closeEditModalBtn = document.getElementById("closeEditModalBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const editProfileForm = document.getElementById("editProfileForm");

  const inputUsername = document.getElementById("inputUsername");
  const inputEmail = document.getElementById("inputEmail");
  const inputAvatarFile = document.getElementById("inputAvatarFile");
  const removeAvatarBtn = document.getElementById("removeAvatarBtn");
  const modalAvatarPreview = document.getElementById("modalAvatarPreview");

  const logoutBtn = document.getElementById("logoutBtn");
  const toast = document.getElementById("profileToast");

  let currentAvatarBase64 = localStorage.getItem("profile_image") || "";

  // 3. Populate Profile Info
  function refreshProfileUI() {
    const username = localStorage.getItem("username") || "User";
    const email = localStorage.getItem("email") || "user@example.com";
    const avatarImg = localStorage.getItem("profile_image") || "";

    const initials = username
      .split(" ")
      .filter(Boolean)
      .map(n => n[0].toUpperCase())
      .slice(0, 2)
      .join("") || "U";

    if (avatarImg) {
      profileAvatarHero.innerHTML = `<img src="${avatarImg}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar" />`;
      miniAvatar.innerHTML = `<img src="${avatarImg}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar" />`;
    } else {
      profileAvatarHero.textContent = initials;
      miniAvatar.textContent = initials;
    }

    if (profileUsernameHero) profileUsernameHero.textContent = username;
    if (profileEmailHero) profileEmailHero.textContent = email;
    if (displayUsernameVal) displayUsernameVal.textContent = username;
    if (displayEmailVal) displayEmailVal.textContent = email;
    if (miniUsername) miniUsername.textContent = username;
  }

  refreshProfileUI();

  // 4. Toast Helper
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

  // 5. Edit Profile Modal Events
  function updateModalAvatarPreview() {
    const username = inputUsername ? inputUsername.value || "User" : "User";
    const initials = username
      .split(" ")
      .filter(Boolean)
      .map(n => n[0].toUpperCase())
      .slice(0, 2)
      .join("") || "U";

    if (currentAvatarBase64) {
      modalAvatarPreview.innerHTML = `<img src="${currentAvatarBase64}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar" />`;
    } else {
      modalAvatarPreview.textContent = initials;
    }
  }

  const openModal = () => {
    currentAvatarBase64 = localStorage.getItem("profile_image") || "";
    if (inputUsername) inputUsername.value = localStorage.getItem("username") || "User";
    if (inputEmail) inputEmail.value = localStorage.getItem("email") || "user@example.com";
    updateModalAvatarPreview();
    if (editProfileModal) editProfileModal.classList.add("active");
  };

  if (openEditModalBtn) openEditModalBtn.addEventListener("click", openModal);
  if (editNameBtn) editNameBtn.addEventListener("click", openModal);
  if (editEmailBtn) editEmailBtn.addEventListener("click", openModal);
  if (uploadPhotoBtn) uploadPhotoBtn.addEventListener("click", openModal);

  function hideModal() {
    if (editProfileModal) editProfileModal.classList.remove("active");
  }

  if (closeEditModalBtn) closeEditModalBtn.addEventListener("click", hideModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", hideModal);

  if (inputUsername) {
    inputUsername.addEventListener("input", updateModalAvatarPreview);
  }

  if (inputAvatarFile) {
    inputAvatarFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        showToast("❌ Select a valid image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast("❌ Image must be under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        currentAvatarBase64 = ev.target.result;
        updateModalAvatarPreview();
      };
      reader.readAsDataURL(file);
    });
  }

  if (removeAvatarBtn) {
    removeAvatarBtn.addEventListener("click", () => {
      currentAvatarBase64 = "";
      if (inputAvatarFile) inputAvatarFile.value = "";
      updateModalAvatarPreview();
    });
  }

  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newName = inputUsername ? inputUsername.value.trim() : "User";
      const newEmail = inputEmail ? inputEmail.value.trim() : "user@example.com";

      if (!newName) {
        showToast("❌ Username cannot be empty.");
        return;
      }

      localStorage.setItem("username", newName);
      localStorage.setItem("email", newEmail);
      if (currentAvatarBase64) {
        localStorage.setItem("profile_image", currentAvatarBase64);
      } else {
        localStorage.removeItem("profile_image");
      }

      refreshProfileUI();
      showToast("✅ Profile updated successfully!");
      hideModal();
    });
  }

  // 6. Genre Select
  const favGenreSelect = document.getElementById("favGenreSelect");
  if (favGenreSelect) {
    favGenreSelect.value = localStorage.getItem("fav_genre") || "punjabi";
    favGenreSelect.addEventListener("change", (e) => {
      localStorage.setItem("fav_genre", e.target.value);
      showToast(`🎵 Preferred Genre set to ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // 7. Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("is_logged_in");
      window.location.href = "login.html";
    });
  }
});
