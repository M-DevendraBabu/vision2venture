import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPaperPlane, FaRobot, FaUser, FaTrash, FaLightbulb, 
  FaRocket, FaChartLine, FaShieldAlt, FaMagic, FaCopy, 
  FaCheck, FaArrowLeft, FaTimes, FaBars, FaRedoAlt,
  FaRegThumbsUp, FaRegThumbsDown, FaCoins, FaCompass, 
  FaPlus, FaChevronRight, FaBolt
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Assistant.css';

// 4 High-Impact Gemini Hero Prompt Cards
const HERO_PROMPT_CARDS = [
  {
    id: 'validate',
    icon: <FaRocket style={{ color: '#38bdf8' }} />,
    bgGlow: 'rgba(56, 189, 248, 0.15)',
    title: 'Validate Startup Idea',
    description: 'Test market feasibility, problem-solution fit, and TAM for my startup',
    prompt: 'Can you help me rigorously validate my startup idea? What are the key customer pain points, market risks, and feasibility checks I should perform?'
  },
  {
    id: 'finance',
    icon: <FaCoins style={{ color: '#fbbf24' }} />,
    bgGlow: 'rgba(251, 191, 36, 0.15)',
    title: 'CapEx & Break-Even Modeling',
    description: 'Calculate setup CapEx, monthly OpEx burn, and break-even in Indian Rupees',
    prompt: 'How do I accurately calculate my startup setup capital (CapEx), monthly operating burn (OpEx), and realistic unit economics in Indian Rupees (₹)?'
  },
  {
    id: 'competitor',
    icon: <FaShieldAlt style={{ color: '#a855f7' }} />,
    bgGlow: 'rgba(168, 85, 247, 0.15)',
    title: 'Competitor Moats & Gaps',
    description: 'Analyze competitive positioning, defensibility, and underserved niches',
    prompt: 'How do I identify high-leverage competitor gaps and build a defensible product moat against well-funded incumbents?'
  },
  {
    id: 'roadmap',
    icon: <FaCompass style={{ color: '#34d399' }} />,
    bgGlow: 'rgba(52, 211, 153, 0.15)',
    title: '12-Month Launch Roadmap',
    description: 'Generate a phased execution blueprint with legal compliance & KPIs',
    prompt: 'Generate a 12-month phased execution roadmap for my venture, covering legal incorporation, MVP launch, and scaling milestones.'
  }
];

// Quick suggestion chips above the input
const QUICK_SUGGESTION_CHIPS = [
  { text: '💡 Stress-test my business model', prompt: 'Stress-test my business model: what are the 3 biggest assumptions that could fail?' },
  { text: '💰 How to reduce CAC in India', prompt: 'What are the most cost-effective customer acquisition channels (CAC) for early-stage startups in India?' },
  { text: '📊 Calculate break-even units', prompt: 'Walk me through how to calculate the monthly break-even units and payback period for my startup.' },
  { text: '🛡️ Regulatory approvals needed', prompt: 'What statutory registrations (MCA, GSTIN, DPIIT, Trademark) are required before launching in India?' }
];

// Helper: Lightweight inline formatting for markdown bold, code, and lists
const renderFormattedMessage = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Trim line for checking
    const trimmed = line.trim();

    // Empty line -> spacing
    if (!trimmed) {
      return <div key={idx} className="gemini-msg-spacer" />;
    }

    // Headers: ### Header
    if (line.startsWith('### ')) {
      return <h4 key={idx} className="gemini-msg-h4">{renderInlineStyles(line.slice(4))}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={idx} className="gemini-msg-h3">{renderInlineStyles(line.slice(3))}</h3>;
    }

    // Bullet points: * or -
    if (/^[\*\-]\s+/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^[\*\-]\s+/, '');
      return (
        <div key={idx} className="gemini-msg-bullet">
          <span className="gemini-bullet-dot" />
          <span className="gemini-bullet-text">{renderInlineStyles(bulletContent)}</span>
        </div>
      );
    }

    // Numbered list: 1. or 2.
    if (/^\d+\.\s+/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="gemini-msg-numbered">
            <span className="gemini-number-badge">{numMatch[1]}</span>
            <span className="gemini-numbered-text">{renderInlineStyles(numMatch[2])}</span>
          </div>
        );
      }
    }

    // Regular paragraph
    return <p key={idx} className="gemini-msg-p">{renderInlineStyles(line)}</p>;
  });
};

