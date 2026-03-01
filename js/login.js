const API="https://darktutor-backend.onrender.com";

async function login(){
  const r=await fetch(API+"/api/auth/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username:u.value,password:p.value})
  });
  const d=await r.json();
  if(!r.ok) return m.innerText=d.msg;
  localStorage.token=d.token;
  localStorage.user=JSON.stringify(d.user);
  location="index.html";
}

async function reg(){
  await fetch(API+"/api/auth/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      username:u.value,
      password:p.value,
      avatar:"https://i.imgur.com/1X6RZ4C.png"
    })
  });
  m.innerText="Registered. Now login.";
}