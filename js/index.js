const API="https://darktutor-backend.onrender.com";
const token=localStorage.token;
const me=JSON.parse(localStorage.user||"null");
if(!token||!me) location="login.html";

const s=io(API);
let chat=null;

s.emit("online",me._id);

async function load(){
  const r=await fetch(API+"/api/chat/users",{headers:{Authorization:token}});
  const u=await r.json();
  users.innerHTML="";
  u.forEach(x=>{
    const d=document.createElement("div");
    d.innerText=x.username+(x.online?" 🟢":"");
    d.onclick=()=>start(x._id,x.username);
    users.appendChild(d);
  });
}
load();

async function start(id,n){
  const r=await fetch(API+"/api/chat/private",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:token
    },
    body:JSON.stringify({userId:id})
  });
  const c=await r.json();
  chat=c._id;
  msgs.innerHTML="<b>"+n+"</b>";
  loadMsgs();
}

async function loadMsgs(){
  const r=await fetch(API+"/api/chat/messages/"+chat,
    {headers:{Authorization:token}});
  const m=await r.json();
  m.forEach(show);
}

function show(m){
  const d=document.createElement("div");
  d.className=m.sender===me._id?"me":"other";
  d.innerText=m.text;
  msgs.appendChild(d);
}

function send(){
  if(!chat) return;
  s.emit("sendMessage",{chatId:chat,sender:me._id,text:msg.value});
  msg.value="";
}

s.on("newMessage",m=>{
  if(m.chatId===chat) show(m);
});