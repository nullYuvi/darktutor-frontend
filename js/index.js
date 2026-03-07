const API="https://darktutor-backend.onrender.com"

/* USER */

const me=JSON.parse(localStorage.user||"null")

if(!me) location.href="login.html"

/* SOCKET */

const socket=io(API)

/* DOM */

const chatList=document.getElementById("chatList")
const search=document.getElementById("search")

let chats=[]

/* USER ONLINE */

socket.emit("userOnline",me._id)

/* LOAD CHATS */

async function loadChats(){

try{

const res=await fetch(API+"/api/chat/list",{
headers:{
Authorization:localStorage.token
}
})

chats=await res.json()

renderChats(chats)

}catch(err){

console.log("chat load error",err)

}

}

loadChats()

/* RENDER CHATS */

function renderChats(list){

chatList.innerHTML=""

list.forEach(c=>{

const div=document.createElement("div")

div.className="chat-item"

div.innerHTML=`

<div style="position:relative">

<img class="avatar"
src="${c.avatar||"https://i.imgur.com/1X6RZ4C.png"}">

${c.online?'<div class="online-dot"></div>':''}

</div>

<div class="chat-info">

<div class="username">${c.username}</div>

<div class="last-msg">${c.lastMessage||""}</div>

</div>

<div class="right">

<div class="time">${c.time||""}</div>

${c.unread?`<div class="unread">${c.unread}</div>`:""}

</div>

`

div.onclick=()=>{

localStorage.chatUser=JSON.stringify(c)

location.href="chat.html"

}

chatList.appendChild(div)

})

}

/* SEARCH */

search.addEventListener("input",()=>{

const q=search.value.toLowerCase()

const filtered=chats.filter(c=>
c.username.toLowerCase().includes(q)
)

renderChats(filtered)

})

/* NEW CHAT */

function newChat(){

location.href="users.html"

}

/* REALTIME UPDATE */

socket.on("newMessage",(data)=>{

loadChats()

})