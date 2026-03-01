const API = "https://darktutor-backend.onrender.com";
const token = localStorage.token;
const me = JSON.parse(localStorage.user || "null");

if (!token || !me) location = "login.html";

const socket = io(API);
socket.emit("online", me._id);

const onlineDiv = document.getElementById("onlineUsers");
const allDiv = document.getElementById("allUsers");

let usersList = [];

// LOGOUT
function logout() {
  localStorage.clear();
  location = "login.html";
}

// LOAD USERS
async function loadUsers() {
  const res = await fetch(API + "/api/chat/users", {
    headers: { Authorization: token }
  });
  usersList = await res.json();
  renderUsers(usersList);
}

// RENDER
function renderUsers(list) {
  onlineDiv.innerHTML = "";
  allDiv.innerHTML = "";

  list.forEach(u => {
    const div = document.createElement("div");
    div.className = "user";
    div.innerText = u.username;
    div.onclick = () => openChat(u);

    if (u.online) {
      onlineDiv.appendChild(div.cloneNode(true));
    }
    allDiv.appendChild(div);
  });
}

// SEARCH
search.oninput = () => {
  const q = search.value.toLowerCase();
  renderUsers(
    usersList.filter(u =>
      u.username.toLowerCase().includes(q)
    )
  );
};

// CHAT (redirect simple)
async function openChat(u) {
  const r = await fetch(API + "/api/chat/private", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ userId: u._id })
  });
  const chat = await r.json();
  alert("Chat started with " + u.username + " (UI next)");
}

loadUsers();