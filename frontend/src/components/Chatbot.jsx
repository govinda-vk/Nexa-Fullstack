import React, { useState } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" }
  ]);
  const [inputText, setInputText] = useState("");

  // Simple response logic
  const getBotResponse = (userMessage) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
      return "Hello there! How can I assist you today?";
    } else if (lowerCaseMessage.includes("pricing") || lowerCaseMessage.includes("price")) {
      return "We offer several pricing plans: Basic ($29/month), Pro ($79/month), and Enterprise ($199/month). Which one are you interested in?";
    } else if (lowerCaseMessage.includes("feature") || lowerCaseMessage.includes("what can you do")) {
      return "I can answer questions about our products, help with troubleshooting, and provide information about pricing and features.";
    } else if (lowerCaseMessage.includes("thank")) {
      return "You're welcome! Is there anything else I can help with?";
    } else if (lowerCaseMessage.includes("bye") || lowerCaseMessage.includes("goodbye")) {
      return "Goodbye! Feel free to come back if you have more questions.";
    } else {
      return "I'm still learning. Can you please ask something about our products, pricing, or features?";
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;
    
    // Add user message
    const newMessages = [...messages, { text: inputText, sender: "user" }];
    setMessages(newMessages);
    setInputText("");
    
    // Simulate bot thinking and response
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
      setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f8f9fa",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem",
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        borderRadius: "16px 16px 0 0"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.2rem",
          marginRight: "0.75rem"
        }}>
          N
        </div>
        <div>
          <div style={{ fontWeight: "600", fontSize: "1rem" }}>NEXA Assistant</div>
          <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>AI-powered support</div>
        </div>
      </div>
      
      {/* Messages */}
      <div style={{
        flex: 1,
        padding: "1rem",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: message.sender === "user" ? "#4f46e5" : "white",
              color: message.sender === "user" ? "white" : "#374151",
              padding: "0.75rem 1rem",
              borderRadius: message.sender === "user" ? "16px 16px 0 16px" : "16px 16px 16px 0",
              maxWidth: "70%",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
            }}
          >
            {message.text}
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        padding: "1rem",
        backgroundColor: "white",
        borderTop: "1px solid #e5e7eb",
        borderRadius: "0 0 16px 16px"
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "1rem",
            outline: "none"
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={inputText.trim() === ""}
          style={{
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: inputText.trim() === "" ? "not-allowed" : "pointer",
            opacity: inputText.trim() === "" ? 0.5 : 1
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;