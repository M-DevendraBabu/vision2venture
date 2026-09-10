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
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
  }
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } }
};

const LandingPage = () => {
  const { user } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState('saas');
  const [activeTabPreview, setActiveTabPreview] = useState('Overview');

  const demoData = INDUSTRY_PREVIEWS[selectedDemo];

  return (
    <div className="landing-page">
      {/* Dynamic Ambient Light Mesh Background */}
      <div className="landing-ambient-bg" aria-hidden="true">
        <div className="ambient-orb orb-primary"></div>
        <div className="ambient-orb orb-cyan"></div>
        <div className="ambient-orb orb-violet"></div>
        <div className="ambient-orb orb-teal"></div>
        <div className="ambient-grid-overlay"></div>
      </div>

      {/* ============================================================ */}
      {/* 1. ASYMMETRIC EDITORIAL HERO SECTION                         */}
      {/* ============================================================ */}
      <section className="hero-editorial-section">
        <div className="hero-editorial-container">
          
          {/* LEFT SIDE: Editorial Typography, Headline, CTAs & Metric Strip */}
          <motion.div 
            className="hero-editorial-col"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Status Eyebrow Badge */}
            <motion.div className="hero-status-pill" variants={itemVariants}>
              <span className="status-indicator-dot"></span>
              <FaMagic className="badge-sparkle" />
              <span>Next-Gen AI Startup Intelligence</span>
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1 className="hero-main-title" variants={itemVariants}>
              <span className="title-lead">Validate Your Startup Idea</span>
              <span className="title-accent-wrap">
                <span className="hero-gradient-text">Before You Invest</span>
              </span>
            </motion.h1>

            {/* Supporting Hero Description */}
            <motion.p className="hero-supporting-desc" variants={itemVariants}>
              Get AI-powered market sizing, competitor intelligence, financial projections, 
              and a complete business roadmap for <strong>Online, Offline &amp; Hybrid ventures</strong> — in under 60 seconds.
            </motion.p>

            {/* CTA Actions */}
            <motion.div className="hero-cta-actions" variants={itemVariants}>
              <motion.div whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary">
                  <FaRocket className="btn-icon-rocket" />
                  <span>Start Free Analysis</span>
                  <FaArrowRight className="btn-icon-arrow" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to={user ? "/dashboard" : "/login"} className="hero-btn-secondary">
                  <FaPlay className="btn-icon-play" />
                  <span>Explore Dashboard</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Connected Intelligence Metrics Strip */}
            <motion.div className="hero-intelligence-strip" variants={itemVariants}>
              <div className="intelligence-tile">
                <div className="intel-metric-row">
                  <span className="intel-number color-indigo">500+</span>
                  <span className="intel-dot dot-indigo"></span>
                </div>
                <div className="intel-label">Ideas Validated</div>
              </div>

              <div className="intel-separator"></div>

              <div className="intelligence-tile">
                <div className="intel-metric-row">
                  <span className="intel-number color-emerald">9</span>
                  <span className="intel-dot dot-emerald"></span>
                </div>
                <div className="intel-label">AI Modules</div>
              </div>

              <div className="intel-separator"></div>

              <div className="intelligence-tile">
                <div className="intel-metric-row">
                  <span className="intel-number color-cyan">&lt; 60s</span>
                  <span className="intel-dot dot-cyan"></span>
                </div>
                <div className="intel-label">Analysis Speed</div>
              </div>

              <div className="intel-separator"></div>

              <div className="intelligence-tile">
                <div className="intel-metric-row">
                  <span className="intel-number color-amber">100%</span>
                  <span className="intel-dot dot-amber"></span>
                </div>
                <div className="intel-label">Free Access</div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: Layered Miniature Intelligence Workspace */}
          <motion.div 
            className="hero-workspace-col hero-visual-stage"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="workspace-layered-canvas">
              
              {/* Layer 3: Floating Insight Card - Growth (Top-Right) */}
              <motion.div 
                className="floating-depth-card floating-growth-card"
                initial={{ opacity: 0, x: 20, y: -16 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.55, delay: 0.5 }}
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <div className="floating-card-icon-box bg-emerald-subtle">
                  <FaChartLine className="floating-card-icon color-emerald" />
                </div>
                <div className="floating-card-meta">
                  <span className="floating-card-value">{demoData.growth}</span>
                  <span className="floating-card-caption">Market Sizing Velocity</span>
                </div>
                <span className="floating-live-badge">Verified</span>
              </motion.div>

              {/* Layer 3: Floating Insight Card - Risk Mitigation (Bottom-Left) */}
              <motion.div 
                className="floating-depth-card floating-risk-card"
                initial={{ opacity: 0, x: -20, y: 16 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.55, delay: 0.6 }}
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <div className="floating-card-icon-box bg-cyan-subtle">
                  <FaShieldAlt className="floating-card-icon color-cyan" />
                </div>
                <div className="floating-card-meta">
                  <span className="floating-card-value">{demoData.risk} Risk Profile</span>
                  <span className="floating-card-caption">Automated Mitigation Playbook</span>
                </div>
              </motion.div>

              {/* Layer 2: Main Workspace Cockpit Surface */}
              <div className="main-workspace-cockpit">
                
                {/* Chrome Window Header */}
                <div className="workspace-chrome-header">
                  <div className="chrome-dot-group">
                    <span className="chrome-dot dot-close"></span>
                    <span className="chrome-dot dot-min"></span>
                    <span className="chrome-dot dot-expand"></span>
                  </div>
                  <div className="chrome-url-pill">
                    <span className="chrome-lock">🔒</span>
                    <span className="chrome-path">vision2venture.ai/preview/{selectedDemo}</span>
                  </div>
                  <div className="chrome-live-chip">
                    <span className="chip-pulsing-dot"></span>
                    <span>Live AI Simulation</span>
                  </div>
                </div>

                {/* Sector Switcher Toolbar */}
                <div className="workspace-sector-toolbar">
                  <span className="sector-toolbar-label"><FaBrain /> Try Live Preview:</span>
                  <div className="sector-pill-row">
                    <button 
                      className={`sector-tab-pill ${selectedDemo === 'saas' ? 'active saas' : ''}`}
                      onClick={() => setSelectedDemo('saas')}
                    >
                      <FaLaptopCode /> <span>SaaS App</span>
                    </button>
                    <button 
                      className={`sector-tab-pill ${selectedDemo === 'restaurant' ? 'active restaurant' : ''}`}
                      onClick={() => setSelectedDemo('restaurant')}
                    >
                      <FaStore /> <span>Cloud Kitchen</span>
                    </button>
                    <button 
                      className={`sector-tab-pill ${selectedDemo === 'ecommerce' ? 'active ecommerce' : ''}`}
                      onClick={() => setSelectedDemo('ecommerce')}
                    >
                      <FaSync /> <span>D2C Brand</span>
                    </button>
                    <button 
                      className={`sector-tab-pill ${selectedDemo === 'healthtech' ? 'active healthtech' : ''}`}
                      onClick={() => setSelectedDemo('healthtech')}
                    >
                      <FaGlobe /> <span>HealthTech</span>
                    </button>
                  </div>
                </div>

                {/* Visual Hero Banner Viewport */}
                <div className="workspace-hero-banner">
                  <img 
                    src="/images/hero-dashboard.jpg" 
                    alt="AI Startup Analytics Platform Preview" 
                    className="workspace-hero-img"
                  />
                  <div className="workspace-banner-gradient-shield">
                    <div className="cockpit-engine-pill">
                      <FaBolt className="engine-bolt" />
                      <span>Real-time Multi-Agent Validation Cockpit</span>
                    </div>
                  </div>
                </div>

                {/* Dossier Card Header */}
                <div className="workspace-identity-card">
                  <div className="dossier-left-meta">
                    <h3 className="dossier-headline">{demoData.title}</h3>
                    <div className="dossier-badge-row">
                      <span 
                        className="dossier-tag" 
                        style={{ borderColor: demoData.color, color: demoData.color, background: `${demoData.color}14` }}
                      >
                        {demoData.sector}
                      </span>
                      <span className="dossier-status-check">
                        <FaCheck className="check-mini" /> Multi-Domain Model
                      </span>
                    </div>
                  </div>

                  <div className="dossier-score-cockpit">
                    <span className="score-heading">V2V Score</span>
                    <div className="score-dial-wrap" style={{ borderColor: demoData.color }}>
                      <span className="score-digits" style={{ color: demoData.color }}>{demoData.score}</span>
                      <span className="score-total">/100</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Navigation Tabs */}
                <div className="workspace-nav-menu">
                  {['Overview', 'Market', 'Competitors', 'Financials'].map(tab => (
                    <button 
                      key={tab} 
                      className={`workspace-menu-item ${activeTabPreview === tab ? 'active' : ''}`}
                      onClick={() => setActiveTabPreview(tab)}
                    >
                      <span>{tab}</span>
                      {activeTabPreview === tab && (
                        <motion.div layoutId="activeWorkspaceTabLine" className="menu-active-line" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Workspace Tab Body */}
                <div className="workspace-tab-viewport">
                  <AnimatePresence mode="wait">
                    {activeTabPreview === 'Overview' && (
                      <motion.div 
                        key={`overview-${selectedDemo}`}
                        className="cockpit-overview-matrix"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tabContentVariants}
                      >
                        <div className="kpi-cockpit-tile border-indigo">
                          <span className="kpi-caption">TAM / Market Size</span>
                          <span className="kpi-data-val color-indigo">{demoData.marketSize}</span>
                        </div>
                        <div className="kpi-cockpit-tile border-emerald">
                          <span className="kpi-caption">Growth Trajectory</span>
                          <span className="kpi-data-val color-emerald">{demoData.growth}</span>
                        </div>
                        <div className="kpi-cockpit-tile border-cyan">
                          <span className="kpi-caption">Calculated Risk</span>
                          <span className="kpi-data-val color-cyan">{demoData.risk}</span>
                        </div>
                      </motion.div>
                    )}

                    {activeTabPreview === 'Market' && (
                      <motion.div 
                        key={`market-${selectedDemo}`}
                        className="cockpit-market-view"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tabContentVariants}
                      >
                        <div className="market-intel-banner-box">
                          <FaChartLine className="market-intel-icon" />
                          <div className="market-intel-copy">
                            <strong>Market Intelligence Highlight:</strong>
                            <p>{demoData.keyHighlight}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTabPreview === 'Competitors' && (
                      <motion.div 
                        key={`competitors-${selectedDemo}`}
                        className="cockpit-comp-view"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tabContentVariants}
                      >
                        <span className="comp-matrix-caption">Identified Local &amp; Global Players:</span>
                        <div className="comp-pills-row">
                          {demoData.topCompetitors.map((comp, idx) => (
                            <motion.span 
                              key={idx} 
                              className="comp-status-chip"
                              whileHover={{ scale: 1.05, y: -2 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <FaCheckCircle className="chip-check-icon" /> <span>{comp}</span>
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTabPreview === 'Financials' && (
                      <motion.div 
                        key={`financials-${selectedDemo}`}
                        className="cockpit-fin-view"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tabContentVariants}
                      >
                        <div className="fin-cockpit-strip">
                          <div className="fin-strip-cell">
                            <span className="fin-cell-label">Estimated Break-even</span>
                            <strong className="fin-cell-figure color-amber">Month 7 - 9</strong>
                          </div>
                          <div className="fin-strip-divider"></div>
                          <div className="fin-strip-cell">
                            <span className="fin-cell-label">Projected Year 1 Profit Margin</span>
                            <strong className="fin-cell-figure color-emerald">28.4%</strong>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Workspace Footer Action Strip */}
                <div className="workspace-footer-strip">
                  <span className="workspace-engine-pill">⚡ Powered by Groq AI &amp; Llama 3.3 70B Engine</span>
                  <Link to={user ? "/new-idea" : "/register"} className="workspace-deep-link">
                    <span>Analyze Your Own Idea</span>
                    <FaArrowRight className="arrow-hover-move" />
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. HOW IT WORKS (CONNECTED SEQUENCE ARCHITECTURE)           */}
      {/* ============================================================ */}
      <section className="section-how">
        <div className="section-inner">
          <motion.div 
            initial={false}
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={containerVariants}
          >
            <div className="section-label">SIMPLE PROCESS</div>
            <h2 className="section-heading">How It Works</h2>
            <p className="section-sub">Three simple steps from idea to actionable intelligence</p>

            <div className="steps-connected-grid">
              {/* Step 1 */}
              <motion.div 
                className="step-card card-step-1" 
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className="step-card-header">
                  <div className="step-badge badge-indigo">01</div>
                  <div className="step-icon-wrap gradient-indigo"><FaLightbulb /></div>
                </div>
                <h3>Describe Your Idea</h3>
                <p>Enter your business concept, industry, location, budget, and team details. Works for online, offline, and hybrid businesses.</p>
                <div className="step-accent-bar accent-indigo"></div>
              </motion.div>
              
              {/* Step Connector 1 */}
              <div className="step-flow-arrow">
                <svg width="48" height="24" viewBox="0 0 48 24">
                  <path d="M0 12h38M34 6l8 6-8 6" stroke="#6366F1" strokeWidth="2.5" fill="none" strokeDasharray="4 3"/>
                </svg>
              </div>
              
              {/* Step 2 */}
              <motion.div 
                className="step-card card-step-2" 
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className="step-card-header">
                  <div className="step-badge badge-purple">02</div>
                  <div className="step-icon-wrap gradient-purple"><FaBrain /></div>
                </div>
                <h3>AI Deep-Dive Analysis</h3>
                <p>Our AI engine runs 9 comprehensive analysis modules simultaneously — market, competitors, financials, risks, and roadmap.</p>
                <div className="step-thumb-wrap">
                  <img src="/images/ai-analysis-engine.jpg" alt="AI Analysis Engine" className="step-thumb-img" />
                </div>
                <div className="step-accent-bar accent-purple"></div>
              </motion.div>
              
              {/* Step Connector 2 */}
              <div className="step-flow-arrow">
                <svg width="48" height="24" viewBox="0 0 48 24">
                  <path d="M0 12h38M34 6l8 6-8 6" stroke="#10B981" strokeWidth="2.5" fill="none" strokeDasharray="4 3"/>
                </svg>
              </div>
              
              {/* Step 3 */}
              <motion.div 
                className="step-card card-step-3" 
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className="step-card-header">
                  <div className="step-badge badge-emerald">03</div>
                  <div className="step-icon-wrap gradient-emerald"><FaFileAlt /></div>
                </div>
                <h3>Actionable Results &amp; PDF</h3>
                <p>Receive an interactive dashboard with scores, charts, SWOT maps, a 12-month roadmap timeline, and a downloadable PDF report.</p>
                <div className="step-accent-bar accent-emerald"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. 9 POWERFUL MODULES (MODERN ASYMMETRIC GRID)              */}
      {/* ============================================================ */}
      <section className="section-features">
        <div className="section-inner">
          <motion.div 
            initial={false}
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={containerVariants}
          >
            <div className="section-label">POWERFUL MODULES</div>
            <h2 className="section-heading">Everything You Need to Decide</h2>
            <p className="section-sub">9 AI-powered analysis modules that cover every angle of your business idea</p>

            <div className="features-modular-grid">
              {FEATURES_LIST.map((feat, i) => (
                <motion.div 
                  className={`feat-card-refined feat-${feat.color}`} 
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  style={{ '--card-accent': feat.accent }}
                >
                  <div className={`feat-icon-bubble feat-icon-${feat.color}`}>
                    {feat.icon}
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                  <div className="feat-bottom-accent" style={{ background: feat.accent }}></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. COMPARISON MATRIX (VISION2VENTURE VS TRADITIONAL)         */}
      {/* ============================================================ */}
      <section className="section-compare">
        <div className="section-inner">
          <motion.div 
            initial={false}
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={containerVariants}
          >
            <h2 className="section-heading">Why Vision2Venture?</h2>
            <p className="section-sub">See how AI-powered analysis beats traditional research</p>

            <div className="compare-matrix-layout">
              {/* Vision2Venture Premium Card */}
              <motion.div 
                className="compare-box v2v-premium-box" 
                variants={itemVariants}
                whileHover={{ y: -3 }}
              >
                <div className="compare-header-row">
                  <div className="compare-brand-tag color-emerald">
                    <FaRocket className="v2v-tag-icon" /> Vision2Venture
                  </div>
                  <span className="v2v-speed-badge">⚡ Instant AI Engine</span>
                </div>
                <ul className="compare-checklist">
                  <li><FaCheckCircle className="icon-v2v-check" /> <span>60-second AI analysis</span></li>
                  <li><FaCheckCircle className="icon-v2v-check" /> <span>Free to start</span></li>
                  <li><FaCheckCircle className="icon-v2v-check" /> <span>Data-driven insights with explanations</span></li>
                  <li><FaCheckCircle className="icon-v2v-check" /> <span>Interactive dashboard &amp; PDF export</span></li>
                  <li><FaCheckCircle className="icon-v2v-check" /> <span>Online, Offline &amp; Hybrid support</span></li>
                  <li><FaCheckCircle className="icon-v2v-check" /> <span>AI chatbot assistant co-pilot</span></li>
                </ul>
              </motion.div>

              {/* VS Floating Indicator */}
              <div className="compare-vs-orb">VS</div>

              {/* Traditional Research Card */}
              <motion.div 
                className="compare-box manual-legacy-box" 
                variants={itemVariants}
                whileHover={{ y: -3 }}
              >
                <div className="compare-header-row">
                  <div className="compare-brand-tag color-muted">Traditional Research</div>
                  <span className="legacy-speed-badge">Weeks of Delay</span>
                </div>
                <ul className="compare-checklist">
                  <li><FaTimesCircle className="icon-manual-cross" /> <span>Weeks of manual research</span></li>
                  <li><FaTimesCircle className="icon-manual-cross" /> <span>₹4,00,000+ consultant fees</span></li>
                  <li><FaTimesCircle className="icon-manual-cross" /> <span>Gut feelings &amp; biased data</span></li>
                  <li><FaTimesCircle className="icon-manual-cross" /> <span>Static PDF documents</span></li>
                  <li><FaTimesCircle className="icon-manual-cross" /> <span>Limited to one business type</span></li>
                  <li><FaTimesCircle className="icon-manual-cross" /> <span>No ongoing support</span></li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. IMMERSIVE CONVERSION CTA SECTION                          */}
      {/* ============================================================ */}
      <section className="section-cta">
        <div className="cta-ambient-mesh"></div>
        <motion.div 
          className="section-inner"
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={containerVariants}
        >
          <div className="cta-elevated-card">
            <motion.div className="cta-sparkle-pill" variants={itemVariants}>
              <FaStar className="star-icon" /> <span>Fast • Reliable • Zero Setup</span>
            </motion.div>
            <motion.h2 className="cta-main-title" variants={itemVariants}>
              Ready to Validate Your Idea?
            </motion.h2>
            <motion.p className="cta-lead-text" variants={itemVariants}>
              Join hundreds of founders who make data-driven decisions.
            </motion.p>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary cta-btn-glow">
                <FaRocket className="btn-icon-rocket" />
                <span>Get Started Free</span>
                <FaArrowRight className="btn-icon-arrow" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
