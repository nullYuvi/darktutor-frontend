// ===== profile.js =====
const API_URL = 'https://darktutor.onrender.com';
const token = localStorage.getItem('token');
let currentUserId = null;
let profileUserId = null;

// Get user id from URL
const urlParams = new URLSearchParams(window.location.search);
profileUserId = urlParams.get('id');

if (!token) {
  window.location.href = 'index.html';
}

// Back button
document.getElementById('back-btn').addEventListener('click', () => {
  window.history.back();
});

// Fetch profile data
async function loadProfile() {
  try {
    // Get current user info (to know if it's own profile)
    const meRes = await fetch(API_URL + `/api/users/${JSON.parse(localStorage.getItem('user')).id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const me = await meRes.json();
    currentUserId = me._id;

    // Get profile user
    const res = await fetch(API_URL + `/api/users/${profileUserId || currentUserId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const user = await res.json();

    document.getElementById('profile-avatar').src = user.avatar || 'https://via.placeholder.com/150';
    document.getElementById('profile-username').textContent = user.username;
    document.getElementById('profile-bio').textContent = user.bio || 'No bio yet.';
    document.getElementById('profile-friends-count').textContent = user.friends.length;
    document.getElementById('profile-premium').textContent = user.isPremium ? 'Yes ⭐' : 'No';

    // Check if it's own profile
    if (user._id === currentUserId) {
      document.getElementById('own-pending').style.display = 'block';
      loadPendingRequests(user.pendingRequests);
    } else {
      // Show action buttons based on friend status
      renderActionButtons(user);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to load profile');
  }
}

async function loadPendingRequests(pendingIds) {
  if (!pendingIds.length) {
    document.getElementById('pending-list').innerHTML = '<p>No pending requests</p>';
    return;
  }
  const pendingList = document.getElementById('pending-list');
  pendingList.innerHTML = '';
  for (let id of pendingIds) {
    const res = await fetch(API_URL + `/api/users/${id}`, { headers: { 'Authorization': 'Bearer ' + token } });
    const requester = await res.json();
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
    pendingList.appendChild(div);
  }
}

async function handleRequest(userId, action) {
  try {
    const res = await fetch(API_URL + `/api/users/${userId}/${action}-request`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      alert(`Request ${action}ed`);
      loadProfile(); // reload
    } else {
      const data = await res.json();
      alert(data.error);
    }
  } catch (err) {
    alert(err.message);
  }
}

async function renderActionButtons(targetUser) {
  const actionsDiv = document.getElementById('profile-actions');
  actionsDiv.innerHTML = '';

  // Check if already friends
  const me = await fetch(API_URL + `/api/users/${currentUserId}`, { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json());
  const isFriend = me.friends.includes(targetUser._id);
  const requestSent = me.sentRequests.includes(targetUser._id);
  const requestPending = me.pendingRequests.includes(targetUser._id);

  if (isFriend) {
    const btn = document.createElement('button');
    btn.textContent = 'Message';
    btn.onclick = () => window.location.href = `chat.html?id=${targetUser._id}`;
    actionsDiv.appendChild(btn);
  } else if (requestSent) {
    actionsDiv.innerHTML = '<p>Friend request sent</p>';
  } else if (requestPending) {
    actionsDiv.innerHTML = `
      <button id="accept-request">Accept Request</button>
      <button id="reject-request">Reject Request</button>
    `;
    document.getElementById('accept-request').addEventListener('click', () => handleRequest(targetUser._id, 'accept'));
    document.getElementById('reject-request').addEventListener('click', () => handleRequest(targetUser._id, 'reject'));
  } else {
    const btn = document.createElement('button');
    btn.textContent = 'Send Friend Request';
    btn.onclick = async () => {
      try {
        const res = await fetch(API_URL + `/api/users/${targetUser._id}/send-request`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
          alert('Request sent');
          loadProfile();
        } else {
          const data = await res.json();
          alert(data.error);
        }
      } catch (err) {
        alert(err.message);
      }
    };
    actionsDiv.appendChild(btn);
  }
}

loadProfile();
