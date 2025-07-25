(() => {
  const icon = document.getElementById('chatbot-icon');
  const container = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('chatbot-close');
  const messagesEl = document.getElementById('chatbot-messages');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

  let userInteracted = false;
  let welcomeTimeout;

  // Add message to chat
  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Show chat
  function showChat(auto = false) {
    container.style.display = 'flex';
    inputEl.focus();

    if (auto && !messagesEl.hasChildNodes()) {
      addMessage("👋 Hi! I'm Shan's bot, your assistant here. I will let you know about him well.", 'bot');
      welcomeTimeout = setTimeout(() => {
        if (!userInteracted) hideChat();
      }, 7000);
    }
  }

  // Hide chat
  function hideChat() {
    container.style.display = 'none';
  }

  // Send message to backend API (OpenRouter via Vercel)
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    inputEl.value = '';
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const loadingMsg = document.createElement('div');
    loadingMsg.classList.add('message', 'bot');
    loadingMsg.textContent = '...';
    messagesEl.appendChild(loadingMsg);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const response = await fetch('https://shans-bot-api.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }) // ✅ Correct format
      });

      const data = await response.json();
      loadingMsg.remove();

      if (data.reply) {
        addMessage(data.reply, 'bot');
      } else {
        addMessage("⚠️ I couldn’t understand that. Please try again.", 'bot');
      }
    } catch (err) {
      loadingMsg.remove();
      addMessage("❌ Error: Couldn't reach the server.", 'bot');
    }
  }

  // Detect click inside chat
  function chatWasClicked(event) {
    return container.contains(event.target) || icon.contains(event.target);
  }

  // Click on bot icon
  icon.addEventListener('click', () => {
    userInteracted = true;
    clearTimeout(welcomeTimeout);
    showChat();
  });

  // Click outside = hide
  document.addEventListener('click', (e) => {
    if (!chatWasClicked(e)) {
      hideChat();
    } else {
      userInteracted = true;
      clearTimeout(welcomeTimeout);
    }
  });

  // Scroll = hide
  window.addEventListener('scroll', () => {
    hideChat();
  });

  // Enter key to send
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Click send button
  sendBtn.addEventListener('click', sendMessage);

  // Close button
  closeBtn.addEventListener('click', hideChat);

  // Auto-open on page load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      showChat(true);
    }, 1000);
  });
})();
