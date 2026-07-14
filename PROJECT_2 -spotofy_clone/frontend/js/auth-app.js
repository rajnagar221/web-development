import {
  handleLogin,
  handleSignup,
  handleGoogleAuth,
  handleSpotifyAuth,
  handleAppleAuth,
  checkDashboardLogin,
  showAuthToast
} from './modules/auth-core.js';

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleButtons = document.querySelectorAll(".google-auth-btn");
  const spotifyButtons = document.querySelectorAll(".spotify-auth-btn");
  const appleButtons = document.querySelectorAll(".apple-auth-btn");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const identifier = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      
      const submitBtn = loginForm.querySelector(".submit-btn");
      if (submitBtn) {
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;
      }

      await handleLogin(identifier, password);

      if (submitBtn) {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const fullname = document.getElementById("fullname").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();

      if (!fullname || !email || !password || !confirmPassword) {
        showAuthToast("All fields are required.", "error");
        return;
      }
      if (password.length < 6) {
        showAuthToast("Password must be at least 6 characters.", "error");
        return;
      }
      if (password !== confirmPassword) {
        showAuthToast("Passwords do not match.", "error");
        return;
      }

      const submitBtn = signupForm.querySelector(".submit-btn");
      if (submitBtn) {
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;
      }

      const success = await handleSignup(fullname, email, password);

      if (!success && submitBtn) {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    });
  }

  googleButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      showAuthToast("Google Login is currently pending. Please do not use this method.", "warning");
    });
  });

  spotifyButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      showAuthToast("Spotify Login is currently pending. Please do not use this method.", "warning");
    });
  });

  appleButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      showAuthToast("Apple Login is currently pending. Please do not use this method.", "warning");
    });
  });

  checkDashboardLogin();
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
      .catch((err) => console.warn('Service Worker registration failed:', err));
  });
}
