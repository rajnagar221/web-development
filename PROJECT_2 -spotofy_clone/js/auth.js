document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://localhost:8000";

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const toastContainer = document.getElementById("toastContainer");
    const googleButtons = document.querySelectorAll(".google-auth-btn");
    const spotifyButtons = document.querySelectorAll(".spotify-auth-btn");
    const appleButtons = document.querySelectorAll(".apple-auth-btn");

    function showToast(message, variant = "info") {
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

    async function handleLogin(identifier, password) {
        if (!identifier || !password) {
            showToast("Please fill in both fields.", "error");
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
                showToast(data.detail || "Login failed.", "error");
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
                showToast(`Welcome back, ${data.username}!`, "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1200);
            }
        } catch (err) {
            console.error(err);
            showToast("Server error. Make sure backend is running.", "error");
        }
    }

    async function handleGoogleAuth() {
        try {
            const response = await fetch(`${API_BASE_URL}/google-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (!response.ok) {
                showToast(data.detail || "Google login failed.", "error");
                return;
            }
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("email", "google-demo@musify.com");
            localStorage.setItem("is_logged_in", "true");
            
            // Show Success Redirect Modal
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
                showToast("Signed in with Google!", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1200);
            }
        } catch (err) {
            console.error(err);
            showToast("Google login is unavailable right now.", "error");
        }
    }

    async function handleSpotifyAuth() {
        try {
            const response = await fetch(`${API_BASE_URL}/spotify-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (!response.ok) {
                showToast(data.detail || "Spotify login failed.", "error");
                return;
            }
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("email", "spotify-demo@musify.com");
            localStorage.setItem("is_logged_in", "true");
            
            // Show Success Redirect Modal
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
                showToast("Signed in with Spotify!", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1200);
            }
        } catch (err) {
            console.error(err);
            showToast("Spotify login is unavailable right now.", "error");
        }
    }

    async function handleAppleAuth() {
        try {
            const response = await fetch(`${API_BASE_URL}/apple-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (!response.ok) {
                showToast(data.detail || "Apple login failed.", "error");
                return;
            }
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("email", "apple-demo@musify.com");
            localStorage.setItem("is_logged_in", "true");
            
            // Show Success Redirect Modal
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
                showToast("Signed in with Apple!", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1200);
            }
        } catch (err) {
            console.error(err);
            showToast("Apple login is unavailable right now.", "error");
        }
    }

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
                showToast("All fields are required.", "error");
                return;
            }
            if (password.length < 6) {
                showToast("Password must be at least 6 characters.", "error");
                return;
            }
            if (password !== confirmPassword) {
                showToast("Passwords do not match.", "error");
                return;
            }

            const submitBtn = signupForm.querySelector(".submit-btn");
            if (submitBtn) {
                submitBtn.classList.add("loading");
                submitBtn.disabled = true;
            }

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
                    showToast(data.detail || "Signup failed.", "error");
                    if (submitBtn) {
                        submitBtn.classList.remove("loading");
                        submitBtn.disabled = false;
                    }
                    return;
                }
                showToast("Account created successfully! Redirecting...", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1400);
            } catch (err) {
                console.error(err);
                showToast("Server error. Make sure backend is running.", "error");
                if (submitBtn) {
                    submitBtn.classList.remove("loading");
                    submitBtn.disabled = false;
                }
            }
        });
    }

    googleButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
            e.preventDefault();
            
            button.style.opacity = "0.7";
            button.style.pointerEvents = "none";
            await handleGoogleAuth();
            button.style.opacity = "1";
            button.style.pointerEvents = "auto";
        });
    });

    spotifyButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
            e.preventDefault();
            
            button.style.opacity = "0.7";
            button.style.pointerEvents = "none";
            await handleSpotifyAuth();
            button.style.opacity = "1";
            button.style.pointerEvents = "auto";
        });
    });

    appleButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
            e.preventDefault();
            
            button.style.opacity = "0.7";
            button.style.pointerEvents = "none";
            await handleAppleAuth();
            button.style.opacity = "1";
            button.style.pointerEvents = "auto";
        });
    });

    function checkDashboardLogin() {
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

    function updateIndexAuthButtons() {
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

    checkDashboardLogin();
    updateIndexAuthButtons();
});
