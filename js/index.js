const API="https://darktutor-backend.onrender.com";

const me=JSON.parse(localStorage.user||"null");

if(!me) location.href="login.html";

document.getElementById("myUsername").innerText=me.username;

const onlineUsers=document.getElementById("onlineUsers");
const allUsers=document.getElementById("allUsers");
const recentChats=document.getElementById("recentChats");
const search=document.getElementById("search");

/* LOAD DATA */

loadUsers();
loadRecent();

/* USERS */

async function loadUsers(){

const r=await fetch(API+"/api/chat/users",{
headers:{Authorization:localStorage.token}
});

const users=await r.json();

renderUsers(users);

}

/* RECENT CHATS */

async function loadRecent(){

const r=await fetch(API+"/api/chat/recent",{
headers:{Authorization:localStorage.token}
});

const chats=await r.json();

recentChats.innerHTML="";

chats.forEach(c=>{

const d=document.createElement("div");

d.className="chat-item";

const time=new Date(c.time)
.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

d.innerHTML=`

<img class="avatar" src="${c.user.avatar}">

<div class="chat-info">

<div class="username">${c.user.username}</div>

<div class="last-msg">
${c.lastMessage || "Start conversation"}
</div>

</div>

<div class="time">${time}</div>

`;

d.onclick=()=>openChat(c.user);

recentChats.appendChild(d);

});

}

/* RENDER USERS */

function renderUsers(users){

onlineUsers.innerHTML="";
allUsers.innerHTML="";

users.forEach(u=>{

/* ONLINE */

if(u.online){

const d=document.createElement("div");

d.className="online-user";

d.innerHTML=`
<img src="${u.avatar}">
<span>${u.username}</span>
`;

d.onclick=()=>openChat(u);

onlineUsers.appendChild(d);

}

/* ALL USERS */

const d=document.createElement("div");

d.className="chat-item";

d.innerHTML=`

<img class="avatar" src="${u.avatar}">

<div class="chat-info">

<div class="username">${u.username}</div>
<div class="last-msg">Start conversation</div>

</div>

`;

d.onclick=()=>openChat(u);

allUsers.appendChild(d);

});

}

/* SEARCH */

search.addEventListener("input",()=>{

const q=search.value.toLowerCase();

document.querySelectorAll(".chat-item").forEach(i=>{

i.style.display=i.innerText.toLowerCase().includes(q)
?"flex":"none";

});

});

/* OPEN CHAT */

function openChat(user){

localStorage.setItem("chatUser",JSON.stringify(user));

location.href="chat.html";

}

/* LOGOUT */

function logout(){

localStorage.clear();

location.href="login.html";

}