const API = "https://darktutor.onrender.com";

const msg = document.getElementById("msg");
const card = document.getElementById("card");

// ---------- SIGNUP ----------
async function signupUser() {
  msg.innerText = "Signing up...";

  try {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      msg.innerText = "All fields required";
      return;
    }

    const res = await fetch(API + "/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    msg.innerText = data.message || "Signup error";

  } catch (err) {
    msg.innerText = "Server not reachable ❌";
  }
}

// ---------- LOGIN ----------
async function loginUser() {
  msg.innerText = "Logging in...";

  try {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      msg.innerText = "All fields required";
      return;
    }

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

    // SAVE TOKEN
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showDashboard();

  } catch (err) {
    msg.innerText = "Server not reachable ❌";
  }
}

// ---------- DASHBOARD ----------
function showDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  card.innerHTML = `
    <h2>Welcome, ${user.username} 👋</h2>
    <p>Role: ${user.role}</p>
    <p>Chat Score: ${user.chatScore}</p>
    <p>Premium: ${user.isPremium ? "Yes" : "No"}</p>
    <button onclick="logout()">Logout</button>
  `;
}

// ---------- LOGOUT ----------
function logout() {
  localStorage.clear();
  location.reload();
}

// ---------- AUTO LOGIN ----------
window.onload = () => {
  if (localStorage.getItem("token")) {
    showDashboard();
  }
};
