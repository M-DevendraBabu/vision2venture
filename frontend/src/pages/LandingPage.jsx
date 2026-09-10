import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LandingPage.css';
import { 
  FaRocket, FaChartLine, FaBrain, FaFileAlt, 
  FaCheckCircle, FaTimesCircle, FaUsers, 
  FaLightbulb, FaShieldAlt, FaCommentsDollar, FaGlobe,
  FaArrowRight, FaChartPie, FaRoute,
  FaPlay, FaLaptopCode, FaStore, FaSync, FaMagic, FaCheck, FaStar, FaBolt
} from 'react-icons/fa';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INDUSTRY_PREVIEWS = {
  saas: {
    id: 'saas',
    title: "AI Project Management Platform",
    sector: "Online • SaaS",
    score: 88,
    marketSize: "₹1.5 Lakh Cr",
    growth: "+16.8% CAGR",
    risk: "Low-Medium",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    topCompetitors: ["Asana", "Monday.com", "ClickUp"],
    keyHighlight: "High demand for automated workflow planning with AI features.",
  },
  restaurant: {
    id: 'restaurant',
    title: "Authentic Hyderabadi Cloud Kitchen",
    sector: "Offline • Food & Beverage",
    score: 92,
    marketSize: "₹35 Cr (Local)",
    growth: "+22.4% CAGR",
    risk: "Low",
    color: "#D97706",
    gradient: "linear-gradient(135deg, #D97706, #F59E0B)",
    topCompetitors: ["Behrouz Biryani", "Paradise", "Local Outlets"],
    keyHighlight: "Prime opportunity in delivery-only model with 25-minute SLA.",
  },
  ecommerce: {
    id: 'ecommerce',
    title: "Eco-Friendly D2C Apparel Brand",
    sector: "Hybrid • E-Commerce",
    score: 85,
    marketSize: "₹17,500 Cr",
    growth: "+19.2% CAGR",
    risk: "Medium",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669, #10B981)",
    topCompetitors: ["Patagonia", "Everlane", "Local D2C"],
    keyHighlight: "Strong consumer willingness to pay 18% premium for sustainable wear.",
  },
  healthtech: {
    id: 'healthtech',
    title: "Telehealth & Smart Clinic Software",
    sector: "Online • HealthTech",
    score: 94,
    marketSize: "₹2.6 Lakh Cr",
    growth: "+28.5% CAGR",
    risk: "Low",
    color: "#0891B2",
    gradient: "linear-gradient(135deg, #0891B2, #06B6D4)",
    topCompetitors: ["Practo", "Teladoc", "PharmEasy"],
    keyHighlight: "Rapid adoption in Tier-2/3 cities driving 3x year-over-year user growth.",
  }
};

