const API = "https://darktutor.onrender.com";

const msg = document.getElementById("msg");
const authView = document.getElementById("authView");
const dashboardView = document.getElementById("dashboardView");
const usersList = document.getElementById("usersList");
const welcome = document.getElementById("welcome");

/* ================= AUTH ================= */

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
    msg.innerText = data.message || "Signup done";
  } catch {
    msg.innerText = "Server error";
  }
}

async function loginUser() {
  msg.innerText = "Logging in...";
  try {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.success) {
      msg.innerText = data.message || "Login failed";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    msg.innerText = "";
    loadDashboard();
  } catch {
    msg.innerText = "Server error";
  }
}

/* ================= DASHBOARD ================= */

function loadDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  authView.style.display = "none";
  dashboardView.style.display = "block";

  welcome.innerText = `Welcome, ${user.username} 👋`;
  fetchUsers();
}

async function fetchUsers() {
  usersList.innerHTML = "Loading users...";

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(API + "/users", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();
    if (!data.success) {
      usersList.innerText = "Failed to load users";
      return;
    }

    usersList.innerHTML = "";

    data.users.forEach(u => {
      usersList.innerHTML += `
        <div class="userRow">
          <img src="${u.avatar}" />
          <span>${u.username}</span>
          <button disabled>Chat locked</button>
        </div>
      `;
    });

  } catch {
    usersList.innerText = "Server error";
  }
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.clear();
  location.reload();
}

/* ================= AUTO LOGIN ================= */

window.onload = () => {
  if (localStorage.getItem("token")) {
    loadDashboard();
  }
};
