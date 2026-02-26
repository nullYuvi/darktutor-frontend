const API="https://darktutor.onrender.com";

function signup(){
 fetch(API+"/signup",{method:"POST",
 headers:{'Content-Type':'application/json'},
 body:JSON.stringify({username:username.value,password:password.value})
 }).then(r=>r.json()).then(d=>msg.innerText=d.message);
}

function login(){
 fetch(API+"/login",{method:"POST",
 headers:{'Content-Type':'application/json'},
 body:JSON.stringify({username:username.value,password:password.value})
 }).then(r=>r.json()).then(d=>{
  if(!d.success)return msg.innerText="Error";
  localStorage.token=d.token;
  localStorage.user=JSON.stringify(d.user);
  load();
 });
}

function load(){
 auth.classList.add("hidden");
 dash.classList.remove("hidden");
 me.innerText="Welcome "+JSON.parse(localStorage.user).username;
 fetchUsers();
}

function fetchUsers(){
 fetch(API+"/users",{headers:{Authorization:"Bearer "+localStorage.token}})
 .then(r=>r.json()).then(d=>{
  users.innerHTML="";
  d.users.forEach(u=>{
    users.innerHTML+=`
    <div class="row">
      <img src="${u.avatar}">
      ${u.username}
      <button onclick="sendReq('${u._id}')">Add</button>
      <button onclick="openChat('${u.username}')">Chat</button>
    </div>`;
  });
 });
}

function sendReq(id){
 fetch(API+"/friend-request/"+id,{
  method:"POST",
  headers:{Authorization:"Bearer "+localStorage.token}
 });
}

function openChat(u){
 location.href="chat.html?user="+encodeURIComponent(u);
}

function logout(){
 localStorage.clear();
 location.reload();
}

if(localStorage.token)load();
