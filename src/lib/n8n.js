/**
 * n8n Chatbot Integration Helper
 * 
 * This file contains helper functions to integrate your chatbot with n8n.
 * 
 * Setup Instructions:
 * 1. Create a .env file in your project root
 * 2. Add: VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url_here
 * 3. Example: VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/chatbot
 */

// Configuration - reads from environment variable
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chatbot';

/**
 * Database Tables Context (for reference)
 * Your n8n AI agent should be aware of these tables:
 * - products: product details (name, category, price, stock, etc.)
 * - sales: sales records (product_id, quantity, date, customer, etc.)
 * - purchases: purchase records (product_id, quantity, date, supplier, etc.)
 * - users: user information (name, role, email, etc.)
 * - alerts: system alerts (type, message, status, etc.)
 * - reports: generated reports
 */

/**
 * Send a message to n8n and get a response
 * @param {string} message - The user's message
 * @param {object} context - Optional context (user info, session data, etc.)
 * @returns {Promise<object>} - Bot's response object { text, timestamp }
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
        chatInput: message, // For compatibility with different n8n node names
        context,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different n8n response structures
    const botText = data.response || data.message || data.text || 'Sorry, I couldn\'t process that.';
    
    return {
      text: botText,
      timestamp: new Date(),
      metadata: data.metadata || {},
    };
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
 * Test the n8n connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
export async function testN8NConnection() {
  try {
    const response = await sendMessageToN8N('test connection', { test: true });
    return !!response.text;
  } catch (error) {
    console.error('n8n connection test failed:', error);
    return false;
  }
}

/**
 * Example n8n workflow expected response structure:
 * 
 * {
 *   "response": "Here are the products in stock...",
 *   "message": "Alternative response field",
 *   "suggestions": ["Check inventory", "View reports", "Add product"],
 *   "metadata": {
 *     "intent": "inventory_query",
 *     "confidence": 0.95,
 *     "table": "products"
 *   }
 * }
 */

// Example usage in your Chatbot component:
/*
import { sendMessageToN8N, initializeChatSession } from '../../lib/n8n';
import { useAuth } from '../../contexts/AuthContext'; // or wherever your auth context is

// In your component:
const { user } = useAuth(); // Get current user info

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
    // Send message to n8n with user context
    const botResponse = await sendMessageToN8N(inputMessage, {
      userId: user?.id,
      userRole: user?.role,
      userEmail: user?.email,
    });

    const botMessage = {
      id: Date.now() + 1,
      text: botResponse.text,
      sender: 'bot',
      timestamp: botResponse.timestamp,
    };
    
    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    const errorMessage = {
      id: Date.now() + 1,
      text: "Sorry, I'm having trouble connecting to the assistant. Please try again later.",
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};

// Initialize session when chat opens
useEffect(() => {
  if (isOpen && user) {
    initializeChatSession({
      id: user.id,
      role: user.role,
      email: user.email,
    });
  }
}, [isOpen, user]);
*/
