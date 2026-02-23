alert("JS LOADED OK");
const API = "https://darktutor.onrender.com";

const msg = document.getElementById("msg");

// ---------- SIGNUP ----------
async function signupUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  msg.innerText = data.message || "Signup error";
}

// ---------- LOGIN ----------
async function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    // 🔐 SAVE TOKEN
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    msg.innerText = "Login successful ✅";
    showProfile();
  } else {
    msg.innerText = data.message || "Login failed ❌";
  }
}

// ---------- AUTO LOGIN ----------
function showProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  document.querySelector(".card").innerHTML = `
    <h2>Welcome, ${user.username} 👋</h2>
    <p>Role: ${user.role}</p>
    <p>ChatScore: ${user.chatScore}</p>
    <button onclick="logout()">Logout</button>
  `;
}

// ---------- LOGOUT ----------
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  location.reload();
}

// ---------- ON PAGE LOAD ----------
window.onload = () => {
  const token = localStorage.getItem("token");
  if (token) {
    showProfile();
  }
};
