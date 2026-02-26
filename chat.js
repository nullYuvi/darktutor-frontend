const API="https://darktutor.onrender.com";
const to=new URLSearchParams(location.search).get("u");

function load(){
 fetch(API+"/messages/"+to,{
  headers:{Authorization:"Bearer "+localStorage.token}
 }).then(r=>r.json()).then(d=>{
  msgs.innerHTML="";
  d.forEach(m=>{
    msgs.innerHTML+=`<p>${m.from}: ${m.text}</p>`;
  });
 });
}
setInterval(load,1500);

function send(){
 fetch(API+"/message",{method:"POST",
 headers:{
  'Content-Type':'application/json',
  Authorization:"Bearer "+localStorage.token
 },
 body:JSON.stringify({to,text:text.value})
 });
 text.value="";
}
