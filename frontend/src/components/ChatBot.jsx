import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import axios from 'axios';
import './ChatBot.css';

const api = axios.create({ baseURL: '/api' });

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm the V2V Assistant. Ask me anything about startup validation, business planning, or how to use the platform.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/chatbot/message', { message: userText });
      setMessages(prev => [...prev, { id: Date.now(), text: data.reply, sender: 'bot' }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I couldn't connect to the server. Please try again.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar"><FaRobot /></div>
              <div>
                <h3>V2V Assistant</h3>
                <span className="chatbot-status">Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={toggleChat}><FaTimes /></button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chatbot-msg ${msg.sender}`}>
                <div className="chatbot-msg-bubble">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-msg bot">
                <div className="chatbot-msg-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="chatbot-input"
              autoComplete="off"
            />
            <button type="submit" className="chatbot-send" disabled={!input.trim() || isTyping}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
      
      <button 
        className={`chatbot-fab ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chat assistant"
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>
    </div>
  );
};

export default ChatBot;
