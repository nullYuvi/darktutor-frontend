const API = "https://darktutor-backend.onrender.com";
const token = localStorage.token;
const me = JSON.parse(localStorage.user || "null");

if (!token || !me) location = "login.html";

function logout() {
  localStorage.clear();
  location = "login.html";
}

let usersList = [];

async function loadUsers() {
  const res = await fetch(API + "/api/chat/users", {
    headers: { Authorization: token }
  });
  usersList = await res.json();
  render(usersList);
}

function render(list) {
  onlineUsers.innerHTML = "";
  allUsers.innerHTML = "";

  list.forEach(u => {
    const div = document.createElement("div");
    div.className = "user";
    div.innerText = u.username;
    div.onclick = () => {
      localStorage.chatUser = JSON.stringify(u);
      location = "chat.html";
    };

    if (u.online) onlineUsers.appendChild(div.cloneNode(true));
    allUsers.appendChild(div);
  });
}

search.oninput = () => {
  const q = search.value.toLowerCase();
  render(usersList.filter(u =>
    u.username.toLowerCase().includes(q)
  ));
};

loadUsers();