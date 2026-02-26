const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");

const params = new URLSearchParams(window.location.search);
const username = params.get("user");

document.getElementById("chatName").innerText = username;
document.getElementById("chatAvatar").src =
  "https://i.pravatar.cc/150?u=" + username;

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "me");
  input.value = "";

  // fake reply (for UI testing)
  setTimeout(() => {
    addMessage("Reply from " + username, "other");
  }, 700);
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerText = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function goBack() {
  window.history.back();
}
