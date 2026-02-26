const API="https://darktutor.onrender.com";
const other=new URLSearchParams(location.search).get("user");
with.innerText=other;

const me=JSON.parse(localStorage.user);
const socket=io(API,{auth:{token:localStorage.token}});

socket.on("receiveMessage",m=>{
 add(m.from===me.username?"me":"other",m.text);
});

socket.on("chatLocked",()=>{
 warn.classList.remove("hidden");
 text.disabled=true;
});

function send(){
 if(!text.value.trim())return;
 socket.emit("sendMessage",{to:other,text:text.value});
 add("me",text.value);
 text.value="";
}

function add(type,txt){
 const d=document.createElement("div");
 d.className="msg "+type;
 d.innerText=txt;
 messages.appendChild(d);
 messages.scrollTop=messages.scrollHeight;
}
