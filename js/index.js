const API = "https://darktutor-backend.onrender.com";
const token = localStorage.token;
const me = JSON.parse(localStorage.user || "null");

if (!token || !me) location = "login.html";

const socket = io(API);
let currentChat = null;

socket.emit("online", me._id);

async function loadUsers() {
  const res = await fetch(API + "/api/chat/users", {
    headers: { Authorization: token }
  });
  const users = await res.json();

  renderUsers(users);

  // search
  search.oninput = () => {
    const q = search.value.toLowerCase();
    renderUsers(users.filter(u =>
      u.username.toLowerCase().includes(q)
    ));
  };
}

function renderUsers(list) {
  users.innerHTML = "";
  list.forEach(u => {
    const d = document.createElement("div");
    d.className = "user";
    d.innerHTML = `
      <img src="${u.avatar}">
      <span>${u.username}</span>
      <small>${u.online ? "🟢" : "⚪"}</small>
    `;

    d.onclick = () => openChat(u);
    d.ondblclick = () => showProfile(u);

    users.appendChild(d);
  });
}

async function openChat(u) {
  const res = await fetch(API + "/api/chat/private", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ userId: u._id })
  });

  const chat = await res.json();
  currentChat = chat._id;

  chatHeader.innerText = u.username;
  msg.disabled = false;
  sendBtn.disabled = false;
  msgs.innerHTML = "";

  const m = await fetch(API + "/api/chat/messages/" + currentChat,
    { headers: { Authorization: token } });
  (await m.json()).forEach(showMsg);
}

function showMsg(m) {
  const d = document.createElement("div");
  d.className = m.sender === me._id ? "me" : "other";
  d.innerText = m.text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function send() {
  if (!currentChat || !msg.value) return;
  socket.emit("sendMessage", {
    chatId: currentChat,
    sender: me._id,
    text: msg.value
  });
  msg.value = "";
}

socket.on("newMessage", m => {
  if (m.chatId === currentChat) showMsg(m);
});

// PROFILE
function showProfile(u) {
  pAvatar.src = u.avatar;
  pName.innerText = u.username;
  profile.style.display = "flex";
}
function closeProfile() {
  profile.style.display = "none";
}

loadUsers();