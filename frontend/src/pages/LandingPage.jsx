import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LandingPage.css';
import { 
  FaRocket, FaChartLine, FaBrain, FaFileAlt, 
  FaCheckCircle, FaTimesCircle, FaUsers, 
  FaLightbulb, FaShieldAlt, FaCommentsDollar, FaGlobe,
  FaArrowRight, FaChartPie, FaRoute,
  FaPlay, FaLaptopCode, FaStore, FaSync, FaCheck, FaStar, FaMagic
} from 'react-icons/fa';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INDUSTRY_PREVIEWS = {
  saas: {
    title: "AI Project Management Platform",
    sector: "Online • SaaS",
    score: 88,
    marketSize: "₹1.5 Lakh Cr",
    growth: "+16.8% CAGR",
    risk: "Low-Medium",
    topCompetitors: ["Asana", "Monday.com", "ClickUp"],
    keyHighlight: "High demand for automated workflow planning with AI features.",
  },
  restaurant: {
    title: "Authentic Hyderabadi Cloud Kitchen",
    sector: "Offline • Food & Beverage",
    score: 92,
    marketSize: "₹35 Cr (Local)",
    growth: "+22.4% CAGR",
    risk: "Low",
    topCompetitors: ["Behrouz Biryani", "Paradise", "Local Outlets"],
    keyHighlight: "Prime opportunity in delivery-only model with 25-minute SLA.",
  },
  ecommerce: {
    title: "Eco-Friendly D2C Apparel Brand",
    sector: "Hybrid • E-Commerce",
    score: 85,
    marketSize: "₹17,500 Cr",
    growth: "+19.2% CAGR",
    risk: "Medium",
    topCompetitors: ["Patagonia", "Everlane", "Local D2C"],
    keyHighlight: "Strong consumer willingness to pay 18% premium for sustainable wear.",
  },
  healthtech: {
    title: "Telehealth & Smart Clinic Software",
    sector: "Online • HealthTech",
    score: 94,
    marketSize: "₹2.6 Lakh Cr",
    growth: "+28.5% CAGR",
    risk: "Low",
    topCompetitors: ["Practo", "Teladoc", "PharmEasy"],
    keyHighlight: "Rapid adoption in Tier-2/3 cities driving 3x year-over-year user growth.",
  }
};

