const API = "https://darktutor-backend.onrender.com";

const me = JSON.parse(localStorage.user || "null");
const other = JSON.parse(localStorage.chatUser || "null");

if (!me || !other) location.href = "index.html";

const socket = io(API);

const msgs = document.getElementById("msgs");
const msgInput = document.getElementById("msg");
const chatName = document.querySelector(".chat-name");
const chatAvatar = document.querySelector(".chat-avatar");

chatName.innerText = other.username;
chatAvatar.src = other.avatar;

let chatId = null;

/* ================= INIT ================= */
async function init() {
  const r = await fetch(API + "/api/chat/private", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.token
    },
    body: JSON.stringify({ userId: other._id })
  });

  const chat = await r.json();
  chatId = chat._id;

  const m = await fetch(API + "/api/chat/messages/" + chatId, {
    headers: { Authorization: localStorage.token }
  });

  const list = await m.json();
  list.forEach(renderMsg);

  // 🔵 MARK ALL RECEIVED MESSAGES AS SEEN
  setTimeout(() => {
    list.forEach(x => {
      if (x.sender !== me._id) {
        socket.emit("seenMessage", x._id);
      }
    });
  }, 500);
}
init();

/* ================= RENDER MESSAGE ================= */
function renderMsg(m) {
  const d = document.createElement("div");
  d.className = "msg " + (m.sender === me._id ? "me" : "other");
  d.dataset.id = m._id;

  let ticks = "";
  if (m.sender === me._id) {
    ticks = `<span class="ticks ${m.status}">✔✔</span>`;
  }

  d.innerHTML = `
    <span>${m.text}</span>
    ${ticks}
  `;

  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ================= SEND MESSAGE ================= */
function send() {
  if (!msgInput.value.trim()) return;

  socket.emit("sendMessage", {
    chatId,
    sender: me._id,
    text: msgInput.value
  });

  msgInput.value = "";
}

/* ================= SOCKET EVENTS ================= */

// NEW MESSAGE
socket.on("newMessage", m => {
  renderMsg(m);

  // 🔵 if message is from other user → mark seen
  if (m.sender !== me._id) {
    setTimeout(() => {
      socket.emit("seenMessage", m._id);
    }, 300);
  }
});

// STATUS UPDATE (✔✔ grey → ✔✔ blue)
socket.on("messageStatus", data => {
  const el = document.querySelector(
    `[data-id="${data.id}"] .ticks`
  );
  if (!el) return;

  el.className = "ticks " + data.status;
});

function goBack() {
  history.back();
}