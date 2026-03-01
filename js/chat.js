const API = "https://darktutor-backend.onrender.com";
const token = localStorage.token;
const me = JSON.parse(localStorage.user || "null");
const other = JSON.parse(localStorage.chatUser || "null");

if (!token || !me || !other) location = "index.html";

const socket = io(API);
let chatId = null;

chatName.innerText = other.username;

socket.emit("online", me._id);

async function init() {
  const r = await fetch(API + "/api/chat/private", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ userId: other._id })
  });
  const chat = await r.json();
  chatId = chat._id;

  const m = await fetch(API + "/api/chat/messages/" + chatId, {
    headers: { Authorization: token }
  });
  (await m.json()).forEach(show);
}

function show(m) {
  const d = document.createElement("div");
  d.className = m.sender === me._id ? "me" : "other";
  d.innerText = m.text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function send() {
  if (!msg.value) return;
  socket.emit("sendMessage", {
    chatId,
    sender: me._id,
    text: msg.value
  });
  msg.value = "";
}

socket.on("newMessage", m => {
  if (m.chatId === chatId) show(m);
});

function back() {
  location = "index.html";
}

init();