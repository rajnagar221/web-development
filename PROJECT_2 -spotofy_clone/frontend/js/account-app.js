// ==========================================
// MUSIFY ACCOUNT PAGE LOGIC (account.html)
// ==========================================

function activatePlan(planName, planDesc) {
  localStorage.setItem("user_plan", planName);
  localStorage.setItem("user_plan_desc", planDesc);
  const badge = document.getElementById("accountPlanBadge");
  const title = document.getElementById("currentPlanTitle");
  const desc = document.getElementById("currentPlanDesc");
  if (badge) badge.textContent = planName;
  if (title) title.textContent = planName;
  if (desc) desc.textContent = planDesc;
  const plansModal = document.getElementById("plansModal");
  if (plansModal) plansModal.classList.remove("active");
  const toast = document.getElementById("accountToast");
  if (toast) {
    toast.textContent = `🎉 Activated ${planName}!`;
    toast.style.display = "block";
    toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.style.display = "none", 300); }, 2800);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Auth check
  const isLoggedIn = localStorage.getItem("is_logged_in") === "true" || !!localStorage.getItem("token");
  if (!isLoggedIn) {
    window.location.href = "login.html";
    return;
  }

  // 2. DOM elements
  const miniAvatar = document.getElementById("miniAvatar");
  const miniUsername = document.getElementById("miniUsername");
  const logoutBtn = document.getElementById("logoutBtn");
  const toast = document.getElementById("accountToast");
  const displayAddressText = document.getElementById("displayAddressText");

  const accountPlanBadge = document.getElementById("accountPlanBadge");
  const currentPlanTitle = document.getElementById("currentPlanTitle");
  const currentPlanDesc = document.getElementById("currentPlanDesc");

  const accountEditModal = document.getElementById("accountEditModal");
  const closeAccModalBtn = document.getElementById("closeAccModalBtn");
  const cancelAccModalBtn = document.getElementById("cancelAccModalBtn");
  const accEditForm = document.getElementById("accEditForm");
  const accUsernameInput = document.getElementById("accUsernameInput");
  const accEmailInput = document.getElementById("accEmailInput");
  const accAvatarFile = document.getElementById("accAvatarFile");
  const accRemoveAvatarBtn = document.getElementById("accRemoveAvatarBtn");
  const accAvatarPreview = document.getElementById("accAvatarPreview");

  const plansModal = document.getElementById("plansModal");
  const closePlansModalBtn = document.getElementById("closePlansModalBtn");
  const explorePlansBtn = document.getElementById("explorePlansBtn");
  const joinPremiumBtn = document.getElementById("joinPremiumBtn");

  let currentAvatarBase64 = localStorage.getItem("profile_image") || "";

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

  // 3. User & Plan UI Update
  function refreshAccountUI() {
    const username = localStorage.getItem("username") || "User";
    const email = localStorage.getItem("email") || "user@example.com";
    const avatarImg = localStorage.getItem("profile_image") || "";
    const address = localStorage.getItem("user_address") || "New Delhi, India";
    const planName = localStorage.getItem("user_plan") || "Musify Free";
    const planDesc = localStorage.getItem("user_plan_desc") || "Ad-supported music streaming with standard 160kbps audio quality.";

    const initials = username
      .split(" ")
      .filter(Boolean)
      .map(n => n[0].toUpperCase())
      .slice(0, 2)
      .join("") || "U";

    if (avatarImg) {
      miniAvatar.innerHTML = `<img src="${avatarImg}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar" />`;
      accAvatarPreview.innerHTML = `<img src="${avatarImg}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar" />`;
    } else {
      miniAvatar.textContent = initials;
      accAvatarPreview.textContent = initials;
    }
    if (miniUsername) miniUsername.textContent = username;
    if (displayAddressText) displayAddressText.textContent = address;

    if (accountPlanBadge) accountPlanBadge.textContent = planName;
    if (currentPlanTitle) currentPlanTitle.textContent = planName;
    if (currentPlanDesc) currentPlanDesc.textContent = planDesc;
  }

  refreshAccountUI();

  // 4. Modal Triggers
  function openEditModal() {
    currentAvatarBase64 = localStorage.getItem("profile_image") || "";
    if (accUsernameInput) accUsernameInput.value = localStorage.getItem("username") || "User";
    if (accEmailInput) accEmailInput.value = localStorage.getItem("email") || "user@example.com";
    if (accountEditModal) accountEditModal.classList.add("active");
  }

  function hideEditModal() {
    if (accountEditModal) accountEditModal.classList.remove("active");
  }

  if (closeAccModalBtn) closeAccModalBtn.addEventListener("click", hideEditModal);
  if (cancelAccModalBtn) cancelAccModalBtn.addEventListener("click", hideEditModal);

  if (accAvatarFile) {
    accAvatarFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        showToast("❌ Image must be under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        currentAvatarBase64 = ev.target.result;
        accAvatarPreview.innerHTML = `<img src="${currentAvatarBase64}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="Avatar" />`;
      };
      reader.readAsDataURL(file);
    });
  }

  if (accRemoveAvatarBtn) {
    accRemoveAvatarBtn.addEventListener("click", () => {
      currentAvatarBase64 = "";
      if (accAvatarFile) accAvatarFile.value = "";
      const username = accUsernameInput ? accUsernameInput.value || "User" : "User";
      const initials = username.split(" ").filter(Boolean).map(n => n[0].toUpperCase()).slice(0, 2).join("") || "U";
      accAvatarPreview.textContent = initials;
    });
  }

  if (accEditForm) {
    accEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newName = accUsernameInput ? accUsernameInput.value.trim() : "User";
      const newEmail = accEmailInput ? accEmailInput.value.trim() : "user@example.com";
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
      refreshAccountUI();
      showToast("✅ Personal Info saved!");
      hideEditModal();
    });
  }

  // Plans Modal
  function openPlansModal() {
    if (plansModal) plansModal.classList.add("active");
  }

  if (explorePlansBtn) explorePlansBtn.addEventListener("click", openPlansModal);
  if (joinPremiumBtn) joinPremiumBtn.addEventListener("click", openPlansModal);
  if (closePlansModalBtn) closePlansModalBtn.addEventListener("click", () => {
    if (plansModal) plansModal.classList.remove("active");
  });

  // 5. Account Action Row Handler
  document.querySelectorAll(".menu-row-item").forEach(item => {
    item.addEventListener("click", () => {
      const action = item.dataset.action;
      if (action === "edit-profile") {
        openEditModal();
      } else if (action === "subscription") {
        openPlansModal();
      } else if (action === "address") {
        const currentAddr = localStorage.getItem("user_address") || "New Delhi, India";
        const newAddr = prompt("Enter your account address:", currentAddr);
        if (newAddr !== null && newAddr.trim() !== "") {
          localStorage.setItem("user_address", newAddr.trim());
          refreshAccountUI();
          showToast("🏠 Address updated successfully!");
        }
      } else if (action === "recover-playlists") {
        showToast("🔄 Restored 3 deleted playlists to your library!");
      } else if (action === "payment-history") {
        const plan = localStorage.getItem("user_plan") || "Musify Free";
        showToast(`📑 Payment History: Current Plan - ${plan}`);
      } else if (action === "saved-cards") {
        showToast("💳 No saved payment cards. Click Explore Plans to add one.");
      } else if (action === "redeem") {
        const code = prompt("Enter your 12-digit Musify Gift Code:");
        if (code && code.trim().length > 0) {
          activatePlan("Musify Premium 1 Month", "1 Month Gift Premium (320kbps Audio)");
          showToast("✨ Gift Code applied! 1 Month Premium activated!");
        }
      } else if (action === "privacy") {
        const isPrivate = localStorage.getItem("listening_privacy") === "private";
        const nextState = isPrivate ? "public" : "private";
        localStorage.setItem("listening_privacy", nextState);
        showToast(nextState === "private" ? "👁️ Listening activity set to Private." : "👁️ Listening activity set to Public.");
      } else if (action === "delete-account") {
        if (confirm(" Are you sure you want to delete your account? This action cannot be undone.")) {
          localStorage.clear();
          showToast("🗑️ Account deleted");
          setTimeout(() => window.location.href = "signup.html", 1000);
        }
      } else if (action === "sign-out-everywhere") {
        if (confirm(" Sign out of all devices? You will be logged out here as well.")) {
          localStorage.clear();
          showToast(" Signed out");
          setTimeout(() => window.location.href = "login.html", 1000);
        }
      } else {
        const label = item.querySelector(".menu-row-left span:last-child")?.textContent || "Action";
        showToast(`⚙️ ${label} processed.`);
      }
    });
  });

  // 6. Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("is_logged_in");
      window.location.href = "login.html";
    });
  }
});
