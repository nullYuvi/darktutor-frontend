const API = "https://darktutor-backend.onrender.com";

/* ===== USER DATA ===== */
const me = JSON.parse(localStorage.user || "null");
const other = JSON.parse(localStorage.chatUser || "null");

if (!me || !other) {
  location.href = "index.html";
}

/* ===== SOCKET ===== */
const socket = io(API);

/* ===== DOM ===== */
const msgs = document.getElementById("msgs");
const msgInput = document.getElementById("msg");
const chatName = document.querySelector(".chat-name");
const chatAvatar = document.querySelector(".chat-avatar");
const typingDiv = document.getElementById("typing");

/* ===== HEADER DATA ===== */
chatName.innerText = other.username;
chatAvatar.src = other.avatar || "https://i.imgur.com/1X6RZ4C.png";

let chatId = null;
let typingTimeout = null;

/* ================= INIT ================= */
async function init() {
  try {
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

    // MARK RECEIVED MESSAGES AS SEEN
    setTimeout(() => {
      list.forEach(x => {
        if (x.sender !== me._id) {
          socket.emit("seenMessage", x._id);
        }
      });
    }, 300);

  } catch (err) {
    console.error("Init error:", err);
  }
}
init();

/* ================= RENDER MESSAGE ================= */
function renderMsg(m) {
  const d = document.createElement("div");
  d.className = "msg " + (m.sender === me._id ? "me" : "other");
  d.dataset.id = m._id;

  let ticks = "";
  if (m.sender === me._id) {
    ticks = `<span class="ticks ${m.status || "sent"}">✔✔</span>`;
  }

  d.innerHTML = `
    <span>${m.text}</span>
    ${ticks}
  `;

  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ================= SEND MESSAGE ================= */
function send(e) {
  if (e) e.preventDefault();

  if (!msgInput.value.trim() || !chatId) return;

  socket.emit("sendMessage", {
    chatId,
    sender: me._id,
    text: msgInput.value
  });

  msgInput.value = "";
}

/* ================= TYPING EMIT ================= */
msgInput.addEventListener("input", () => {
  if (!chatId) return;

  socket.emit("typing", {
    chatId,
    from: me._id
  });
});

/* ================= SOCKET EVENTS ================= */

// RECEIVE MESSAGE
socket.on("newMessage", m => {
  renderMsg(m);

  if (m.sender !== me._id) {
    setTimeout(() => {
      socket.emit("seenMessage", m._id);
    }, 300);
  }
});

// UPDATE TICKS
socket.on("messageStatus", data => {
  const el = document.querySelector(
    `[data-id="${data.id}"] .ticks`
  );
  if (!el) return;

  el.className = "ticks " + data.status;
});

// SHOW TYPING INDICATOR
socket.on("typing", data => {
  if (data.from === me._id) return;

  typingDiv.innerText = `${other.username} is typing…`;
  typingDiv.classList.add("show");

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingDiv.classList.remove("show");
  }, 1000);
});

/* ================= BACK ================= */
function goBack() {
  history.back();
}