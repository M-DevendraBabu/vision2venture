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
import { useEffect, useRef, useState } from 'react';

const INDUSTRY_PREVIEWS = {
  saas: {
    title: "AI Project Management Platform",
    sector: "Online • SaaS",
    score: 88,
    marketSize: "$18.4 Billion",
    growth: "+16.8% CAGR",
    risk: "Low-Medium",
    topCompetitors: ["Asana", "Monday.com", "ClickUp"],
    keyHighlight: "High demand for automated workflow planning with AI features.",
  },
  restaurant: {
    title: "Authentic Hyderabadi Cloud Kitchen",
    sector: "Offline • Food & Beverage",
    score: 92,
    marketSize: "$4.2 Million (Local)",
    growth: "+22.4% CAGR",
    risk: "Low",
    topCompetitors: ["Behrouz Biryani", "Paradise", "Local Outlets"],
    keyHighlight: "Prime opportunity in delivery-only model with 25-minute SLA.",
  },
  ecommerce: {
    title: "Eco-Friendly D2C Apparel Brand",
    sector: "Hybrid • E-Commerce",
    score: 85,
    marketSize: "$2.1 Billion",
    growth: "+19.2% CAGR",
    risk: "Medium",
    topCompetitors: ["Patagonia", "Everlane", "Local D2C"],
    keyHighlight: "Strong consumer willingness to pay 18% premium for sustainable wear.",
  },
  healthtech: {
    title: "Telehealth & Smart Clinic Software",
    sector: "Online • HealthTech",
    score: 94,
    marketSize: "$32.0 Billion",
    growth: "+28.5% CAGR",
    risk: "Low",
    topCompetitors: ["Practo", "Teladoc", "PharmEasy"],
    keyHighlight: "Rapid adoption in Tier-2/3 cities driving 3x year-over-year user growth.",
  }
};

