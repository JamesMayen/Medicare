import React, { useState } from "react";
import { Send, Bot, User, Stethoscope, Heart, Brain } from "lucide-react";

// ✅ AI Chat component
const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      content:
        "Hello! I'm your AI health assistant. I can help you understand symptoms, suggest appropriate specialists, and guide you to the right care. What health concerns can I help you with today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    { text: "I have a persistent headache", icon: Brain },
    { text: "Chest pain and shortness of breath", icon: Heart },
    { text: "Need a general check-up", icon: Stethoscope },
  ];


  // === Send message handler ===
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: `Based on your symptoms "${userMessage.content}", I recommend consulting with a specialist. Would you like me to help you find appropriate doctors in your area? Please remember, this AI does not replace professional medical advice.`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question) => {
    setNewMessage(question);
  };

  return (

    <section className="max-w-md mx-auto bg-white shadow-lg rounded-xl flex flex-col h-[600px] border border-gray-200 mb-5" aria-label="AI Health Assistant Chat">

      {/* ===== Header ===== */}
      <header className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
          <Bot className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">AI Health Assistant</h2>
          <p className="text-sm opacity-90">Get instant health guidance to your health questions!
          </p>
        </div>
        <span className="ml-auto bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold" aria-label="AI assistant is online">
          Online
        </span>
      </header>
      

      {/* ===== Messages ===== */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.sender === "user"
                  ? "bg-blue-400 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              <div className="flex items-start space-x-2 bg-blue-50 rounded-lg p-4 mb-3 text-gray-700">
                {message.sender === "ai" && (
                  <Bot className="w-4 h-4 mt-0.5 text-blue-600" aria-hidden="true" />
                )}
                {message.sender === "user" && (
                  <User className="w-4 h-4 mt-0.5 text-white" aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Animation */}
        {isTyping && (
          <div className="flex justify-start" aria-live="assertive" aria-label="AI assistant is typing">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <div className="flex space-x-1" aria-hidden="true">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Quick Questions ===== */}
      <div className="px-4 py-2 border-t border-gray-200 bg-white">
        <p className="text-xs font-bold text-gray-700 mb-1">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickQuestion(q.text)}
              className="flex items-center px-3 py-1.5 text-xs border border-gray-300 rounded-full hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Ask: ${q.text}`}
            >
              <q.icon className="w-3 h-3 mr-1 text-blue-600" aria-hidden="true" />
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Input Field ===== */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <label htmlFor="chat-input" className="sr-only">Type your health question or concern</label>
          <input
            id="chat-input"
            type="text"
            placeholder="Describe your symptoms or health concerns..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-describedby="chat-disclaimer"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 cursor-pointer rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p id="chat-disclaimer" className="text-xs font-sans text-red-400 mt-2">
          ⚠️ This AI assistant provides general information only. Always consult
          healthcare professionals for medical advice.
        </p>
      </div>
    </section>
  );
};

export default AIChat;
