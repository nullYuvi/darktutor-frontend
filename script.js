const API = "https://darktutor.onrender.com";
let socket = null;
let currentChatUser = null;

const msg = document.getElementById("msg");
const authView = document.getElementById("authView");
const dashboardView = document.getElementById("dashboardView");
const usersList = document.getElementById("usersList");
const welcome = document.getElementById("welcome");

const chatBox = document.getElementById("chatBox");
const chatWith = document.getElementById("chatWith");
const messagesDiv = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");
const friendBtn = document.getElementById("friendBtn");

/* ============ AUTH ============ */

async function signupUser() {
  msg.innerText = "Signing up...";
  const username = usernameInput();
  const password = passwordInput();

  const res = await fetch(API + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  msg.innerText = data.message;
}

async function loginUser() {
  msg.innerText = "Logging in...";
  const username = usernameInput();
  const password = passwordInput();

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

  msg.innerText = "";
  loadDashboard();
}

/* ============ DASHBOARD ============ */

function loadDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  authView.style.display = "none";
  dashboardView.style.display = "block";
  welcome.innerText = `Welcome, ${user.username} 👋`;

  connectSocket();
  fetchUsers();
}

async function fetchUsers() {
  usersList.innerHTML = "Loading users...";
  const token = localStorage.getItem("token");

  const res = await fetch(API + "/users", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();
  usersList.innerHTML = "";

  data.users.forEach(u => {
    usersList.innerHTML += `
      <div class="userRow" onclick="openChat('${u.username}')">
        <img src="${u.avatar}" />
        <span>${u.username}</span>
      </div>
    `;
  });
}

/* ============ CHAT ============ */

function connectSocket() {
  socket = io(API, {
    auth: { token: localStorage.getItem("token") }
  });

  socket.on("receiveMessage", msg => {
    if (msg.from === currentChatUser) {
      addMessage(msg.from, msg.text);
    }
  });

  socket.on("chatLocked", () => {
    friendBtn.style.display = "block";
    chatInput.disabled = true;
    alert("Chat locked. Add friend to continue.");
  });
}

function openChat(username) {
  currentChatUser = username;
  chatBox.style.display = "block";
  friendBtn.style.display = "none";
  chatInput.disabled = false;
  messagesDiv.innerHTML = "";
  chatWith.innerText = "Chat with " + username;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || !currentChatUser) return;

  socket.emit("sendMessage", {
    to: currentChatUser,
    text
  });

  addMessage("You", text);
  chatInput.value = "";
}

function addMessage(from, text) {
  const div = document.createElement("div");
  div.innerText = `${from}: ${text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* ============ FRIEND REQUEST FROM CHAT ============ */

async function sendFriendReqFromChat() {
  const token = localStorage.getItem("token");

  const res = await fetch(API + "/users", {
    headers: { Authorization: "Bearer " + token }
  });
  const data = await res.json();

  const user = data.users.find(u => u.username === currentChatUser);
  if (!user) return;

  await fetch(API + "/friend-request/" + user._id, {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  alert("Friend request sent");
}

/* ============ HELPERS ============ */

function usernameInput() {
  return document.getElementById("username").value.trim();
}
function passwordInput() {
  return document.getElementById("password").value.trim();
}

/* ============ AUTO LOGIN ============ */

window.onload = () => {
  if (localStorage.getItem("token")) {
    loadDashboard();
  }
};

function logout() {
  localStorage.clear();
  location.reload();
  }
