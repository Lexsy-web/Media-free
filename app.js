(() => {
  const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('\\');
  const isChat = window.location.pathname.endsWith('chat.html');

  const normalizeCode = (code) => code.trim();

  const getQuery = (key) => new URLSearchParams(window.location.search).get(key);

  const localStorageJson = {
    get(key) {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (e) { return null; }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const removeSelfFromWaiting = (code, userId) => {
    if (!code || !userId) return;
    const key = `chat-wait-${code}`;
    const wait = localStorageJson.get(key) || [];
    const filtered = wait.filter((p) => p.id !== userId);
    localStorageJson.set(key, filtered);
  };

  if (isIndex) {
    const roomInput = document.getElementById('roomCode');
    const nameInput = document.getElementById('userName');
    const statusEl = document.getElementById('status');
    const button = document.getElementById('joinBtn');
    const clientId = `uid-${Math.random().toString(36).slice(2, 11)}`;
    let poll = null;

    const setStatus = (text, isError = false) => {
      statusEl.textContent = text;
      statusEl.style.borderLeftColor = isError ? '#f87171' : 'var(--accent)';
    };

    const checkReady = (code, personalId, displayName) => {
      const normalized = normalizeCode(code) || '1234';
      if (!normalized) {
        setStatus('Please provide a room code or use the default 1234.', true);
        return;
      }
      if (!displayName.trim()) {
        setStatus('Choose a display name first.', true);
        return;
      }

      const waitKey = `chat-wait-${normalized}`;
      const pairKey = `chat-pair-${normalized}`;

      const updateWait = () => {
        let waiting = localStorageJson.get(waitKey) || [];
        if (!waiting.some((p) => p.id === personalId)) {
          waiting.push({ id: personalId, name: displayName, joinedAt: Date.now() });
          if (waiting.length > 2) waiting = waiting.slice(waiting.length - 2);
          localStorageJson.set(waitKey, waiting);
        }

        if (waiting.length >= 2) {
          localStorageJson.set(pairKey, waiting.slice(0, 2));
          setStatus('Matched! Opening chat ...');
          window.location.href = `chat.html?code=${encodeURIComponent(normalized)}&uid=${encodeURIComponent(personalId)}&name=${encodeURIComponent(displayName)}`;
        } else {
          setStatus('Waiting for another user to join your code. Keep this page open in one tab and open another to join.');
        }
      };

      updateWait();
      poll = setInterval(updateWait, 1200);

      window.addEventListener('beforeunload', () => {
        clearInterval(poll);
        removeSelfFromWaiting(normalized, personalId);
      });

      window.addEventListener('storage', (evt) => {
        if (evt.key === pairKey) {
          const pair = JSON.parse(evt.newValue || '[]');
          if (pair && Array.isArray(pair) && pair.some((p) => p.id === personalId)) {
            setStatus('Friend is here! Redirecting...');
            window.location.href = `chat.html?code=${encodeURIComponent(normalized)}&uid=${encodeURIComponent(personalId)}&name=${encodeURIComponent(displayName)}`;
          }
        }
      });
    };

    button.addEventListener('click', () => {
      checkReady(roomInput.value, clientId, nameInput.value);
    });

    setStatus('Ready to connect. Enter a code (or leave 1234) and your name.');
  }

  if (isChat) {
    const code = getQuery('code');
    const userId = getQuery('uid');
    const userName = getQuery('name') || 'Guest';
    const participantsEl = document.getElementById('participants');
    const statusLabel = document.getElementById('statusLabel');
    const roomTitle = document.getElementById('roomTitle');
    const form = document.getElementById('messageForm');
    const input = document.getElementById('messageInput');
    const chatLog = document.getElementById('chatLog');

    const pairKey = `chat-pair-${code}`;
    const chatKey = `chat-${code}`;
    const typingKey = `chat-typing-${code}`;

    if (!code || !userId) {
      window.location.href = 'index.html';
      return;
    }

    roomTitle.textContent = `Room ${code}`;

    const typingStatusEl = document.getElementById('typingStatus');

    const loadPair = () => {
      const pair = localStorageJson.get(pairKey) || [];
      if (!pair.some((p) => p.id === userId)) {
        statusLabel.textContent = 'Waiting for matching participant...';
        statusLabel.style.backgroundColor = '#fbbf24';
      } else {
        statusLabel.textContent = 'Connected';
        statusLabel.style.backgroundColor = '#22c55e';
      }
      participantsEl.innerHTML = pair.length
        ? pair.map((p) => `<li>${p.name} ${p.id === userId ? '(You)' : ''}</li>`).join('')
        : '<li>(none)</li>';
    };

    const updateTypingStatus = () => {
      const typingData = localStorageJson.get(typingKey);
      if (!typingData || typingData.userId === userId || Date.now() - typingData.timestamp > 4500) {
        typingStatusEl.textContent = '';
        return;
      }
      typingStatusEl.textContent = `${typingData.name} is typing...`;
    };

    const escapeHtml = (untrusted) => {
      const div = document.createElement('div');
      div.textContent = untrusted;
      return div.innerHTML;
    };

    const isHiText = (value) => /^\s*hi[.!?\s]*$/i.test(value);

    const maybeAutoReply = () => {
      const messages = localStorageJson.get(chatKey) || [];
      if (!messages.length) return;
      const last = messages[messages.length - 1];

      if (!last || last.senderId === userId || last.senderId === 'bot') return;
      if (!isHiText(last.text)) return;

      const existingBotReply = messages.some((m) => m.senderId === 'bot' && m.inReplyTo === last.id);
      if (existingBotReply) return;

      setTimeout(() => {
        const liveMessages = localStorageJson.get(chatKey) || [];
        if (liveMessages.some((m) => m.senderId === 'bot' && m.inReplyTo === last.id)) return;

        liveMessages.push({
          id: `bot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: 'Codechat Bot',
          text: 'Hi! I saw your friend say hi and I am echoing it on the left side 😊',
          senderId: 'bot',
          timestamp: Date.now(),
          inReplyTo: last.id,
        });
        localStorageJson.set(chatKey, liveMessages);
        renderMessages();
      }, 700);
    };

    const renderMessages = () => {
      const messages = localStorageJson.get(chatKey) || [];
      if (!messages.length) {
        chatLog.innerHTML = '<p class="status">No messages yet. Say hello!</p>';
        return;
      }
      chatLog.innerHTML = messages
        .map((m) => {
          const time = new Date(m.timestamp).toLocaleTimeString();
          const cssClass = m.senderId === 'bot' ? 'message bot' : m.senderId === userId ? 'message me' : 'message';
          return `<div class="${cssClass}"><strong>${m.name}</strong>: ${escapeHtml(m.text)} <span>${time}</span></div>`;
        })
        .join('');
      chatLog.scrollTop = chatLog.scrollHeight;
    };

    const addMessage = (text) => {
      if (!text.trim()) return;
      const messages = localStorageJson.get(chatKey) || [];
      messages.push({ id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`, name: userName, text: text.trim(), senderId: userId, timestamp: Date.now() });
      localStorageJson.set(chatKey, messages);
      localStorageJson.set(typingKey, null);
      renderMessages();
      input.value = '';
      updateTypingStatus();
    };

    input.addEventListener('input', () => {
      localStorageJson.set(typingKey, { userId, name: userName, timestamp: Date.now() });
      updateTypingStatus();
    });

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      addMessage(input.value);
    });

    const clearChatBtn = document.getElementById('clearChatBtn');
    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => {
        localStorageJson.set(chatKey, []);
        renderMessages();
      });
    }

    window.addEventListener('storage', (evt) => {
      if (evt.key === chatKey) {
        renderMessages();
        maybeAutoReply();
      }
      if (evt.key === typingKey) {
        updateTypingStatus();
      }
      if (evt.key === pairKey) {
        loadPair();
      }
    });

    const keepPairAlive = () => {
      const pair = localStorageJson.get(pairKey) || [];
      if (!pair.some((p) => p.id === userId)) {
        const originalWaiting = localStorageJson.get(`chat-wait-${code}`) || [];
        const self = { id: userId, name: userName, joinedAt: Date.now() };
        const nextPair = [...originalWaiting, self].filter((v, i, arr) => arr.findIndex((u) => u.id === v.id) === i).slice(0, 2);
        localStorageJson.set(pairKey, nextPair);
        localStorageJson.set(`chat-wait-${code}`, nextPair);
      }
      loadPair();
    };

    keepPairAlive();
    renderMessages();
    maybeAutoReply();
    updateTypingStatus();
    setInterval(() => {
      keepPairAlive();
      renderMessages();
      maybeAutoReply();
      updateTypingStatus();
    }, 1300);
  }
})();