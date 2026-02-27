// ===== chat.js =====
const API_URL = 'https://darktutor.onrender.com';
const token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));
let otherUserId = null;
let socket = null;
let messageLimitReached = false;

const urlParams = new URLSearchParams(window.location.search);
otherUserId = urlParams.get('id');

if (!token || !otherUserId) {
  window.location.href = 'index.html';
}

// Back button
document.getElementById('back-btn').addEventListener('click', () => {
  window.history.back();
});

// Initialize socket
socket = io(API_URL, {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Socket connected');
  loadMessages();
  // Fetch other user's info
  fetchOtherUser();
});

socket.on('private-message', (msg) => {
  // If message is from/to the current chat partner, display it
  if ((msg.sender === otherUserId && msg.receiver === currentUser.id) ||
      (msg.sender === currentUser.id && msg.receiver === otherUserId)) {
    displayMessage(msg);
  }
});

socket.on('typing', ({ userId, isTyping }) => {
  if (userId === otherUserId) {
    document.getElementById('typing-indicator').textContent = isTyping ? 'Typing...' : '';
  }
});

socket.on('limit-reached', (data) => {
  messageLimitReached = true;
  document.getElementById('warning').style.display = 'block';
  document.getElementById('warning').textContent = data.message;
  document.getElementById('message-input').disabled = true;
  document.getElementById('send-btn').disabled = true;
  // Add option to send friend request
  const warningDiv = document.getElementById('warning');
  const friendBtn = document.createElement('button');
  friendBtn.textContent = 'Send Friend Request';
  friendBtn.onclick = () => {
    window.location.href = `profile.html?id=${otherUserId}`;
  };
  warningDiv.appendChild(friendBtn);
});

socket.on('user-online', (userId) => {
  if (userId === otherUserId) {
    document.getElementById('online-status').className = 'online';
    document.getElementById('online-status').textContent = '● Online';
  }
});

socket.on('user-offline', (userId) => {
  if (userId === otherUserId) {
    document.getElementById('online-status').className = 'offline';
    document.getElementById('online-status').textContent = '● Offline';
  }
});

// Fetch other user info
async function fetchOtherUser() {
  try {
    const res = await fetch(API_URL + `/api/users/${otherUserId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const user = await res.json();
    document.getElementById('chat-with').textContent = user.username;
    // Check online status (if user object has online flag)
    if (user.online) {
      document.getElementById('online-status').className = 'online';
      document.getElementById('online-status').textContent = '● Online';
    }
  } catch (err) {
    console.error(err);
  }
}

// Load chat history
async function loadMessages() {
  try {
    const res = await fetch(API_URL + `/api/messages/${otherUserId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const messages = await res.json();
    messages.forEach(msg => displayMessage(msg));
    scrollToBottom();
  } catch (err) {
    console.error(err);
  }
}

function displayMessage(msg) {
  const messagesDiv = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${msg.sender._id === currentUser.id ? 'sent' : 'received'}`;
  div.textContent = msg.content;
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const small = document.createElement('small');
  small.textContent = time;
  div.appendChild(small);
  messagesDiv.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Send message
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  if (messageLimitReached) {
    alert('You have reached the message limit. Send a friend request to continue.');
    return;
  }
  const input = document.getElementById('message-input');
  const content = input.value.trim();
  if (!content) return;

  socket.emit('private-message', { receiverId: otherUserId, content });
  input.value = '';
}

// Typing indicator
let typingTimeout;
document.getElementById('message-input').addEventListener('input', () => {
  socket.emit('typing', { receiverId: otherUserId, isTyping: true });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', { receiverId: otherUserId, isTyping: false });
  }, 1000);
});
