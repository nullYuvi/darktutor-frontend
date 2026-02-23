const API = "https://darktutor.onrender.com";

// elements
const msg = document.getElementById("msg");

// ================= SIGNUP =================
async function signupUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    msg.innerText = "Username & password required ❌";
    return;
  }

  try {
    msg.innerText = "Signing up...";

    const res = await fetch(API + "/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    msg.innerText = data.message;

  } catch (e) {
    msg.innerText = "Server not reachable ❌";
  }
}

// ================= LOGIN =================
async function loginUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    msg.innerText = "Username & password required ❌";
    return;
  }

  try {
    msg.innerText = "Logging in...";

    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.success) {
      msg.innerText = data.message || "Login failed ❌";
      return;
    }

    // 🔐 save session
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // 👉 REDIRECT (IMPORTANT PART)
    window.location.href = "dashboard.html";

  } catch (e) {
    msg.innerText = "Server not reachable ❌";
  }
}

// ================= AUTO LOGIN =================
(function autoLogin() {
  const token = localStorage.getItem("token");
  if (token && window.location.pathname.endsWith("index.html")) {
    window.location.href = "dashboard.html";
  }
})();
