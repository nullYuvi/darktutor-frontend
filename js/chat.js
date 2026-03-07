const API = "https://darktutor-backend.onrender.com";

/* USER DATA */

const me = JSON.parse(localStorage.user || "null");
const other = JSON.parse(localStorage.chatUser || "null");

if (!me || !other) location.href = "index.html";

/* SOCKET */

const socket = io(API);

/* DOM */

const msgs = document.getElementById("msgs");
const msgInput = document.getElementById("msg");
const chatName = document.getElementById("chatName");
const chatAvatar = document.getElementById("chatAvatar");
const status = document.getElementById("status");

/* HEADER DATA */

chatName.innerText = other.username;

chatAvatar.src =
other.avatar || "https://i.imgur.com/1X6RZ4C.png";

/* VARIABLES */

let chatId = null;
let typingTimeout = null;

/* USER ONLINE */

socket.emit("userOnline", me._id);

/* INIT */

async function init(){

try{

const r = await fetch(API + "/api/chat/private", {
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:localStorage.token
},
body:JSON.stringify({userId:other._id})
});

const chat = await r.json();

chatId = chat._id;

/* LOAD OLD MESSAGES */

const m = await fetch(API + "/api/chat/messages/" + chatId,{
headers:{Authorization:localStorage.token}
});

const list = await m.json();

list.forEach(renderMsg);

/* AUTO SCROLL */

msgs.scrollTop = msgs.scrollHeight;

}catch(err){

console.error("Chat init error:",err);

}

}

init();

/* RENDER MESSAGE */

function renderMsg(m){

const d = document.createElement("div");

d.className = "msg " + (m.sender === me._id ? "self" : "other");

/* TIME */

const date = new Date(m.createdAt || Date.now());

const time =
date.getHours() +
":" +
String(date.getMinutes()).padStart(2,"0");

/* TICKS */

let ticks = "";

if(m.sender === me._id){
ticks = "✔✔";
}

/* MESSAGE HTML */

d.innerHTML = `
<div>${m.text}</div>
<div class="meta">${time} ${ticks}</div>
`;

msgs.appendChild(d);

/* AUTO SCROLL */

msgs.scrollTop = msgs.scrollHeight;

}

/* SEND MESSAGE */

function send(e){

if(e) e.preventDefault();

const text = msgInput.value.trim();

if(!text) return;
if(!chatId) return;

socket.emit("sendMessage",{
chatId:chatId,
sender:me._id,
text:text
});

msgInput.value="";

}

/* TYPING */

msgInput.addEventListener("input",()=>{

if(!chatId) return;

socket.emit("typing",{
chatId:chatId,
from:me._id
});

});

/* RECEIVE MESSAGE */

socket.on("newMessage",m=>{

renderMsg(m);

});

/* TYPING HEADER */

socket.on("typing",data=>{

if(!data) return;
if(data.from === me._id) return;

status.innerText = "typing...";

clearTimeout(typingTimeout);

typingTimeout = setTimeout(()=>{

status.innerText = "online";

},1200);

});

/* USER STATUS */

socket.on("userStatus",data=>{

if(!data) return;
if(data.userId !== other._id) return;

status.innerText = data.online ? "online" : "offline";

});

/* KEYBOARD FIX */

msgInput.addEventListener("focus",()=>{

setTimeout(()=>{

msgs.scrollTo({
top:msgs.scrollHeight,
behavior:"smooth"
});

},300);

});

/* NEW MESSAGE KEYBOARD FIX */

msgInput.addEventListener("keydown",(e)=>{

if(e.key === "Enter"){

setTimeout(()=>{
msgs.scrollTop = msgs.scrollHeight;
},100);

}

});

/* BACK BUTTON */

function goBack(){
history.back();
}