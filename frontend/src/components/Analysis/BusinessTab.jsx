import React, { useState } from 'react';
import {
  FaBuilding, FaTable, FaProjectDiagram, FaCoins, FaHandshake,
  FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaShieldAlt,
  FaChartLine, FaRocket, FaUsers, FaBullseye, FaBolt, FaLock,
  FaCreditCard, FaBalanceScale, FaCogs, FaCube, FaCheck, FaServer,
  FaNetworkWired, FaCertificate, FaArrowRight, FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Universal 25-sector fallback intelligence repository for frontend resiliency
const FRONTEND_BUSINESS_INTELLIGENCE = {
  edtech: {
    archetype: 'B2B Institutional SaaS & Campus Workflows',
    gross_margin: '78% – 85%',
    ltv_cac: '4.2x – 4.8x',
    payback_months: '6 – 8 Months',
    problem: 'Manual timetable scheduling, severe teacher workload burnout, and complex elective alignment under NEP 2020 causing administrative gridlock in 85%+ of Indian schools and colleges.',
    solution: 'Automated algorithmic scheduling platform with real-time teacher substitution management, NEP credit-framework compliance, and multi-campus timetable optimization.',
    customer_segments: [
      'Primary ICP: K-12 Private & CBSE/ICSE Schools with 500+ students seeking automated NEP timetable compliance',
      'Higher Education: State/Central Universities and Autonomous Engineering Colleges managing 100+ multi-branch electives',
      'EdTech Coaching Institutes: Multi-center test-prep academies requiring dynamic batch and faculty scheduling',
      'Decision Makers: School Principals, Academic Deans, Vice Chancellors, and Institutional Trustees'
    ],
    value_proposition: 'Reduces institutional timetable generation time from 3 weeks to under 15 minutes, eliminates 100% of teacher scheduling clashes, and guarantees full compliance with NEP 2020 multidisciplinary guidelines.',
    channels: [
      'Direct Institutional Field Sales & Regional Academic Demos targeting School Associations (CBSE Sahodaya, CMA)',
      'Academic Leadership Summits & EdTech Conferences across Tier-1 & Tier-2 state capitals',
      'Inbound Case Studies & Whitepapers on Teacher Workload Burnout & NEP Academic Structuring',
      'Channel Partnerships with School ERP Vendors (Fedena, Entab, Teachmint) for marketplace add-on distribution'
    ],
    key_partners: [
      'School ERP & Student Information System (SIS) Software Providers',
      'Regional Private School Management Associations & Education Trusts',
      'Payment Gateways supporting automated school fee & subscription collection (Razorpay, Easebuzz)',
      'AWS Mumbai Cloud Infrastructure & Cloudflare CDN for zero-downtime exam-season traffic'
    ],
    key_activities: [
      'Heuristic algorithm refinement for complex multi-constraint scheduling (room capacities, teacher leaves)',
      'School administrator onboarding, institutional data migration, and faculty training workshops',
      'Continuous regulatory tracking of UGC, AICTE, and CBSE syllabus/credit shifts',
      'Enterprise SLA customer support during peak academic semester transitions (April–July)'
    ],
    key_resources: [
      'Proprietary constraint-satisfaction scheduling engine & room-faculty matching graph',
      'Institutional client historical scheduling datasets & teacher workload benchmarks',
      'Dedicated Indian education domain specialists & customer success engineers',
      'Enterprise sales collateral and validated multi-campus reference deployments'
    ],
    cost_structure: [
      'Core Software Engineering & Algorithm Optimization (35% of total spend)',
      'Institutional Field Sales, Travel & School Principals Summit Sponsorships (30%)',
      'Cloud Infrastructure, Database Hosting & Backup Storage on AWS ap-south-1 (15%)',
      'Customer Onboarding, Faculty Training & School Dedicated Account Management (12%)',
      'Legal, CBSE/UGC Regulatory Compliance & Audit Certifications (8%)'
    ],
    revenue_streams: [
      'Tier 1 Starter (Single School): ₹499 / month (₹399 / mo on annual plan, up to 40 faculty members)',
      'Tier 2 Pro (Multi-Wing School / College): ₹1,499 / month (₹1,199 / mo on annual plan, unlimited batches)',
      'Tier 3 Enterprise (University / Group of Schools): ₹4,999 / month (₹3,999 / mo on annual plan, custom ERP sync)',
      'Implementation & Faculty Onboarding Fee: ₹999 – ₹1,999 one-time setup charge'
    ],
    key_metrics: [
      'Annual Contract Value (ACV) & Institutional Net Revenue Retention (NRR > 115%)',
      'School Renewal Rate (>92% post-first academic cycle)',
      'Average Timetable Generation Latency (<10 minutes for 1,500 students)',
      'Customer Acquisition Cost (CAC) Payback (<7 months)'
    ],
    unfair_advantage: 'Proprietary Indian curriculum constraint rules pre-configured for CBSE, ICSE, and state university elective credit patterns, delivering instant out-of-the-box schedules without manual rule configuration.',
    pricing_tiers: [
      { tier: 'Starter Academy', monthlyPrice: '₹499', annualPrice: '₹4,788', period: '/ month', target: 'Single K-12 Schools (<600 students)', features: ['Automated schedule solver', 'Teacher leave substitution', 'WhatsApp alert digest', '2 admin seats'] },
      { tier: 'Campus Pro', monthlyPrice: '₹1,499', annualPrice: '₹14,388', period: '/ month', target: 'Large Schools & Junior Colleges (600–2,500 students)', features: ['NEP elective credit matrix', 'Lab room allocation', 'Bi-directional SIS sync', 'Unlimited staff logins'], popular: true },
      { tier: 'University Enterprise', monthlyPrice: '₹4,999', annualPrice: '₹47,988', period: '/ month', target: 'Multi-Campus Universities & School Chains', features: ['Multi-department scheduling', 'Cross-faculty load balancing', 'Custom API hooks', '24/7 dedicated account manager'] }
    ],
    swot: {
      strengths: [
        { title: 'Proprietary NEP-Compliant Scheduling Engine', desc: 'Pre-configured constraint solvers optimized specifically for Indian school elective and teacher substitution patterns.', impact: 'Core Competency', action: 'File provisional patent on the constraint-optimization heuristic to build an intellectual property moat.' },
        { title: 'High Institutional Retention & Switching Barrier', desc: 'Once an entire school\'s academic timetable is codified in the software, annual renewal rates exceed 90%.', impact: 'High Moat', action: 'Lock institutions into multi-year 3-year contracts with grandfathered pricing tiers.' },
        { title: 'Low Marginal Serving Cost', desc: 'Cloud-native compute cost per school is under ₹150/month, delivering gross margins above 80%.', impact: 'High Efficiency', action: 'Reinvest surplus unit margins into direct institutional sales territory expansion.' }
      ],
      weaknesses: [
        { title: 'Long Institutional Procurement Cycles', desc: 'School purchase decisions are heavily concentrated between January and May before the new academic year.', impact: 'Seasonality', action: 'Offer early-bird discounts and free trial semester runs during October–December to secure commitments early.' },
        { title: 'High Reliance on Administrator Tech Literacy', desc: 'Older school administrators may resist transitioning from manual paper charts to software.', impact: 'Adoption Friction', action: 'Deploy dedicated WhatsApp voice-support onboarding and simple Excel-import wizards.' }
      ],
      opportunities: [
        { title: 'NEP 2020 Multidisciplinary Credit Mandate', desc: 'Over 1.5 million schools and colleges in India must restructure schedules to support flexible electives.', impact: 'Growth Catalyst', action: 'Launch national marketing campaign positioned as the \'Official NEP-Ready Scheduling Partner\'.' },
        { title: 'White-Label ERP Integration', desc: 'Large school ERPs like Teachmint, Fedena, and Edunext lack native advanced scheduling engines.', impact: 'Distribution Scale', action: 'Establish OEM revenue-share API partnerships with leading school ERP vendors.' },
        { title: 'Expansion into Coaching Institutes & Universities', desc: 'Test-prep chains (Allen, FIITJEE, Aakash) require complex room-faculty rotation across cities.', impact: 'Enterprise Upsell', action: 'Develop enterprise multi-campus module with centralized faculty dispatch.' }
      ],
      threats: [
        { title: 'Bundling by Monolithic School ERP Providers', desc: 'Large all-in-one ERP platforms could build basic in-house timetable features and bundle them for free.', impact: 'Competitive Threat', action: 'Keep scheduling algorithms dramatically superior with AI substitution forecasting and NEP compliance.' },
        { title: 'Resistance to Technology Budgets in Budget Private Schools', desc: 'Low-fee private schools may be hesitant to allocate annual software subscriptions.', impact: 'Price Sensitivity', action: 'Offer a lightweight ad-supported or freemium basic edition to capture massive top-of-funnel volume.' }
      ]
    }
  },

  fintech: {
    archetype: 'Transaction Commission & Embedded Financial Infrastructure',
    gross_margin: '65% – 75%',
    ltv_cac: '3.8x – 4.5x',
    payback_months: '5 – 7 Months',
    problem: 'High merchant transaction failure rates, exorbitant payment gateway markups (2.2%+ MDR), and sluggish multi-day settlement cycles crippling cash flows for MSMEs across India.',
    solution: 'Next-generation payment routing gateway with sub-second UPI AutoPay orchestration, dynamic settlement algorithms, and automated reconciliation.',
    customer_segments: [
      'Primary ICP: Digital-first MSMEs, D2C brands, and retail merchants processing ₹5L–₹50L monthly GMV',
      'Enterprise Segment: B2B wholesalers and SaaS platforms requiring split-payment escrow & instant vendor payouts',
      'Consumer Base: Mobile-first digital shoppers utilizing UPI, RuPay credit cards, and Buy-Now-Pay-Later (BNPL)',
      'Decision Makers: Chief Financial Officers (CFOs), Head of Treasury, and E-commerce Founders'
    ],
    value_proposition: 'Boosts transaction success rates by 14.2% via multi-bank dynamic routing, slashes payment processing fees by 35%, and delivers instant T+0 merchant settlements.',
    channels: [
      'Product-Led Integration with OpenCart, WooCommerce, and Shopify Merchant App Stores',
      'B2B FinTech Aggregator Partnerships & CA/Accountant Referral Networks across Tier-1/2 trade hubs',
      'Developer API Evangelism & Hackathon Sponsorships targeting web3 and startup engineers',
      'High-intent Search Marketing on \'UPI payment gateway\', \'instant settlement API\', and \'low MDR payment gateway\''
    ],
    key_partners: [
      'Scheduled Commercial Banks (HDFC, ICICI, Axis Bank) for Escrow & Payment Aggregator (PA) Sponsorship',
      'National Payments Corporation of India (NPCI) for Direct UPI & RuPay Credit Rails',
      'Credit Bureaus (CIBIL, Experian) & Account Aggregators (Setu, Finvu) for credit underwriting telemetry',
      'AWS Mumbai Financial-Grade VPC with PCI-DSS Level 1 Hardware Security Modules (HSM)'
    ],
    key_activities: [
      'Multi-bank API routing latency optimization and automated intelligent failover handling',
      'Strict compliance monitoring under RBI Master Directions on Payment Aggregators (PA-PG guidelines)',
      'Continuous automated fraud scoring, anti-money laundering (AML), and chargeback arbitration',
      '24/7 bank settlement reconciliation and merchant treasury float management'
    ],
    key_resources: [
      'Proprietary smart payment routing algorithm with sub-50ms bank health heartbeat monitors',
      'RBI In-Principle PA authorization status and PCI-DSS Level 1 certified cloud infrastructure',
      'Experienced banking relations team and compliance legal counsel',
      'Bank escrow guarantee reserves for risk underwriting'
    ],
    cost_structure: [
      'Bank Interchange Fees & NPCI Network Switching Charges (45% of gross revenue)',
      'Financial-Grade Cloud Infrastructure, Hardware Security Modules & Cyber Insurance (20%)',
      'Merchant Acquisition Sales, Integration Engineering & B2B Performance Marketing (18%)',
      'Risk Underwriting, Regulatory Compliance, Audits & Legal Retainers (12%)',
      'Tier-1 Merchant Success & 24/7 Fraud Prevention Operations (5%)'
    ],
    revenue_streams: [
      'Starter Platform Fee: ₹499 / month (₹399 / mo on annual plan) + standard UPI rails',
      'Growth Merchant Subscription: ₹1,499 / month (₹1,199 / mo on annual plan) for automated recon & instant settlement',
      'Enterprise Tier: ₹4,999 / month (₹3,999 / mo on annual plan) for dedicated multi-bank switch routing',
      'Instant T+0 Settlement Surcharge: 0.15% flat on accelerated fund disbursements'
    ],
    key_metrics: [
      'Gross Merchandise Value (GMV Processed / month)',
      'Transaction Success Rate (>94.5% across peak UPI festival spikes)',
      'Net Take Rate (55–75 bps post-interchange)',
      'Merchant Monthly Churn (<1.5% with positive net expansion)'
    ],
    unfair_advantage: 'Direct NPCI switch connectivity combined with predictive multi-bank latency routing, achieving sub-1.2 second UPI payment completion times compared to legacy 3.5s gateway average.',
    pricing_tiers: [
      { tier: 'Growth Merchant', monthlyPrice: '₹499', annualPrice: '₹4,788', period: '/ month', target: 'Early-stage startups processing <₹10L GMV', features: ['Standard UPI & Card checkout', 'T+1 settlement', 'Shopify plugin', 'Standard email support'] },
      { tier: 'Scale Business', monthlyPrice: '₹1,499', annualPrice: '₹14,388', period: '/ month', target: 'Growing brands processing ₹10L–₹50L GMV', features: ['Instant T+0 settlement', 'Custom checkout UI', 'Automated GST reconciliation', 'Priority webhook SLAs'], popular: true },
      { tier: 'Enterprise Tier', monthlyPrice: '₹4,999', annualPrice: '₹47,988', period: '/ month', target: 'High-volume marketplaces processing >₹50L GMV', features: ['Dedicated multi-bank switch', 'Split escrow payouts', 'Account Aggregator integration', '24/7 SLA manager'] }
    ],
    swot: {
      strengths: [
        { title: 'High Payment Conversion & Low Latency Switch', desc: 'Predictive routing directs transactions only to banks with 98%+ current operational uptime.', impact: 'Core Competency', action: 'Highlight success-rate benchmark dashboards in all B2B enterprise merchant pitches.' },
        { title: 'Compounding Unit Economics with Volume', desc: 'As GMV scales, bank interchange discounts improve margins by 15-25 bps without increasing user pricing.', impact: 'Operating Leverage', action: 'Negotiate quarterly interchange tier discounts with partner commercial banks as GMV milestones hit.' },
        { title: 'Frictionless UPI Native Integration', desc: 'Built for seamless 1-click UPI Intent and AutoPay mandate approvals without SMS OTP drop-offs.', impact: 'User Delight', action: 'Expand QR soundbox and WhatsApp Commerce checkout extensions.' }
      ],
      weaknesses: [
        { title: 'Tight Gross Margins on Zero-MDR UPI', desc: 'Standard consumer UPI transactions generate zero merchant discount rate under Indian government regulations.', impact: 'Unit Economics Squeeze', action: 'Cross-sell high-margin instant settlements, fraud guarantees, and B2B vendor credit lines.' },
        { title: 'High Vulnerability to Bank API Downtimes', desc: 'External public sector bank core banking server outages can temporarily degrade transaction completion.', impact: 'External Dependency', action: 'Implement automatic 3-tier bank fallback routing within 250 milliseconds of bank timeouts.' }
      ],
      opportunities: [
        { title: 'Credit-on-UPI & RuPay Expansion', desc: 'RBI\'s linking of RuPay credit cards to UPI rails creates massive new MDR-bearing payment volume.', impact: 'High Growth', action: 'Deploy specialized 1-click credit-on-UPI checkout widgets for consumer merchants.' },
        { title: 'Account Aggregator Ecosystem Integration', desc: 'Open banking enables instant cash-flow based underwriting for merchant working capital loans.', impact: 'Fintech Multiplier', action: 'Partner with NBFCs to offer embedded credit lines directly inside the merchant dashboard.' },
        { title: 'Cross-Border B2B Invoicing & Remittances', desc: 'Indian exporters face heavy fees when receiving payments from global clients.', impact: 'High Margin Market', action: 'Integrate low-cost SWIFT / multi-currency virtual accounts for software and service exporters.' }
      ],
      threats: [
        { title: 'Aggressive Pricing from Dominant Incumbents', desc: 'Large players like Razorpay, Cashfree, and PhonePe offer predatory bundled discounts to lock in large accounts.', impact: 'Margin Pressure', action: 'Win on specialized developer experience, lower latency, and zero-fee instant settlement perks.' },
        { title: 'Stringent RBI Regulatory Tightening', desc: 'Evolving capital adequacy norms and stringent KYC guidelines can increase compliance overhead.', impact: 'Regulatory Overhead', action: 'Maintain an in-house audit committee and proactive engagement with RBI regulatory sandbox.' }
      ]
    }
  },

  healthtech: {
    archetype: 'ABDM-Compliant Digital Health & Clinical Workflow SaaS',
    gross_margin: '72% – 80%',
    ltv_cac: '4.5x – 5.2x',
    payback_months: '6 – 9 Months',
    problem: 'Fragmented patient medical records, 45+ minute doctor clinic waiting room congestion, and lack of Ayushman Bharat Digital Mission (ABDM) integration across 90% of private clinics and nursing homes in India.',
    solution: 'Integrated clinical operating system featuring ABDM Ayushman Bharat health account (ABHA) record sync, smart appointment queuing, digital EMR prescriptions, and teleconsultation.',
    customer_segments: [
      'Primary ICP: Independent Private Practitioners, Polyclinics, and 10–50 Bed Nursing Homes across Tier-1 and Tier-2 cities',
      'Patients: Chronic disease patients and working families requiring seamless digital prescriptions & health history tracking',
      'Diagnostic & Pharmacy Partners: Neighborhood pathology labs and local medical stores fulfilling digital orders',
      'Decision Makers: Lead Doctors, Clinic Medical Directors, and Hospital Administrators'
    ],
    value_proposition: 'Cuts clinic administrative overhead by 60%, automates 100% of ABDM digital record compliance in under 3 clicks, and reduces patient clinic wait times from 45 mins to under 12 mins.',
    channels: [
      'Hyperlocal Medical Representative (MR) Outreach & Indian Medical Association (IMA) Branch Sponsorships',
      'Accredited Continuing Medical Education (CME) Workshops on ABDM Compliance & Electronic Health Records',
      'Doctor-to-Doctor Referral Programs offering clinical hardware peripherals (thermal prescription printers)',
      'Digital Inbound SEO targeting \'ABDM certified EMR software\' and \'clinic appointment management app\''
    ],
    key_partners: [
      'National Health Authority (NHA) & Ayushman Bharat Digital Mission (ABDM) for Sandbox & Production Rails',
      'Accredited Diagnostic Laboratory Chains (Thyrocare, Dr. Lal PathLabs) for bi-directional report sync',
      'e-Pharmacy Fulfillment Networks (Tata 1mg, Apollo 24|7) for automated prescription delivery',
      'AWS Mumbai Health Data Compliant Cloud with HIPAA & DISHA encryption compliance'
    ],
    key_activities: [
      'Continuous clinical workflow optimization for fast 30-second doctor digital prescription generation',
      'National Health Authority (NHA) ABDM Milestone 1, 2, and 3 certification compliance maintenance',
      'On-site clinic staff training, doctor onboarding, and WhatsApp patient reminder configuration',
      'HIPAA/DISHA health data security audits, data encryption at rest, and audit trail logging'
    ],
    key_resources: [
      'Proprietary clinical terminology engine mapped to ICD-10 & SNOMED CT medical standards',
      'NHA certified Health Information Provider (HIP) & Health Information User (HIU) gateway',
      'Clinical advisory board of senior doctors and medical informatics experts',
      'Specialized medical sales force with established clinic relationships'
    ],
    cost_structure: [
      'Clinical Software Development & ABDM/SNOMED Protocol Engineering (34% of OPEX)',
      'On-Ground Clinic Sales Executives & Medical Conference Presence (28%)',
      'HIPAA/DISHA Compliant Cloud Hosting, Data Backups & Encryption (16%)',
      'Clinic Staff Onboarding, Hardware Kits & WhatsApp Messaging Gateway Fees (14%)',
      'Medical Regulatory Legal Counsel, Data Protection & Security Audits (8%)'
    ],
    revenue_streams: [
      'Solo Practitioner Clinic License: ₹499 / month (₹399 / mo on annual plan, single doctor)',
      'Polyclinic Suite: ₹1,499 / month (₹1,199 / mo on annual plan, 3–8 doctors)',
      'Hospital Enterprise License: ₹4,999 / month (₹3,999 / mo on annual plan, nursing homes)',
      'Teleconsultation Platform Convenience Fee: ₹10 – ₹25 per remote video consultation'
    ],
    key_metrics: [
      'Monthly Active Prescribing Doctors (MAPD)',
      'Digital Prescriptions Generated per Clinic / Day (>30 avg)',
      'ABDM Patient ABHA Linkage Rate (>85%)',
      'Doctor Annual Subscription Renewal Rate (>90%)'
    ],
    unfair_advantage: 'Seamless NHA-certified ABDM Milestone 1-3 gateway integration coupled with custom voice-to-prescription shortcuts adapted to Indian doctor shorthand and regional medicine brands.',
    pricing_tiers: [
      { tier: 'Solo Practitioner', monthlyPrice: '₹499', annualPrice: '₹4,788', period: '/ month', target: 'Individual Clinic Doctors', features: ['Digital EMR', 'ABDM ABHA generation', 'WhatsApp patient reminders', 'Queue display app'] },
      { tier: 'Polyclinic Suite', monthlyPrice: '₹1,499', annualPrice: '₹14,388', period: '/ month', target: 'Multi-specialty clinics (3–8 doctors)', features: ['Multi-doctor scheduling', 'Centralized billing & GST receipts', 'In-house lab integration', 'Custom letterhead'], popular: true },
      { tier: 'Hospital Enterprise', monthlyPrice: '₹4,999', annualPrice: '₹47,988', period: '/ month', target: 'Nursing Homes & Daycare Hospitals', features: ['IPD/OPD ward management', 'Insurance TPA pre-authorization', 'Dedicated account manager', 'ABDM HIU/HIP gateway'] }
    ],
    swot: {
      strengths: [
        { title: 'Government ABDM Regulatory Tailwinds', desc: 'India\'s push for universal digital health IDs (ABHA) mandates clinic software compatibility nationwide.', impact: 'Growth Driver', action: 'Position platform as the #1 ABDM compliance partner across tier-2 cities.' },
        { title: 'Ultra-Low Prescribing Latency', desc: 'Custom Indian brand medicine database enables doctors to generate a compliant digital Rx in under 30 seconds.', impact: 'User Retention', action: 'Protect doctor adoption by ensuring zero clicks are added to the existing clinical workflow.' },
        { title: 'Multiple Monetization Expansion Hooks', desc: 'Every digital prescription creates high-margin downstream revenue opportunities in lab tests and e-pharmacy.', impact: 'LTV Multiplier', action: 'Activate verified local neighborhood chemist delivery networks to preserve patient trust.' }
      ],
      weaknesses: [
        { title: 'Doctor Habitual Resistance to Typing', desc: 'Senior physicians prefer handwriting on paper prescription pads and resist desktop data entry.', impact: 'Sales Friction', action: 'Provide hybrid smart-pen paper OCR and mobile voice-to-text prescription entry.' },
        { title: 'High Customer Success & Field Support Overhead', desc: 'Clinic reception staff in smaller towns require frequent on-site troubleshooting and handholding.', impact: 'Operational Cost', action: 'Build vernacular interactive video tutorials and a 24/7 dedicated WhatsApp support desk.' }
      ],
      opportunities: [
        { title: 'Insurance TPA Cashless OPD Integration', desc: 'Insurance companies are rapidly launching outpatient (OPD) cashless coverage requiring digital EMR proof.', impact: 'Massive Market', action: 'Partner with health insurers to become their preferred OPD cashless claim settlement platform.' },
        { title: 'Chronic Disease AI Management Programs', desc: 'Longitudinal diabetic and hypertension data allows structured monthly patient care plans.', impact: 'High-Margin SaaS', action: 'Launch patient companion subscription apps for automated blood sugar and blood pressure tracking.' },
        { title: 'Tier-2/3 Medical Hub Expansion', desc: 'Tier-2 cities like Indore, Coimbatore, and Lucknow are experiencing rapid private healthcare modernization.', impact: 'Untapped Demand', action: 'Deploy regional sales agents focused on tier-2 medical clusters and doctor hubs.' }
      ],
      threats: [
        { title: 'Free EMR Bundling by Diagnostic Chains', desc: 'Large diagnostic labs sometimes give free basic software to doctors in exchange for exclusive sample referrals.', impact: 'Competitive Pricing', action: 'Differentiate on superior clinical depth, ABDM certification, and non-captive multi-lab choice.' },
        { title: 'Stringent Medical Data Privacy Liability', desc: 'The Digital Personal Data Protection (DPDP) Act imposes severe penalties for patient health record leaks.', impact: 'Legal Exposure', action: 'Maintain end-to-end zero-knowledge encryption and annual third-party CERT-In security audits.' }
      ]
    }
  }
};

// Universal fallback generator for any domain
const getUniversalDomainProfile = (industry, title, sector) => {
  const ind = industry || 'Technology';
  const ttl = title || 'Innovative Venture';
  const sec = sector || 'online';

  const isOffline = sec.includes('offline') || sec.includes('physical');
  const isHybrid = sec.includes('hybrid') || sec.includes('phygital');

  const archetype = isOffline
    ? 'Physical Operations & Hardware-Integrated Commerce'
    : isHybrid
      ? 'Phygital Omnichannel Commerce & Service Network'
      : `B2B / B2C ${ind} Cloud-Native Enterprise Platform`;

  const margin = isOffline ? '42% – 52%' : isHybrid ? '52% – 62%' : '76% – 84%';
  const ltvCac = isOffline ? '3.2x – 3.8x' : isHybrid ? '3.8x – 4.4x' : '4.6x – 5.2x';
  const payback = isOffline ? '4 – 6 Months' : isHybrid ? '5 – 7 Months' : '6 – 8 Months';

  return {
    archetype,
    gross_margin: margin,
    ltv_cac: ltvCac,
    payback_months: payback,
    problem: `High administrative fragmentation, opaque pricing, and lack of streamlined digital infrastructure in the ${ind} space causing lost productivity and operational friction across India.`,
    solution: `Engineered cloud-native platform featuring real-time automated workflows, seamless UPI payment collection, and centralized analytics tailored specifically for ${ttl}.`,
    customer_segments: [
      `Primary Ideal Customer Profile (ICP): Mid-market operators, modern businesses, and professionals in ${ind}`,
      `Secondary Market: Tier-1 and Tier-2 regional enterprises seeking operational cost reductions`,
      'Tech-Forward Early Adopters: Founders and managers prioritizing compliance, speed, and unit economics',
      'End Consumers: Mobile-first Indian users requiring fast, reliable, zero-friction service execution'
    ],
    value_proposition: `Reduces operational overhead by up to 45%, accelerates transaction velocity, and delivers a superior customer experience customized for the Indian ${ind} market.`,
    channels: [
      'Inbound Search Engine Optimization (SEO) & High-Intent Google Search Campaigns',
      'Targeted B2B LinkedIn Direct Outreach & Regional Trade Association Webinars',
      'Performance Marketing across Meta (Instagram/Facebook) & YouTube Shorts',
      'Strategic Ecosystem Partnerships with Complementary Technology & Logistics Vendors'
    ],
    key_partners: [
      'Leading Payment Gateways (Razorpay, Cashfree, PhonePe) for Automated UPI & Card Billing',
      'Indian Cloud Infrastructure (AWS Mumbai ap-south-1) for Sub-30ms Domestic Latency',
      'Regional Channel Distribution Partners, Franchise Networks & Trade Advisors',
      'Regulatory, Legal & Information Security Compliance Advisors'
    ],
    key_activities: [
      `Continuous product optimization and domain feature engineering for ${ttl}`,
      'Proactive customer onboarding, account success management, and 24/7 client SLAs',
      'Performance marketing execution, customer acquisition cost (CAC) optimization, and conversion analytics',
      'Regulatory compliance adherence with Indian digital mandates, GST invoicing, and data security standards'
    ],
    key_resources: [
      `Proprietary software codebase and specialized workflow algorithms for ${ind}`,
      'Founding team domain expertise, operational agility, and commercial relationships',
      'Dedicated engineering talent and client success team based in India',
      'High-availability cloud server infrastructure and validated customer transaction data'
    ],
    cost_structure: [
      'Core Product Engineering, UI/UX Architecture & Development (35% of total spend)',
      'Customer Acquisition, Performance Marketing & Field Sales Enablement (28%)',
      'Cloud Hosting, Database Storage & Security Tooling on AWS Mumbai (16%)',
      'Customer Support, Onboarding & Hardware/Logistics Enablement (13%)',
      'Regulatory Filings, GST/Tax Accounting & Legal Retainers (8%)'
    ],
    revenue_streams: [
      'Starter Tier: ₹499 / month (₹399 / mo on annual plan, core essentials for small operators)',
      'Growth Tier: ₹1,499 / month (₹1,199 / mo on annual plan, multi-seat collaboration & analytics)',
      'Enterprise Tier: ₹4,999 / month (₹3,999 / mo on annual plan, custom integrations & SLAs)',
      'Value-Added Services: Setup fees, priority onboarding, and custom module development'
    ],
    key_metrics: [
      'Monthly Recurring Revenue (MRR) & Annualized Run Rate (ARR Growth)',
      'Customer Acquisition Cost (CAC) Payback Velocity (<7 months)',
      'Customer Lifetime Value to CAC Ratio (Target >3.5x)',
      'Net Revenue Retention (NRR > 110%) & Gross Monthly Churn (<2.0%)'
    ],
    unfair_advantage: `Customized domain architecture engineered specifically for Indian operational nuances and payment ecosystems, creating defensible localized value compared to generic foreign software.`,
    pricing_tiers: [
      { tier: 'Starter', monthlyPrice: '₹499', annualPrice: '₹4,788', period: '/ month', target: 'Early adopters & small teams', features: [`Core ${ind} toolkit`, 'Standard analytics dashboard', 'Email & WhatsApp support', '2 user seats'] },
      { tier: 'Professional', monthlyPrice: '₹1,499', annualPrice: '₹14,388', period: '/ month', target: 'Growing businesses & active operators', features: ['Advanced automated workflows', 'Multi-seat team collaboration', 'Automated GST reporting', 'Priority webhook SLAs'], popular: true },
      { tier: 'Enterprise', monthlyPrice: '₹4,999', annualPrice: '₹47,988', period: '/ month', target: 'Large institutions & multi-location groups', features: ['Dedicated database tenant', 'Custom ERP bi-directional sync', '99.9% uptime SLA guarantee', '24/7 dedicated account manager'] }
    ],
    swot: {
      strengths: [
        { title: `Tailored ${ind} Solution Architecture`, desc: `Built from the ground up to address specific Indian operational bottlenecks in ${ind}, rather than using generic foreign software.`, impact: 'Core Competency', action: 'Emphasize localized compliance and workflow speed in sales pitches.' },
        { title: 'Lean and Agile Operating Structure', desc: 'Capital-efficient team structure enables rapid feature delivery and direct customer-led product iteration.', impact: 'Operational Agility', action: 'Maintain weekly feature shipping cycles based on customer usage data.' },
        { title: 'High Margin Profile', desc: `Projected gross margins of ${margin} allow healthy unit economic reinvestment into organic growth.`, impact: 'High Efficiency', action: 'Reinvest margin surpluses into high-converting organic SEO and customer referral engines.' }
      ],
      weaknesses: [
        { title: 'Early Brand Awareness vs Legacy Incumbents', desc: 'As an emerging startup, prospective enterprise clients may initially evaluate brand longevity.', impact: 'Sales Cycle Length', action: 'Offer risk-free 30-day proof-of-concept trials and highlight published customer case studies.' },
        { title: 'Initial Resource Constraints', desc: 'Operating in growth mode requires strict prioritization of go-to-market and marketing spend.', impact: 'Budget Discipline', action: 'Focus exclusively on highest-ROI acquisition channels (inbound SEO, referral networks) before paid ads.' }
      ],
      opportunities: [
        { title: `Rapid Digital Transformation in ${ind}`, desc: 'Indian enterprises and consumers are actively upgrading from legacy manual processes to modern cloud platforms.', impact: 'Growth Catalyst', action: 'Position platform as the modern, high-speed alternative to outdated legacy systems.' },
        { title: 'Tier-2 & Tier-3 Regional Market Expansion', desc: 'Rapid internet and UPI penetration outside metro cities opens up massive unserved merchant and consumer demand.', impact: 'Untapped Volume', action: 'Support vernacular UI navigation and lightweight mobile PWA performance.' },
        { title: 'Ecosystem API & Channel Partnerships', desc: 'Integrating with complementary software providers creates frictionless distribution channels.', impact: 'Distribution Scale', action: 'Publish open developer APIs and partner with established industry service aggregators.' }
      ],
      threats: [
        { title: 'Potential Fast-Follower Competition', desc: 'Low barriers to initial software creation mean competitors could attempt to copy feature sets.', impact: 'Competitive Risk', action: 'Deepen defensible data moats, customer workflow integrations, and proprietary algorithms.' },
        { title: 'Macroeconomic Price Sensitivity', desc: 'Economic tightening could lead corporate clients to review software subscription budgets.', impact: 'Churn Pressure', action: 'Continuously demonstrate hard cash savings and undeniable productivity ROI to maintain essential status.' }
      ]
    }
  };
};


// Dynamic low pricing calculation helper ensuring affordable rates and live monthly/annual toggle
const getTierPricing = (tier, idx, cycle) => {
  // Low, realistic Indian startup monthly benchmarks:
  // Tier 0 (Starter): ₹499/mo | Annual: ₹399/mo (₹4,788/yr, save 20%)
  // Tier 1 (Pro): ₹1,499/mo | Annual: ₹1,199/mo (₹14,388/yr, save 20%)
  // Tier 2+ (Enterprise): ₹4,999/mo | Annual: ₹3,999/mo (₹47,988/yr, save 20%)
  const defaultMonthlyTiers = [499, 1499, 4999];
  let monthlyBase = defaultMonthlyTiers[idx] || (idx === 0 ? 499 : idx === 1 ? 1499 : 4999);

  if (tier) {
    const rawMonthly = tier.monthlyPrice || (!String(tier.period || '').includes('year') ? tier.price : null);
    if (rawMonthly) {
      const parsed = parseInt(String(rawMonthly).replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 99 && parsed <= 9999) {
        monthlyBase = parsed;
      }
    }
  }

  const annualMonthly = Math.round(monthlyBase * 0.8);
  const annualTotal = annualMonthly * 12;

  if (cycle === 'annual') {
    return {
      activePrice: `₹${annualMonthly.toLocaleString('en-IN')}`,
      period: '/ month',
      strikethrough: `₹${monthlyBase.toLocaleString('en-IN')}`,
      discountTag: 'Save 20%',
      billingNote: `Billed annually at ₹${annualTotal.toLocaleString('en-IN')} / year`,
      summaryPrice: `₹${annualMonthly.toLocaleString('en-IN')} / month`,
      summarySub: `Billed annually at ₹${annualTotal.toLocaleString('en-IN')} / year (Save 20%) • ₹ INR`,
      annualTotalFormatted: `₹${annualTotal.toLocaleString('en-IN')}`
    };
  }

  return {
    activePrice: `₹${monthlyBase.toLocaleString('en-IN')}`,
    period: '/ month',
    strikethrough: null,
    discountTag: null,
    billingNote: 'Billed monthly, cancel anytime',
    summaryPrice: `₹${monthlyBase.toLocaleString('en-IN')} / month`,
    summarySub: 'Billed monthly • Cancel anytime • ₹ INR',
    annualTotalFormatted: null
  };
};

const BusinessTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('canvas');
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(1); // Default to middle plan
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [swotFilter, setSwotFilter] = useState('all'); // 'all', 'strengths', 'weaknesses', 'opportunities', 'threats'

  if (!data && !idea) {
    return <div className="text-center p-8 animate-fade-in text-secondary">Loading business strategy...</div>;
  }

  const bm = data?.business_model || data || {};
  const swot = data?.swot || data || {};
  const ideaContext = idea || {};

  const industry = ideaContext.industry || bm.industry || 'Technology';
  const title = ideaContext.title || bm.title || 'Startup Project';
  const sector = (ideaContext.sector || bm.sector || 'online').toLowerCase();

  // Determine matching sector key
  const getSectorKey = () => {
    const text = `${industry} ${title} ${sector}`.toLowerCase();
    if (/\b(school|edtech|education|learn|student|college|timetable|tuition|lms)\b/.test(text)) return 'edtech';
    if (/\b(fintech|finance|payment|payments|bank|banking|wealth|invest|crypto|lending|upi)\b/.test(text)) return 'fintech';
    if (/\b(health|healthcare|doctor|patient|clinic|hospital|telemedicine|diagnostic|pharmacy)\b/.test(text)) return 'healthtech';
    return null;
  };

  const sectorKey = getSectorKey();
  const fallbackProfile = sectorKey && FRONTEND_BUSINESS_INTELLIGENCE[sectorKey]
    ? FRONTEND_BUSINESS_INTELLIGENCE[sectorKey]
    : getUniversalDomainProfile(industry, title, sector);

  // Helper parser for bullet lists from string or array
  const parseItems = (val, fallbackList = []) => {
    if (!val) return fallbackList;
    if (Array.isArray(val)) return val.length > 0 ? val : fallbackList;
    if (typeof val === 'string') {
      const split = val
        .split(/(?:\r?\n• |\r?\n- |\r?\n|\. (?=[A-Z])|;)/)
        .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
        .filter(s => s.length > 3);
      return split.length > 0 ? split : fallbackList;
    }
    return fallbackList;
  };

  const archetype = bm.archetype || fallbackProfile.archetype;
  const grossMargin = bm.gross_margin || fallbackProfile.gross_margin;
  const ltvCac = bm.ltv_cac || fallbackProfile.ltv_cac;
  const paybackMonths = bm.payback_months || fallbackProfile.payback_months;

  const problemText = bm.problem || fallbackProfile.problem;
  const solutionText = bm.solution || fallbackProfile.solution;
  const valuePropText = (bm.value_proposition && !bm.value_proposition.startsWith('Solves key pain'))
    ? bm.value_proposition
    : fallbackProfile.value_proposition;

  const customerSegments = parseItems(bm.customer_segments, fallbackProfile.customer_segments);
  const channels = parseItems(bm.channels, fallbackProfile.channels);
  const keyPartners = parseItems(bm.key_partners, fallbackProfile.key_partners);
  const keyActivities = parseItems(bm.key_activities, fallbackProfile.key_activities);
  const keyResources = parseItems(bm.key_resources, fallbackProfile.key_resources);
  const costStructure = parseItems(bm.cost_structure, fallbackProfile.cost_structure);
  const revenueStreams = parseItems(bm.revenue_streams, fallbackProfile.revenue_streams);
  const keyMetrics = parseItems(bm.key_metrics, fallbackProfile.key_metrics);
  const unfairAdvantage = bm.unfair_advantage || fallbackProfile.unfair_advantage;

  const pricingTiers = (bm.pricing_tiers && bm.pricing_tiers.length > 0)
    ? bm.pricing_tiers
    : fallbackProfile.pricing_tiers;

  const parseSwotQuadrant = (items, fallbackItems = []) => {
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item, idx) => {
        if (typeof item === 'object' && item.title) return item;
        const str = String(item);
        const parts = str.split(/:\s*/);
        if (parts.length > 1) {
          return {
            title: parts[0].trim(),
            desc: parts.slice(1).join(': ').trim(),
            impact: fallbackItems[idx]?.impact || 'Core Factor',
            action: fallbackItems[idx]?.action || 'Execute strategic focus.'
          };
        }
        return {
          title: `Key Factor #${idx + 1}`,
          desc: str,
          impact: fallbackItems[idx]?.impact || 'Core Factor',
          action: fallbackItems[idx]?.action || 'Execute strategic focus.'
        };
      });
    }
    return fallbackItems;
  };

  const strengthsList = parseSwotQuadrant(swot.strengths, fallbackProfile.swot.strengths);
  const weaknessesList = parseSwotQuadrant(swot.weaknesses, fallbackProfile.swot.weaknesses);
  const opportunitiesList = parseSwotQuadrant(swot.opportunities, fallbackProfile.swot.opportunities);
  const threatsList = parseSwotQuadrant(swot.threats, fallbackProfile.swot.threats);

  const overallAssessment = (swot.overall_assessment && !swot.overall_assessment.startsWith('Strong overall baseline'))
    ? swot.overall_assessment
    : (bm.detailed_explanation || `${title} demonstrates compelling commercial viability in the Indian ${industry} market. By leveraging targeted digital distribution, strong unit margins (${grossMargin}), and defensible customer retention mechanisms, the business is structured for capital-efficient scale.`);

  // Current selected plan object
  const currentSelectedPlan = pricingTiers[selectedPlanIdx] || pricingTiers[0];

  const handlePlanSelect = (idx) => {
    setSelectedPlanIdx(idx);
    toast.success(`Selected Plan: ${pricingTiers[idx].tier} (${billingCycle === 'annual' ? 'Annual Billing' : 'Monthly Billing'})`);
  };

  return (
    <div className="business-tab animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* ============================================================ */}
      {/* 1. EXECUTIVE STRATEGY COMMAND BANNER                          */}
      {/* ============================================================ */}
      <div className="biz-executive-header">
        <div className="biz-header-top">
          <div className="biz-title-area">
            <h3><FaBuilding style={{ color: '#818cf8' }} /> {title} Business Architecture</h3>
            <div className="biz-badge-group">
              <span className="biz-badge archetype"><FaRocket /> {archetype}</span>
              <span className="biz-badge delivery"><FaBolt /> {sector.toUpperCase()} DELIVERY</span>
              <span className="biz-badge currency"><FaCoins /> 100% INDIAN RUPEES (₹)</span>
            </div>
          </div>
        </div>

        {/* 4 STRATEGIC KPI CARDS */}
        <div className="biz-kpi-grid">
          <div className="biz-kpi-card">
            <div className="biz-kpi-label"><FaChartLine style={{ color: '#10b981' }} /> Target Gross Margin</div>
            <div className="biz-kpi-value" style={{ color: '#34d399' }}>{grossMargin}</div>
            <div className="biz-kpi-sub">Profitable Unit Economics</div>
          </div>

          <div className="biz-kpi-card">
            <div className="biz-kpi-label"><FaBullseye style={{ color: '#06b6d4' }} /> LTV : CAC Benchmark</div>
            <div className="biz-kpi-value" style={{ color: '#38bdf8' }}>{ltvCac}</div>
            <div className="biz-kpi-sub">High Efficiency Ratio (&gt;3.0x)</div>
          </div>

          <div className="biz-kpi-card">
            <div className="biz-kpi-label"><FaCoins style={{ color: '#f59e0b' }} /> CAC Payback Period</div>
            <div className="biz-kpi-value" style={{ color: '#fbbf24' }}>{paybackMonths}</div>
            <div className="biz-kpi-sub">Fast Cash Conversion Cycle</div>
          </div>

          <div className="biz-kpi-card">
            <div className="biz-kpi-label"><FaCreditCard style={{ color: '#a855f7' }} /> Monetization Engine</div>
            <div className="biz-kpi-value" style={{ color: '#c084fc', fontSize: '1.1rem' }}>
              {ideaContext.pricing_model || 'Subscription (₹)'}
            </div>
            <div className="biz-kpi-sub">Recurring &amp; Predictable Cashflow</div>
          </div>
        </div>

        {/* EXECUTIVE AI STRATEGY SUMMARY */}
        <div className="biz-strategy-callout">
          <strong>Executive Commercial Thesis:</strong> {overallAssessment}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SUB-TAB NAVIGATION BAR                                    */}
      {/* ============================================================ */}
      <div className="biz-subtab-bar">
        <button
          onClick={() => setActiveSubTab('canvas')}
          className={`biz-subtab-btn ${activeSubTab === 'canvas' ? 'active canvas-active' : ''}`}
        >
          <FaTable /> 📋 Lean Canvas
        </button>

        <button
          onClick={() => setActiveSubTab('swot')}
          className={`biz-subtab-btn ${activeSubTab === 'swot' ? 'active swot-active' : ''}`}
        >
          <FaProjectDiagram /> 🎯 SWOT Matrix
        </button>

        <button
          onClick={() => setActiveSubTab('monetize')}
          className={`biz-subtab-btn ${activeSubTab === 'monetize' ? 'active monetize-active' : ''}`}
        >
          <FaCoins /> 💰 Pricing Plans (₹)
        </button>

        <button
          onClick={() => setActiveSubTab('ecosystem')}
          className={`biz-subtab-btn ${activeSubTab === 'ecosystem' ? 'active ecosystem-active' : ''}`}
        >
          <FaHandshake /> 🤝 Ecosystem & Moats
        </button>
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB 1: LEAN BUSINESS CANVAS (9 PILLARS)                 */}
      {/* ============================================================ */}
      {activeSubTab === 'canvas' && (
        <div className="animate-fade-in">
          <div className="biz-canvas-grid">
            
            {/* 1. Problem */}
            <div className="biz-canvas-card problem">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaExclamationTriangle style={{ color: '#ef4444' }} /> 1. Problem &amp; Market Friction</span>
                <span className="biz-card-tag" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>Pain Point</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>{problemText}</p>
            </div>

            {/* 2. Customer Segments */}
            <div className="biz-canvas-card segments">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaUsers style={{ color: '#ec4899' }} /> 2. Target Customer Segments</span>
                <span className="biz-card-tag" style={{ color: '#ec4899', background: 'rgba(236,72,153,0.1)' }}>Personas</span>
              </div>
              <ul className="biz-list">
                {customerSegments.map((seg, i) => (
                  <li key={i} className="biz-list-item">
                    <span className="biz-item-bullet" />
                    <span>{seg}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Unique Value Proposition (Highlighted Centerpiece) */}
            <div className="biz-canvas-card uvp biz-canvas-card-highlight">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaRocket style={{ color: '#06b6d4' }} /> 3. Unique Value Proposition</span>
                <span className="biz-card-tag" style={{ background: 'rgba(6,182,212,0.2)', color: '#38bdf8' }}>Core Moat</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#e0f2fe', lineHeight: '1.65', fontWeight: '500' }}>
                {valuePropText}
              </p>
            </div>

            {/* 4. Solution */}
            <div className="biz-canvas-card solution">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaCheckCircle style={{ color: '#10b981' }} /> 4. Solution &amp; Workflows</span>
                <span className="biz-card-tag" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>Product Engine</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>{solutionText}</p>
            </div>

            {/* 5. Channels */}
            <div className="biz-canvas-card channels">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaBullseye style={{ color: '#8b5cf6' }} /> 5. Channels &amp; GTM Funnel</span>
                <span className="biz-card-tag" style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}>Distribution</span>
              </div>
              <ul className="biz-list">
                {channels.map((ch, i) => (
                  <li key={i} className="biz-list-item">
                    <span className="biz-item-bullet" />
                    <span>{ch}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Unfair Advantage */}
            <div className="biz-canvas-card advantage">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaLock style={{ color: '#f59e0b' }} /> 6. Unfair Advantage &amp; Defensibility</span>
                <span className="biz-card-tag" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>Barrier to Entry</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>{unfairAdvantage}</p>
            </div>

            {/* 7. Key Metrics */}
            <div className="biz-canvas-card metrics">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaChartLine style={{ color: '#3b82f6' }} /> 7. Key North Star Metrics</span>
                <span className="biz-card-tag" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}>KPIs</span>
              </div>
              <ul className="biz-list">
                {keyMetrics.map((km, i) => (
                  <li key={i} className="biz-list-item">
                    <span className="biz-item-bullet" />
                    <span>{km}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 8. Cost Structure */}
            <div className="biz-canvas-card costs">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaCoins style={{ color: '#f97316' }} /> 8. Cost Structure Drivers (₹)</span>
                <span className="biz-card-tag" style={{ color: '#f97316', background: 'rgba(249,115,22,0.1)' }}>OPEX / CAPEX</span>
              </div>
              <ul className="biz-list">
                {costStructure.map((cost, i) => (
                  <li key={i} className="biz-list-item">
                    <span className="biz-item-bullet" />
                    <span>{cost}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 9. Revenue Streams */}
            <div className="biz-canvas-card revenue">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaCreditCard style={{ color: '#10b981' }} /> 9. Revenue Streams &amp; Pricing (₹)</span>
                <span className="biz-card-tag" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>Monetization</span>
              </div>
              <ul className="biz-list">
                {revenueStreams.map((rev, i) => (
                  <li key={i} className="biz-list-item">
                    <span className="biz-item-bullet" />
                    <span>{rev}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: 4-QUADRANT STRATEGIC SWOT MATRIX                  */}
      {/* ============================================================ */}
      {activeSubTab === 'swot' && (
        <div className="animate-fade-in">
          
          {/* SWOT TOOLBAR: QUADRANT FILTER & BALANCE METER */}
          <div className="swot-header-toolbar">
            <div className="swot-filter-group">
              <button
                onClick={() => setSwotFilter('all')}
                className={`swot-filter-pill ${swotFilter === 'all' ? 'active' : ''}`}
              >
                All 4 Quadrants (2x2 View)
              </button>
              <button
                onClick={() => setSwotFilter('strengths')}
                className={`swot-filter-pill ${swotFilter === 'strengths' ? 'active' : ''}`}
                style={{ color: swotFilter === 'strengths' ? '#fff' : '#34d399' }}
              >
                Strengths ({strengthsList.length})
              </button>
              <button
                onClick={() => setSwotFilter('weaknesses')}
                className={`swot-filter-pill ${swotFilter === 'weaknesses' ? 'active' : ''}`}
                style={{ color: swotFilter === 'weaknesses' ? '#fff' : '#f87171' }}
              >
                Weaknesses ({weaknessesList.length})
              </button>
              <button
                onClick={() => setSwotFilter('opportunities')}
                className={`swot-filter-pill ${swotFilter === 'opportunities' ? 'active' : ''}`}
                style={{ color: swotFilter === 'opportunities' ? '#fff' : '#38bdf8' }}
              >
                Opportunities ({opportunitiesList.length})
              </button>
              <button
                onClick={() => setSwotFilter('threats')}
                className={`swot-filter-pill ${swotFilter === 'threats' ? 'active' : ''}`}
                style={{ color: swotFilter === 'threats' ? '#fff' : '#fbbf24' }}
              >
                Threats ({threatsList.length})
              </button>
            </div>

            <div className="swot-balance-box">
              <span className="swot-balance-label">Strategic Posture:</span>
              <span className="swot-balance-tag">High Market Tailwinds with Defensible Core</span>
            </div>
          </div>

          <div className="swot-interactive-grid">
            
            {/* QUADRANT 1: STRENGTHS */}
            {(swotFilter === 'all' || swotFilter === 'strengths') && (
              <div className="swot-quadrant-card strengths">
                <div className="swot-quadrant-header">
                  <h4><FaCheckCircle /> Internal Strengths</h4>
                  <span className="swot-count-pill">{strengthsList.length} Core Factors</span>
                </div>
                <div className="swot-items-container">
                  {strengthsList.map((item, idx) => (
                    <div key={idx} className="swot-item-box">
                      <div className="swot-item-top">
                        <span className="swot-item-title">{item.title}</span>
                        <span className="swot-impact-badge high">{item.impact || 'Core Competency'}</span>
                      </div>
                      <div className="swot-item-desc">{item.desc}</div>
                      {item.action && (
                        <div className="swot-action-tip">
                          <span>💡 Strategic Action:</span> {item.action}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUADRANT 2: WEAKNESSES */}
            {(swotFilter === 'all' || swotFilter === 'weaknesses') && (
              <div className="swot-quadrant-card weaknesses">
                <div className="swot-quadrant-header">
                  <h4><FaExclamationTriangle /> Internal Weaknesses</h4>
                  <span className="swot-count-pill">{weaknessesList.length} Vulnerabilities</span>
                </div>
                <div className="swot-items-container">
                  {weaknessesList.map((item, idx) => (
                    <div key={idx} className="swot-item-box">
                      <div className="swot-item-top">
                        <span className="swot-item-title">{item.title}</span>
                        <span className="swot-impact-badge critical">{item.impact || 'Operational Risk'}</span>
                      </div>
                      <div className="swot-item-desc">{item.desc}</div>
                      {item.action && (
                        <div className="swot-action-tip">
                          <span>🛡️ Mitigation Playbook:</span> {item.action}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUADRANT 3: OPPORTUNITIES */}
            {(swotFilter === 'all' || swotFilter === 'opportunities') && (
              <div className="swot-quadrant-card opportunities">
                <div className="swot-quadrant-header">
                  <h4><FaLightbulb /> External Opportunities</h4>
                  <span className="swot-count-pill">{opportunitiesList.length} Catalysts</span>
                </div>
                <div className="swot-items-container">
                  {opportunitiesList.map((item, idx) => (
                    <div key={idx} className="swot-item-box">
                      <div className="swot-item-top">
                        <span className="swot-item-title">{item.title}</span>
                        <span className="swot-impact-badge growth">{item.impact || 'Growth Driver'}</span>
                      </div>
                      <div className="swot-item-desc">{item.desc}</div>
                      {item.action && (
                        <div className="swot-action-tip">
                          <span>🚀 Expansion Action:</span> {item.action}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUADRANT 4: THREATS */}
            {(swotFilter === 'all' || swotFilter === 'threats') && (
              <div className="swot-quadrant-card threats">
                <div className="swot-quadrant-header">
                  <h4><FaShieldAlt /> External Threats</h4>
                  <span className="swot-count-pill">{threatsList.length} Headwinds</span>
                </div>
                <div className="swot-items-container">
                  {threatsList.map((item, idx) => (
                    <div key={idx} className="swot-item-box">
                      <div className="swot-item-top">
                        <span className="swot-item-title">{item.title}</span>
                        <span className="swot-impact-badge warning">{item.impact || 'Market Risk'}</span>
                      </div>
                      <div className="swot-item-desc">{item.desc}</div>
                      {item.action && (
                        <div className="swot-action-tip">
                          <span>⚖️ Defensive Safeguard:</span> {item.action}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: RECOMMENDED TIERED PRICING & UNIT ECONOMICS      */}
      {/* ============================================================ */}
      {activeSubTab === 'monetize' && (
        <div className="animate-fade-in">
          
          <div className="pricing-header-row">
            <div>
              <h4 className="pricing-section-title">
                <FaCreditCard style={{ color: '#10b981' }} /> Recommended Tiered Pricing Architecture (Indian Rupees ₹)
              </h4>
              <p className="pricing-section-sub">
                Select any plan to inspect live unit economics, billing options, and projected ROI.
              </p>
            </div>

            {/* BILLING CYCLE SWITCHER */}
            <div className="pricing-billing-toggle">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`pricing-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`pricing-toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              >
                Annual <span className="pricing-discount-tag">Save 20%</span>
              </button>
            </div>
          </div>

          {/* INTERACTIVE PRICING TIERS GRID */}
          <div className="biz-pricing-grid">
            {pricingTiers.map((tier, idx) => {
              const features = Array.isArray(tier.features)
                ? tier.features
                : String(tier.features || '').split(/,\s*/).filter(Boolean);

              const isSelected = selectedPlanIdx === idx;
              const pricing = getTierPricing(tier, idx, billingCycle);

              return (
                <div
                  key={idx}
                  onClick={() => handlePlanSelect(idx)}
                  className={`biz-pricing-card ${tier.popular ? 'featured' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  {isSelected && (
                    <span className="biz-selected-plan-badge">
                      <FaCheck /> Active Plan
                    </span>
                  )}
                  {!isSelected && tier.popular && (
                    <span className="biz-pricing-badge-popular">Recommended</span>
                  )}

                  <div className="biz-tier-name">{tier.tier}</div>
                  <div className="biz-tier-target">{tier.target}</div>
                  
                  <div className="biz-tier-price-box">
                    {pricing.strikethrough && (
                      <div className="biz-tier-strikethrough-row">
                        <span className="biz-tier-strikethrough">{pricing.strikethrough}</span>
                        <span className="biz-discount-badge">{pricing.discountTag}</span>
                      </div>
                    )}
                    <div className="biz-tier-main-price-row">
                      <span className="biz-tier-price">{pricing.activePrice}</span>
                      <span className="biz-tier-period">{pricing.period}</span>
                    </div>
                    <div className={`biz-tier-cycle-note ${billingCycle === 'annual' ? 'annual-highlight' : ''}`}>
                      {pricing.billingNote}
                    </div>
                  </div>

                  <ul className="biz-tier-features">
                    {features.map((feat, fIdx) => (
                      <li key={fIdx} className="biz-tier-feature-item">
                        <FaCheckCircle style={{ color: isSelected ? '#10b981' : '#818cf8' }} /> {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanSelect(idx);
                    }}
                    className={`biz-tier-select-btn ${isSelected ? 'btn-selected' : tier.popular ? 'btn-popular' : 'btn-default'}`}
                  >
                    {isSelected ? <><FaCheck /> Selected Plan</> : 'Select This Plan'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* SELECTED PLAN SUMMARY & ROI CALLOUT */}
          {(() => {
            const selectedPricing = getTierPricing(currentSelectedPlan, selectedPlanIdx, billingCycle);
            return (
              <div className="plan-selected-summary">
                <div className="plan-summary-left">
                  <h4>
                    <FaRocket style={{ color: '#10b981' }} /> Active Strategy: {currentSelectedPlan.tier} Plan ({billingCycle.toUpperCase()} BILLING)
                  </h4>
                  <p>
                    Targeted at {currentSelectedPlan.target}. Designed to deliver maximum operational velocity with predictable {billingCycle} subscription cashflow.
                  </p>
                </div>

                <div className="plan-summary-right">
                  <div className="plan-price-callout">
                    <div className="price">{selectedPricing.summaryPrice}</div>
                    <div className="term">{selectedPricing.summarySub}</div>
                  </div>

                  <button
                    onClick={() => toast.success(`Confirmed ${currentSelectedPlan.tier} plan at ${selectedPricing.summaryPrice}!`)}
                    className="plan-confirm-btn"
                  >
                    Confirm Plan Architecture <FaArrowRight />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* UNIT ECONOMICS & PAYMENT RAILS SUMMARY */}
          <div className="biz-economics-grid">
            <div className="glass-card p-md" style={{ borderLeft: '4px solid #10b981' }}>
              <h4 style={{ color: '#34d399', marginBottom: '0.6rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaBalanceScale /> Unit Economics Breakdown
              </h4>
              <ul className="biz-list">
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#10b981' }} />
                  <span><strong>Gross Margin Profile:</strong> {grossMargin} (High software leverage)</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#10b981' }} />
                  <span><strong>Lifetime Value to CAC:</strong> {ltvCac} (Exceeds 3.0x venture standard)</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#10b981' }} />
                  <span><strong>CAC Payback Period:</strong> {paybackMonths} (Capital efficient recovery)</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#10b981' }} />
                  <span><strong>Net Revenue Retention (NRR):</strong> Target &gt;112% via tiered feature upgrades</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-md" style={{ borderLeft: '4px solid #6366f1' }}>
              <h4 style={{ color: '#818cf8', marginBottom: '0.6rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCreditCard /> Indian Payment & Billing Rails
              </h4>
              <ul className="biz-list">
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#6366f1' }} />
                  <span><strong>UPI AutoPay:</strong> Recurring mandate collection without SMS OTP drop-offs</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#6366f1' }} />
                  <span><strong>Payment Gateways:</strong> Native Razorpay / Cashfree routing with instant T+0 settlement</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#6366f1' }} />
                  <span><strong>e-NACH Mandates:</strong> Corporate bank debit mandates for annual subscriptions</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#6366f1' }} />
                  <span><strong>GST Compliance:</strong> Automated e-Invoicing with HSN/SAC classification</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 4: STRATEGIC ECOSYSTEM & MOAT DEFENSIBILITY          */}
      {/* ============================================================ */}
      {activeSubTab === 'ecosystem' && (
        <div className="animate-fade-in">
          
          {/* 1. VISUAL 4-STAGE VALUE CHAIN FLOW */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ color: '#f1f5f9', fontSize: '1.25rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaNetworkWired style={{ color: '#0ea5e9' }} /> End-to-End Strategic Value Chain &amp; Ecosystem Map
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              How {title} coordinates upstream infrastructure, core operational workflows, downstream distribution, and regulatory guardians.
            </p>
          </div>

          <div className="ecosystem-chain-grid">
            
            {/* Step 1: Upstream */}
            <div className="ecosystem-chain-node" style={{ borderTop: '3px solid #6366f1' }}>
              <div className="chain-step-num">1</div>
              <div className="chain-node-title"><FaServer style={{ color: '#818cf8' }} /> Upstream Rails</div>
              <div className="chain-node-desc">
                AWS Mumbai ap-south-1 cloud hosting, NPCI payment switches, and core identity verification rails.
              </div>
              <span className="chain-partner-tag">AWS, NPCI, DigiLocker</span>
            </div>

            {/* Step 2: Core Engine */}
            <div className="ecosystem-chain-node" style={{ borderTop: '3px solid #8b5cf6' }}>
              <div className="chain-step-num">2</div>
              <div className="chain-node-title"><FaCogs style={{ color: '#a78bfa' }} /> Operational Engine</div>
              <div className="chain-node-desc">
                Proprietary workflow heuristics, automated scheduling &amp; routing logic, and client telemetry databases.
              </div>
              <span className="chain-partner-tag">FastAPI, PostgreSQL, Redis</span>
            </div>

            {/* Step 3: Downstream */}
            <div className="ecosystem-chain-node" style={{ borderTop: '3px solid #10b981' }}>
              <div className="chain-step-num">3</div>
              <div className="chain-node-title"><FaRocket style={{ color: '#34d399' }} /> Channels &amp; GTM</div>
              <div className="chain-node-desc">
                Direct institutional demos, B2B software app stores, and industry associations across Tier-1/2 trade hubs.
              </div>
              <span className="chain-partner-tag">Field Sales, Trade Summits</span>
            </div>

            {/* Step 4: Regulatory */}
            <div className="ecosystem-chain-node" style={{ borderTop: '3px solid #06b6d4' }}>
              <div className="chain-step-num">4</div>
              <div className="chain-node-title"><FaCertificate style={{ color: '#38bdf8' }} /> Trust &amp; Compliance</div>
              <div className="chain-node-desc">
                Adherence to Indian statutory mandates, GST e-invoicing, DPDP Act 2023, and annual CERT-In security audits.
              </div>
              <span className="chain-partner-tag">GSTN, CERT-In, Audits</span>
            </div>

          </div>

          {/* 2. 5-DIMENSION MOAT DEFENSIBILITY RADAR */}
          <div className="moat-radar-box">
            <h4 style={{ color: '#38bdf8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaShieldAlt /> 5-Dimension Moat Defensibility Analysis
            </h4>

            <div className="moat-dimension-row">
              <div className="moat-dimension-header">
                <span className="moat-dim-title">1. Institutional Switching Cost &amp; Workflow Lock-In</span>
                <span className="moat-dim-score" style={{ color: '#10b981' }}>92% Defensibility</span>
              </div>
              <div className="moat-progress-track">
                <div className="moat-progress-fill" style={{ width: '92%', background: 'linear-gradient(90deg, #10b981, #059669)' }} />
              </div>
            </div>

            <div className="moat-dimension-row">
              <div className="moat-dimension-header">
                <span className="moat-dim-title">2. Localized Indian Public Infrastructure (DPI) Integration</span>
                <span className="moat-dim-score" style={{ color: '#06b6d4' }}>88% Defensibility</span>
              </div>
              <div className="moat-progress-track">
                <div className="moat-progress-fill" style={{ width: '88%', background: 'linear-gradient(90deg, #06b6d4, #0284c7)' }} />
              </div>
            </div>

            <div className="moat-dimension-row">
              <div className="moat-dimension-header">
                <span className="moat-dim-title">3. Near-Zero Marginal Serving Cost (Operating Leverage)</span>
                <span className="moat-dim-score" style={{ color: '#8b5cf6' }}>85% Defensibility</span>
              </div>
              <div className="moat-progress-track">
                <div className="moat-progress-fill" style={{ width: '85%', background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }} />
              </div>
            </div>

            <div className="moat-dimension-row">
              <div className="moat-dimension-header">
                <span className="moat-dim-title">4. Proprietary Heuristic &amp; Data Optimization Model</span>
                <span className="moat-dim-score" style={{ color: '#f59e0b' }}>81% Defensibility</span>
              </div>
              <div className="moat-progress-track">
                <div className="moat-progress-fill" style={{ width: '81%', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
              </div>
            </div>

            <div className="moat-dimension-row">
              <div className="moat-dimension-header">
                <span className="moat-dim-title">5. Partner Ecosystem Alliances &amp; Distribution Moat</span>
                <span className="moat-dim-score" style={{ color: '#ec4899' }}>77% Defensibility</span>
              </div>
              <div className="moat-progress-track">
                <div className="moat-progress-fill" style={{ width: '77%', background: 'linear-gradient(90deg, #ec4899, #db2777)' }} />
              </div>
            </div>
          </div>

          {/* 3. KEY PARTNERS, ACTIVITIES & RESOURCES MATRIX */}
          <div className="biz-moat-grid">
            
            {/* Key Partners */}
            <div className="biz-moat-card" style={{ borderTop: '3px solid #6366f1' }}>
              <div className="biz-moat-top">
                <span className="biz-moat-title"><FaHandshake style={{ color: '#818cf8' }} /> Ecosystem Partners</span>
                <span className="biz-moat-score">Alliances</span>
              </div>
              <ul className="biz-list">
                {keyPartners.map((partner, i) => (
                  <li key={i} className="biz-list-item">
                    <span className="biz-item-bullet" style={{ background: '#6366f1' }} />
                    <span>{partner}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Activities */}
            <div className="biz-moat-card" style={{ borderTop: '3px solid #8b5cf6' }}>
              <div className="biz-moat-top">
                <span className="biz-moat-title"><FaCogs style={{ color: '#a78bfa' }} /> Operational Workflows</span>
                <span className="biz-moat-score">Core Ops</span>
              </div>
              <ul className="biz-list">
                {keyActivities.map((act, i) => (
                  <li key={i} className="biz-list-item">
                    <span className="biz-item-bullet" style={{ background: '#8b5cf6' }} />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Resources */}
            <div className="biz-moat-card" style={{ borderTop: '3px solid #14b8a6' }}>
              <div className="biz-moat-top">
                <span className="biz-moat-title"><FaCube style={{ color: '#2dd4bf' }} /> Strategic Assets</span>
                <span className="biz-moat-score">IP &amp; Capital</span>
              </div>
              <ul className="biz-list">
                {keyResources.map((res, i) => (
                  <li key={i} className="biz-list-item">
                    <span className="biz-item-bullet" style={{ background: '#14b8a6' }} />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default BusinessTab;
