/**
 * n8n Chatbot Integration Helper
 * 
 * This file contains helper functions to integrate your chatbot with n8n.
 * Replace the placeholder URL with your actual n8n webhook URL.
 */

// Configuration
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'YOUR_N8N_WEBHOOK_URL_HERE';

/**
 * Send a message to n8n and get a response
 * @param {string} message - The user's message
 * @param {object} context - Optional context (user info, session data, etc.)
 * @returns {Promise<string>} - Bot's response message
 */
export async function sendMessageToN8N(message, context = {}) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Adjust this based on your n8n workflow response structure
    return data.response || data.message || 'Sorry, I couldn\'t process that.';
  } catch (error) {
    console.error('Error communicating with n8n:', error);
    throw error;
  }
}

/**
 * Send user context to n8n (for session initialization)
 * @param {object} userInfo - User information
 * @returns {Promise<void>}
 */
export async function initializeChatSession(userInfo) {
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'init_session',
        user: userInfo,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Error initializing chat session:', error);
  }
}

/**
 * Example n8n workflow response structure:
 * 
 * {
 *   "response": "Hello! How can I help you today?",
 *   "suggestions": ["Check inventory", "View reports", "Add product"],
 *   "metadata": {
 *     "intent": "greeting",
 *     "confidence": 0.95
 *   }
 * }
 */

// Example usage in your Chatbot component:
/*
import { sendMessageToN8N, initializeChatSession } from '../../lib/n8n';

// In your component:
const handleSendMessage = async (e) => {
  e.preventDefault();
  
  if (!inputMessage.trim()) return;

  const userMessage = {
    id: Date.now(),
    text: inputMessage,
    sender: 'user',
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setInputMessage('');
  setIsTyping(true);

  try {
    const botResponse = await sendMessageToN8N(inputMessage, {
      userId: user.id,
      userRole: user.role,
    });

    const botMessage = {
      id: Date.now() + 1,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    const errorMessage = {
      id: Date.now() + 1,
      text: "Sorry, I'm having trouble connecting. Please try again.",
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};
*/
