import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Generate a session ID for this client
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    console.log('Session created:', newSessionId);
  }, []);

  const sendMessage = async (message) => {
    if (!sessionId) {
      throw new Error('Session not initialized');
    }

    // Add user message to chat
    const userMessage = {
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message to server via HTTP API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Handle both string and object responses
        const responseText = typeof data.response === 'string' 
          ? data.response 
          : data.response.message || JSON.stringify(data.response);
        
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: responseText,
          timestamp: data.timestamp
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `Error: ${data.error || 'Failed to process message'}`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value = {
    messages,
    sendMessage,
    clearMessages,
    sessionId,
    isConnected
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