const LandingPage = () => {
  const { user } = useAuth();
  const observerRef = useRef(null);
  const [selectedDemo, setSelectedDemo] = useState('saas');
  const [activeTabPreview, setActiveTabPreview] = useState('Overview');

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const demoData = INDUSTRY_PREVIEWS[selectedDemo];

  return (
    <div className="landing-page">
      
      {/* Ambient background light meshes */}
      <div className="landing-ambient-bg">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="hero-grid-bg"></div>
        
        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="badge-dot"></span>
            <FaMagic className="badge-sparkle" /> Next-Gen AI Startup Intelligence
          </div>

          <h1 className="hero-title reveal">
            Validate Your Startup Idea
            <br />
            <span className="hero-gradient">Before You Invest</span>
          </h1>
          
          <p className="hero-desc reveal">
            Get AI-powered market sizing, competitor intelligence, financial projections, 
            and a complete business roadmap for <strong>Online, Offline & Hybrid ventures</strong> — in under 60 seconds.
          </p>

          <div className="hero-actions reveal">
            <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary">
              <FaRocket /> Start Free Analysis <FaArrowRight />
            </Link>
            <Link to={user ? "/dashboard" : "/login"} className="hero-btn-secondary">
              <FaPlay /> Explore Dashboard
            </Link>
          </div>

          <div className="hero-metrics reveal">
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
          </div>
        </div>

        {/* ========== INTERACTIVE LIVE PREVIEW MOCKUP ========== */}
        <div className="hero-preview-section reveal">
          <div className="preview-selector-bar">
            <span className="selector-title"><FaBrain /> Try Live Preview:</span>
            <button className={`selector-btn ${selectedDemo === 'saas' ? 'active' : ''}`} onClick={() => setSelectedDemo('saas')}>
              <FaLaptopCode /> SaaS App
            </button>
            <button className={`selector-btn ${selectedDemo === 'restaurant' ? 'active' : ''}`} onClick={() => setSelectedDemo('restaurant')}>
              <FaStore /> Cloud Kitchen
            </button>
            <button className={`selector-btn ${selectedDemo === 'ecommerce' ? 'active' : ''}`} onClick={() => setSelectedDemo('ecommerce')}>
              <FaSync /> D2C Brand
            </button>
            <button className={`selector-btn ${selectedDemo === 'healthtech' ? 'active' : ''}`} onClick={() => setSelectedDemo('healthtech')}>
              <FaGlobe /> HealthTech
            </button>
          </div>

          <div className="interactive-preview-card glass-card-accent">
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
              {activeTabPreview === 'Overview' && (
                <div className="preview-overview-grid animate-fade-in">
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
                </div>
              )}

              {activeTabPreview === 'Market' && (
                <div className="preview-market-content animate-fade-in">
                  <div className="market-highlight-box">
                    <FaChartLine className="box-icon" />
                    <div>
                      <strong>Market Intelligence Highlight:</strong>
                      <p>{demoData.keyHighlight}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTabPreview === 'Competitors' && (
                <div className="preview-comp-content animate-fade-in">
                  <span className="mini-lbl mb-2">Identified Local & Global Players:</span>
                  <div className="comp-chips-wrap">
                    {demoData.topCompetitors.map((comp, idx) => (
                      <span key={idx} className="comp-chip"><FaCheckCircle /> {comp}</span>
                    ))}
                  </div>
                </div>
              )}

              {activeTabPreview === 'Financials' && (
                <div className="preview-fin-content animate-fade-in">
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
                </div>
              )}
            </div>

            <div className="preview-card-footer">
              <span>✨ Powered by Groq AI & Llama 3.3 70B Engine</span>
              <Link to={user ? "/new-idea" : "/register"} className="preview-action-link">
                Analyze Your Own Idea →
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section-how">
        <div className="section-inner">
          <div className="section-label reveal">SIMPLE PROCESS</div>
          <h2 className="section-heading reveal">How It Works</h2>
          <p className="section-sub reveal">Three simple steps from idea to actionable intelligence</p>

          <div className="steps reveal">
            <div className="step-card">
              <div className="step-badge">01</div>
              <div className="step-icon-wrap gradient-blue"><FaLightbulb /></div>
              <h3>Describe Your Idea</h3>
              <p>Enter your business concept, industry, location, budget, and team details. Works for online, offline, and hybrid businesses.</p>
              <div className="step-glow blue"></div>
            </div>
            
            <div className="step-connector">
              <svg width="60" height="24" viewBox="0 0 60 24"><path d="M0 12h50M45 6l10 6-10 6" stroke="rgba(99,102,241,0.3)" strokeWidth="2" fill="none" strokeDasharray="4 3"/></svg>
            </div>
            
            <div className="step-card">
              <div className="step-badge">02</div>
              <div className="step-icon-wrap gradient-purple"><FaBrain /></div>
              <h3>AI Deep-Dive Analysis</h3>
              <p>Our AI engine runs 9 comprehensive analysis modules simultaneously — market, competitors, financials, risks, and roadmap.</p>
              <div className="step-glow purple"></div>
            </div>
            
            <div className="step-connector">
              <svg width="60" height="24" viewBox="0 0 60 24"><path d="M0 12h50M45 6l10 6-10 6" stroke="rgba(139,92,246,0.3)" strokeWidth="2" fill="none" strokeDasharray="4 3"/></svg>
            </div>
            
            <div className="step-card">
              <div className="step-badge">03</div>
              <div className="step-icon-wrap gradient-cyan"><FaFileAlt /></div>
              <h3>Actionable Results & PDF</h3>
              <p>Receive an interactive dashboard with scores, charts, SWOT maps, a 12-month roadmap timeline, and a downloadable PDF report.</p>
              <div className="step-glow cyan"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="section-features">
        <div className="section-inner">
          <div className="section-label reveal">POWERFUL MODULES</div>
          <h2 className="section-heading reveal">Everything You Need to Decide</h2>
          <p className="section-sub reveal">9 AI-powered analysis modules that cover every angle of your business idea</p>

          <div className="features-grid reveal">
            {[
              { icon: <FaGlobe />, title: 'Market Sizing', desc: 'TAM/SAM/SOM sizing, demand levels, and growth trajectories for your target geography.', color: 'blue' },
              { icon: <FaUsers />, title: 'Competitor Intel', desc: 'Identify real local & global competitors, analyze their strengths, and spot market gaps.', color: 'purple' },
              { icon: <FaChartLine />, title: 'Financial Projections', desc: 'Revenue forecasts, break-even timeline, ROI, profit margins, and cost explanations.', color: 'cyan' },
              { icon: <FaShieldAlt />, title: 'Risk Assessment', desc: 'Technical, market, financial, and operational risk scoring with actionable mitigations.', color: 'red' },
              { icon: <FaRoute />, title: '12-Month Roadmap', desc: '5-phase timeline with milestones, key tasks, success metrics, and cost estimates.', color: 'green' },
              { icon: <FaChartPie />, title: 'Business Model Canvas', desc: 'Customer segments, value propositions, revenue streams, and key partner mapping.', color: 'orange' },
              { icon: <FaBrain />, title: 'SWOT Matrix', desc: 'Specific strengths, weaknesses, opportunities, and threats tailored for your venture.', color: 'pink' },
              { icon: <FaCommentsDollar />, title: 'Investor Readiness', desc: 'Score your funding readiness and receive recommendations to attract investors.', color: 'teal' },
              { icon: <FaRocket />, title: 'Feasibility Score', desc: 'Overall viability assessment combining all 8 modules into an overall confidence score.', color: 'indigo' },
            ].map((feat, i) => (
              <div className={`feat-card feat-${feat.color}`} key={i}>
                <div className={`feat-icon gradient-${feat.color}`}>{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPARISON ========== */}
      <section className="section-compare">
        <div className="section-inner">
          <h2 className="section-heading reveal">Why Vision2Venture?</h2>
          <p className="section-sub reveal">See how AI-powered analysis beats traditional research</p>
          <div className="compare-grid reveal">
            <div className="compare-card v2v">
              <div className="compare-label">Vision2Venture</div>
              <ul>
                <li><FaCheckCircle /> 60-second AI analysis</li>
                <li><FaCheckCircle /> Free to start</li>
                <li><FaCheckCircle /> Data-driven insights with explanations</li>
                <li><FaCheckCircle /> Interactive dashboard & PDF export</li>
                <li><FaCheckCircle /> Online, Offline & Hybrid support</li>
                <li><FaCheckCircle /> AI chatbot assistant co-pilot</li>
              </ul>
            </div>
            <div className="compare-vs">VS</div>
            <div className="compare-card manual">
              <div className="compare-label">Traditional Research</div>
              <ul>
                <li><FaTimesCircle /> Weeks of manual research</li>
                <li><FaTimesCircle /> $5,000+ consultant fees</li>
                <li><FaTimesCircle /> Gut feelings & biased data</li>
                <li><FaTimesCircle /> Static PDF documents</li>
                <li><FaTimesCircle /> Limited to one business type</li>
                <li><FaTimesCircle /> No ongoing support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="section-cta">
        <div className="cta-glow"></div>
        <div className="section-inner reveal">
          <h2>Ready to Validate Your Idea?</h2>
          <p>Join hundreds of founders who make data-driven decisions.</p>
          <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary">
            <FaRocket /> Get Started Free <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
