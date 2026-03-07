const API = "https://darktutor-backend.onrender.com";

const me = JSON.parse(localStorage.user || "null");
const other = JSON.parse(localStorage.chatUser || "null");

if (!me || !other) {
location.href = "index.html";
}

const socket = io(API);

const msgs = document.getElementById("msgs");
const msgInput = document.getElementById("msg");
const chatName = document.getElementById("chatName");
const chatAvatar = document.getElementById("chatAvatar");
const typingDiv = document.getElementById("typing");
const status = document.getElementById("status");

chatName.innerText = other.username;
chatAvatar.src = other.avatar || "https://i.imgur.com/1X6RZ4C.png";

socket.emit("userOnline", me._id);

let chatId = null;

async function init(){

try{

const r = await fetch(API + "/api/chat/private",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:localStorage.token
},
body:JSON.stringify({userId:other._id})
});

const chat = await r.json();
chatId = chat._id;

const m = await fetch(API + "/api/chat/messages/" + chatId,{
headers:{Authorization:localStorage.token}
});

const list = await m.json();
list.forEach(renderMsg);

}catch(err){

console.error("Init error:",err);

}

}

init();

function renderMsg(m){

const d = document.createElement("div");
d.className = "msg " + (m.sender === me._id ? "self":"other");
d.dataset.id = m._id;

const date = new Date(m.createdAt || Date.now());
const time = date.getHours() + ":" + String(date.getMinutes()).padStart(2,"0");

let ticks = "";

if(m.sender === me._id){
ticks = "<span class="ticks ${m.status || "sent"}">✔✔</span>";
}

d.innerHTML = `

<div class="sender">${m.sender === me._id ? "You" : other.username}</div>
<div>${m.text}</div>
<div class="meta">${time} ${ticks}</div>
`;msgs.appendChild(d);
msgs.scrollTop = msgs.scrollHeight;

}

function send(e){

e.preventDefault();

if(!msgInput.value.trim()) return;

socket.emit("sendMessage",{
chatId,
sender:me._id,
text:msgInput.value
});

msgInput.value="";

}

socket.on("newMessage",m=>{
renderMsg(m);
});

socket.on("userStatus",data=>{

if(data.userId !== other._id) return;

status.innerText = data.online ? "● online" : "offline";

});

function goBack(){
history.back();
}