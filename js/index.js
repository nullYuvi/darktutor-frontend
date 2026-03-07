const API = "https://darktutor-backend.onrender.com";

/* USER DATA */

const token = localStorage.getItem("token");
const me = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !me) {
  location.href = "login.html";
}

/* DOM */

const onlineDiv = document.getElementById("onlineUsers");
const allDiv = document.getElementById("allUsers");
const search = document.getElementById("search");

let users = [];

/* LOAD USERS */

async function loadUsers() {

  try {

    const res = await fetch(API + "/api/chat/users", {
      headers: {
        Authorization: token
      }
    });

    users = await res.json();

    renderUsers(users);

  } catch (err) {

    console.log("Users load error:", err);

  }

}

loadUsers();

/* RENDER USERS */

function renderUsers(list) {

  onlineDiv.innerHTML = "";
  allDiv.innerHTML = "";

  list.forEach(u => {

    if (u._id === me._id) return;

    const card = document.createElement("div");

    card.className = "user";

    card.innerHTML = `
      <img class="avatar"
      src="${u.avatar || "https://i.imgur.com/1X6RZ4C.png"}">

      <div class="name">${u.username}</div>
    `;

    card.onclick = () => openChat(u);

    if (u.online) {
      onlineDiv.appendChild(card);
    }

    allDiv.appendChild(card);

  });

}

/* OPEN CHAT */

async function openChat(user) {

  try {

    const res = await fetch(API + "/api/chat/private", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        userId: user._id
      })
    });

    const chat = await res.json();

    localStorage.setItem("chatUser", JSON.stringify(user));
    localStorage.setItem("chatId", chat._id);

    location.href = "chat.html";

  } catch (err) {

    console.log("Open chat error:", err);

  }

}

/* SEARCH */

search.addEventListener("input", () => {

  const q = search.value.toLowerCase();

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(q)
  );

  renderUsers(filtered);

});

/* LOGOUT */

function logout() {

  localStorage.clear();

  location.href = "login.html";

}