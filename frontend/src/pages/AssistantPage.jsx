import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPaperPlane, FaRobot, FaUser, FaTrash, FaLightbulb, 
  FaRocket, FaChartLine, FaShieldAlt, FaQuestionCircle,
  FaMagic, FaCopy, FaCheck, FaArrowLeft
} from 'react-icons/fa';
import api from '../services/api';
import '../styles/Assistant.css';

const QUICK_PROMPTS = [
  { icon: <FaRocket />, text: "How do I validate a new startup idea?" },
  { icon: <FaChartLine />, text: "Explain how financial projections work" },
  { icon: <FaLightbulb />, text: "What analysis modules does V2V offer?" },
  { icon: <FaShieldAlt />, text: "How is the risk score calculated?" }
];

const AssistantPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Welcome to Vision2Venture AI Co-Pilot! 🚀\n\nI can analyze your business models, evaluate market opportunities, review risk scores, and help refine your pitch. How can I assist your venture today?", 
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      text: userText, 
      sender: 'user',
      timestamp: timeStr
    }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => inputRef.current?.focus(), 50);

    try {
      const { data } = await api.post('/chatbot/message', { message: userText });
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: data.reply, 
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "I'm having trouble reaching the server right now. Please ensure the backend is running and try again.", 
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        id: Date.now(), 
        text: "Conversation reset. What startup question would you like to explore next?", 
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handlePromptClick = (promptText) => {
    setInput(promptText);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="assistant-page">
      <div className="assistant-glass-wrapper">
        
        {/* Sidebar Panel */}
        <aside className="assistant-sidebar">
          <div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="back-nav-btn mb-md flex align-center gap-xs"
              type="button"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <FaArrowLeft size={12} /> Back to Dashboard
            </button>

            <div className="assistant-brand">
              <div className="avatar-ring">
                <FaRobot className="avatar-icon" />
                <span className="online-indicator"></span>
              </div>
              <div className="brand-info">
                <h2>V2V Assistant</h2>
                <span className="model-tag"><FaMagic className="sparkle-icon" /> Groq Llama 3.3 70B</span>
              </div>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          <div className="quick-prompts-section">
            <h3><FaQuestionCircle /> Suggested Topics</h3>
            <div className="prompts-list">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button 
                  key={i} 
                  className="prompt-chip" 
                  onClick={() => handlePromptClick(prompt.text)}
                  type="button"
                >
                  <span className="chip-icon">{prompt.icon}</span>
                  <span className="chip-text">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="clear-chat-btn" onClick={clearChat} type="button">
              <FaTrash /> Clear Conversation
            </button>
          </div>
        </aside>

        {/* Main Chat Interface */}
        <main className="assistant-main-chat">
          
          {/* Header Bar */}
          <header className="chat-header-bar flex-between align-center">
            <div className="chat-header-left">
              <div className="header-status-badge">
                <span className="status-dot"></span>
                <span>Active Session</span>
              </div>
              <p className="header-subtitle">Ask questions about market size, business plans, financial models, or risk factors</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="chat-back-btn"
              type="button"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <FaArrowLeft size={12} /> Back to Dashboard
            </button>
          </header>

          {/* Messages Stream */}
          <div className="messages-viewport">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === 'bot' ? <FaRobot /> : <FaUser />}
                </div>
                
                <div className="message-bubble-wrap">
                  <div className="message-header">
                    <span className="sender-name">{msg.sender === 'bot' ? 'Vision2Venture AI' : 'You'}</span>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                  
                  <div className="message-body">
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx}>{line || <br />}</p>
                    ))}
                  </div>

                  {msg.sender === 'bot' && (
                    <button 
                      className="copy-msg-btn" 
                      onClick={() => handleCopy(msg.id, msg.text)}
                      title="Copy message"
                      type="button"
                    >
                      {copiedId === msg.id ? <FaCheck className="copied-icon" /> : <FaCopy />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row bot typing">
                <div className="message-avatar"><FaRobot /></div>
                <div className="message-bubble-wrap">
                  <div className="message-header">
                    <span className="sender-name">Vision2Venture AI</span>
                  </div>
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Pinned Input Form */}
          <div className="chat-input-bar-container">
            <form className="chat-input-pill" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask V2V AI assistant about your startup idea..."
                autoComplete="off"
              />
              <button 
                type="submit" 
                className="send-pill-btn" 
                disabled={!input.trim() || isTyping}
                title="Send Message"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AssistantPage;
