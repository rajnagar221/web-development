document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://127.0.0.1:8000";

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const loginTabs = document.querySelectorAll("[data-login-tab]");
    const loginEmailSection = document.getElementById("loginEmailSection");
    const loginPhoneSection = document.getElementById("loginPhoneSection");
    const loginEmailInput = document.getElementById("loginEmail");
    const loginPhoneInput = document.getElementById("loginPhone");
    const toastContainer = document.getElementById("toastContainer");
    const googleButtons = document.querySelectorAll(".google-auth-btn");

    let loginMode = "email";

    function showToast(message, variant = "info") {
        if (!toastContainer) {
            alert(message);
            return;
        }
        toastContainer.textContent = message;
        toastContainer.style.display = "block";
        toastContainer.style.opacity = "1";
        toastContainer.style.background = variant === "success" ? "rgba(34, 197, 94, 0.18)" : variant === "error" ? "rgba(244, 63, 94, 0.18)" : "rgba(15, 23, 42, 0.95)";
        toastContainer.style.borderColor = variant === "success" ? "rgba(34, 197, 94, 0.4)" : variant === "error" ? "rgba(244, 63, 94, 0.4)" : "rgba(148, 163, 184, 0.35)";
        toastContainer.style.color = "#FFFFFF";
        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => {
            if (toastContainer) {
                toastContainer.style.opacity = "0";
                setTimeout(() => toastContainer.style.display = "none", 300);
            }
        }, 3200);
    }

    function setLoginMode(mode) {
        loginMode = mode;
        loginTabs.forEach((tab) => {
            const active = tab.dataset.loginTab === mode;
            tab.classList.toggle("active", active);
        });

        if (loginEmailSection && loginPhoneSection) {
            loginEmailSection.classList.toggle("hidden", mode !== "email");
            loginPhoneSection.classList.toggle("hidden", mode !== "phone");
        }

        if (loginEmailInput && loginPhoneInput) {
            loginEmailInput.disabled = mode !== "email";
            loginPhoneInput.disabled = mode !== "phone";
            loginEmailInput.required = mode === "email";
            loginPhoneInput.required = mode === "phone";
        }
    }

    loginTabs.forEach((tab) => {
        tab.addEventListener("click", (event) => {
            const mode = event.currentTarget.dataset.loginTab;
            if (mode) {
                setLoginMode(mode);
            }
        });
    });

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

            showToast(`Welcome back, ${data.username}!`, "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
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
            showToast("Signed in with Google!", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        } catch (err) {
            console.error(err);
            showToast("Google login is unavailable right now.", "error");
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const identifier = loginMode === "email"
                ? document.getElementById("loginEmail").value.trim()
                : document.getElementById("loginPhone").value.trim();
            const password = document.getElementById("loginPassword").value.trim();
            handleLogin(identifier, password);
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const fullname = document.getElementById("fullname").value.trim();
            const email = document.getElementById("signupEmail").value.trim();
            const phone = document.getElementById("signupPhone").value.trim();
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

            try {
                const response = await fetch(`${API_BASE_URL}/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: fullname,
                        email: email,
                        phone: phone,
                        password: password,
                    }),
                });
                const data = await response.json();
                if (!response.ok) {
                    showToast(data.detail || "Signup failed.", "error");
                    return;
                }
                showToast("Account created successfully! Redirecting...");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1400);
            } catch (err) {
                console.error(err);
                showToast("Server error. Make sure backend is running.", "error");
            }
        });
    }

    googleButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            handleGoogleAuth();
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

    setLoginMode("email");
    checkDashboardLogin();
    updateIndexAuthButtons();
});
