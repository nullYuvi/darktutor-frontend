const API = "https://darktutor-backend.onrender.com";
const token = localStorage.token;
const me = JSON.parse(localStorage.user || "null");
const other = JSON.parse(localStorage.chatUser || "null");

if (!token || !me || !other) location = "index.html";

const socket = io(API);
let chatId = null;

chatName.innerText = other.username;
chatAvatar.src = other.avatar;

// INIT CHAT
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

  (await m.json()).forEach(showMsg);
}
init();

// RENDER MESSAGE
function showMsg(m) {
  const d = document.createElement("div");
  d.className = "msg " + (m.sender === me._id ? "me" : "other");
  d.dataset.id = m._id;

  const ticks = m.sender === me._id
    ? `<span class="ticks ${m.status}">✔✔</span>`
    : "";

  d.innerHTML = `
    <span>${m.text}</span>
    ${ticks}
  `;

  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;

  // mark seen if message from other
  if (m.sender !== me._id && m.status !== "seen") {
    socket.emit("seenMessage", m._id);
  }
}

// SEND
function send() {
  if (!msg.value.trim()) return;

  socket.emit("sendMessage", {
    chatId,
    sender: me._id,
    text: msg.value
  });

  msg.value = "";
}

// SOCKET EVENTS
socket.on("newMessage", showMsg);

socket.on("messageStatus", data => {
  const el = document.querySelector(`[data-id="${data.id}"] .ticks`);
  if (!el) return;

  el.className = "ticks " + data.status;
});