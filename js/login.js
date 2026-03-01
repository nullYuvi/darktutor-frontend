const API = "https://darktutor-backend.onrender.com";

const u = document.getElementById("u");
const p = document.getElementById("p");
const m = document.getElementById("m");

// LOGIN
async function login() {
  m.innerText = "";

  if (!u.value || !p.value) {
    m.innerText = "Username and password required";
    return;
  }

  const res = await fetch(API + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: u.value.trim(),
      password: p.value
    })
  });

  const data = await res.json();

  // ❌ ERROR HANDLE
  if (!res.ok) {
    m.innerText = data.msg || "Login failed";
    return;
  }

  // ✅ SUCCESS
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  location.href = "index.html";
}

// REGISTER
async function reg() {
  m.innerText = "";

  if (!u.value || !p.value) {
    m.innerText = "Username and password required";
    return;
  }

  const res = await fetch(API + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: u.value.trim(),
      password: p.value,
      avatar: "https://i.imgur.com/1X6RZ4C.png"
    })
  });

  const data = await res.json();

  // ❌ ERROR HANDLE (IMPORTANT PART YOU ASKED)
  if (!res.ok) {
    m.innerText = data.msg || "Signup failed";
    return;
  }

  // ✅ SUCCESS
  m.innerText = "Registered successfully. Now login.";
}