const FEATURES_LIST = [
  { icon: <FaGlobe />, title: 'Market Sizing', desc: 'TAM/SAM/SOM sizing, demand levels, and growth trajectories for your target geography.', color: 'indigo', accent: '#6366F1', bgGrad: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' },
  { icon: <FaUsers />, title: 'Competitor Intel', desc: 'Identify real local & global competitors, analyze their strengths, and spot market gaps.', color: 'purple', accent: '#8B5CF6', bgGrad: 'linear-gradient(135deg, #FAF5FF, #F3E8FF)' },
  { icon: <FaChartLine />, title: 'Financial Projections', desc: 'Revenue forecasts, break-even timeline, ROI, profit margins, and cost explanations.', color: 'emerald', accent: '#10B981', bgGrad: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' },
  { icon: <FaShieldAlt />, title: 'Risk Assessment', desc: 'Technical, market, financial, and operational risk scoring with actionable mitigations.', color: 'rose', accent: '#F43F5E', bgGrad: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)' },
  { icon: <FaRoute />, title: '12-Month Roadmap', desc: '5-phase timeline with milestones, key tasks, success metrics, and cost estimates.', color: 'sky', accent: '#0EA5E9', bgGrad: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' },
  { icon: <FaChartPie />, title: 'Business Model Canvas', desc: 'Customer segments, value propositions, revenue streams, and key partner mapping.', color: 'amber', accent: '#F59E0B', bgGrad: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' },
  { icon: <FaBrain />, title: 'SWOT Matrix', desc: 'Specific strengths, weaknesses, opportunities, and threats tailored for your venture.', color: 'fuchsia', accent: '#D946EF', bgGrad: 'linear-gradient(135deg, #FDF4FF, #FAE8FF)' },
  { icon: <FaCommentsDollar />, title: 'Investor Readiness', desc: 'Score your funding readiness and receive recommendations to attract investors.', color: 'teal', accent: '#0D9488', bgGrad: 'linear-gradient(135deg, #F0FDFA, #CCFBF1)' },
  { icon: <FaRocket />, title: 'Feasibility Score', desc: 'Overall viability assessment combining all 8 modules into an overall confidence score.', color: 'violet', accent: '#4F46E5', bgGrad: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const tabContentVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.18 } }
};

const LandingPage = () => {
  const { user } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState('saas');
  const [activeTabPreview, setActiveTabPreview] = useState('Overview');

  const demoData = INDUSTRY_PREVIEWS[selectedDemo];

  return (
    <div className="landing-page">
      {/* Dynamic Multi-Color Ambient Light Mesh */}
      <div className="landing-ambient-bg" aria-hidden="true">
        <div className="ambient-orb orb-indigo"></div>
        <div className="ambient-orb orb-cyan"></div>
        <div className="ambient-orb orb-rose"></div>
        <div className="ambient-orb orb-emerald"></div>
      </div>

      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="hero-grid-bg"></div>

        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div className="hero-badge" variants={itemVariants}>
            <span className="badge-dot"></span>
            <FaMagic className="badge-sparkle" /> Next-Gen AI Startup Intelligence
          </motion.div>

          <motion.h1 className="hero-title" variants={itemVariants}>
            Validate Your Startup Idea
            <br />
            <span className="hero-gradient">Before You Invest</span>
          </motion.h1>

          <motion.p className="hero-desc" variants={itemVariants}>
            Get AI-powered market sizing, competitor intelligence, financial projections, 
            and a complete business roadmap for <strong>Online, Offline &amp; Hybrid ventures</strong> — in under 60 seconds.
          </motion.p>

          <motion.div className="hero-actions" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary">
                <FaRocket /> Start Free Analysis <FaArrowRight />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to={user ? "/dashboard" : "/login"} className="hero-btn-secondary">
                <FaPlay /> Explore Dashboard
              </Link>
            </motion.div>
          </motion.div>

          <motion.div className="hero-metrics" variants={itemVariants}>
            <div className="metric">
              <div className="metric-value color-indigo">500+</div>
              <div className="metric-label">Ideas Validated</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value color-emerald">9</div>
              <div className="metric-label">AI Modules</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value color-cyan">&lt; 60s</div>
              <div className="metric-label">Analysis Speed</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value color-amber">100%</div>
              <div className="metric-label">Free Access</div>
            </div>
          </motion.div>
        </motion.div>

        {/* ========== INTERACTIVE LIVE PREVIEW MOCKUP WITH VISUAL BANNER ========== */}
        <motion.div 
          className="hero-preview-section"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="preview-selector-bar">
            <span className="selector-title"><FaBrain /> Try Live Preview:</span>
            <button 
              className={`selector-btn btn-saas ${selectedDemo === 'saas' ? 'active' : ''}`} 
              onClick={() => setSelectedDemo('saas')}
            >
              <FaLaptopCode /> SaaS App
            </button>
            <button 
              className={`selector-btn btn-restaurant ${selectedDemo === 'restaurant' ? 'active' : ''}`} 
              onClick={() => setSelectedDemo('restaurant')}
            >
              <FaStore /> Cloud Kitchen
            </button>
            <button 
              className={`selector-btn btn-ecommerce ${selectedDemo === 'ecommerce' ? 'active' : ''}`} 
              onClick={() => setSelectedDemo('ecommerce')}
            >
              <FaSync /> D2C Brand
            </button>
            <button 
              className={`selector-btn btn-healthtech ${selectedDemo === 'healthtech' ? 'active' : ''}`} 
              onClick={() => setSelectedDemo('healthtech')}
            >
              <FaGlobe /> HealthTech
            </button>
          </div>

          <div className="interactive-preview-card">
            {/* Window Chrome Header */}
            <div className="preview-window-chrome">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <span className="window-url">vision2venture.ai/preview/{selectedDemo}</span>
              <span className="window-badge">✨ Live AI Simulation</span>
            </div>

            {/* Attractive Visual Hero Banner */}
            <div className="preview-visual-hero-banner">
              <img 
                src="/images/hero-dashboard.jpg" 
                alt="AI Startup Analytics Platform Preview" 
                className="preview-banner-img"
              />
              <div className="preview-banner-overlay">
                <div className="banner-float-chip">
                  <FaBolt className="chip-bolt" />
                  <span>Real-time Multi-Agent Validation Cockpit</span>
                </div>
              </div>
            </div>

            {/* Card Main Header */}
            <div className="preview-card-header">
              <div className="preview-title-info">
                <h3>{demoData.title}</h3>
                <span className="preview-badge" style={{ borderColor: demoData.color, color: demoData.color, background: `${demoData.color}14` }}>
                  {demoData.sector}
                </span>
              </div>
              <div className="preview-score-box">
                <span className="score-lbl">V2V Score</span>
                <div className="score-ring-wrap" style={{ borderColor: demoData.color }}>
                  <span className="score-num" style={{ color: demoData.color }}>{demoData.score}</span>
                  <span className="score-denom">/100</span>
                </div>
              </div>
            </div>

            {/* Interactive Tabs */}
            <div className="preview-tabs">
              {['Overview', 'Market', 'Competitors', 'Financials'].map(tab => (
                <button 
                  key={tab} 
                  className={`preview-tab-btn ${activeTabPreview === tab ? 'active' : ''}`}
                  onClick={() => setActiveTabPreview(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="preview-tab-content">
              <AnimatePresence mode="wait">
                {activeTabPreview === 'Overview' && (
                  <motion.div 
                    key={`overview-${selectedDemo}`}
                    className="preview-overview-grid"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tabContentVariants}
                  >
                    <div className="preview-mini-card border-indigo">
                      <span className="mini-lbl">TAM / Market Size</span>
                      <span className="mini-val color-indigo">{demoData.marketSize}</span>
                    </div>
                    <div className="preview-mini-card border-emerald">
                      <span className="mini-lbl">Growth Trajectory</span>
                      <span className="mini-val color-emerald">{demoData.growth}</span>
                    </div>
                    <div className="preview-mini-card border-cyan">
                      <span className="mini-lbl">Calculated Risk</span>
                      <span className="mini-val color-cyan">{demoData.risk}</span>
                    </div>
                  </motion.div>
                )}

                {activeTabPreview === 'Market' && (
                  <motion.div 
                    key={`market-${selectedDemo}`}
                    className="preview-market-content"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tabContentVariants}
                  >
                    <div className="market-highlight-box">
                      <FaChartLine className="box-icon" />
                      <div>
                        <strong>Market Intelligence Highlight:</strong>
                        <p>{demoData.keyHighlight}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTabPreview === 'Competitors' && (
                  <motion.div 
                    key={`competitors-${selectedDemo}`}
                    className="preview-comp-content"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tabContentVariants}
                  >
                    <span className="mini-lbl mb-2">Identified Local &amp; Global Players:</span>
                    <div className="comp-chips-wrap">
                      {demoData.topCompetitors.map((comp, idx) => (
                        <motion.span 
                          key={idx} 
                          className="comp-chip"
                          whileHover={{ scale: 1.06, y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <FaCheckCircle className="chip-icon" /> {comp}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTabPreview === 'Financials' && (
                  <motion.div 
                    key={`financials-${selectedDemo}`}
                    className="preview-fin-content"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={tabContentVariants}
                  >
                    <div className="fin-mini-bar">
                      <div className="fin-row">
                        <span>Estimated Break-even</span>
                        <strong className="color-amber">Month 7 - 9</strong>
                      </div>
                      <div className="fin-row">
                        <span>Projected Year 1 Profit Margin</span>
                        <strong className="color-emerald">28.4%</strong>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="preview-card-footer">
              <span className="footer-engine-pill">⚡ Powered by Groq AI &amp; Llama 3.3 70B Engine</span>
              <Link to={user ? "/new-idea" : "/register"} className="preview-action-link">
                Analyze Your Own Idea <FaArrowRight />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section-how">
        <div className="section-inner">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <div className="section-label">SIMPLE PROCESS</div>
            <h2 className="section-heading">How It Works</h2>
            <p className="section-sub">Three simple steps from idea to actionable intelligence</p>

            <div className="steps">
              {/* Step 1 */}
              <motion.div 
                className="step-card card-step-1" 
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
              >
                <div className="step-badge badge-indigo">01</div>
                <div className="step-icon-wrap gradient-indigo"><FaLightbulb /></div>
                <h3>Describe Your Idea</h3>
                <p>Enter your business concept, industry, location, budget, and team details. Works for online, offline, and hybrid businesses.</p>
                <div className="step-accent-bar accent-indigo"></div>
              </motion.div>
              
              <div className="step-connector">
                <svg width="60" height="24" viewBox="0 0 60 24">
                  <path d="M0 12h50M45 6l10 6-10 6" stroke="url(#connector-grad-1)" strokeWidth="2.5" fill="none" strokeDasharray="5 3"/>
                  <defs>
                    <linearGradient id="connector-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Step 2 - Enhanced with attractive visual preview art */}
              <motion.div 
                className="step-card card-step-2" 
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
              >
                <div className="step-badge badge-purple">02</div>
                <div className="step-icon-wrap gradient-purple"><FaBrain /></div>
                <h3>AI Deep-Dive Analysis</h3>
                <p>Our AI engine runs 9 comprehensive analysis modules simultaneously — market, competitors, financials, risks, and roadmap.</p>
                <div className="step-thumb-wrap">
                  <img src="/images/ai-analysis-engine.jpg" alt="AI Analysis Engine" className="step-thumb-img" />
                </div>
                <div className="step-accent-bar accent-purple"></div>
              </motion.div>
              
              <div className="step-connector">
                <svg width="60" height="24" viewBox="0 0 60 24">
                  <path d="M0 12h50M45 6l10 6-10 6" stroke="url(#connector-grad-2)" strokeWidth="2.5" fill="none" strokeDasharray="5 3"/>
                  <defs>
                    <linearGradient id="connector-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Step 3 */}
              <motion.div 
                className="step-card card-step-3" 
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
              >
                <div className="step-badge badge-emerald">03</div>
                <div className="step-icon-wrap gradient-emerald"><FaFileAlt /></div>
                <h3>Actionable Results &amp; PDF</h3>
                <p>Receive an interactive dashboard with scores, charts, SWOT maps, a 12-month roadmap timeline, and a downloadable PDF report.</p>
                <div className="step-accent-bar accent-emerald"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURES (9 MODULES WITH RICH COLOR THEMES) ========== */}
      <section className="section-features">
        <div className="section-inner">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <div className="section-label">POWERFUL MODULES</div>
            <h2 className="section-heading">Everything You Need to Decide</h2>
            <p className="section-sub">9 AI-powered analysis modules that cover every angle of your business idea</p>

            <div className="features-grid">
              {FEATURES_LIST.map((feat, i) => (
                <motion.div 
                  className={`feat-card feat-${feat.color}`} 
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                  style={{ '--card-accent': feat.accent }}
                >
                  <div className={`feat-icon feat-icon-${feat.color}`}>
                    {feat.icon}
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                  <div className="feat-hover-bar" style={{ background: feat.accent }}></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== COMPARISON ========== */}
      <section className="section-compare">
        <div className="section-inner">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <h2 className="section-heading">Why Vision2Venture?</h2>
            <p className="section-sub">See how AI-powered analysis beats traditional research</p>

            <div className="compare-grid">
              <motion.div 
                className="compare-card v2v" 
                variants={itemVariants}
                whileHover={{ y: -2 }}
              >
                <div className="compare-label color-emerald">
                  <FaRocket className="v2v-lbl-icon" /> Vision2Venture
                </div>
                <ul>
                  <li><FaCheckCircle className="icon-v2v-check" /> 60-second AI analysis</li>
                  <li><FaCheckCircle className="icon-v2v-check" /> Free to start</li>
                  <li><FaCheckCircle className="icon-v2v-check" /> Data-driven insights with explanations</li>
                  <li><FaCheckCircle className="icon-v2v-check" /> Interactive dashboard &amp; PDF export</li>
                  <li><FaCheckCircle className="icon-v2v-check" /> Online, Offline &amp; Hybrid support</li>
                  <li><FaCheckCircle className="icon-v2v-check" /> AI chatbot assistant co-pilot</li>
                </ul>
              </motion.div>

              <div className="compare-vs">VS</div>

              <motion.div 
                className="compare-card manual" 
                variants={itemVariants}
                whileHover={{ y: -2 }}
              >
                <div className="compare-label color-muted">Traditional Research</div>
                <ul>
                  <li><FaTimesCircle className="icon-manual-cross" /> Weeks of manual research</li>
                  <li><FaTimesCircle className="icon-manual-cross" /> ₹4,00,000+ consultant fees</li>
                  <li><FaTimesCircle className="icon-manual-cross" /> Gut feelings &amp; biased data</li>
                  <li><FaTimesCircle className="icon-manual-cross" /> Static PDF documents</li>
                  <li><FaTimesCircle className="icon-manual-cross" /> Limited to one business type</li>
                  <li><FaTimesCircle className="icon-manual-cross" /> No ongoing support</li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="section-cta">
        <div className="cta-glow"></div>
        <motion.div 
          className="section-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          <div className="cta-card-box">
            <motion.div className="cta-sparkle-pill" variants={itemVariants}>
              <FaStar className="star-icon" /> Fast • Reliable • Zero Setup
            </motion.div>
            <motion.h2 variants={itemVariants}>Ready to Validate Your Idea?</motion.h2>
            <motion.p variants={itemVariants}>Join hundreds of founders who make data-driven decisions.</motion.p>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary cta-btn-glow">
                <FaRocket /> Get Started Free <FaArrowRight />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
