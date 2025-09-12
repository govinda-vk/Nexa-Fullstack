// Widget JavaScript code template
function generateWidgetScript(config) {
  return `(function() {
  'use strict';
  
  // Widget configuration
  const WIDGET_CONFIG = ${JSON.stringify(config, null, 2)};
  const API_BASE = '${process.env.WIDGET_BASE_URL || 'http://localhost:3000'}';
  
  // Prevent multiple instances
  if (window.NexaWidget) {
    console.warn('NEXA Widget already initialized');
    return;
  }
  
  // Widget state
  let isOpen = false;
  let isMinimized = false;
  let messageHistory = [];
  let sessionId = generateSessionId();
  
  // Generate unique session ID
  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
  
  // Create widget HTML structure
  function createWidgetHTML() {
    const position = WIDGET_CONFIG.position || 'bottom-right';
    const theme = WIDGET_CONFIG.theme === 'dark' ? 'dark' : 'light';
    const primaryColor = WIDGET_CONFIG.primaryColor || '#8B5CF6';
    
    const positionStyles = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;'
    };
    
    const sizeStyles = {
      'small': 'width: 300px; height: 400px;',
      'medium': 'width: 350px; height: 500px;',
      'large': 'width: 400px; height: 600px;'
    };
    
    const size = WIDGET_CONFIG.size || 'medium';
    
    return \`
      <!-- Widget Styles -->
      <style id="nexa-widget-styles">
        .nexa-widget-container {
          position: fixed;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          \${positionStyles[position]}
        }
        
        .nexa-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          background: linear-gradient(135deg, \${primaryColor}, \${primaryColor}dd);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: white;
          font-size: 24px;
        }
        
        .nexa-widget-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        
        .nexa-widget-chat {
          \${sizeStyles[size]}
          background: \${theme === 'dark' ? '#1f2937' : 'white'};
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          display: none;
          flex-direction: column;
          border: \${theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'};
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .nexa-widget-chat.open {
          display: flex;
        }
        
        .nexa-widget-header {
          background: linear-gradient(135deg, \${primaryColor}, \${primaryColor}dd);
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .nexa-widget-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .nexa-widget-avatar {
          width: 32px;
          height: 32px;
          border-radius: 16px;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }
        
        .nexa-widget-title {
          font-weight: 600;
          font-size: 16px;
          margin: 0;
        }
        
        .nexa-widget-subtitle {
          font-size: 12px;
          opacity: 0.8;
          margin: 0;
        }
        
        .nexa-widget-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 20px;
          padding: 4px;
          border-radius: 4px;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        
        .nexa-widget-close:hover {
          opacity: 1;
          background: rgba(255,255,255,0.1);
        }
        
        .nexa-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: \${theme === 'dark' ? '#1f2937' : '#f9fafb'};
        }
        
        .nexa-widget-message {
          margin-bottom: 16px;
          display: flex;
          gap: 8px;
        }
        
        .nexa-widget-message.user {
          justify-content: flex-end;
        }
        
        .nexa-widget-message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .nexa-widget-message.bot .nexa-widget-message-content {
          background: \${theme === 'dark' ? '#374151' : 'white'};
          color: \${theme === 'dark' ? 'white' : '#1f2937'};
          border-bottom-left-radius: 6px;
        }
        
        .nexa-widget-message.user .nexa-widget-message-content {
          background: \${primaryColor};
          color: white;
          border-bottom-right-radius: 6px;
        }
        
        .nexa-widget-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: \${theme === 'dark' ? '#374151' : 'white'};
          border-radius: 18px;
          border-bottom-left-radius: 6px;
          max-width: 80%;
        }
        
        .nexa-widget-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 3px;
          background: \${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          animation: nexaTyping 1.4s infinite;
        }
        
        .nexa-widget-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .nexa-widget-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes nexaTyping {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
        
        .nexa-widget-input-container {
          padding: 16px 20px;
          border-top: 1px solid \${theme === 'dark' ? '#374151' : '#e5e7eb'};
          background: \${theme === 'dark' ? '#1f2937' : 'white'};
        }
        
        .nexa-widget-input-form {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        
        .nexa-widget-input {
          flex: 1;
          border: 1px solid \${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          background: \${theme === 'dark' ? '#374151' : 'white'};
          color: \${theme === 'dark' ? 'white' : '#1f2937'};
          resize: none;
          outline: none;
          max-height: 100px;
          min-height: 40px;
          transition: border-color 0.2s;
        }
        
        .nexa-widget-input:focus {
          border-color: \${primaryColor};
        }
        
        .nexa-widget-input::placeholder {
          color: \${theme === 'dark' ? '#9ca3af' : '#6b7280'};
        }
        
        .nexa-widget-send {
          background: \${primaryColor};
          border: none;
          border-radius: 20px;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          transition: background 0.2s;
        }
        
        .nexa-widget-send:hover {
          background: \${primaryColor}dd;
        }
        
        .nexa-widget-send:disabled {
          background: \${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          cursor: not-allowed;
        }
        
        .nexa-widget-powered-by {
          text-align: center;
          padding: 8px;
          font-size: 11px;
          color: \${theme === 'dark' ? '#9ca3af' : '#6b7280'};
          border-top: 1px solid \${theme === 'dark' ? '#374151' : '#f3f4f6'};
        }
        
        .nexa-widget-powered-by a {
          color: \${primaryColor};
          text-decoration: none;
        }
        
        .nexa-widget-error {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 12px;
          border: 1px solid #fecaca;
        }
        
        /* Mobile responsive */
        @media (max-width: 480px) {
          .nexa-widget-chat {
            width: calc(100vw - 40px) !important;
            height: calc(100vh - 100px) !important;
            max-width: 400px;
            max-height: 600px;
          }
        }
      </style>
      
      <!-- Widget HTML -->
      <div id="nexa-widget-container" class="nexa-widget-container">
        <!-- Chat Interface -->
        <div id="nexa-widget-chat" class="nexa-widget-chat">
          <!-- Header -->
          <div class="nexa-widget-header">
            <div class="nexa-widget-header-info">
              <div class="nexa-widget-avatar">
                \${WIDGET_CONFIG.avatar ? \`<img src="\${WIDGET_CONFIG.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;">\` : 'N'}
              </div>
              <div>
                <div class="nexa-widget-title">\${WIDGET_CONFIG.title}</div>
                <div class="nexa-widget-subtitle">\${WIDGET_CONFIG.subtitle}</div>
              </div>
            </div>
            <button class="nexa-widget-close" id="nexa-widget-close-btn">&times;</button>
          </div>
          
          <!-- Messages -->
          <div id="nexa-widget-messages" class="nexa-widget-messages">
            <!-- Welcome message will be added here -->
          </div>
          
          <!-- Input -->
          <div class="nexa-widget-input-container">
            <form id="nexa-widget-form" class="nexa-widget-input-form">
              <textarea 
                id="nexa-widget-input" 
                class="nexa-widget-input" 
                placeholder="\${WIDGET_CONFIG.placeholder}"
                rows="1"
              ></textarea>
              <button type="submit" id="nexa-widget-send" class="nexa-widget-send">
                ➤
              </button>
            </form>
          </div>
          
          \${WIDGET_CONFIG.showPoweredBy ? \`
          <div class="nexa-widget-powered-by">
            Powered by <a href="https://nexa.ai" target="_blank">NEXA</a>
          </div>
          \` : ''}
        </div>
        
        <!-- Toggle Button -->
        <button id="nexa-widget-button" class="nexa-widget-button">
          💬
        </button>
      </div>
    \`;
  }
  
  // Auto-resize textarea
  function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
  
  // Add message to chat
  function addMessage(content, isUser = false, isError = false) {
    const messagesContainer = document.getElementById('nexa-widget-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = \`nexa-widget-message \${isUser ? 'user' : 'bot'}\`;
    
    if (isError) {
      messageDiv.innerHTML = \`
        <div class="nexa-widget-error">
          \${content}
        </div>
      \`;
    } else {
      messageDiv.innerHTML = \`
        <div class="nexa-widget-message-content">
          \${content}
        </div>
      \`;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store in history
    messageHistory.push({ content, isUser, timestamp: new Date() });
    
    // Limit history
    if (messageHistory.length > WIDGET_CONFIG.maxMessages) {
      messageHistory = messageHistory.slice(-WIDGET_CONFIG.maxMessages);
    }
  }
  
  // Show typing indicator
  function showTyping() {
    const messagesContainer = document.getElementById('nexa-widget-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'nexa-widget-typing-indicator';
    typingDiv.className = 'nexa-widget-message bot';
    typingDiv.innerHTML = \`
      <div class="nexa-widget-typing">
        <div class="nexa-widget-typing-dot"></div>
        <div class="nexa-widget-typing-dot"></div>
        <div class="nexa-widget-typing-dot"></div>
      </div>
    \`;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Hide typing indicator
  function hideTyping() {
    const typingIndicator = document.getElementById('nexa-widget-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // Send message to API
  async function sendMessage(message) {
    try {
      const response = await fetch(\`\${API_BASE}/widget/chat\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Widget-API-Key': WIDGET_CONFIG.apiKey,
          'X-Widget-Session': sessionId
        },
        body: JSON.stringify({
          message,
          sessionId,
          websiteUrl: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      return data.answer || data.response || 'I apologize, but I encountered an issue processing your request.';
    } catch (error) {
      console.error('NEXA Widget: API Error:', error);
      throw error;
    }
  }
  
  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    
    const input = document.getElementById('nexa-widget-input');
    const sendButton = document.getElementById('nexa-widget-send');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Disable input
    input.disabled = true;
    sendButton.disabled = true;
    
    // Show typing
    showTyping();
    
    // Send to API
    sendMessage(message)
      .then(response => {
        hideTyping();
        addMessage(response);
        
        // Update widget stats
        if (window.NexaWidget && window.NexaWidget.updateStats) {
          window.NexaWidget.updateStats();
        }
      })
      .catch(error => {
        hideTyping();
        addMessage('I apologize, but I encountered an error. Please try again later.', false, true);
        console.error('NEXA Widget Error:', error);
      })
      .finally(() => {
        // Re-enable input
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
      });
  }
  
  // Initialize widget
  function initWidget() {
    // Insert widget HTML
    document.body.insertAdjacentHTML('beforeend', createWidgetHTML());
    
    // Add event listeners
    const form = document.getElementById('nexa-widget-form');
    const input = document.getElementById('nexa-widget-input');
    const toggleButton = document.getElementById('nexa-widget-button');
    const closeButton = document.getElementById('nexa-widget-close-btn');
    
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    
    if (toggleButton) {
      toggleButton.addEventListener('click', () => window.NexaWidget.toggle());
    }
    
    if (closeButton) {
      closeButton.addEventListener('click', () => window.NexaWidget.close());
    }
    
    if (input) {
      // Auto-resize on input
      input.addEventListener('input', (e) => autoResize(e.target));
      
      // Submit on Enter (not Shift+Enter)
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
        }
      });
    }
    
    // Add welcome message
    if (WIDGET_CONFIG.showWelcomeMessage && WIDGET_CONFIG.welcomeMessage) {
      setTimeout(() => {
        addMessage(WIDGET_CONFIG.welcomeMessage);
      }, 500);
    }
    
    // Auto-open if configured
    if (WIDGET_CONFIG.autoOpen) {
      setTimeout(() => {
        window.NexaWidget.open();
      }, 1000);
    }
  }
  
  // Widget API
  window.NexaWidget = {
    open() {
      const chat = document.getElementById('nexa-widget-chat');
      const button = document.getElementById('nexa-widget-button');
      
      if (chat && button) {
        chat.classList.add('open');
        button.style.display = 'none';
        isOpen = true;
        
        // Focus input
        setTimeout(() => {
          const input = document.getElementById('nexa-widget-input');
          if (input) input.focus();
        }, 100);
      }
    },
    
    close() {
      const chat = document.getElementById('nexa-widget-chat');
      const button = document.getElementById('nexa-widget-button');
      
      if (chat && button) {
        chat.classList.remove('open');
        button.style.display = 'flex';
        isOpen = false;
      }
    },
    
    toggle() {
      if (isOpen) {
        this.close();
      } else {
        this.open();
      }
    },
    
    sendMessage(message) {
      const input = document.getElementById('nexa-widget-input');
      if (input && message) {
        input.value = message;
        const form = document.getElementById('nexa-widget-form');
        if (form) {
          handleSubmit({ preventDefault: () => {} });
        }
      }
    },
    
    getConfig() {
      return WIDGET_CONFIG;
    },
    
    getHistory() {
      return messageHistory;
    },
    
    clearHistory() {
      messageHistory = [];
      const messagesContainer = document.getElementById('nexa-widget-messages');
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
        
        // Re-add welcome message
        if (WIDGET_CONFIG.showWelcomeMessage && WIDGET_CONFIG.welcomeMessage) {
          setTimeout(() => {
            addMessage(WIDGET_CONFIG.welcomeMessage);
          }, 100);
        }
      }
    },
    
    updateStats() {
      // This could be used to ping analytics
      if (WIDGET_CONFIG.apiKey) {
        fetch(\`\${API_BASE}/widget/stats\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Widget-API-Key': WIDGET_CONFIG.apiKey
          },
          body: JSON.stringify({
            sessionId,
            action: 'message_sent',
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}); // Silent fail
      }
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
  
})();`;
}

module.exports = { generateWidgetScript };
