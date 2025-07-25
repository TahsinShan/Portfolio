window.addEventListener('DOMContentLoaded', () => {
  const icon = document.getElementById('chatbot-icon');
  const container = document.getElementById('chatbot-container');
  const closeBtn = document.getElementById('chatbot-close');
  const messagesEl = document.getElementById('chatbot-messages');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

  if (!icon || !container || !closeBtn || !messagesEl || !inputEl || !sendBtn) {
    console.error("Chatbot elements not found in DOM!");
    return;
  }

  let userInteracted = false;
  let welcomeTimeout;

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

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

  function hideChat() {
    container.style.display = 'none';
  }

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
        body: JSON.stringify({ message: text })
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

  function chatWasClicked(event) {
    return container.contains(event.target) || icon.contains(event.target);
  }

  icon.addEventListener('click', () => {
    userInteracted = true;
    clearTimeout(welcomeTimeout);
    showChat();
  });

  document.addEventListener('click', (e) => {
    if (!chatWasClicked(e)) {
      hideChat();
    } else {
      userInteracted = true;
      clearTimeout(welcomeTimeout);
    }
  });

  window.addEventListener('scroll', () => {
    hideChat();
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  sendBtn.addEventListener('click', sendMessage);
  closeBtn.addEventListener('click', hideChat);

  // 👇 Auto-show after short delay
  setTimeout(() => {
    showChat(true);
  }, 1000);
});
