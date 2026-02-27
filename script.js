// ===== script.js =====
const API_URL = 'https://darktutor.onrender.com'; // Backend URL
let currentUser = null;
let token = null;

// DOM elements
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const authForm = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const authSubmit = document.getElementById('auth-submit');
const toggleLink = document.getElementById('toggle-link');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const dashboardUsername = document.getElementById('dashboard-username');
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.getElementById('search-input');
const usersList = document.getElementById('users-list');
const requestsList = document.getElementById('requests-list');

let isLogin = true;

// Check if user is already logged in
token = localStorage.getItem('token');
if (token) {
  fetchUserData();
}

// Toggle between login and signup
toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? 'Login' : 'Sign Up';
  authSubmit.textContent = isLogin ? 'Login' : 'Sign Up';
  toggleLink.textContent = isLogin ? 'Sign up' : 'Login';
  authForm.reset();
});

// Handle form submit
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;
  const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
  const body = isLogin ? { email, password } : { username: email.split('@')[0], email, password }; // quick username

  try {
    const res = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');

    if (isLogin) {
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      showDashboard();
    } else {
      alert('Signup successful! Please login.');
      isLogin = true;
      formTitle.textContent = 'Login';
      authSubmit.textContent = 'Login';
      toggleLink.textContent = 'Sign up';
      authForm.reset();
    }
  } catch (err) {
    alert(err.message);
  }
});

// Fetch user data after login
async function fetchUserData() {
  try {
    const res = await fetch(API_URL + '/api/users/search?q=', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Session expired');
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      currentUser = JSON.parse(userFromStorage);
      showDashboard();
    } else {
      // fallback: decode token to get id, but we'll just redirect to login
      localStorage.removeItem('token');
      window.location.reload();
    }
  } catch (err) {
    localStorage.removeItem('token');
    window.location.reload();
  }
}

// Show dashboard
function showDashboard() {
  authContainer.style.display = 'none';
  dashboardContainer.style.display = 'block';
  dashboardUsername.textContent = currentUser.username;
  loadUsers();
  loadRequests();
}

// Load all users (except self)
async function loadUsers(query = '') {
  try {
    const res = await fetch(API_URL + '/api/users/search?q=' + encodeURIComponent(query), {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    console.error(err);
  }
}

function renderUsers(users) {
  usersList.innerHTML = '';
  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.onclick = () => window.location.href = `profile.html?id=${user._id}`;
    div.innerHTML = `
      <img src="${user.avatar || 'https://via.placeholder.com/50'}" alt="avatar">
      <div class="user-info-text">
        <h3>${user.username} ${user.isPremium ? '<span class="premium-badge">⭐</span>' : ''}</h3>
        <p>${user.bio || ''}</p>
      </div>
    `;
    usersList.appendChild(div);
  });
}

// Load friend requests (pending)
async function loadRequests() {
  try {
    const res = await fetch(API_URL + `/api/users/${currentUser.id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const user = await res.json();
    if (user.pendingRequests && user.pendingRequests.length > 0) {
      // Fetch details of each requester
      const requests = await Promise.all(user.pendingRequests.map(async id => {
        const r = await fetch(API_URL + `/api/users/${id}`, { headers: { 'Authorization': 'Bearer ' + token } });
        return r.json();
      }));
      renderRequests(requests);
    } else {
      requestsList.innerHTML = '<p>No pending requests</p>';
    }
  } catch (err) {
    console.error(err);
  }
}

function renderRequests(requesters) {
  requestsList.innerHTML = '';
  requesters.forEach(requester => {
    const div = document.createElement('div');
    div.className = 'user-item';
    div.innerHTML = `
      <img src="${requester.avatar || 'https://via.placeholder.com/50'}" alt="avatar">
      <div class="user-info-text">
        <h3>${requester.username}</h3>
      </div>
      <button class="accept-request" data-id="${requester._id}">Accept</button>
      <button class="reject-request" data-id="${requester._id}">Reject</button>
    `;
    div.querySelector('.accept-request').addEventListener('click', (e) => {
      e.stopPropagation();
      handleRequest(requester._id, 'accept');
    });
    div.querySelector('.reject-request').addEventListener('click', (e) => {
      e.stopPropagation();
      handleRequest(requester._id, 'reject');
    });
    requestsList.appendChild(div);
  });
}

async function handleRequest(userId, action) {
  try {
    const res = await fetch(API_URL + `/api/users/${userId}/${action}-request`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      alert(`Request ${action}ed`);
      loadRequests();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  } catch (err) {
    alert(err.message);
  }
}

// Search input
searchInput.addEventListener('input', (e) => {
  loadUsers(e.target.value);
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
});
