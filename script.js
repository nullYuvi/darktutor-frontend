const API = "https://darktutor.onrender.com";

// Signup
async function signup(username, password) {
  const res = await fetch(API + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

// Login
async function login(username, password) {
  const res = await fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

// Example test (temporary)
(async () => {
  const result = await login("testuser", "12345");
  console.log(result);
})();
