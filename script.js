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
    msg.innerText = data.message;
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
      msg.innerText = data.message;
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

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
    const me = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(API + "/users", {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    if (!data.success) {
      usersList.innerText = "Failed to load users";
      return;
    }

    usersList.innerHTML = "";

    data.users.forEach(u => {
      let buttonHTML = "";

      if (u.friends.includes(me.id)) {
        buttonHTML = `<button disabled>Friends</button>`;
      }
      else if (u.pendingRequests.includes(me.id)) {
        buttonHTML = `<button onclick="acceptRequest('${u._id}')">Accept</button>`;
      }
      else if (u.sentRequests && u.sentRequests.includes(me.id)) {
        buttonHTML = `<button disabled>Requested</button>`;
      }
      else {
        buttonHTML = `<button onclick="sendRequest('${u._id}')">Add Friend</button>`;
      }

      usersList.innerHTML += `
        <div class="userRow">
          <img src="${u.avatar}" />
          <span>${u.username}</span>
          ${buttonHTML}
        </div>
      `;
    });

  } catch {
    usersList.innerText = "Server error";
  }
}

/* ================= FRIEND REQUESTS ================= */

async function sendRequest(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(API + "/friend-request/" + id, {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();
  alert(data.message);
  fetchUsers();
}

async function acceptRequest(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(API + "/friend-accept/" + id, {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();
  alert(data.message);
  fetchUsers();
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
