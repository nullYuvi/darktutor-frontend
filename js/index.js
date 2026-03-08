const API = "https://darktutor-backend.onrender.com";

/* USER DATA */

const me = JSON.parse(localStorage.getItem("user") || "null");
const token = localStorage.getItem("token");

if (!me || !token) location.href = "login.html";

document.getElementById("myUsername").innerText = me.username;

/* SOCKET */

const socket = io(API);

/* DOM */

const onlineUsers = document.getElementById("onlineUsers");
const allUsers = document.getElementById("allUsers");
const recentChats = document.getElementById("recentChats");
const search = document.getElementById("search");

/* USER ONLINE */

socket.emit("userOnline", me._id);

/* LOAD DATA */

loadUsers();
loadRecent();

/* ===== USERS ===== */

async function loadUsers(){

try{

const r = await fetch(API + "/api/chat/users",{
headers:{
"Content-Type":"application/json",
"Authorization": token
}
});

if(!r.ok){
console.error("Users API error");
return;
}

const users = await r.json();

renderUsers(users);

}catch(err){

console.error("Users load error:",err);

}

}

/* ===== RECENT CHATS ===== */

async function loadRecent(){

try{

const r = await fetch(API + "/api/chat/recent",{
headers:{
"Content-Type":"application/json",
"Authorization": token
}
});

if(!r.ok){
console.error("Recent API error");
return;
}

const chats = await r.json();

recentChats.innerHTML = "";

chats.forEach(c=>{

const d = document.createElement("div");
d.className = "chat-item";

const time = new Date(c.time)
.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

d.innerHTML = `
<img class="avatar" src="${c.user.avatar}">
<div class="chat-info">
<div class="username">${c.user.username}</div>
<div class="last-msg">
${c.lastMessage || "Start conversation"}
</div>
</div>
<div class="time">${time}</div>
`;

d.onclick = ()=>openChat(c.user);

recentChats.appendChild(d);

});

}catch(err){

console.error("Recent chat error:",err);

}

}

/* ===== RENDER USERS ===== */

function renderUsers(users){

onlineUsers.innerHTML="";
allUsers.innerHTML="";

users.forEach(u=>{

/* ONLINE USERS */

if(u.online){

const d = document.createElement("div");

d.className = "online-user";

d.innerHTML = `
<img src="${u.avatar}">
<span>${u.username}</span>
`;

d.onclick = ()=>openChat(u);

onlineUsers.appendChild(d);

}

/* ALL USERS */

const d = document.createElement("div");

d.className = "chat-item";

d.innerHTML = `
<img class="avatar" src="${u.avatar}">
<div class="chat-info">
<div class="username">${u.username}</div>
<div class="last-msg">Start conversation</div>
</div>
`;

d.onclick = ()=>openChat(u);

allUsers.appendChild(d);

});

}

/* ===== SEARCH ===== */

search.addEventListener("input",()=>{

const q = search.value.toLowerCase();

document.querySelectorAll(".chat-item").forEach(i=>{

i.style.display =
i.innerText.toLowerCase().includes(q)
? "flex"
: "none";

});

});

/* ===== OPEN CHAT ===== */

function openChat(user){

localStorage.setItem("chatUser",JSON.stringify(user));

location.href = "chat.html";

}

/* ===== LOGOUT ===== */

function logout(){

localStorage.clear();

location.href = "login.html";

}

/* ===== REALTIME RECENT UPDATE ===== */

socket.on("recentUpdate",()=>{

loadRecent();

});

/* ===== ONLINE STATUS UPDATE ===== */

socket.on("userStatus",()=>{

loadUsers();

});