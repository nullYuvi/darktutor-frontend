const API="https://darktutor-backend.onrender.com";

const me=JSON.parse(localStorage.user||"null");
const other=JSON.parse(localStorage.chatUser||"null");

if(!me||!other) location.href="index.html";

const socket=io(API);

const msgs=document.getElementById("msgs");
const msgInput=document.getElementById("msg");
const chatName=document.getElementById("chatName");
const chatAvatar=document.getElementById("chatAvatar");
const status=document.getElementById("status");

chatName.innerText=other.username;

chatAvatar.src=
other.avatar||"https://i.imgur.com/1X6RZ4C.png";

let chatId=null;
let typingTimeout=null;

socket.emit("userOnline",me._id);

async function init(){

const r=await fetch(API+"/api/chat/private",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:localStorage.token
},
body:JSON.stringify({userId:other._id})
});

const chat=await r.json();

chatId=chat._id;

const m=await fetch(API+"/api/chat/messages/"+chatId,{
headers:{Authorization:localStorage.token}
});

const list=await m.json();

list.forEach(renderMsg);

}

init();

/* RENDER MESSAGE */

function renderMsg(m){

const d=document.createElement("div");

d.className="msg "+(m.sender===me._id?"self":"other");

const date=new Date(m.createdAt||Date.now());

const time=date.getHours()+":"+
String(date.getMinutes()).padStart(2,"0");

let ticks="";

if(m.sender===me._id) ticks="✔✔";

d.innerHTML=`
<div>${m.text}</div>
<div class="meta">${time} ${ticks}</div>
`;

msgs.appendChild(d);

msgs.scrollTop=msgs.scrollHeight;

}

/* SEND */

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

/* TYPING */

msgInput.addEventListener("input",()=>{

socket.emit("typing",{
chatId,
from:me._id
});

});

/* RECEIVE */

socket.on("newMessage",m=>{

renderMsg(m);

});

/* TYPING HEADER */

socket.on("typing",data=>{

if(data.from===me._id) return;

status.innerText="typing...";

clearTimeout(typingTimeout);

typingTimeout=setTimeout(()=>{

status.innerText="online";

},1200);

});

/* USER STATUS */

socket.on("userStatus",data=>{

if(data.userId!==other._id) return;

status.innerText=data.online?"online":"offline";

});

/* KEYBOARD FIX */

msgInput.addEventListener("focus",()=>{

setTimeout(()=>{
msgs.scrollTop=msgs.scrollHeight
},300)

})

function goBack(){

history.back();

}