document.addEventListener("DOMContentLoaded", function () {

    // ==================== LOGIN HANDLER ====================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Validation
            if (!email || !password) {
                alert("❌ Email and password are required");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Save token and user info
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("username", data.username);
                    localStorage.setItem("email", email);
                    localStorage.setItem("is_logged_in", "true");

                    // Show success modal
                    const successModal = document.getElementById("successModal");
                    if (successModal) {
                        const successUsername = document.getElementById("successUsername");
                        if (successUsername) {
                            successUsername.textContent = data.username;
                        }
                        successModal.classList.remove("hidden");
                        
                        // Redirect to homepage after 3 seconds
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 3000);
                    } else {
                        // Fallback if modal not found
                        alert(`✅ Login Successful!\nWelcome ${data.username}!`);
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 1000);
                    }
                } else {
                    alert(`❌ ${data.detail || "Login failed"}`);
                }

            } catch (error) {
                alert("❌ Server Error - Make sure backend is running on http://127.0.0.1:8000");
                console.log(error);
            }
        });
    }

    // ==================== SIGNUP HANDLER ====================
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const fullname = document.getElementById("fullname").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Validation
            if (!fullname || !email || !password || !confirmPassword) {
                alert("❌ All fields are required");
                return;
            }

            if (password.length < 6) {
                alert("❌ Password must be at least 6 characters");
                return;
            }

            if (password !== confirmPassword) {
                alert("❌ Passwords do not match");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: fullname,
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`✅ ${data.message}\nAccount created successfully!\nRedirecting to login...`);

                    // Redirect to login
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    alert(`❌ ${data.detail || "Signup failed"}`);
                }

            } catch (error) {
                alert("❌ Server Error - Make sure backend is running on http://127.0.0.1:8000");
                console.log(error);
            }
        });
    }

    // ==================== CHECK LOGIN STATUS ====================
    const dashboardPage = document.querySelector(".dashboard, [data-page='dashboard']");
    if (dashboardPage) {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        
        if (token && username) {
            console.log(`✅ User ${username} is logged in`);
            // Update UI to show logged in user
            const userDisplay = document.getElementById("user-display");
            if (userDisplay) {
                userDisplay.textContent = `Welcome, ${username}`;
            }
        } else {
            console.log("❌ No active session");
            // Redirect to login if not logged in
            // window.location.href = "login.html";
        }
    }

    // ==================== INDEX BUTTON VISIBILITY ====================
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

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                localStorage.removeItem("email");
                localStorage.removeItem("is_logged_in");
                window.location.reload();
            });
        }
    }

});
