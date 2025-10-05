import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initial welcome message
  const initialMessage = {
    id: 1,
    text: "👋 Welcome to SmartStock AI! I'm here to assist you with inventory management, sales insights, and product information. How can I help you today?",
    sender: 'bot',
    timestamp: new Date(),
  };
  
  const [messages, setMessages] = useState([initialMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick suggestion buttons
  const suggestions = [
    "📊 Show inventory status",
    "💰 Recent sales report",
    "📦 Low stock alerts",
    "🔍 Search products",
  ];

  // Reset chatbot to initial state
  const resetChat = () => {
    setMessages([{
      ...initialMessage,
      id: Date.now(), // New ID to force re-render
      timestamp: new Date(),
    }]);
    setInputMessage('');
    setIsTyping(false);
    setShowSuggestions(true);
  };

  // Handle closing chat with reset
  const handleClose = () => {
    setIsOpen(false);
    // Reset chat after animation completes
    setTimeout(() => {
      resetChat();
    }, 300);
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    // Hide suggestions after first message
    setShowSuggestions(false);

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response (replace this with n8n API call later)
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: "✨ I'm currently in demo mode! Soon I'll be powered by n8n to provide:\n\n🔹 Real-time inventory insights\n🔹 Sales analytics\n🔹 Product recommendations\n🔹 Smart alerts & notifications\n\nStay tuned! 🚀",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);

    // TODO: Replace above with actual n8n API call
    // Example:
    // try {
    //   const response = await fetch('YOUR_N8N_WEBHOOK_URL', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ message: inputMessage }),
    //   });
    //   const data = await response.json();
    //   const botMessage = {
    //     id: Date.now() + 1,
    //     text: data.response,
    //     sender: 'bot',
    //     timestamp: new Date(),
    //   };
    //   setMessages((prev) => [...prev, botMessage]);
    // } catch (error) {
    //   console.error('Error sending message:', error);
    // } finally {
    //   setIsTyping(false);
    // }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 group"
          aria-label="Open chat"
        >
          <MessageCircle size={28} className="drop-shadow-lg" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5 flex items-center justify-between relative overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30 shadow-lg">
                <Bot size={24} className="text-white drop-shadow" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide">SmartStock AI</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
                  <p className="text-xs text-blue-100 font-medium">Online • Ready to help</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="hover:bg-white/20 p-2.5 rounded-full transition-all duration-200 hover:rotate-90 relative z-10"
              aria-label="Close chat"
            >
              <X size={22} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white scrollbar-hide">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[85%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-2 ring-blue-200'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 ring-2 ring-gray-300'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex flex-col">
                    <div
                      className={`rounded-2xl p-4 shadow-md ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                          : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    </div>
                    <span
                      className={`text-xs text-gray-500 mt-1.5 px-1 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 shadow-md ring-2 ring-gray-300">
                    <Bot size={18} />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-md border border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Suggestions */}
            {showSuggestions && messages.length === 1 && !isTyping && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles size={16} className="text-blue-600" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quick Actions</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-700 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md text-left group"
                    >
                      <span className="group-hover:scale-105 inline-block transition-transform">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white border-t border-gray-200 shadow-inner">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-5 py-3.5 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder:text-gray-400 bg-gray-50 hover:bg-white"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-full p-3.5 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </form>
            <div className="flex items-center justify-center mt-3 gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-gray-500 font-medium">
                Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold">SmartStock AI</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
