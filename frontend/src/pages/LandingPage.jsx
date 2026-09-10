import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LandingPage.css';
import { 
  FaRocket, FaChartLine, FaBrain, FaFileAlt, 
  FaCheckCircle, FaTimesCircle, FaUsers, 
  FaLightbulb, FaShieldAlt, FaCommentsDollar, FaGlobe,
  FaArrowRight, FaChartPie, FaRoute,
  FaPlay, FaLaptopCode, FaStore, FaSync, FaCheck, FaStar, FaMagic,
  FaCalculator, FaBalanceScale, FaRobot, FaDownload, FaBuilding,
  FaGraduationCap, FaCoins, FaBullseye, FaSearch, FaUserTie
} from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';

const INDUSTRY_PREVIEWS = {
  saas: {
    id: 'saas',
    title: 'AI Automated Workflow Orchestrator',
    badge: 'Online • B2B SaaS Platform',
    icon: <FaLaptopCode />,
    score: 88,
    scoreLabel: 'Highly Viable',
    tam: '₹1.85 Lakh Cr',
    cagr: '+18.4% CAGR',
    breakeven: 'Month 8',
    riskLevel: 'Low-Medium',
    targetAudience: 'Mid-Market Enterprise Ops & IT Leaders',
    keyPainPoint: 'Fragmented SaaS tooling and expensive manual cross-platform data synchronization',
    acquisitionChannel: 'Product-Led Growth (PLG) & Targeted B2B LinkedIn Search',
    capEx: '₹8,50,000',
    opEx: '₹2,10,000/mo',
    cac: '₹4,200',
    ltv: '₹18,500',
    ltvCac: '4.4x',
    competitors: ['Zapier', 'Make.com', 'Workato', 'n8n'],
    risks: [
      { label: 'Market Demand', level: 'Low', pct: 22, color: '#059669' },
      { label: 'Competition', level: 'Medium', pct: 54, color: '#d97706' },
      { label: 'Technical Complexity', level: 'Low', pct: 28, color: '#059669' },
      { label: 'Financial Burn', level: 'Low-Medium', pct: 36, color: '#0284c7' },
      { label: 'Operational Risk', level: 'Low', pct: 18, color: '#059669' },
    ]
  },
  restaurant: {
    id: 'restaurant',
    title: 'Artisanal Wood-Fired Cloud Kitchen',
    badge: 'Offline • Food & Beverage Retail',
    icon: <FaStore />,
    score: 91,
    scoreLabel: 'Exceptional Feasibility',
    tam: '₹42 Cr (Local Metro Hub)',
    cagr: '+22.6% CAGR',
    breakeven: 'Month 6',
    riskLevel: 'Low',
    targetAudience: 'Urban Working Professionals & High-Density Gated Communities',
    keyPainPoint: 'Lack of authentic, high-speed gourmet delivery options within 25 minutes',
    acquisitionChannel: 'Hyper-Local Swiggy/Zomato Ads, Instagram Reels & In-Kitchen Tasting Offers',
    capEx: '₹14,50,000',
    opEx: '₹2,80,000/mo',
    cac: '₹280',
    ltv: '₹2,600',
    ltvCac: '9.3x',
    competitors: ['Behrouz Biryani', 'FreshMenu', 'Local Gourmet Kitchens'],
    risks: [
      { label: 'Food Waste & COGS', level: 'Medium', pct: 48, color: '#d97706' },
      { label: 'Local Competition', level: 'Medium', pct: 52, color: '#d97706' },
      { label: 'Licensing & Compliance', level: 'Low', pct: 24, color: '#059669' },
      { label: 'Staff Retention', level: 'Low-Medium', pct: 38, color: '#0284c7' },
      { label: 'Delivery Radius SLA', level: 'Low', pct: 20, color: '#059669' },
    ]
  },
  ecommerce: {
    id: 'ecommerce',
    title: 'Zero-Waste Organic Activewear',
    badge: 'Hybrid • D2C Sustainable Apparel',
    icon: <FaSync />,
    score: 84,
    scoreLabel: 'Solid Growth Model',
    tam: '₹14,200 Cr National',
    cagr: '+19.2% CAGR',
    breakeven: 'Month 10',
    riskLevel: 'Medium',
    targetAudience: 'Eco-Conscious Gen Z & Millennials (Ages 22-38)',
    keyPainPoint: 'Limited ethical activewear options with transparent supply chain certifications',
    acquisitionChannel: 'Influencer Seeding, Meta Video Retargeting & Pop-Up Experiences',
    capEx: '₹11,00,000',
    opEx: '₹2,40,000/mo',
    cac: '₹850',
    ltv: '₹3,400',
    ltvCac: '4.0x',
    competitors: ['BlissClub', 'Kica Active', 'Patagonia D2C', 'Local Eco Labels'],
    risks: [
      { label: 'Inventory Holding', level: 'Medium', pct: 58, color: '#d97706' },
      { label: 'Digital Ad CAC Inflation', level: 'Medium', pct: 50, color: '#d97706' },
      { label: 'Supply Chain Audits', level: 'Low-Medium', pct: 32, color: '#0284c7' },
      { label: 'Return Rates (RTO)', level: 'Medium', pct: 44, color: '#d97706' },
      { label: 'Brand Loyalty', level: 'Low', pct: 26, color: '#059669' },
    ]
  },
  healthtech: {
    id: 'healthtech',
    title: 'AI Preventive Health & Remote Diagnostics',
    badge: 'Online • Telehealth DeepTech',
    icon: <FaGlobe />,
    score: 93,
    scoreLabel: 'Tier-1 Venture Ready',
    tam: '₹2.4 Lakh Cr',
    cagr: '+29.4% CAGR',
    breakeven: 'Month 11',
    riskLevel: 'Low-Medium',
    targetAudience: 'Chronic Condition Patients & Tier-2/3 Polyclinics',
    keyPainPoint: 'Delayed diagnostic screening and acute specialist shortages in semi-urban India',
    acquisitionChannel: 'Hospital B2B Partnerships, Doctor Referral Networks & Diagnostic Camp Retainers',
    capEx: '₹16,00,000',
    opEx: '₹3,20,000/mo',
    cac: '₹1,450',
    ltv: '₹7,800',
    ltvCac: '5.4x',
    competitors: ['Practo', 'Tata 1mg', 'MediBuddy', 'HealthPlix'],
    risks: [
      { label: 'Regulatory Compliance', level: 'Medium', pct: 52, color: '#d97706' },
      { label: 'Data Privacy & HIPAA', level: 'Low', pct: 28, color: '#059669' },
      { label: 'Doctor Onboarding', level: 'Low-Medium', pct: 35, color: '#0284c7' },
      { label: 'Clinical Accuracy', level: 'Low', pct: 19, color: '#059669' },
      { label: 'Capital Runway', level: 'Low', pct: 22, color: '#059669' },
    ]
  }
};

