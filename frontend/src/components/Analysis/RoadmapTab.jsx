import React, { useState, useRef } from 'react';
import {
  FaMapSigns, FaCheckCircle, FaCalendarAlt, FaTrophy, FaTools,
  FaRupeeSign, FaBullseye, FaFlag, FaChevronLeft, FaChevronRight,
  FaLink, FaLightbulb, FaShieldAlt, FaRocket, FaClock, FaCheck,
  FaClipboardList, FaCoins, FaBalanceScale, FaBuilding, FaReceipt, FaCalculator
} from 'react-icons/fa';

// Client-side fallback intelligence synchronized with Financial Intelligence
const calculateFallbackRoadmap = (idea, data) => {
  const title = idea?.title || 'Startup Project';
  const ind = (idea?.industry || 'Technology').toLowerCase();
  const sec = (idea?.sector || 'online').toLowerCase();
  const isOffline = sec.includes('offline') || sec.includes('physical');
  const isHybrid = sec.includes('hybrid') || sec.includes('phygital');
  const userBudget = parseFloat(idea?.budget || 0);

  let totalCapex = isOffline ? 600000 : (isHybrid ? 480000 : 320000);
  if (userBudget >= 500000) {
    totalCapex = Math.max(totalCapex, Math.round(userBudget * 0.55));
  }

  let devCost = Math.round(totalCapex * (isOffline ? 0.40 : 0.48));
  let hwCost = Math.round(totalCapex * (isOffline ? 0.35 : 0.24));
  let licCost = Math.round(totalCapex * (isOffline ? 0.08 : 0.12));
  let brandCost = Math.round(totalCapex * (isOffline ? 0.07 : 0.10));
  let invCost = Math.round(totalCapex * (isOffline ? 0.10 : 0.06));

  let p1Cost = licCost + Math.round(brandCost * 0.6);
  let p3Cost = invCost + Math.round(brandCost * 0.4);
  let p2Cost = totalCapex - (p1Cost + p3Cost);

  let monthlyOpex = isOffline ? 303000 : (isHybrid ? 293300 : 207000);

  return {
    total_setup_capex: totalCapex,
    monthly_opex: monthlyOpex,
    break_even_months: isOffline ? 8 : (isHybrid ? 11 : 9),
    timeline: '12 Months to Break-Even & Scale',
    phase_1_cost: p1Cost,
    phase_2_cost: p2Cost,
    phase_3_cost: p3Cost,
    phase_4_cost: monthlyOpex,
    phase_5_cost: Math.round(monthlyOpex * 0.65)
  };
};

const RoadmapTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('timeline');
  const subtabBarRef = useRef(null);

  const fb = calculateFallbackRoadmap(idea, data);

  const scrollTabs = (direction) => {
    if (subtabBarRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      subtabBarRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  const title = idea?.title || 'Startup Project';
  const sector = (idea?.sector || 'online').toUpperCase();
  const industry = idea?.industry || 'Technology';

  // Extract phases
  const phases = [];
  const phaseColors = ['#0ea5e9', '#10b981', '#06b6d4', '#10b981', '#f59e0b'];

  for (let i = 1; i <= 5; i++) {
    const phaseKey = `phase_${i}`;
    const p = data?.[phaseKey];
    if (p && typeof p === 'object') {
      phases.push({
        id: i,
        name: p.name || `Phase ${i}`,
        duration: p.duration || `Months ${i * 2 - 1}–${i * 2}`,
        weeks: p.weeks || `Weeks ${(i - 1) * 8 + 1}–${i * 8}`,
        focus: p.focus || 'Strategic Execution & Milestones',
        tasks: Array.isArray(p.tasks) ? p.tasks : (typeof p.tasks === 'string' ? p.tasks.split('\n').filter(Boolean) : []),
        milestones: Array.isArray(p.milestones) ? p.milestones : (typeof p.milestones === 'string' ? p.milestones.split('•').map(s => s.trim()).filter(Boolean) : []),
        success_metrics: Array.isArray(p.success_metrics) ? p.success_metrics : (typeof p.success_metrics === 'string' ? p.success_metrics.split('•').map(s => s.trim()).filter(Boolean) : []),
        estimated_cost: String(p.estimated_cost || 'N/A').replace(/\$/g, '₹'),
        cost_numeric: Number(p.cost_numeric) || (i === 1 ? fb.phase_1_cost : (i === 2 ? fb.phase_2_cost : (i === 3 ? fb.phase_3_cost : (i === 4 ? fb.phase_4_cost : fb.phase_5_cost)))),
        cost_rationale: p.cost_rationale || `Operational expenditure allocated to complete all phase deliverables.`,
        financial_tab_tie: p.financial_tab_tie || (i <= 3 ? `Directly tied to Setup CapEx in Financial Tab.` : `Directly tied to Monthly OpEx burn rate in Financial Tab.`)
      });
    }
  }

  // If no phases in data, build domain-tailored fallback phases
  if (phases.length === 0) {
    const textCombo = `${title} ${industry} ${sector}`.toLowerCase();
    const isGym = /gym|fitness|crossfit|workout|strength/.test(textCombo);
    const isBakery = /bakery|sourdough|bread|pastry|croissant|crust/.test(textCombo);
    const isClinic = /clinic|healthcare|medical|doctor|carepoint|opd/.test(textCombo);
    const isGrocery = /grocery|farm|produce|freshfarm|agri|organic/.test(textCombo);
    const isFinOps = /finops|cloud cost|aws cost|cloud spend/.test(textCombo);
    const isResume = /resume|portfolio|job|career|ats/.test(textCombo);
    const isDining = /biryani|restaurant|food|dining|qsr|catering/.test(textCombo);

    const p1Name = isGym
      ? 'Phase 1: Legal Incorporation, Commercial Lease & Gym Floor Blueprint'
      : isBakery
      ? 'Phase 1: Legal Incorporation, Sourdough Starter & High-Street Lease'
      : isClinic
      ? 'Phase 1: Legal Incorporation, Clinical Registration & Facility Lease'
      : isGrocery
      ? 'Phase 1: Legal Incorporation, Farm Sourcing & Dark Store Lease'
      : isFinOps
      ? 'Phase 1: Corporate Incorporation, AWS Partner Status & IAM Architecture'
      : isResume
      ? 'Phase 1: MCA Incorporation, Domain Acquisition & ATS Engine Blueprint'
      : isDining
      ? 'Phase 1: Legal Incorporation, Concept Finalization & FSSAI Licensing'
      : 'Phase 1: Legal Incorporation, Architecture Blueprint & Foundation';

    const p1Focus = isGym
      ? 'Statutory Licensing, High-Street Commercial Lease & Rig Floor Plan'
      : isBakery
      ? 'FSSAI License, Commercial Retail Lease & Kitchen Ventilation'
      : isClinic
      ? 'Clinical Establishment Clearances, Doctor Roster & EMR Architecture'
      : isGrocery
      ? 'Farm-Gate Agreements, APMC Licensing & Micro-Warehouse Lease'
      : isFinOps
      ? 'AWS/Azure Marketplace Partner Onboarding & SOC-2 Framework'
      : isResume
      ? 'ATS Schema Mapping, LaTeX Engine Blueprint & DPIIT Startup India'
      : isDining
      ? 'FSSAI Food License, Municipal Health Trade License & Kitchen Layout'
      : 'Statutory Licensing, Cloud Infrastructure & Product Blueprint';

    const p1Tasks = isGym
      ? [
          'Incorporate entity with MCA (Pvt Ltd / LLP) and secure GSTIN & PAN',
          'Execute commercial property lease (2,500–4,000 sq.ft) with structural clearance for CrossFit drop zones',
          'Apply for Municipal Health Trade License, Fire Department NOC & building clearances',
          'Design 3D architectural floor layout: free weights zone, modular CrossFit rig, cardio deck & locker rooms'
        ]
      : isBakery
      ? [
          'Incorporate entity with MCA (Pvt Ltd / LLP) and secure FSSAI Food Manufacturing License & GSTIN',
          'Finalize high-street commercial lease (800–1,200 sq.ft) with heavy electrical & clean water supply',
          'Cultivate and stabilize proprietary 36-hour wild-yeast sourdough mother starter',
          'Design 3D bakery cafe layout: glass bread display, open deck ovens, coffee station & prep tables'
        ]
      : isClinic
      ? [
          'Incorporate entity with MCA and register under State Clinical Establishment Act',
          'Execute commercial lease for modern clinic facility (800–1,500 sq.ft) in high-density residential hub',
          'Design clinical layout: consultation rooms, observation bay, pharmacy counter & cold-chain storage',
          'Establish physician onboarding roster and register for ABDM (Ayushman Bharat Digital Mission) compliance'
        ]
      : isGrocery
      ? [
          'Incorporate entity with MCA and secure APMC mandi exemption, FSSAI retail license & GSTIN',
          'Execute lease for 1,200–2,000 sq.ft ground-floor neighborhood dark store / fulfillment hub',
          'Sign direct farm-gate procurement agreements with 15+ farmer producer organizations (FPOs)',
          'Design cold room (4-8°C), ambient produce sorting tables, and digital precision scale stations'
        ]
      : isFinOps
      ? [
          'Incorporate entity with MCA and register for DPIIT Startup India tax benefits & GSTIN',
          'Enroll in AWS Partner Network (APN) and Microsoft Azure Marketplace Partner Programs',
          'Design multi-cloud telemetry ingestion architecture using read-only IAM Cross-Account Roles and Cost Explorer APIs',
          'Establish SOC-2 Type 1 readiness framework and data privacy safeguards for cloud billing metadata'
        ]
      : isResume
      ? [
          'Incorporate entity with MCA (Pvt Ltd) and secure DPIIT Startup India recognition & GSTIN',
          'Acquire premium domain (.in / .com) and provision secure cloud VPC on AWS Mumbai',
          'Architect ATS resume parsing pipeline based on standard Workday, Taleo, and Greenhouse resume schemas',
          'Design 12 modern, mobile-responsive resume templates and personal portfolio microsite themes'
        ]
      : isDining
      ? [
          'Incorporate entity with MCA (Pvt Ltd / LLP) and secure PAN/TAN/GSTIN',
          'Apply for FSSAI State Food License, Municipal Health Trade License & Fire NOC',
          'Finalize commercial high-street lease and execute 3-month rental deposit',
          'Architectural interior design layout, 3D floor plan & commercial kitchen exhaust schematic'
        ]
      : [
          'Incorporate entity with MCA (Pvt Ltd / LLP) and secure GSTIN & PAN',
          'Apply for industry statutory approvals (DPIIT recognition, Trademark Class 9/42)',
          'High-fidelity UI/UX wireframing, architecture blueprint & customer discovery interviews',
          'Domain acquisition (.in / .com) and cloud staging VPC provisioning'
        ];

    const p2Name = isGym
      ? 'Phase 2: High-Density Flooring, Rig Fit-out & Coach Onboarding'
      : isBakery
      ? 'Phase 2: Deck Oven Commissioning, Spiral Mixers & Pastry Sheeter Fit-out'
      : isClinic
      ? 'Phase 2: Clinical Fit-Out, Diagnostic Calibration & EMR Deployment'
      : isGrocery
      ? 'Phase 2: Cold-Chain Storage, Sorting Line & Hyperlocal POS Deployment'
      : isFinOps
      ? 'Phase 2: Multi-Cloud Billing Ingestion Engine & Kubernetes Cost Daemon Build'
      : isResume
      ? 'Phase 2: LLM Fine-Tuning, Dynamic LaTeX PDF Engine & Interactive Portfolio Builder'
      : 'Phase 2: Core Infrastructure Build, Equipment Setup & MVP Development';

    const p2Tasks = isGym
      ? [
          'Install high-density acoustic rubber drop flooring and specialized Olympic lifting platforms',
          'Erect custom steel CrossFit rig with pull-up bars, gymnastic rings, and squat stations',
          'Procure Olympic barbells, bumper plate sets, kettlebells, Concept2 rowers, and Assault air bikes',
          'Hire Head Coach (CrossFit Level-1/2) and 2 certified strength trainers; standardize class SOPs'
        ]
      : isBakery
      ? [
          'Install commercial multi-deck stone ovens with steam injection, spiral dough mixers, and pastry sheeters',
          'Commission commercial refrigeration, proofing cabinets, and espresso machine coffee station',
          'Hire Master Baker / Head Pastry Chef (@ ₹40k) and 2 assistant bakers / front-of-house staff',
          'Standardize recipes for country sourdough, seeded loaves, French butter croissants, and seasonal pastries'
        ]
      : isClinic
      ? [
          'Complete clinical civil interior fit-out, medical gas lines, and calibrated diagnostic equipment',
          'Deploy ABDM-certified Electronic Medical Record (EMR) software and WhatsApp queue alerts',
          'Stock dispensary with essential generic medicines and rapid diagnostic test kits',
          'Onboard 2 MBBS general physicians and certified nursing staff for multi-shift coverage'
        ]
      : isGrocery
      ? [
          'Install commercial cold-room storage and ethylene absorption filters for fresh produce shelf-life extension',
          'Deploy digital precision scale barcode scanners and batch-traceability inventory POS software',
          'Procure eco-friendly biodegradable packaging and insulated delivery crates',
          'Onboard and train 8 dedicated delivery partners with electric two-wheelers (EVs)'
        ]
      : isFinOps
      ? [
          'Build high-throughput billing data ingestion workers for AWS CUR and Azure Cost Management',
          'Develop Kubernetes (EKS/GKE) container-level resource allocation daemon for pod-level cost attribution',
          'Implement statistical anomaly detection engine alerting engineers on unexpected cloud spend spikes',
          'Build interactive FinOps executive dashboard with RI/Savings Plan recommendations'
        ]
      : isResume
      ? [
          'Implement fine-tuned AI bullet point rewrite models optimized for action verbs and quantified metrics',
          'Build sub-second LaTeX / SVG rendering pipeline generating clean, ATS-compliant PDF downloads',
          'Develop 1-click personal web portfolio generator with custom subdomains (username.v2v.me)',
          'Integrate Razorpay payment gateway for instant UPI, credit card, and recurring subscription checkout'
        ]
      : [
          'Execute core product engineering sprint / commercial interior fit-out',
          'Procure high-performance developer workstations / commercial equipment machinery',
          'Implement core database schemas, APIs, and payment gateway webhooks (Razorpay)',
          'Hire core founding personnel aligned with Indian market salary standards'
        ];

    phases.push(
      {
        id: 1,
        name: p1Name,
        duration: 'Months 1–2',
        weeks: 'Weeks 1–8',
        focus: p1Focus,
        tasks: p1Tasks,
        milestones: ['Entity incorporated with corporate bank account', 'Facility lease executed / Architecture blueprint validated'],
        success_metrics: ['100% regulatory documentation clearance', 'Pre-launch validation confirmed'],
        estimated_cost: formatCurrency(fb.phase_1_cost),
        cost_numeric: fb.phase_1_cost,
        cost_rationale: 'Covers statutory government incorporation fees, trademark filing, CA retainers, and initial branding assets.',
        financial_tab_tie: 'Synchronized with Financial Tab: Allocates 100% of Legal/Licensing CapEx + 60% of Branding CapEx.'
      },
      {
        id: 2,
        name: p2Name,
        duration: 'Months 3–5',
        weeks: 'Weeks 9–20',
        focus: 'Equipment Commissioning, Core Build & Operational Setup',
        tasks: p2Tasks,
        milestones: ['Production MVP / Commercial facility 100% ready', 'First end-to-end operational dry-run successful'],
        success_metrics: ['Zero critical safety or operational defects', 'Facility/system operational readiness > 95%'],
        estimated_cost: formatCurrency(fb.phase_2_cost),
        cost_numeric: fb.phase_2_cost,
        cost_rationale: 'Covers production-grade infrastructure build/fit-out and high-performance equipment machinery.',
        financial_tab_tie: 'Synchronized with Financial Tab: Allocates 100% of Development CapEx + 100% of Hardware CapEx.'
      },
      {
        id: 3,
        name: 'Phase 3: Soft Opening, Beta Cohort & Launch Campaign',
        duration: 'Months 6–7',
        weeks: 'Weeks 21–28',
        focus: 'Beta Pilot, User Feedback & Launch Collateral',
        tasks: [
          'Deploy opening consumable inventory buffer and staging cloud reserve',
          'Host invite-only closed beta test / soft opening with pilot cohort',
          'Launch digital marketing teaser campaigns and regional PR outreach',
          'Iterate on user feedback, edge-case bottlenecks, and customer support SOPs'
        ],
        milestones: ['First 100 paying customers successfully onboarded', 'Customer satisfaction rating established at > 4.6★'],
        success_metrics: ['Average Order Value at target ticket size', '30-day user retention rate > 35%'],
        estimated_cost: formatCurrency(fb.phase_3_cost),
        cost_numeric: fb.phase_3_cost,
        cost_rationale: 'Covers opening inventory buffer, pilot staging reserve, launch collateral, and initial customer onboarding tests.',
        financial_tab_tie: 'Synchronized with Financial Tab: Allocates 100% of Inventory/Staging CapEx + 40% of Branding CapEx.'
      },
      {
        id: 4,
        name: 'Phase 4: Commercial Scale & Operational Break-Even',
        duration: 'Months 8–10',
        weeks: 'Weeks 29–40',
        focus: 'Customer Acquisition Velocity & Break-Even Run-Rate',
        tasks: [
          'Scale monthly sales volume to surpass the operational break-even threshold',
          'Deploy performance marketing campaigns on Meta & Google Ads at target blended CAC',
          'Optimize procurement and operational workflows to maintain healthy gross margins',
          'Achieve monthly cashflow profitability covering all staff salaries, rent, and overhead'
        ],
        milestones: ['Operational break-even surpassed with positive monthly net operating profit', 'Customer Acquisition Cost (CAC) fully recouped within 4 months'],
        success_metrics: ['Monthly revenue exceeds monthly operating costs', 'LTV:CAC ratio exceeding 3.8x'],
        estimated_cost: formatCurrency(fb.phase_4_cost),
        cost_numeric: fb.phase_4_cost,
        cost_rationale: 'Represents baseline monthly operating expenditure (staff payroll, facility rent, cloud, utilities, and marketing) required to drive sales volume past break-even.',
        financial_tab_tie: 'Synchronized with Financial Tab: Matches exactly 1 month of full Operational Expenditure (OpEx).'
      },
      {
        id: 5,
        name: 'Phase 5: CapEx Recoup, Moat Building & Expansion',
        duration: 'Months 11–12',
        weeks: 'Weeks 41–52',
        focus: 'Capital Payback, Enterprise Tier / 2nd Outlet & Scale',
        tasks: [
          'Accumulate monthly net profits to achieve complete payback of initial setup CapEx',
          'Launch enterprise value-add modules, premium tier passes, or evaluate 2nd location expansion',
          'Establish strategic partnerships and distribution affiliate networks',
          'Package audited unit economics and financial statements for institutional expansion round'
        ],
        milestones: ['Initial setup CapEx 100% recouped from free cashflows', 'Annualized revenue run-rate exceeding target ARR'],
        success_metrics: ['Self-sustaining runway with positive free cashflow', 'Gross margin sustained above target benchmark'],
        estimated_cost: formatCurrency(fb.phase_5_cost),
        cost_numeric: fb.phase_5_cost,
        cost_rationale: 'Funded entirely from free monthly operating profits and retained earnings to scale capacity without external debt.',
        financial_tab_tie: 'Synchronized with Financial Tab: Funded via monthly net operating profits.'
      }
    );
  }

  const totalCapEx = data?.total_setup_capex || fb.total_setup_capex;
  const monthlyOpEx = data?.monthly_opex || fb.monthly_opex;
  const breakEvenMonths = data?.break_even_months || fb.break_even_months;

  // CapEx Phases sum
  const setupPhasesSum = (phases[0]?.cost_numeric || 0) + (phases[1]?.cost_numeric || 0) + (phases[2]?.cost_numeric || 0);

  return (
    <div className="tab-pane roadmap-tab animate-fade-in">
      
      {/* ============================================================ */}
      {/* 1. EXECUTIVE ROADMAP COMMAND HEADER                          */}
      {/* ============================================================ */}
      <div className="roadmap-command-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FaMapSigns style={{ color: '#10b981' }} /> Implementation Roadmap &amp; Execution Blueprint
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              Phased strategic milestones strictly calibrated in Indian Rupees (₹) and mathematically synchronized with your CapEx &amp; OpEx financial model.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="fin-badge currency"><FaRupeeSign /> Indian Rupee (₹)</span>
            <span className="fin-badge sector"><FaBuilding /> {sector} MODEL</span>
            <span className="fin-badge benchmark"><FaRocket /> 12-MONTH HORIZON</span>
          </div>
        </div>

        {/* 4 STRATEGIC HORIZON KPI CARDS */}
        <div className="fin-kpi-grid">
          <div className="fin-kpi-card">
            <div className="fin-kpi-label"><FaTools style={{ color: '#0ea5e9' }} /> Setup CapEx Deployment</div>
            <div className="fin-kpi-value text-info" style={{ color: '#0284c7' }}>{formatCurrency(totalCapEx)}</div>
            <div className="fin-kpi-sub">Phases 1–3 Launch Budget</div>
          </div>

          <div className="fin-kpi-card">
            <div className="fin-kpi-label"><FaReceipt style={{ color: '#f59e0b' }} /> Phase 4 Monthly Burn</div>
            <div className="fin-kpi-value" style={{ color: '#d97706' }}>{formatCurrency(monthlyOpEx)}<span style={{ fontSize: '0.8rem', color: '#64748B' }}>/mo</span></div>
            <div className="fin-kpi-sub">Operational Run-Rate</div>
          </div>

          <div className="fin-kpi-card">
            <div className="fin-kpi-label"><FaBullseye style={{ color: '#10b981' }} /> Break-Even Target</div>
            <div className="fin-kpi-value" style={{ color: '#059669' }}>Month {breakEvenMonths}</div>
            <div className="fin-kpi-sub">Operational Profitability</div>
          </div>

          <div className="fin-kpi-card">
            <div className="fin-kpi-label"><FaTrophy style={{ color: '#06b6d4' }} /> Total Milestones</div>
            <div className="fin-kpi-value" style={{ color: '#0284c7' }}>15 Milestones</div>
            <div className="fin-kpi-sub">Across 5 Execution Phases</div>
          </div>
        </div>
      </div>


      {/* ============================================================ */}
      {/* 2. SUB-TAB NAVIGATION BAR (HORIZONTAL SCROLL WITH ARROWS)    */}
      {/* ============================================================ */}
      <div className="roadmap-subtab-container">
        <button
          type="button"
          className="roadmap-scroll-arrow left"
          onClick={() => scrollTabs('left')}
          aria-label="Scroll left"
          title="Scroll Left"
        >
          <FaChevronLeft />
        </button>

        <div className="roadmap-subtab-bar" ref={subtabBarRef}>
          <button
            type="button"
            onClick={() => setActiveSubTab('timeline')}
            className={`roadmap-subtab-btn ${activeSubTab === 'timeline' ? 'active timeline-active' : ''}`}
          >
            <FaCalendarAlt style={{ color: activeSubTab === 'timeline' ? '#ffffff' : '#059669' }} /> Execution Timeline
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('milestones')}
            className={`roadmap-subtab-btn ${activeSubTab === 'milestones' ? 'active milestones-active' : ''}`}
          >
            <FaTrophy style={{ color: activeSubTab === 'milestones' ? '#ffffff' : '#d97706' }} /> Milestones &amp; KPIs
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('costs')}
            className={`roadmap-subtab-btn ${activeSubTab === 'costs' ? 'active costs-active' : ''}`}
          >
            <FaCoins style={{ color: activeSubTab === 'costs' ? '#ffffff' : '#0284c7' }} /> Phase Budgets &amp; CapEx Tie
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('tasks')}
            className={`roadmap-subtab-btn ${activeSubTab === 'tasks' ? 'active tasks-active' : ''}`}
          >
            <FaClipboardList style={{ color: activeSubTab === 'tasks' ? '#ffffff' : '#0284c7' }} /> Operational Checklist
          </button>
        </div>

        <button
          type="button"
          className="roadmap-scroll-arrow right"
          onClick={() => scrollTabs('right')}
          aria-label="Scroll right"
          title="Scroll Right"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB 1: 5-PHASE INTERACTIVE EXECUTION TIMELINE            */}
      {/* ============================================================ */}
      {activeSubTab === 'timeline' && (
        <div className="animate-fade-in" style={{ maxWidth: '980px', margin: '0 auto' }}>
          {phases.map((phase, idx) => {
            const color = phaseColors[idx % phaseColors.length];
            return (
              <div key={idx} className="rm-timeline-row">
                
                {/* Visual Connector Column */}
                <div className="rm-node-col">
                  <div className="rm-node-bubble" style={{ background: color }}>
                    {idx + 1}
                  </div>
                  {idx < phases.length - 1 && (
                    <div
                      className="rm-node-line"
                      style={{ background: `linear-gradient(to bottom, ${color}, ${phaseColors[(idx + 1) % phaseColors.length]})` }}
                    />
                  )}
                </div>

                {/* Main Phase Card */}
                <div className="rm-card" style={{ borderTop: `3px solid ${color}` }}>
                  
                  <div className="rm-card-header">
                    <div>
                      <h4 className="rm-card-title" style={{ color: color }}>{phase.name}</h4>
                      <div className="rm-card-focus">{phase.focus}</div>
                    </div>

                    <div className="rm-badge-group">
                      <span className="rm-cost-badge" style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}>
                        <FaCoins style={{ marginRight: '0.25rem' }} /> {phase.estimated_cost}
                      </span>
                      <span className="rm-duration-badge">
                        <FaClock /> {phase.duration} ({phase.weeks})
                      </span>
                    </div>
                  </div>

                  {/* Why it costs this much & Financial Tie */}
                  <div className="rm-why-box" style={{ borderLeftColor: color }}>
                    <div className="rm-why-label" style={{ color: color }}>
                      <FaRupeeSign /> Phase Capital Rationale:
                    </div>
                    <p className="rm-why-text">{phase.cost_rationale}</p>
                    <div className="rm-fin-tie">
                      <FaLink /> {phase.financial_tab_tie}
                    </div>
                  </div>

                  {/* Action Items Checklist */}
                  {phase.tasks && phase.tasks.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0.75rem 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaTools style={{ color: color }} /> Core Action Items &amp; Deliverables:
                      </div>
                      <div className="rm-task-grid">
                        {phase.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="rm-task-item">
                            <span className="rm-task-bullet" style={{ background: color }} />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones & Metrics Footer */}
                  <div className="rm-card-footer">
                    {phase.milestones && phase.milestones.length > 0 && (
                      <div className="rm-milestone-tile">
                        <div className="rm-milestone-label"><FaTrophy /> Key Milestones</div>
                        <div className="rm-milestone-val">{phase.milestones.join(' • ')}</div>
                      </div>
                    )}

                    {phase.success_metrics && phase.success_metrics.length > 0 && (
                      <div className="rm-metric-tile">
                        <div className="rm-metric-label"><FaBullseye /> Success Metrics</div>
                        <div className="rm-metric-val">{phase.success_metrics.join(' • ')}</div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: MILESTONES & SUCCESS KPIS                         */}
      {/* ============================================================ */}
      {activeSubTab === 'milestones' && (
        <div className="animate-fade-in">
          <div className="fin-cards-grid">
            {phases.map((phase, idx) => {
              const color = phaseColors[idx % phaseColors.length];
              return (
                <div key={idx} className="fin-item-card" style={{ borderTop: `3px solid ${color}` }}>
                  <div className="fin-card-header-row">
                    <span className="fin-card-title">{phase.name}</span>
                    <span className="fin-card-percent-pill">{phase.duration}</span>
                  </div>

                  <div className="mb-sm">
                    <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaTrophy /> Core Milestones:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#334155', fontSize: '0.84rem', lineHeight: 1.5 }}>
                      {phase.milestones.map((m, mIdx) => (
                        <li key={mIdx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-sm" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaBullseye /> Success Target Metrics:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#334155', fontSize: '0.84rem', lineHeight: 1.5 }}>
                      {phase.success_metrics.map((s, sIdx) => (
                        <li key={sIdx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="fin-calc-text" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.4rem' }}>
                    Strategic Focus: {phase.focus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: PHASE BUDGETS & CAPEX SYNCHRONIZATION             */}
      {/* ============================================================ */}
      {activeSubTab === 'costs' && (
        <div className="animate-fade-in">
          
          <div className="fin-formula-box" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="fin-formula-title">
              <FaCalculator style={{ color: '#059669' }} /> Capital Deployment Mathematical Reconciliation
            </div>
            <div className="fin-formula-code">
              Phase 1 (<span className="formula-val">{phases[0]?.estimated_cost}</span>) + Phase 2 (<span className="formula-val">{phases[1]?.estimated_cost}</span>) + Phase 3 (<span className="formula-val">{phases[2]?.estimated_cost}</span>) = <span className="formula-var">Setup CapEx:</span> <span className="formula-total">{formatCurrency(totalCapEx)}</span> • Phase 4: <span className="formula-val">{formatCurrency(monthlyOpEx)}/mo OpEx</span>
            </div>
            <div className="fin-formula-desc">
              Initial launch capital is disbursed across three controlled milestones prior to commercial scaling. Phase 4 onwards is funded directly from operating customer revenues.
            </div>
          </div>

          {/* Phased Budget Table */}
          <div className="glass-card p-lg mb-xl" style={{ overflowX: 'auto' }}>
            <h4 className="section-heading mb-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCoins style={{ color: '#10b981' }} /> Milestone Capital Disbursement &amp; Financial Tab Reconciliation
            </h4>

            <table className="fin-source-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Execution Phase</th>
                  <th style={{ width: '15%' }}>Duration</th>
                  <th style={{ width: '18%' }}>Budget Allocation (₹)</th>
                  <th style={{ width: '30%' }}>Financial Tab Component Synchronized</th>
                  <th style={{ width: '15%' }}>Funding Nature</th>
                </tr>
              </thead>
              <tbody>
                {phases.map((phase, idx) => (
                  <tr key={idx}>
                    <td><strong style={{ color: phaseColors[idx % phaseColors.length] }}>{phase.name}</strong></td>
                    <td>{phase.duration}</td>
                    <td><strong style={{ color: '#059669' }}>{phase.estimated_cost}</strong></td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{phase.financial_tab_tie}</td>
                    <td>
                      <span className={`fin-badge ${idx < 3 ? 'currency' : (idx === 3 ? 'sector' : 'benchmark')}`}>
                        {idx < 3 ? 'Setup CapEx' : (idx === 3 ? 'Monthly OpEx' : 'Retained Profits')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Strategic Liquidity Advisory Box */}
          <div className="fin-advisory-box">
            <FaShieldAlt className="fin-advisory-icon" style={{ color: '#0ea5e9' }} />
            <div className="fin-advisory-content">
              <h5>Staged Capital Deployment &amp; Runway Protection</h5>
              <p>
                By strictly tying Phase 1 (Foundation) to {phases[0]?.estimated_cost} and Phase 2 (Build) to {phases[1]?.estimated_cost}, founders avoid spending unallocated capital before confirming product validation. Maintaining Phase 3 launch reserves of {phases[2]?.estimated_cost} guarantees operational runway to absorb unexpected launch delays without defaulting on commitments.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 4: COMPREHENSIVE OPERATIONAL CHECKLIST               */}
      {/* ============================================================ */}
      {activeSubTab === 'tasks' && (
        <div className="animate-fade-in">
          <div className="glass-card p-xl mb-xl">
            <h4 className="section-heading mb-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaClipboardList style={{ color: '#06b6d4' }} /> Complete 12-Month Operational Execution Checklist
            </h4>

            {phases.map((phase, idx) => {
              const color = phaseColors[idx % phaseColors.length];
              return (
                <div key={idx} style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: idx < phases.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <h5 style={{ color: color, fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                      {phase.name} ({phase.duration})
                    </h5>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      Budget: <strong style={{ color: '#059669' }}>{phase.estimated_cost}</strong>
                    </span>
                  </div>

                  <div className="rm-task-grid">
                    {phase.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="rm-task-item">
                        <FaCheck style={{ color: '#10b981', marginTop: '0.2rem', flexShrink: 0 }} />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default RoadmapTab;