const FEATURES_LIST = [
  { icon: <FaGlobe />, title: 'Market Sizing', desc: 'TAM/SAM/SOM sizing, demand levels, and growth trajectories for your target geography.', color: 'blue' },
  { icon: <FaUsers />, title: 'Competitor Intel', desc: 'Identify real local & global competitors, analyze their strengths, and spot market gaps.', color: 'purple' },
  { icon: <FaChartLine />, title: 'Financial Projections', desc: 'Revenue forecasts, break-even timeline, ROI, profit margins, and cost explanations.', color: 'cyan' },
  { icon: <FaShieldAlt />, title: 'Risk Assessment', desc: 'Technical, market, financial, and operational risk scoring with actionable mitigations.', color: 'red' },
  { icon: <FaRoute />, title: '12-Month Roadmap', desc: '5-phase timeline with milestones, key tasks, success metrics, and cost estimates.', color: 'green' },
  { icon: <FaChartPie />, title: 'Business Model Canvas', desc: 'Customer segments, value propositions, revenue streams, and key partner mapping.', color: 'orange' },
  { icon: <FaBrain />, title: 'SWOT Matrix', desc: 'Specific strengths, weaknesses, opportunities, and threats tailored for your venture.', color: 'pink' },
  { icon: <FaCommentsDollar />, title: 'Investor Readiness', desc: 'Score your funding readiness and receive recommendations to attract investors.', color: 'teal' },
  { icon: <FaRocket />, title: 'Feasibility Score', desc: 'Overall viability assessment combining all 8 modules into an overall confidence score.', color: 'indigo' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
  }
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

const LandingPage = () => {
  const { user } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState('saas');
  const [activeTabPreview, setActiveTabPreview] = useState('Overview');

  const demoData = INDUSTRY_PREVIEWS[selectedDemo];

  return (
    <div className="landing-page">
      {/* Ambient background light meshes */}
      <div className="landing-ambient-bg" aria-hidden="true">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
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
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary">
                <FaRocket /> Start Free Analysis <FaArrowRight />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to={user ? "/dashboard" : "/login"} className="hero-btn-secondary">
                <FaPlay /> Explore Dashboard
              </Link>
            </motion.div>
          </motion.div>

          <motion.div className="hero-metrics" variants={itemVariants}>
            <div className="metric">
              <div className="metric-value">500+</div>
              <div className="metric-label">Ideas Validated</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value">9</div>
              <div className="metric-label">AI Modules</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value">&lt; 60s</div>
              <div className="metric-label">Analysis Speed</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value">100%</div>
              <div className="metric-label">Free Access</div>
            </div>
          </motion.div>
        </motion.div>

        {/* ========== INTERACTIVE LIVE PREVIEW MOCKUP ========== */}
        <motion.div 
          className="hero-preview-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="preview-selector-bar">
            <span className="selector-title"><FaBrain /> Try Live Preview:</span>
            <button 
              className={`selector-btn ${selectedDemo === 'saas' ? 'active' : ''}`} 
              onClick={() => setSelectedDemo('saas')}
            >
              <FaLaptopCode /> SaaS App
            </button>
            <button 
              className={`selector-btn ${selectedDemo === 'restaurant' ? 'active' : ''}`} 
              onClick={() => setSelectedDemo('restaurant')}
            >
              <FaStore /> Cloud Kitchen
            </button>
            <button 
              className={`selector-btn ${selectedDemo === 'ecommerce' ? 'active' : ''}`} 
              onClick={() => setSelectedDemo('ecommerce')}
            >
              <FaSync /> D2C Brand
            </button>
            <button 
              className={`selector-btn ${selectedDemo === 'healthtech' ? 'active' : ''}`} 
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
              <span className="window-badge">Live Interactive Preview</span>
            </div>

            <div className="preview-card-header">
              <div className="preview-title-info">
                <h3>{demoData.title}</h3>
                <span className="preview-badge">{demoData.sector}</span>
              </div>
              <div className="preview-score-box">
                <span className="score-lbl">V2V Score</span>
                <span className="score-num">{demoData.score}<span>/100</span></span>
              </div>
            </div>

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
                    <div className="preview-mini-card">
                      <span className="mini-lbl">TAM / Market Size</span>
                      <span className="mini-val text-primary">{demoData.marketSize}</span>
                    </div>
                    <div className="preview-mini-card">
                      <span className="mini-lbl">Growth Trajectory</span>
                      <span className="mini-val text-success">{demoData.growth}</span>
                    </div>
                    <div className="preview-mini-card">
                      <span className="mini-lbl">Calculated Risk</span>
                      <span className="mini-val text-info">{demoData.risk}</span>
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
                          whileHover={{ scale: 1.05, y: -1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <FaCheckCircle /> {comp}
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
                        <strong>Month 7 - 9</strong>
                      </div>
                      <div className="fin-row">
                        <span>Projected Year 1 Profit Margin</span>
                        <strong className="text-success">28.4%</strong>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="preview-card-footer">
              <span>✨ Powered by Groq AI &amp; Llama 3.3 70B Engine</span>
              <Link to={user ? "/new-idea" : "/register"} className="preview-action-link">
                Analyze Your Own Idea →
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
              <motion.div 
                className="step-card" 
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className="step-badge">01</div>
                <div className="step-icon-wrap gradient-blue"><FaLightbulb /></div>
                <h3>Describe Your Idea</h3>
                <p>Enter your business concept, industry, location, budget, and team details. Works for online, offline, and hybrid businesses.</p>
                <div className="step-glow blue"></div>
              </motion.div>
              
              <div className="step-connector">
                <svg width="60" height="24" viewBox="0 0 60 24">
                  <path d="M0 12h50M45 6l10 6-10 6" stroke="#0EA5E9" strokeWidth="2" fill="none" strokeDasharray="4 3"/>
                </svg>
              </div>
              
              <motion.div 
                className="step-card" 
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className="step-badge">02</div>
                <div className="step-icon-wrap gradient-purple"><FaBrain /></div>
                <h3>AI Deep-Dive Analysis</h3>
                <p>Our AI engine runs 9 comprehensive analysis modules simultaneously — market, competitors, financials, risks, and roadmap.</p>
                <div className="step-glow purple"></div>
              </motion.div>
              
              <div className="step-connector">
                <svg width="60" height="24" viewBox="0 0 60 24">
                  <path d="M0 12h50M45 6l10 6-10 6" stroke="#10B981" strokeWidth="2" fill="none" strokeDasharray="4 3"/>
                </svg>
              </div>
              
              <motion.div 
                className="step-card" 
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className="step-badge">03</div>
                <div className="step-icon-wrap gradient-cyan"><FaFileAlt /></div>
                <h3>Actionable Results &amp; PDF</h3>
                <p>Receive an interactive dashboard with scores, charts, SWOT maps, a 12-month roadmap timeline, and a downloadable PDF report.</p>
                <div className="step-glow cyan"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURES (9 MODULES) ========== */}
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
                  whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
                >
                  <div className={`feat-icon gradient-${feat.color}`}>{feat.icon}</div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
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
                <div className="compare-label">Vision2Venture</div>
                <ul>
                  <li><FaCheckCircle /> 60-second AI analysis</li>
                  <li><FaCheckCircle /> Free to start</li>
                  <li><FaCheckCircle /> Data-driven insights with explanations</li>
                  <li><FaCheckCircle /> Interactive dashboard &amp; PDF export</li>
                  <li><FaCheckCircle /> Online, Offline &amp; Hybrid support</li>
                  <li><FaCheckCircle /> AI chatbot assistant co-pilot</li>
                </ul>
              </motion.div>

              <div className="compare-vs">VS</div>

              <motion.div 
                className="compare-card manual" 
                variants={itemVariants}
                whileHover={{ y: -2 }}
              >
                <div className="compare-label">Traditional Research</div>
                <ul>
                  <li><FaTimesCircle /> Weeks of manual research</li>
                  <li><FaTimesCircle /> ₹4,00,000+ consultant fees</li>
                  <li><FaTimesCircle /> Gut feelings &amp; biased data</li>
                  <li><FaTimesCircle /> Static PDF documents</li>
                  <li><FaTimesCircle /> Limited to one business type</li>
                  <li><FaTimesCircle /> No ongoing support</li>
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
          <motion.h2 variants={itemVariants}>Ready to Validate Your Idea?</motion.h2>
          <motion.p variants={itemVariants}>Join hundreds of founders who make data-driven decisions.</motion.p>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary">
              <FaRocket /> Get Started Free <FaArrowRight />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