const LandingPage = () => {
  const { user } = useAuth();
  const observerRef = useRef(null);
  const [selectedDemo, setSelectedDemo] = useState('saas');
  const [heroSubTab, setHeroSubTab] = useState('summary');
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('market');

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const demo = INDUSTRY_PREVIEWS[selectedDemo];

  return (
    <div className="landing-page">
      {/* Background ambient lighting */}
      <div className="landing-ambient-bg" aria-hidden="true">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* =================================================================== */}
      {/* 1. HERO SECTION                                                     */}
      {/* =================================================================== */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="hero-grid-bg"></div>

        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="badge-dot"></span>
            <FaMagic className="badge-sparkle" />
            <span>Next-Gen AI Startup Intelligence &amp; Feasibility Engine</span>
          </div>

          <h1 className="hero-title reveal">
            Validate Your Startup Idea
            <br />
            <span className="hero-gradient">Before You Invest Capital</span>
          </h1>

          <p className="hero-desc reveal">
            Turn raw venture concepts into institutional-grade validation reports in under 60 seconds. 
            Comprehensive AI-powered market sizing, competitive radar, financial break-even formulas, 
            and execution roadmaps for <strong>Online, Offline &amp; Hybrid ventures</strong>.
          </p>

          <div className="hero-actions reveal">
            <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary">
              <FaRocket /> Start Free Analysis <FaArrowRight />
            </Link>
            <Link to={user ? "/dashboard" : "/login"} className="hero-btn-secondary">
              <FaPlay /> Explore Dashboard
            </Link>
          </div>

          {/* Social Proof Trust Metrics */}
          <div className="hero-metrics reveal">
            <div className="metric">
              <div className="metric-value">500+</div>
              <div className="metric-label">Ventures Analyzed</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value">9</div>
              <div className="metric-label">Autonomous AI Engines</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value">&lt; 60s</div>
              <div className="metric-label">End-to-End Speed</div>
            </div>
            <div className="metric-sep"></div>
            <div className="metric">
              <div className="metric-value">100%</div>
              <div className="metric-label">Institutional Precision</div>
            </div>
          </div>
        </div>

        {/* Realistic Miniature Dashboard Preview Showcase */}
        <div className="hero-preview-section reveal">
          <div className="preview-selector-bar">
            <span className="selector-title"><FaBrain /> Explore Sample Venture:</span>
            {Object.values(INDUSTRY_PREVIEWS).map(item => (
              <button
                key={item.id}
                className={`selector-btn ${selectedDemo === item.id ? 'active' : ''}`}
                onClick={() => setSelectedDemo(item.id)}
              >
                {item.icon} {item.id === 'saas' ? 'SaaS Platform' : item.id === 'restaurant' ? 'Cloud Kitchen' : item.id === 'ecommerce' ? 'D2C Apparel' : 'HealthTech'}
              </button>
            ))}
          </div>

          <div className="interactive-preview-card">
            {/* Window Header Chrome */}
            <div className="preview-window-bar">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="window-address">
                <span className="address-lock">🔒</span> vision2venture.ai/analysis/{demo.id}-validation
              </div>
              <div className="window-pill">Sample Interactive Intelligence</div>
            </div>

            {/* Dashboard Meta Bar */}
            <div className="preview-card-header">
              <div className="preview-title-info">
                <div className="preview-badge-row">
                  <span className="preview-badge">{demo.badge}</span>
                  <span className="preview-status-chip">✓ Verified Heuristic Benchmark</span>
                </div>
                <h3>{demo.title}</h3>
              </div>
              <div className="preview-score-box">
                <span className="score-lbl">V2V Viability Score</span>
                <div className="score-num-wrap">
                  <span className="score-num">{demo.score}</span>
                  <span className="score-denom">/100</span>
                </div>
                <span className="score-status-badge">{demo.scoreLabel}</span>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="preview-tabs">
              <button 
                className={`preview-tab-btn ${heroSubTab === 'summary' ? 'active' : ''}`}
                onClick={() => setHeroSubTab('summary')}
              >
                <FaChartPie /> Executive Summary
              </button>
              <button 
                className={`preview-tab-btn ${heroSubTab === 'market' ? 'active' : ''}`}
                onClick={() => setHeroSubTab('market')}
              >
                <FaGlobe /> Market Dynamics
              </button>
              <button 
                className={`preview-tab-btn ${heroSubTab === 'financial' ? 'active' : ''}`}
                onClick={() => setHeroSubTab('financial')}
              >
                <FaCalculator /> Financial Projections
              </button>
              <button 
                className={`preview-tab-btn ${heroSubTab === 'risk' ? 'active' : ''}`}
                onClick={() => setHeroSubTab('risk')}
              >
                <FaShieldAlt /> Risk Assessment
              </button>
            </div>

            {/* Tab Body */}
            <div className="preview-tab-content">
              {heroSubTab === 'summary' && (
                <div className="preview-overview-grid animate-fade-in">
                  <div className="preview-mini-card">
                    <span className="mini-lbl">Addressable Market (TAM)</span>
                    <span className="mini-val text-primary">{demo.tam}</span>
                    <span className="mini-subtext">{demo.cagr} estimated expansion</span>
                  </div>
                  <div className="preview-mini-card">
                    <span className="mini-lbl">Operating Break-Even</span>
                    <span className="mini-val text-success">{demo.breakeven}</span>
                    <span className="mini-subtext">Capital-efficient recovery curve</span>
                  </div>
                  <div className="preview-mini-card">
                    <span className="mini-lbl">LTV to CAC Ratio</span>
                    <span className="mini-val text-accent">{demo.ltvCac}</span>
                    <span className="mini-subtext">Strong venture hurdle performance</span>
                  </div>
                  <div className="preview-mini-card">
                    <span className="mini-lbl">Composite Risk Profile</span>
                    <span className="mini-val text-warning">{demo.riskLevel}</span>
                    <span className="mini-subtext">5-dimensional stress-tested</span>
                  </div>
                </div>
              )}

              {heroSubTab === 'market' && (
                <div className="preview-market-content animate-fade-in">
                  <div className="market-row-grid">
                    <div className="market-box">
                      <div className="market-box-title"><FaUsers style={{ color: '#0284c7' }} /> Primary Demographic</div>
                      <p>{demo.targetAudience}</p>
                    </div>
                    <div className="market-box">
                      <div className="market-box-title"><FaBullseye style={{ color: '#d97706' }} /> Core Pain Point Solved</div>
                      <p>{demo.keyPainPoint}</p>
                    </div>
                    <div className="market-box">
                      <div className="market-box-title"><FaRocket style={{ color: '#059669' }} /> Customer Acquisition Engine</div>
                      <p>{demo.acquisitionChannel}</p>
                    </div>
                  </div>
                </div>
              )}

              {heroSubTab === 'financial' && (
                <div className="preview-fin-content animate-fade-in">
                  <div className="fin-kpi-row">
                    <div className="fin-kpi-card">
                      <span className="fin-kpi-lbl">Initial Setup CapEx</span>
                      <span className="fin-kpi-val">{demo.capEx}</span>
                      <span className="fin-kpi-sub">Filing, fitout &amp; infrastructure</span>
                    </div>
                    <div className="fin-kpi-card">
                      <span className="fin-kpi-lbl">Monthly Operating Burn</span>
                      <span className="fin-kpi-val">{demo.opEx}</span>
                      <span className="fin-kpi-sub">Payroll, facility &amp; technology</span>
                    </div>
                    <div className="fin-kpi-card">
                      <span className="fin-kpi-lbl">Blended CAC</span>
                      <span className="fin-kpi-val">{demo.cac}</span>
                      <span className="fin-kpi-sub">Marketing per acquired buyer</span>
                    </div>
                    <div className="fin-kpi-card">
                      <span className="fin-kpi-lbl">Customer Lifetime Value</span>
                      <span className="fin-kpi-val">{demo.ltv}</span>
                      <span className="fin-kpi-sub">Cumulative gross margin contribution</span>
                    </div>
                  </div>
                </div>
              )}

              {heroSubTab === 'risk' && (
                <div className="preview-risk-content animate-fade-in">
                  <div className="risk-bars-container">
                    {demo.risks.map((risk, i) => (
                      <div key={i} className="risk-bar-row">
                        <div className="risk-bar-header">
                          <span className="risk-name">{risk.label}</span>
                          <span className="risk-level-tag" style={{ color: risk.color }}>{risk.level} ({risk.pct}%)</span>
                        </div>
                        <div className="risk-track">
                          <div className="risk-fill" style={{ width: `${risk.pct}%`, backgroundColor: risk.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="preview-card-footer">
              <div className="footer-engine-tag">
                <FaBrain className="text-primary" />
                <span>Powered by Groq Llama 3.3 70B &amp; Multi-Source Market Benchmarks</span>
              </div>
              <Link to={user ? "/new-idea" : "/register"} className="preview-action-link">
                Analyze Your Own Idea in 60s <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. TRUST & VALUE CAPABILITY STRIP                                   */}
      {/* =================================================================== */}
      <section className="section-trust-strip">
        <div className="section-inner">
          <div className="trust-grid reveal">
            <div className="trust-card">
              <div className="trust-icon-box" style={{ background: '#F0F9FF', color: '#0284C7' }}>
                <FaRocket />
              </div>
              <div className="trust-info">
                <h4>60-Second Full-Stack Analysis</h4>
                <p>Replace 4 weeks of manual consulting research with real-time AI modeling and validated industry benchmarks.</p>
              </div>
            </div>

            <div className="trust-card">
              <div className="trust-icon-box" style={{ background: '#FAF5FF', color: '#7C3AED' }}>
                <FaBrain />
              </div>
              <div className="trust-info">
                <h4>9 Co-Operating AI Engines</h4>
                <p>Simultaneous processing across Market, Competitors, Technology, Financials, Risks, Roadmap and SWOT.</p>
              </div>
            </div>

            <div className="trust-card">
              <div className="trust-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
                <FaBuilding />
              </div>
              <div className="trust-info">
                <h4>Online, Offline &amp; Hybrid Logic</h4>
                <p>Specialized modeling for software platforms, physical retail stores, cafes, and hybrid D2C operations.</p>
              </div>
            </div>

            <div className="trust-card">
              <div className="trust-icon-box" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <FaFileAlt />
              </div>
              <div className="trust-info">
                <h4>Institutional-Grade PDF Reports</h4>
                <p>One-click investor-ready executive reports formatted for angel syndicates, bank lenders, and accelerator programs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. HOW IT WORKS (4-STEP CONNECTED WORKFLOW)                         */}
      {/* =================================================================== */}
      <section className="section-how">
        <div className="section-inner">
          <div className="section-label reveal">SEAMLESS METHODOLOGY</div>
          <h2 className="section-heading reveal">From Idea Concept to Validated Roadmap</h2>
          <p className="section-sub reveal">Four disciplined steps ensuring complete diligence before risking capital</p>

          <div className="workflow-steps reveal">
            <div className="wf-step">
              <div className="wf-step-num">01</div>
              <div className="wf-icon-wrap" style={{ background: '#F0F9FF', color: '#0284C7' }}>
                <FaLightbulb />
              </div>
              <h3>Describe Your Concept</h3>
              <p>Enter your title, business model (Online, Offline, Hybrid), sector, target audience, budget, and founder team capabilities.</p>
            </div>

            <div className="wf-connector" aria-hidden="true">
              <div className="wf-connector-line"></div>
              <FaArrowRight className="wf-connector-arrow" />
            </div>

            <div className="wf-step">
              <div className="wf-step-num">02</div>
              <div className="wf-icon-wrap" style={{ background: '#FAF5FF', color: '#7C3AED' }}>
                <FaBrain />
              </div>
              <h3>Multi-Agent AI Synthesis</h3>
              <p>Llama 3.3 70B synthesizes market datasets, queries competitive indices, computes CapEx/OpEx equations, and detects downside vulnerabilities.</p>
            </div>

            <div className="wf-connector" aria-hidden="true">
              <div className="wf-connector-line"></div>
              <FaArrowRight className="wf-connector-arrow" />
            </div>

            <div className="wf-step">
              <div className="wf-step-num">03</div>
              <div className="wf-icon-wrap" style={{ background: '#ECFEFF', color: '#0891B2' }}>
                <FaChartLine />
              </div>
              <h3>Explore 9-Tab Cockpit</h3>
              <p>Review interactive charts, opportunity gauges, mathematical formulas, competitor positioning, and unit economics sensitivity models.</p>
            </div>

            <div className="wf-connector" aria-hidden="true">
              <div className="wf-connector-line"></div>
              <FaArrowRight className="wf-connector-arrow" />
            </div>

            <div className="wf-step">
              <div className="wf-step-num">04</div>
              <div className="wf-icon-wrap" style={{ background: '#ECFDF5', color: '#059669' }}>
                <FaFileAlt />
              </div>
              <h3>Export &amp; Execute</h3>
              <p>Download a comprehensive, branded PDF executive dossier and execute your 12-month phased roadmap with milestone budget checkpoints.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. INTERACTIVE PLATFORM SHOWCASE (TABBED TOUR)                      */}
      {/* =================================================================== */}
      <section className="section-showcase">
        <div className="section-inner">
          <div className="section-label reveal">INTELLIGENCE PLATFORM</div>
          <h2 className="section-heading reveal">Engineered for Institutional Diligence</h2>
          <p className="section-sub reveal">Explore deep analytical modules tailored specifically for high-impact decision makers</p>

          <div className="showcase-nav reveal">
            <button 
              className={`showcase-nav-btn ${activeShowcaseTab === 'market' ? 'active' : ''}`}
              onClick={() => setActiveShowcaseTab('market')}
            >
              <FaGlobe /> Market Sizing &amp; Demand
            </button>
            <button 
              className={`showcase-nav-btn ${activeShowcaseTab === 'competitor' ? 'active' : ''}`}
              onClick={() => setActiveShowcaseTab('competitor')}
            >
              <FaUsers /> Competitive Advantage
            </button>
            <button 
              className={`showcase-nav-btn ${activeShowcaseTab === 'financial' ? 'active' : ''}`}
              onClick={() => setActiveShowcaseTab('financial')}
            >
              <FaCalculator /> Phased Financials
            </button>
            <button 
              className={`showcase-nav-btn ${activeShowcaseTab === 'risk' ? 'active' : ''}`}
              onClick={() => setActiveShowcaseTab('risk')}
            >
              <FaShieldAlt /> 5-Pillar Risk Engine
            </button>
          </div>

          <div className="showcase-display-card reveal">
            {activeShowcaseTab === 'market' && (
              <div className="showcase-content-grid animate-fade-in">
                <div className="showcase-info-col">
                  <span className="showcase-tag">MODULE 01 • MARKET INTELLIGENCE</span>
                  <h3>Macro TAM/SAM/SOM Sizing with Realistic Demographic Signals</h3>
                  <p>
                    Avoid generic market estimates. Vision2Venture contextualizes sizing based on your exact business model, whether you are addressing a <strong>₹1.5 Lakh Crore</strong> national software market or a hyper-local <strong>₹35 Crore</strong> urban micro-market.
                  </p>
                  <ul className="showcase-feature-list">
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Compound Annual Growth Rate (CAGR)</strong> calibrated against regional historical data</li>
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Target Demographics &amp; Persona Profiles</strong> defining exact buyers and purchasing triggers</li>
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Opportunity Score Gauge</strong> benchmarking consumer willingness to pay</li>
                  </ul>
                  <div className="showcase-action-wrap">
                    <Link to={user ? "/new-idea" : "/register"} className="btn-sm-primary">
                      Test Market Engine →
                    </Link>
                  </div>
                </div>
                <div className="showcase-visual-col">
                  <div className="visual-mock-card">
                    <div className="visual-mock-header">
                      <span className="visual-mock-title"><FaGlobe style={{ color: '#0284c7' }} /> Market Sizing Breakdown</span>
                      <span className="visual-mock-badge">Verified 2026 Index</span>
                    </div>
                    <div className="visual-tam-bars">
                      <div className="tam-bar-item">
                        <div className="tam-bar-label"><span>TAM (Total Addressable Market)</span><strong>₹1,85,000 Cr</strong></div>
                        <div className="tam-bar-track"><div className="tam-bar-fill" style={{ width: '100%', background: '#0284c7' }}></div></div>
                      </div>
                      <div className="tam-bar-item">
                        <div className="tam-bar-label"><span>SAM (Serviceable Addressable)</span><strong>₹34,200 Cr</strong></div>
                        <div className="tam-bar-track"><div className="tam-bar-fill" style={{ width: '62%', background: '#0ea5e9' }}></div></div>
                      </div>
                      <div className="tam-bar-item">
                        <div className="tam-bar-label"><span>SOM (Serviceable Obtainable)</span><strong>₹1,850 Cr</strong></div>
                        <div className="tam-bar-track"><div className="tam-bar-fill" style={{ width: '28%', background: '#10b981' }}></div></div>
                      </div>
                    </div>
                    <div className="visual-callout">
                      <FaChartLine style={{ color: '#059669' }} />
                      <span>Projected 18.4% annual market expansion creates substantial headroom for new entrants.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'competitor' && (
              <div className="showcase-content-grid animate-fade-in">
                <div className="showcase-info-col">
                  <span className="showcase-tag">MODULE 02 • COMPETITOR POSITIONING</span>
                  <h3>Automated Competitor Intelligence &amp; Defensible Blue Ocean Gaps</h3>
                  <p>
                    Identify who currently captures your customer's wallet share. Our competitive radar identifies domestic leaders, international incumbents, and overlooked alternative workflows.
                  </p>
                  <ul className="showcase-feature-list">
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Direct &amp; Indirect Competitor Discovery</strong> across online and offline categories</li>
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Strength &amp; Vulnerability Matrix</strong> revealing where incumbents fail customers</li>
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Competitive Differentiation Moat</strong> defining your unique selling proposition (USP)</li>
                  </ul>
                  <div className="showcase-action-wrap">
                    <Link to={user ? "/new-idea" : "/register"} className="btn-sm-primary">
                      Scan Competitors →
                    </Link>
                  </div>
                </div>
                <div className="showcase-visual-col">
                  <div className="visual-mock-card">
                    <div className="visual-mock-header">
                      <span className="visual-mock-title"><FaUsers style={{ color: '#7c3aed' }} /> Competitive Landscape Matrix</span>
                      <span className="visual-mock-badge">Multi-Source</span>
                    </div>
                    <div className="visual-comp-list">
                      <div className="comp-item-row">
                        <div className="comp-name-col"><strong>Incumbent Leader A</strong><span>Established market share</span></div>
                        <div className="comp-gap-col"><span className="comp-weak-pill">High Enterprise Pricing</span></div>
                      </div>
                      <div className="comp-item-row">
                        <div className="comp-name-col"><strong>Legacy Tool B</strong><span>Broad feature footprint</span></div>
                        <div className="comp-gap-col"><span className="comp-weak-pill">Clunky 2018 UI/UX</span></div>
                      </div>
                      <div className="comp-item-row highlight">
                        <div className="comp-name-col"><strong>Your Venture</strong><span>AI-native &amp; lightweight</span></div>
                        <div className="comp-gap-col"><span className="comp-win-pill">10x Speed &amp; Transparent Pricing</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'financial' && (
              <div className="showcase-content-grid animate-fade-in">
                <div className="showcase-info-col">
                  <span className="showcase-tag">MODULE 03 • FINANCIAL MODELING</span>
                  <h3>Setup CapEx, Operational OpEx &amp; Real Unit Economics</h3>
                  <p>
                    Mathematical formulas replace guesswork. Every CapEx item (incorporation, machinery, R&amp;D, working reserve) and OpEx line (payroll, rent, cloud, marketing) is fully itemized with rationales.
                  </p>
                  <ul className="showcase-feature-list">
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Mathematical Formula Blocks</strong> showing exact arithmetic reconciliations</li>
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>LTV:CAC Ratio &amp; Payback Period</strong> to measure customer acquisition sustainability</li>
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Phased Capital Deployment</strong> to preserve runway and eliminate Day-1 cash crunch</li>
                  </ul>
                  <div className="showcase-action-wrap">
                    <Link to={user ? "/new-idea" : "/register"} className="btn-sm-primary">
                      Model Your CapEx →
                    </Link>
                  </div>
                </div>
                <div className="showcase-visual-col">
                  <div className="visual-mock-card">
                    <div className="visual-mock-header">
                      <span className="visual-mock-title"><FaCalculator style={{ color: '#d97706' }} /> Mathematical CapEx Formula</span>
                      <span className="visual-mock-badge">Audited Math</span>
                    </div>
                    <div className="visual-formula-snippet">
                      Total CapEx = R&amp;D (₹3.5L) + Hardware (₹1.8L) + Legal (₹75k) + Branding (₹1.2L) + Reserve (₹1.25L) = <strong>₹8,50,000</strong>
                    </div>
                    <div className="visual-fin-metrics-row">
                      <div className="mock-fin-box">
                        <span className="mock-lbl">LTV:CAC</span>
                        <span className="mock-num text-success">4.4x</span>
                      </div>
                      <div className="mock-fin-box">
                        <span className="mock-lbl">Gross Margin</span>
                        <span className="mock-num text-primary">78%</span>
                      </div>
                      <div className="mock-fin-box">
                        <span className="mock-lbl">Break-Even</span>
                        <span className="mock-num text-accent">Mo 8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'risk' && (
              <div className="showcase-content-grid animate-fade-in">
                <div className="showcase-info-col">
                  <span className="showcase-tag">MODULE 04 • RISK ARCHITECTURE</span>
                  <h3>Stress-Tested 5-Pillar Downside Risk Detection &amp; Mitigation</h3>
                  <p>
                    Every venture carries inherent risks. Vision2Venture scans Technical, Market, Competition, Financial, and Operational axes, pairing every score with actionable mitigation strategies.
                  </p>
                  <ul className="showcase-feature-list">
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>5-Pillar Quantitative Risk Scoring</strong> from low vulnerability to critical caution</li>
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Specific Mitigation Protocols</strong> outlining immediate actions to derisk execution</li>
                    <li><FaCheckCircle style={{ color: '#059669' }} /> <strong>Operational Feasibility Index</strong> measuring regulatory and delivery friction</li>
                  </ul>
                  <div className="showcase-action-wrap">
                    <Link to={user ? "/new-idea" : "/register"} className="btn-sm-primary">
                      Evaluate Venture Risks →
                    </Link>
                  </div>
                </div>
                <div className="showcase-visual-col">
                  <div className="visual-mock-card">
                    <div className="visual-mock-header">
                      <span className="visual-mock-title"><FaShieldAlt style={{ color: '#059669' }} /> Risk Mitigation Blueprint</span>
                      <span className="visual-mock-badge">Actionable</span>
                    </div>
                    <div className="visual-risk-pills">
                      <div className="risk-pill-item">
                        <div className="pill-top"><span>Technical Feasibility</span><strong className="text-success">Low (28%)</strong></div>
                        <p className="pill-desc">Standard APIs and open-source models reduce engineering failure risk.</p>
                      </div>
                      <div className="risk-pill-item">
                        <div className="pill-top"><span>Competitive Crowding</span><strong className="text-warning">Medium (54%)</strong></div>
                        <p className="pill-desc">Mitigate by hyper-focusing on underserved vertical workflows.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. 360° INTELLIGENCE MATRIX (9 CO-OPERATING MODULES)               */}
      {/* =================================================================== */}
      <section className="section-features">
        <div className="section-inner">
          <div className="section-label reveal">COMPLETE ECOSYSTEM</div>
          <h2 className="section-heading reveal">9 Comprehensive AI Intelligence Modules</h2>
          <p className="section-sub reveal">Every angle of your venture analyzed simultaneously with deep cross-module data synchronization</p>

          <div className="features-grid reveal">
            {[
              { icon: <FaGlobe />, title: 'Market Sizing (TAM/SAM/SOM)', desc: 'Regional addressable market estimation, CAGR expansion rate, and buyer demand indexing.', color: 'blue' },
              { icon: <FaUsers />, title: 'Competitor Intelligence', desc: 'Identify direct and indirect market competitors, explore their shortcomings, and locate gap opportunities.', color: 'purple' },
              { icon: <FaChartLine />, title: 'Financial Modeling', desc: 'Itemized setup CapEx, monthly operational OpEx, unit economics, LTV/CAC ratios, and break-even forecasts.', color: 'cyan' },
              { icon: <FaShieldAlt />, title: 'Risk Assessment & Mitigation', desc: '5-pillar quantitative risk audit covering Technical, Market, Financial, Operational, and Competitive hurdles.', color: 'green' },
              { icon: <FaRoute />, title: '12-Month Phased Roadmap', desc: '5-phase chronological milestone schedule with budget synchronization and clear deliverables.', color: 'orange' },
              { icon: <FaChartPie />, title: 'Business Model Canvas', desc: 'Key partners, cost structures, value propositions, channels, and customer segments in one unified canvas.', color: 'pink' },
              { icon: <FaBrain />, title: 'SWOT Matrix Analysis', desc: 'Tailored strengths, weaknesses, expansion opportunities, and defensive threats specific to your model.', color: 'teal' },
              { icon: <FaCommentsDollar />, title: 'Investor Readiness Score', desc: 'Evaluate venture appeal for angel investors and institutional seed funds with actionable recommendations.', color: 'indigo' },
              { icon: <FaRobot />, title: 'AI Strategy Co-Pilot', desc: '24/7 contextual chatbot assistant ready to answer questions and refine strategies on your live report.', color: 'red' },
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

      {/* =================================================================== */}
      {/* 6. THE V2V VIABILITY SCORE (HOW IT'S CALCULATED)                   */}
      {/* =================================================================== */}
      <section className="section-score-breakdown">
        <div className="section-inner">
          <div className="score-explainer-card reveal">
            <div className="score-header-col">
              <span className="score-super">PROPRIETARY METHODOLOGY</span>
              <h2>The V2V Viability Score (0-100)</h2>
              <p>
                Our composite viability index synthesizes hundreds of heuristic signals into four equally-weighted pillars. 
                Scores above 80 indicate strong venture-scale fundamentals.
              </p>
              <div className="score-tiers-list">
                <div className="score-tier-item tier-green">
                  <span className="tier-range">80 – 100</span>
                  <div className="tier-info"><strong>Tier-1 Venture Ready</strong><span>Exceptional unit economics and market headroom.</span></div>
                </div>
                <div className="score-tier-item tier-blue">
                  <span className="tier-range">65 – 79</span>
                  <div className="tier-info"><strong>Viable With Refinement</strong><span>Solid core concept requiring targeted GTM or pricing tweaks.</span></div>
                </div>
                <div className="score-tier-item tier-amber">
                  <span className="tier-range">&lt; 65</span>
                  <div className="tier-info"><strong>High Downside Friction</strong><span>Substantial competition, heavy initial burn, or weak margins.</span></div>
                </div>
              </div>
            </div>

            <div className="score-pillars-col">
              <div className="pillar-card">
                <div className="pillar-header">
                  <span className="pillar-icon" style={{ background: '#F0F9FF', color: '#0284C7' }}><FaGlobe /></span>
                  <div className="pillar-title"><h4>Market Opportunity</h4><span>25% Weight</span></div>
                </div>
                <p>TAM size, CAGR expansion, organic customer demand, and urgency of the customer pain point.</p>
              </div>

              <div className="pillar-card">
                <div className="pillar-header">
                  <span className="pillar-icon" style={{ background: '#ECFDF5', color: '#059669' }}><FaCoins /></span>
                  <div className="pillar-title"><h4>Unit Economics</h4><span>25% Weight</span></div>
                </div>
                <p>LTV:CAC ratio, gross profit margin profile, monthly burn rate, and capital recovery velocity.</p>
              </div>

              <div className="pillar-card">
                <div className="pillar-header">
                  <span className="pillar-icon" style={{ background: '#FAF5FF', color: '#7C3AED' }}><FaLaptopCode /></span>
                  <div className="pillar-title"><h4>Execution Feasibility</h4><span>25% Weight</span></div>
                </div>
                <p>Technical complexity, team skill alignment, regulatory compliance, and operational ease.</p>
              </div>

              <div className="pillar-card">
                <div className="pillar-header">
                  <span className="pillar-icon" style={{ background: '#FFFBEB', color: '#D97706' }}><FaShieldAlt /></span>
                  <div className="pillar-title"><h4>Risk &amp; Moat Defensibility</h4><span>25% Weight</span></div>
                </div>
                <p>Competitive crowding, supplier lock-in, barrier to entry, and downside vulnerability protection.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 7. ASYMMETRIC BENTO GRID (ENTERPRISE CAPABILITIES)                 */}
      {/* =================================================================== */}
      <section className="section-bento">
        <div className="section-inner">
          <div className="section-label reveal">CAPABILITIES SHOWCASE</div>
          <h2 className="section-heading reveal">Precision-Built for Modern Builders</h2>
          <p className="section-sub reveal">Engineered to eliminate blind spots and empower data-backed conviction</p>

          <div className="bento-grid reveal">
            {/* Card 1 - Large Feature Card */}
            <div className="bento-card bento-large">
              <div className="bento-badge"><FaBuilding /> DUAL-MODE ARCHITECTURE</div>
              <h3>Specialized Offline Retail &amp; Online SaaS Engines</h3>
              <p>
                A food truck or cloud kitchen needs commercial refrigeration, FSSAI licenses, and high-street footfall. 
                A SaaS app requires cloud instances, payment webhooks, and digital marketing CAC. 
                Vision2Venture adapts its logic dynamically based on your chosen venture format.
              </p>
              <div className="bento-split-tags">
                <span className="bento-tag tag-offline">🏪 Offline: Prime Lease, Machinery, POS, Municipal NOCs</span>
                <span className="bento-tag tag-online">💻 Online: AWS Hosting, CI/CD, Stripe/Razorpay, LTV Modeling</span>
              </div>
            </div>

            {/* Card 2 - Stat Card */}
            <div className="bento-card bento-stat">
              <div className="bento-icon-box" style={{ background: '#F0F9FF', color: '#0284C7' }}><FaCalculator /></div>
              <h4>Itemized CapEx Math</h4>
              <p>No vague estimates. Setup capital is reconciled to statutory incorporation fees, hardware purchases, and working capital buffers.</p>
              <div className="bento-mini-stat">₹0 Hidden Surprises</div>
            </div>

            {/* Card 3 - Benchmark Card */}
            <div className="bento-card bento-stat">
              <div className="bento-icon-box" style={{ background: '#FAF5FF', color: '#7C3AED' }}><FaSearch /></div>
              <h4>Y-Combinator Benchmarks</h4>
              <p>Evaluates your venture against successful startup cohorts to forecast realistic early revenue growth.</p>
              <div className="bento-mini-stat">5,000+ Startup Models</div>
            </div>

            {/* Card 4 - PDF Card */}
            <div className="bento-card bento-wide">
              <div className="bento-wide-content">
                <div className="bento-badge"><FaDownload /> INVESTOR READINESS</div>
                <h3>Institutional PDF Dossier in One Click</h3>
                <p>Generate a clean, high-contrast, professional validation report ready for venture capital associates, angel syndicates, and corporate partners.</p>
              </div>
              <div className="bento-pdf-mock">
                <div className="mock-pdf-header">
                  <span>Vision2Venture Diligence Dossier</span>
                  <span className="mock-pdf-badge">PDF Export</span>
                </div>
                <div className="mock-pdf-lines">
                  <div className="mock-line" style={{ width: '85%' }}></div>
                  <div className="mock-line" style={{ width: '65%' }}></div>
                  <div className="mock-line" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 8. AI ASSISTANT SHOWCASE                                            */}
      {/* =================================================================== */}
      <section className="section-assistant-showcase">
        <div className="section-inner">
          <div className="assistant-card reveal">
            <div className="assistant-info-col">
              <div className="section-label" style={{ textAlign: 'left', marginBottom: '8px' }}>24/7 STRATEGY CO-PILOT</div>
              <h2>Interactive Advisory On Every Report</h2>
              <p>
                Have questions about your break-even month or want ideas to optimize your unit economics? 
                Vision2Venture’s AI Assistant retains full contextual awareness of your venture report.
              </p>
              <div className="assistant-benefits">
                <div className="benefit-row"><FaCheckCircle style={{ color: '#059669' }} /> Ask how to lower CAC with zero ad spend</div>
                <div className="benefit-row"><FaCheckCircle style={{ color: '#059669' }} /> Request alternative pricing tiers and upsell packages</div>
                <div className="benefit-row"><FaCheckCircle style={{ color: '#059669' }} /> Get customized pitch-deck talking points for angel meetings</div>
              </div>
              <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary" style={{ marginTop: '24px' }}>
                <FaRobot /> Try AI Co-Pilot Free
              </Link>
            </div>

            <div className="assistant-chat-col">
              <div className="mock-chat-window">
                <div className="chat-window-header">
                  <div className="chat-avatar"><FaRobot /></div>
                  <div className="chat-header-text">
                    <strong>Vision2Venture Co-Pilot</strong>
                    <span>Context: Artisanal Cloud Kitchen Report</span>
                  </div>
                  <span className="chat-online-pill">Online</span>
                </div>

                <div className="chat-messages-container">
                  <div className="chat-bubble user">
                    <p>How can I reduce my break-even timeline from Month 6 to Month 4?</p>
                    <span className="chat-time">10:24 AM</span>
                  </div>
                  <div className="chat-bubble ai">
                    <p>
                      To accelerate break-even by 60 days, execute these 2 high-leverage pivots:
                      <br />
                      <strong>1. Corporate Lunch Subscriptions:</strong> Pre-sell 40 monthly corporate meal plans at ₹3,200/mo to guarantee ₹1.28L upfront cashflow before launch.
                      <br />
                      <strong>2. Negotiate Rent Abatement:</strong> Request a 45-day fit-out rent moratorium from the landlord to save ₹70,000 in pre-operational burn.
                    </p>
                    <span className="chat-time">10:24 AM • Vision2Venture AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 9. PERSONAS (WHO IT IS BUILT FOR)                                  */}
      {/* =================================================================== */}
      <section className="section-personas">
        <div className="section-inner">
          <div className="section-label reveal">AUDIENCE TAILORED</div>
          <h2 className="section-heading reveal">Built For Every Venture Builder</h2>
          <p className="section-sub reveal">Trusted across tech hubs, universities, incubators, and high streets</p>

          <div className="personas-grid reveal">
            <div className="persona-card">
              <div className="persona-icon-wrap" style={{ background: '#F0F9FF', color: '#0284C7' }}><FaUserTie /></div>
              <h4>First-Time Founders</h4>
              <p>Test your business idea before quitting your job or investing personal savings into development.</p>
            </div>

            <div className="persona-card">
              <div className="persona-icon-wrap" style={{ background: '#FAF5FF', color: '#7C3AED' }}><FaRocket /></div>
              <h4>Serial Entrepreneurs</h4>
              <p>Rapidly screen a dozen opportunity hypotheses in hours to find the single venture with the highest ROI.</p>
            </div>

            <div className="persona-card">
              <div className="persona-icon-wrap" style={{ background: '#ECFDF5', color: '#059669' }}><FaGraduationCap /></div>
              <h4>Incubators &amp; Universities</h4>
              <p>Standardize applicant venture evaluations with objective scores and comprehensive risk audits.</p>
            </div>

            <div className="persona-card">
              <div className="persona-icon-wrap" style={{ background: '#FFFBEB', color: '#D97706' }}><FaCoins /></div>
              <h4>Angel Investors &amp; Syndicates</h4>
              <p>Conduct lightning-fast preliminary diligence before committing time to deep founder partner calls.</p>
            </div>

            <div className="persona-card">
              <div className="persona-icon-wrap" style={{ background: '#ECFEFF', color: '#0891B2' }}><FaStore /></div>
              <h4>Retail &amp; Offline Owners</h4>
              <p>Accurate CapEx breakdowns for lease fitout, equipment purchases, licensing, and daily footfall.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 10. COMPARISON TABLE                                                */}
      {/* =================================================================== */}
      <section className="section-compare">
        <div className="section-inner">
          <div className="section-label reveal">THE CLEAR ADVANTAGE</div>
          <h2 className="section-heading reveal">Why Vision2Venture?</h2>
          <p className="section-sub reveal">See how AI-powered validation outperforms traditional alternatives</p>

          <div className="compare-grid reveal">
            <div className="compare-card v2v">
              <div className="compare-label">
                <FaRocket style={{ color: '#0284c7' }} /> Vision2Venture AI
              </div>
              <ul>
                <li><FaCheckCircle /> <strong>60-Second Full Synthesis</strong> across 9 specialized modules</li>
                <li><FaCheckCircle /> <strong>100% Free Initial Access</strong> to validate concepts immediately</li>
                <li><FaCheckCircle /> <strong>Mathematical Formula Blocks</strong> explaining every financial metric</li>
                <li><FaCheckCircle /> <strong>Dual-Mode Engine</strong> for Online, Offline &amp; Hybrid businesses</li>
                <li><FaCheckCircle /> <strong>Institutional PDF Dossier</strong> with one-click export</li>
                <li><FaCheckCircle /> <strong>24/7 Contextual Co-Pilot</strong> to answer follow-up questions</li>
              </ul>
            </div>

            <div className="compare-vs">VS</div>

            <div className="compare-card manual">
              <div className="compare-label">
                Traditional Consultants &amp; Gut-Feel
              </div>
              <ul>
                <li><FaTimesCircle /> <strong>3 to 6 Weeks</strong> of manual research delays</li>
                <li><FaTimesCircle /> <strong>₹2,50,000+</strong> in expensive management consulting fees</li>
                <li><FaTimesCircle /> <strong>Black-Box Estimates</strong> without verifiable math formulas</li>
                <li><FaTimesCircle /> <strong>Single-Industry Bias</strong> that ignores offline retail realities</li>
                <li><FaTimesCircle /> <strong>Static PPT Slips</strong> that become outdated immediately</li>
                <li><FaTimesCircle /> <strong>Zero Ongoing Co-Pilot</strong> once the invoice is paid</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 11. FINAL HIGH-IMPACT CTA & ENTERPRISE FOOTER                       */}
      {/* =================================================================== */}
      <section className="section-cta">
        <div className="cta-glow"></div>
        <div className="section-inner reveal">
          <div className="cta-card-box">
            <div className="cta-badge">
              <FaStar style={{ color: '#f59e0b' }} /> Zero Risk • Instant Validation
            </div>
            <h2>Validate Your Venture in the Next 60 Seconds</h2>
            <p>
              Join over 500 founders who save months of wasted development and capital. 
              Get your complete feasibility score, market analysis, and financial projections now.
            </p>
            <div className="cta-buttons-row">
              <Link to={user ? "/new-idea" : "/register"} className="hero-btn-primary">
                <FaRocket /> Start Free Analysis Now <FaArrowRight />
              </Link>
              <Link to={user ? "/dashboard" : "/login"} className="hero-btn-secondary">
                View Sample Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise SaaS Footer */}
      <footer className="landing-footer">
        <div className="section-inner">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <div className="footer-logo">
                <span className="logo-v">V2V</span>
                <span className="logo-name">Vision2Venture</span>
              </div>
              <p className="footer-tagline">
                The institutional-grade startup intelligence and feasibility platform. 
                Empowering founders and investors to make data-driven venture decisions.
              </p>
              <div className="footer-status-indicator">
                <span className="status-ping"></span>
                <span>All Intelligence Engines Operational</span>
              </div>
            </div>

            <div className="footer-links-col">
              <h5>Solutions</h5>
              <ul>
                <li><Link to="/register">SaaS Feasibility</Link></li>
                <li><Link to="/register">Offline &amp; Retail</Link></li>
                <li><Link to="/register">D2C E-Commerce</Link></li>
                <li><Link to="/register">Investor Diligence</Link></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h5>Platform</h5>
              <ul>
                <li><Link to="/dashboard">Intelligence Cockpit</Link></li>
                <li><Link to="/new-idea">Analyze New Idea</Link></li>
                <li><Link to="/assistant">AI Co-Pilot</Link></li>
                <li><Link to="/profile">Account Settings</Link></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h5>Account</h5>
              <ul>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Create Free Account</Link></li>
                <li><Link to="/dashboard">Saved Analyses</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-row">
            <div className="footer-copy">
              &copy; {new Date().getFullYear()} Vision2Venture Inc. All rights reserved. Precision-engineered for global founders.
            </div>
            <div className="footer-bottom-links">
              <span>Privacy Policy</span>
              <span className="sep">•</span>
              <span>Terms of Service</span>
              <span className="sep">•</span>
              <span>Security &amp; Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