// Helper: Format **bold** and `code` inline
const renderInlineStyles = (content) => {
  if (!content) return '';
  // Split by bold (**...**) and inline code (`...`)
  const parts = content.split(/(\*[\*].*?\*[\*]|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="gemini-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="gemini-code-badge">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const AssistantPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const userName = user?.name ? user.name.split(' ')[0] : 'Founder';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    textareaRef.current?.focus();
    // Auto-adjust layout to fit viewport
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Handle textarea auto-resize
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const sendMessage = async (textToSend) => {
    const userText = (textToSend || input).trim();
    if (!userText || isTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: userText, sender: 'user', timestamp: timeStr }
    ]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsTyping(true);

    try {
      const { data } = await api.post('/chatbot/message', { message: userText });
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now() + 1, 
          text: data.reply, 
          sender: 'bot', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now() + 1, 
          text: "I\'m having trouble connecting to the intelligence engine. Please ensure the backend is running and try again.", 
          sender: 'bot', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handlePromptCardClick = (promptText) => {
    sendMessage(promptText);
  };

  const handleChipClick = (promptText) => {
    setInput(promptText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id, type) => {
    setFeedback(prev => ({
      ...prev,
      [id]: prev[id] === type ? null : type
    }));
  };

  const handleRegenerate = (msgIndex) => {
    // Find previous user message
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i]?.sender === 'user') {
        sendMessage(messages[i].text);
        break;
      }
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  return (
    <div className="gemini-assistant-page">
      
      {/* Background Ambient Lights */}
      <div className="gemini-ambient-glow top-left" />
      <div className="gemini-ambient-glow bottom-right" />

      <div className="gemini-app-container">

        {/* ========================================================== */}
        {/* 1. GEMINI SLEEK SIDEBAR                                    */}
        {/* ========================================================== */}
        <aside className={`gemini-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
          <div className="gemini-sidebar-inner">
            
            {/* New Chat Pill Button */}
            <div className="gemini-sidebar-top">
              <button 
                type="button" 
                className="gemini-new-chat-btn" 
                onClick={startNewChat}
                title="Start a fresh conversation"
              >
                <FaPlus className="plus-icon" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Playbooks & Topics */}
            <div className="gemini-sidebar-nav">
              <div className="gemini-nav-section-title">Startup Playbooks</div>
              {HERO_PROMPT_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className="gemini-nav-item"
                  onClick={() => sendMessage(card.prompt)}
                >
                  <span className="gemini-nav-icon">{card.icon}</span>
                  <span className="gemini-nav-label">{card.title}</span>
                </button>
              ))}

              <div className="gemini-nav-section-title" style={{ marginTop: '1.2rem' }}>Quick Actions</div>
              <button
                type="button"
                className="gemini-nav-item"
                onClick={() => navigate('/new-idea')}
              >
                <span className="gemini-nav-icon"><FaBolt style={{ color: '#f59e0b' }} /></span>
                <span className="gemini-nav-label">Analyze New Startup</span>
              </button>
              <button
                type="button"
                className="gemini-nav-item"
                onClick={() => navigate('/dashboard')}
              >
                <span className="gemini-nav-icon"><FaArrowLeft style={{ color: '#818cf8' }} /></span>
                <span className="gemini-nav-label">Back to Dashboard</span>
              </button>
            </div>

            {/* Sidebar Bottom Status */}
            <div className="gemini-sidebar-bottom">
              <div className="gemini-model-badge">
                <div className="gemini-pulse-dot" />
                <div className="gemini-model-info">
                  <span className="gemini-model-name">Groq Llama 3.3 70B</span>
                  <span className="gemini-model-status">Engine Active &amp; Ready</span>
                </div>
              </div>

              {messages.length > 0 && (
                <button 
                  type="button" 
                  className="gemini-clear-btn" 
                  onClick={startNewChat}
                  title="Clear conversation"
                >
                  <FaTrash size={12} /> Clear Chat
                </button>
              )}
            </div>

          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="gemini-sidebar-backdrop" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* ========================================================== */}
        {/* 2. MAIN GEMINI CHAT CANVAS                                 */}
        {/* ========================================================== */}
        <main className="gemini-chat-canvas">

          {/* Top Navigation Bar */}
          <header className="gemini-chat-topbar">
            <div className="gemini-topbar-left">
              <button 
                type="button" 
                className="gemini-icon-btn sidebar-toggle"
                onClick={() => setSidebarOpen(prev => !prev)}
                title="Toggle Sidebar"
              >
                <FaBars />
              </button>
              
              <div className="gemini-title-wrap">
                <div className="gemini-brand-badge">
                  <FaMagic className="gemini-sparkle-icon" />
                  <span className="gemini-brand-title">Vision2Venture AI</span>
                </div>
                <span className="gemini-pill-sub">Venture Co-Pilot</span>
              </div>
            </div>

            <div className="gemini-topbar-right">
              <button 
                type="button" 
                className="gemini-topbar-action-btn"
                onClick={startNewChat}
                title="Reset to Welcome Screen"
              >
                <FaPlus size={12} /> <span className="hide-on-mobile">New Chat</span>
              </button>
              <button 
                type="button" 
                className="gemini-topbar-action-btn exit"
                onClick={() => navigate('/dashboard')}
                title="Return to Dashboard"
              >
                <FaArrowLeft size={12} /> <span className="hide-on-mobile">Dashboard</span>
              </button>
            </div>
          </header>

          {/* Messages & Hero Area */}
          <div className="gemini-viewport">
            
            {/* ---------------------------------------------------- */}
            {/* HERO WELCOME SCREEN (When conversation is fresh)      */}
            {/* ---------------------------------------------------- */}
            {messages.length === 0 ? (
              <div className="gemini-hero-container animate-fade-in">
                
                <div className="gemini-hero-badge">
                  <FaMagic style={{ color: '#c084fc' }} />
                  <span>AI Startup Copilot</span>
                </div>

                <h1 className="gemini-hero-heading">
                  <span className="gemini-greeting">Hello, {userName}.</span>
                  <span className="gemini-gradient-text">What venture are we building today?</span>
                </h1>

                <p className="gemini-hero-sub">
                  Ask anything about your startup idea — test market demand, build financial unit economics, analyze competitors, or map your 12-month launch.
                </p>

                {/* 2x2 Gemini Prompt Grid */}
                <div className="gemini-prompt-grid">
                  {HERO_PROMPT_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className="gemini-prompt-card"
                      onClick={() => handlePromptCardClick(card.prompt)}
                    >
                      <div className="gemini-card-header">
                        <div className="gemini-card-icon-circle" style={{ background: card.bgGlow }}>
                          {card.icon}
                        </div>
                        <FaChevronRight className="gemini-card-arrow" />
                      </div>
                      <h4 className="gemini-card-title">{card.title}</h4>
                      <p className="gemini-card-desc">{card.description}</p>
                    </button>
                  ))}
                </div>

              </div>
            ) : (
              /* ---------------------------------------------------- */
              /* CONVERSATION STREAM                                  */
              /* ---------------------------------------------------- */
              <div className="gemini-messages-stream">
                {messages.map((msg, idx) => (
                  <div key={msg.id} className={`gemini-msg-row ${msg.sender} animate-slide-up`}>
                    
                    {/* Bot Avatar */}
                    {msg.sender === 'bot' && (
                      <div className="gemini-avatar bot">
                        <FaMagic />
                      </div>
                    )}

                    <div className="gemini-msg-content-wrap">
                      
                      {/* Sender Meta */}
                      <div className="gemini-msg-meta">
                        <span className="gemini-sender-label">
                          {msg.sender === 'bot' ? 'Vision2Venture AI' : 'You'}
                        </span>
                        <span className="gemini-msg-time">{msg.timestamp}</span>
                      </div>

                      {/* Message Body */}
                      <div className={`gemini-msg-bubble ${msg.sender}`}>
                        {msg.sender === 'bot' ? (
                          <div className="gemini-formatted-content">
                            {renderFormattedMessage(msg.text)}
                          </div>
                        ) : (
                          <p className="gemini-user-text">{msg.text}</p>
                        )}
                      </div>

                      {/* Bot Action Bar (Copy, Thumbs, Regenerate) */}
                      {msg.sender === 'bot' && (
                        <div className="gemini-msg-actions">
                          <button
                            type="button"
                            className="gemini-action-btn"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <><FaCheck style={{ color: '#34d399' }} /> <span>Copied</span></>
                            ) : (
                              <><FaCopy /> <span>Copy</span></>
                            )}
                          </button>

                          <button
                            type="button"
                            className={`gemini-action-btn ${feedback[msg.id] === 'up' ? 'active' : ''}`}
                            onClick={() => handleFeedback(msg.id, 'up')}
                            title="Good response"
                          >
                            <FaRegThumbsUp />
                          </button>

                          <button
                            type="button"
                            className={`gemini-action-btn ${feedback[msg.id] === 'down' ? 'active' : ''}`}
                            onClick={() => handleFeedback(msg.id, 'down')}
                            title="Poor response"
                          >
                            <FaRegThumbsDown />
                          </button>

                          <button
                            type="button"
                            className="gemini-action-btn"
                            onClick={() => handleRegenerate(idx)}
                            title="Regenerate response"
                          >
                            <FaRedoAlt /> <span>Retry</span>
                          </button>
                        </div>
                      )}

                    </div>

                    {/* User Avatar */}
                    {msg.sender === 'user' && (
                      <div className="gemini-avatar user">
                        <FaUser />
                      </div>
                    )}

                  </div>
                ))}

                {/* Gemini Pulsing Wave Typing Indicator */}
                {isTyping && (
                  <div className="gemini-msg-row bot animate-fade-in">
                    <div className="gemini-avatar bot thinking">
                      <FaMagic />
                    </div>
                    <div className="gemini-msg-content-wrap">
                      <div className="gemini-msg-meta">
                        <span className="gemini-sender-label">Vision2Venture AI</span>
                        <span className="gemini-thinking-tag">Thinking...</span>
                      </div>
                      <div className="gemini-typing-pill">
                        <span className="gemini-dot dot-1" />
                        <span className="gemini-dot dot-2" />
                        <span className="gemini-dot dot-3" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

          </div>

          {/* ========================================================== */}
          {/* 3. GEMINI FLOATING BOTTOM INPUT CAPSULE                    */}
          {/* ========================================================== */}
          <div className="gemini-bottom-dock">
            
            {/* Quick Follow-up Chips when in conversation */}
            {messages.length > 0 && (
              <div className="gemini-chips-bar">
                {QUICK_SUGGESTION_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    className="gemini-chip-btn"
                    onClick={() => handleChipClick(chip.prompt)}
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input Capsule Form */}
            <form className="gemini-input-capsule" onSubmit={handleSubmit}>
              
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask Vision2Venture AI about your startup idea, finances, or roadmap..."
                className="gemini-textarea"
              />

              <div className="gemini-input-controls">
                {input.trim() && (
                  <button
                    type="button"
                    className="gemini-clear-input-btn"
                    onClick={() => {
                      setInput('');
                      if (textareaRef.current) textareaRef.current.style.height = 'auto';
                    }}
                    title="Clear text"
                  >
                    <FaTimes />
                  </button>
                )}

                <button
                  type="submit"
                  className={`gemini-send-btn ${input.trim() ? 'active' : ''}`}
                  disabled={!input.trim() || isTyping}
                  title="Send message (Enter)"
                >
                  <FaPaperPlane />
                </button>
              </div>

            </form>

            <div className="gemini-footer-note">
              <span>✨ Vision2Venture AI Co-Pilot can make mistakes. Verify critical financial &amp; legal projections.</span>
            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default AssistantPage;
