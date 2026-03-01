const API = "https://darktutor-backend.onrender.com";
let selectedAvatar = document.querySelector(".avatar").src;

// avatar select
document.querySelectorAll(".avatar").forEach(img => {
  img.onclick = () => {
    document.querySelectorAll(".avatar").forEach(a => a.classList.remove("active"));
    img.classList.add("active");
    selectedAvatar = img.src;
  };
});

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) return show(data.msg);

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  location.href = "index.html";
}

async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      avatar: selectedAvatar
    })
  });

  const data = await res.json();
  if (!res.ok) return show("Registration failed");

  show("Registered! Now login.");
}

function show(msg) {
  document.getElementById("msg").innerText = msg;
}