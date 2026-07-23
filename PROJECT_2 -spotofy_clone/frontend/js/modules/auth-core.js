import { API_BASE_URL } from './config.js';

export function showAuthToast(message, variant = "info") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    alert(message);
    return;
  }
  toastContainer.textContent = message;
  toastContainer.className = ""; // Reset classes
  toastContainer.classList.add(`toast-${variant}`);
  toastContainer.classList.add("show");
  
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    if (toastContainer) {
      toastContainer.classList.remove("show");
    }
  }, 3200);
}

export async function handleLogin(identifier, password) {
  if (!identifier || !password) {
    showAuthToast("Please fill in both fields.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: identifier,
        password: password,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      showAuthToast(data.detail || "Login failed.", "error");
      return;
    }

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("email", data.email || "");
    localStorage.setItem("is_logged_in", "true");

    // Success Redirect Modal display
    const successModal = document.getElementById("successModal");
    const successUsername = document.getElementById("successUsername");
    const successAvatar = document.getElementById("successAvatar");
    
    if (successModal) {
      if (successUsername) successUsername.textContent = data.username;
      if (successAvatar) successAvatar.textContent = data.username.charAt(0).toUpperCase();
      successModal.classList.add("show");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2500);
    } else {
      showAuthToast(`Welcome back, ${data.username}!`, "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    }
  } catch (err) {
    console.error(err);
    showAuthToast("Server error. Make sure backend is running.", "error");
  }
}

export async function handleGoogleAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      showAuthToast(data.detail || "Google login failed.", "error");
      return;
    }
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("email", "google-demo@musify.com");
    localStorage.setItem("is_logged_in", "true");
    
    const successModal = document.getElementById("successModal");
    const successUsername = document.getElementById("successUsername");
    const successAvatar = document.getElementById("successAvatar");
    
    if (successModal) {
      if (successUsername) successUsername.textContent = data.username;
      if (successAvatar) successAvatar.textContent = data.username.charAt(0).toUpperCase();
      successModal.classList.add("show");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2500);
    } else {
      showAuthToast("Signed in with Google!", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    }
  } catch (err) {
    console.error(err);
    showAuthToast("Google login is unavailable right now.", "error");
  }
}

export async function handleSpotifyAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/spotify-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      showAuthToast(data.detail || "Spotify login failed.", "error");
      return;
    }
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("email", "spotify-demo@musify.com");
    localStorage.setItem("is_logged_in", "true");
    
    const successModal = document.getElementById("successModal");
    const successUsername = document.getElementById("successUsername");
    const successAvatar = document.getElementById("successAvatar");
    
    if (successModal) {
      if (successUsername) successUsername.textContent = data.username;
      if (successAvatar) successAvatar.textContent = data.username.charAt(0).toUpperCase();
      successModal.classList.add("show");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2500);
    } else {
      showAuthToast("Signed in with Spotify!", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    }
  } catch (err) {
    console.error(err);
    showAuthToast("Spotify login is unavailable right now.", "error");
  }
}

export async function handleAppleAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/apple-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      showAuthToast(data.detail || "Apple login failed.", "error");
      return;
    }
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("email", "apple-demo@musify.com");
    localStorage.setItem("is_logged_in", "true");
    
    const successModal = document.getElementById("successModal");
    const successUsername = document.getElementById("successUsername");
    const successAvatar = document.getElementById("successAvatar");
    
    if (successModal) {
      if (successUsername) successUsername.textContent = data.username;
      if (successAvatar) successAvatar.textContent = data.username.charAt(0).toUpperCase();
      successModal.classList.add("show");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2500);
    } else {
      showAuthToast("Signed in with Apple!", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    }
  } catch (err) {
    console.error(err);
    showAuthToast("Apple login is unavailable right now.", "error");
  }
}

export async function handleSignup(fullname, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: fullname,
        email: email,
        password: password,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      showAuthToast(data.detail || "Signup failed.", "error");
      return false;
    }
    showAuthToast("Account created successfully! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1400);
    return true;
  } catch (err) {
    console.error(err);
    showAuthToast("Server error. Make sure backend is running.", "error");
    return false;
  }
}

export function checkDashboardLogin() {
  const dashboardPage = document.querySelector(".dashboard, [data-page='dashboard']");
  if (!dashboardPage) return;

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (token && username) {
    const userDisplay = document.getElementById("user-display");
    if (userDisplay) {
      userDisplay.textContent = `Welcome, ${username}`;
    }
  }
}

export function updateIndexAuthButtons() {
  const authButtons = document.getElementById("authButtons");
  const welcomeInfo = document.getElementById("welcomeInfo");
  const navUsername = document.getElementById("navUsername");
  const isLoggedIn = localStorage.getItem("is_logged_in") === "true";
  if (isLoggedIn && authButtons) {
    authButtons.style.display = "none";
    if (welcomeInfo) {
      welcomeInfo.style.display = "flex";
    }
    if (navUsername) {
      navUsername.textContent = localStorage.getItem("username") || "User";
    }
  }
}

export async function verifyAuthentication() {
  const loader = document.getElementById("appLoader");
  if (loader) loader.remove();

  let token = localStorage.getItem("token");
  if (!token) {
    localStorage.setItem("token", "guest-demo-token");
    localStorage.setItem("username", "Guest Listener");
    localStorage.setItem("email", "guest@musify.com");
    localStorage.setItem("is_logged_in", "true");
  }
  return true;
}

