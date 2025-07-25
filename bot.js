(function () {
  let userInteracted = false;
  let welcomeTimeout;

  function addMessage(messagesEl, text, sender) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showChat(container, messagesEl, inputEl, auto = false) {
    container.classList.add('show');
    inputEl.focus();

    if (auto && !messagesEl.hasChildNodes()) {
      addMessage(messagesEl, "👋 Hi! I'm Shan's bot, your assistant here. I will let you know about him well.", 'bot');
      welcomeTimeout = setTimeout(() => {
        if (!userInteracted) container.classList.remove('show');
      }, 7000);
    }
  }

  function hideChat(container) {
    container.classList.remove('show');
  }

  window.addEventListener('load', function () {
    const icon = document.getElementById('chatbot-icon');
    const container = document.getElementById('chatbot-container');
    const closeBtn = document.getElementById('chatbot-close');
    const messagesEl = document.getElementById('chatbot-messages');
    const inputEl = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');

    if (!icon || !container || !closeBtn || !messagesEl || !inputEl || !sendBtn) {
      console.error("❌ Chatbot elements not found.");
      return;
    }

    async function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;

      addMessage(messagesEl, text, 'user');
      inputEl.value = '';

      const loadingMsg = document.createElement('div');
      loadingMsg.classList.add('message', 'bot');
      loadingMsg.textContent = '...';
      messagesEl.appendChild(loadingMsg);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      try {
        const res = await fetch('https://shans-bot-api.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        loadingMsg.remove();
        if (data.reply) {
          addMessage(messagesEl, data.reply, 'bot');
        } else {
          addMessage(messagesEl, "⚠️ I couldn’t understand that. Please try again.", 'bot');
        }
      } catch (err) {
        loadingMsg.remove();
        addMessage(messagesEl, "❌ Error: Couldn't reach the server.", 'bot');
      }
    }

    icon.addEventListener('click', () => {
      userInteracted = true;
      clearTimeout(welcomeTimeout);
      showChat(container, messagesEl, inputEl);
    });

    closeBtn.addEventListener('click', () => hideChat(container));

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target) && !icon.contains(e.target)) {
        hideChat(container);
      } else {
        userInteracted = true;
        clearTimeout(welcomeTimeout);
      }
    });

    window.addEventListener('scroll', () => {
      hideChat(container);
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    sendBtn.addEventListener('click', sendMessage);

    setTimeout(() => {
      showChat(container, messagesEl, inputEl, true);
    }, 1000);
  });
})();
