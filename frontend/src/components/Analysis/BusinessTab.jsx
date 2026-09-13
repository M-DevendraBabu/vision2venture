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
  },

  career_tech: {
    archetype: 'AI Resume Engineering, Portfolio Builder & Job Search Platform',
    gross_margin: '82% – 88%',
    ltv_cac: '4.8x – 5.5x',
    payback_months: '3 – 5 Months',
    problem: 'Job seekers facing 75%+ ATS bot rejection rates, lack of tailored portfolios, and tedious manual application cycles in competitive job markets.',
    solution: 'Sub-second AI resume restructuring, ATS keyword optimization, dynamic web portfolio publishing, and automated job matching.',
    customer_segments: [
      'Primary ICP: Engineering and management college graduates and early-career job seekers (<3 years experience)',
      'Mid-Career Professionals: Tech and product professionals seeking career switches and senior role promotions',
      'Campus Placement Cells: Universities and colleges seeking institutional resume review and placement tracking portals',
      'Freelancers & Contractors: Independent professionals seeking custom web portfolio links and social showcase sites'
    ],
    value_proposition: 'Transforms generic CVs into high-scoring, ATS-compliant resumes with quantified impact metrics in under 60 seconds, doubling candidate interview shortlists.',
    channels: [
      'Viral Student Referrals & Campus Ambassador Networks across 50+ Engineering Colleges',
      'High-Intent Organic Search (SEO) targeting \'ATS resume builder\', \'fresher resume template\', and \'resume keyword score\'',
      'LinkedIn Thought Leadership & Content Marketing around Hiring Trends and Tech Resumes',
      'Partnerships with Coding Bootcamps, EdTech Upskilling Portals, and College Placement Cells'
    ],
    key_partners: [
      'Leading Payment Gateways (Razorpay) for Instant UPI and Card Subscription Processing',
      'University Training & Placement Officers (TPOs) and Student Placement Committees',
      'Cloud Infrastructure Providers (AWS ap-south-1) for High-Speed LaTeX/PDF Rendering Pipelines',
      'Recruitment Platform APIs and Job Board Aggregators for Direct Application Linking'
    ],
    key_activities: [
      'Fine-tuning specialized LLM prompts for impact-quantified resume bullet points across job domains',
      'Maintaining sub-second PDF rendering engine ensuring 100% ATS parser compatibility',
      'Continuous feature delivery for portfolio themes, custom subdomains, and career tracking',
      'Campus placement drive webinars and live interactive resume critique workshops'
    ],
    key_resources: [
      'Proprietary ATS compatibility rule database benchmarked against Workday, Taleo, and Greenhouse',
      'Fine-tuned AI language models trained on 50,000+ shortlisted tech and corporate resumes',
      'Scalable cloud microservices architecture for real-time document rendering and export',
      'Active student community and collegiate campus ambassador network'
    ],
    cost_structure: [
      'Core Engineering, UI/UX Architecture & Dynamic PDF Engine (36% of total budget)',
      'LLM API Inference Tokens, Cloud Hosting & Content Delivery on AWS Mumbai (22%)',
      'Campus Marketing, Student Brand Ambassador Payouts & Digital Funnels (24%)',
      'Customer Support, Onboarding Video Guides & WhatsApp Helpdesk (10%)',
      'Payment Gateway MDR, Statutory Taxes & Entity Compliance (8%)'
    ],
    revenue_streams: [
      'Starter Free: ₹0 (1 ATS-optimized resume export with standard template)',
      'Job Seeker Pro: ₹499 / month (₹399 / mo on annual plan, unlimited AI rewrites, web portfolio, ATS scoring)',
      'Unlimited Career Pass: ₹1,499 / year (unlimited exports, priority interview callbacks, career cell access)',
      'Institutional Campus Tier: ₹25,000 / college / year (batch resume reviews for 500+ students)'
    ],
    key_metrics: [
      'Monthly Recurring Revenue (MRR) & Pro Subscription Conversion Rate (>4.2%)',
      'Resume Generation Velocity (<60 seconds average creation latency)',
      'Candidate Interview Shortlist Callback Rate Improvement (>32% verified)',
      'Viral K-Factor (Target >1.2 via student-to-student sharing)'
    ],
    unfair_advantage: 'Proprietary ATS parsing engine pre-calibrated to Indian and global enterprise recruitment systems, delivering instant resume score feedback with 1-click tailored suggestions.',
    pricing_tiers: [
      { tier: 'Starter Free', monthlyPrice: '₹0', annualPrice: '₹0', period: 'Free Forever', target: 'Job seekers & fresh graduates', features: ['1 ATS-optimized resume export', 'Standard template styles', 'Basic keyword matching', 'PDF download'] },
      { tier: 'Job Seeker Pro', monthlyPrice: '₹499', annualPrice: '₹1,499', period: '/ month', target: 'Active job seekers & career switchers', features: ['Unlimited AI bullet rewrites', 'Custom web portfolio with sub-domain', 'Real-time ATS match score against job descriptions', 'Cover letter generator', 'Priority WhatsApp support'], popular: true },
      { tier: 'Campus / Enterprise', monthlyPrice: '₹1,499', annualPrice: '₹14,388', period: '/ year', target: 'Placement cells & professional coaches', features: ['Batch resume reviews', 'Institutional branding & custom watermarks', 'Bulk export & analytics', 'Dedicated placement support'] }
    ],
    swot: {
      strengths: [
        { title: 'Proprietary ATS Parser & Instant Score Feedback', desc: 'Pre-calibrated parser mimics enterprise recruitment software, providing instant actionable resume scores.', impact: 'Core Competency', action: 'Continuously benchmark scoring against updated Workday and Greenhouse schemas.' },
        { title: 'Viral Student Referral Loop', desc: 'College placement season drives rapid peer-to-peer word-of-mouth adoption across graduating batches.', impact: 'Low CAC Growth', action: 'Offer free Pro exports to users who refer 2 college batchmates.' },
        { title: 'High Gross Margin Profile', desc: 'Cloud rendering compute cost is negligible (~₹2 per export), resulting in >85% gross margins.', impact: 'Capital Efficiency', action: 'Reinvest unit profit surpluses into campus placement partnerships.' }
      ],
      weaknesses: [
        { title: 'Churn Post-Job Placement', desc: 'Job seekers cancel subscriptions immediately once they successfully secure an employment offer.', impact: 'Subscription Churn', action: 'Introduce annual career monitoring, ongoing portfolio hosting, and appraisal resume update alerts.' },
        { title: 'Free Alternative Competition', desc: 'Generic word processors and open-source LaTeX templates offer zero-cost alternative resume creation.', impact: 'Top-of-Funnel Drag', action: 'Differentiate sharply on AI bullet rewrites, real-time ATS job description matching, and interactive web portfolios.' }
      ],
      opportunities: [
        { title: 'University Campus Placement Integration', desc: 'Over 4,000 engineering and business colleges in India seek software to prepare students for corporate placement drives.', impact: 'B2B Enterprise Upsell', action: 'Launch white-label institutional placement management modules for college career cells.' },
        { title: 'Direct Recruiter Talent Matching', desc: 'Aggregating verified high-scoring candidate resumes enables direct recruitment headhunting monetization.', impact: 'High-Margin Marketplace', action: 'Build recruiter candidate discovery portal with candidate consent-based messaging.' },
        { title: 'Tier-2/Tier-3 Regional Expansion', desc: 'Graduates outside metro areas face greater resume deficits and aggressively seek professional guidance.', impact: 'Untapped Volume', action: 'Partner with regional state university placement drives and vernacular job guidance portals.' }
      ],
      threats: [
        { title: 'General LLM Commoditization', desc: 'Public AI assistants (ChatGPT, Gemini) can generate basic resume bullet points for free.', impact: 'Feature Pressure', action: 'Focus heavily on verified ATS parsing guarantees, pixel-perfect formatting, and live job application tracking.' },
        { title: 'Macroeconomic Hiring Slowdowns', desc: 'Hiring freezes in tech and corporate sectors can temporarily dampen job seeker optimism.', impact: 'Cyclical Demand', action: 'Expand into civil services, state exams, and overseas study abroad CV formats.' }
      ]
    }
  },

  cloud_finops: {
    archetype: 'Multi-Cloud FinOps, Cloud Cost Governance & Automated Waste Remediation',
    gross_margin: '84% – 90%',
    ltv_cac: '5.2x – 6.0x',
    payback_months: '4 – 6 Months',
    problem: 'Exploding multi-cloud bills, unallocated Kubernetes infrastructure spend, and lack of engineering accountability leading to 25–35% cloud waste across tech organizations.',
    solution: 'Real-time multi-cloud cost visibility, container-level pod cost allocation, automated idle resource cleanup, and proactive spend anomaly alerts.',
    customer_segments: [
      'Primary ICP: Fast-growing SaaS startups and mid-market engineering organizations spending ₹5L–₹50L monthly on AWS, Azure, or GCP',
      'Engineering Leadership: CTOs, VP of Engineering, and DevOps Leads seeking automated cost guardrails without slowing velocity',
      'Finance & FinOps Teams: Chief Financial Officers (CFOs) and Head of Infrastructure requiring departmental cost attribution',
      'Managed Service Providers (MSPs): Cloud consulting agencies managing multi-tenant client infrastructure portfolios'
    ],
    value_proposition: 'Detects and eliminates up to 32% of wasted cloud infrastructure spend within 14 days of read-only agent connection, paying for itself within the first billing cycle.',
    channels: [
      'B2B Outbound LinkedIn Campaigns targeting CTOs, DevOps Leads, and VP Engineering across Indian Tech Hubs',
      'Product-Led Inbound SEO on \'AWS cost reduction\', \'Kubernetes cost attribution\', and \'FinOps automation\'',
      'Cloud Partner Marketplaces (AWS Marketplace, Azure Marketplace) for frictionless enterprise procurement',
      'Technical DevOps Community Evangelism, FinOps Foundation Chapter Sponsorships & GitHub Open Source Tooling'
    ],
    key_partners: [
      'Cloud Hyperscalers (Amazon Web Services, Microsoft Azure, Google Cloud Platform) Partner Programs',
      'Regional Cloud Managed Service Providers (MSPs) and DevOps Consulting Firms',
      'Container Orchestration & Observability Ecosystems (Kubernetes, Prometheus, Grafana, Datadog)',
      'Enterprise Invoicing & Payment Rails (Razorpay AutoPay, Stripe Enterprise)'
    ],
    key_activities: [
      'Multi-cloud telemetry ingestion pipeline optimization (AWS Cost and Usage Reports, Azure Cost Management)',
      'Developing machine learning algorithms for real-time cloud spend anomaly detection and forecast modeling',
      'Building safe, 1-click automated remediation scripts for orphan EBS volumes, idle NAT gateways, and unattached IPs',
      'Conducting quarterly enterprise cloud architecture reviews and customer success savings audits'
    ],
    key_resources: [
      'Proprietary cross-cloud billing normalization engine and container cost attribution algorithms',
      'Certified FinOps practitioners and cloud solutions architects on the core engineering roster',
      'Zero-data-payload, read-only IAM cross-account connection architecture ensuring SOC-2 compliance',
      'Historical multi-tenant cloud cost benchmark datasets covering 10,000+ virtual machine instances'
    ],
    cost_structure: [
      'Core Platform Engineering, Distributed Telemetry Ingestion & UI Dashboard Architecture (38% of total budget)',
      'High-Throughput Cloud Data Ingestion, Storage & Anomaly Compute on AWS ap-south-1 (20%)',
      'B2B Enterprise Account-Based Marketing (ABM), Field Sales & FinOps Conference Sponsorships (22%)',
      'Customer Onboarding, Solutions Engineering & Enterprise SLA Dedicated Support (12%)',
      'SOC-2 Type II Audits, Cyber Liability Insurance & Enterprise Legal Retainers (8%)'
    ],
    revenue_streams: [
      'Developer / Team Tier: ₹3,999 / month (₹3,199 / mo on annual plan, up to $10k/mo cloud spend monitored)',
      'Scale / Multi-Cloud FinOps: ₹12,999 / month (₹10,399 / mo on annual plan, Kubernetes attribution, up to $80k/mo spend)',
      'Enterprise Infrastructure: ₹39,999 / month (₹31,999 / mo on annual plan, 1-click auto-remediation, custom ERP sync)',
      'Savings-Share Professional Tier: 15% share of verified hard cash savings realized over first 90 days'
    ],
    key_metrics: [
      'Annual Recurring Revenue (ARR) & Net Revenue Retention (NRR > 125% via cloud spend scaling)',
      'Average Verified Monthly Savings Delivered per Client (>22% hard cost reduction)',
      'Time-to-Value (TTV < 30 minutes from read-only connection to first actionable waste insight)',
      'Gross Customer Monthly Churn (<1.5% due to embedded engineering workflows)'
    ],
    unfair_advantage: 'Sub-pod Kubernetes cost allocation combined with automated 1-click infrastructure remediation, allowing teams to reclaim cloud budgets safely without manual script authoring.',
    pricing_tiers: [
      { tier: 'Developer / Team Tier', monthlyPrice: '₹3,999', annualPrice: '₹38,390', period: '/ month', target: 'Early-stage cloud startups (<$10k/mo cloud spend)', features: ['AWS CUR & Azure billing ingestion', 'Weekly automated waste detection', 'Slack & WhatsApp anomaly alerts', '2 admin seats'] },
      { tier: 'Scale / Multi-Cloud FinOps', monthlyPrice: '₹12,999', annualPrice: '₹1,24,790', period: '/ month', target: 'Growing SaaS companies ($10k–$80k/mo spend)', features: ['Kubernetes pod-level cost allocation', 'Automated RI/Savings Plan recommendations', 'CI/CD pull request cost estimation', 'Unlimited team seats'], popular: true },
      { tier: 'Enterprise Infrastructure', monthlyPrice: '₹39,999', annualPrice: '₹3,83,990', period: '/ month', target: 'Multi-cloud enterprise accounts (>$80k/mo spend)', features: ['1-click auto-remediation bots', 'Custom ERP & ServiceNow sync', 'SOC-2 audit reporting', 'Dedicated FinOps account manager'] }
    ],
    swot: {
      strengths: [
        { title: 'Direct Measurable Hard Dollar ROI', desc: 'Customers immediately recover multiple times the software subscription cost within the first billing cycle.', impact: 'High Conversion', action: 'Offer a risk-free 30-day trial guaranteeing minimum 15% identified cloud waste.' },
        { title: 'Zero Data-Security Friction', desc: 'Uses read-only IAM cross-account telemetry without accessing any proprietary application source code or user data.', impact: 'Fast Enterprise Security Approval', action: 'Publish detailed SOC-2 architecture whitepapers to streamline enterprise CISO signoffs.' },
        { title: 'Expanding Land-and-Expand Mechanics', desc: 'As client companies grow and deploy more cloud servers, FinOps subscription value naturally scales upwards.', impact: 'High Net Retention', action: 'Structure pricing tiers pegged to monitored monthly cloud spend brackets.' }
      ],
      weaknesses: [
        { title: 'Enterprise Procurement Bureaucracy', desc: 'Larger organizations with strict vendor approval cycles can take 60–90 days to finalize contracts.', impact: 'Sales Cycle Length', action: 'Offer frictionless self-serve Starter tiers on corporate credit cards under $500/mo spend.' },
        { title: 'Continuous Cloud Billing Schema Shifts', desc: 'AWS and Azure regularly update billing reporting schemas requiring frequent parser maintenance.', impact: 'Maintenance Overhead', action: 'Build automated schema change detection tests for daily cloud provider updates.' }
      ],
      opportunities: [
        { title: 'AI & GPU Compute Cost Optimization', desc: 'Exploding adoption of LLMs and expensive GPU clusters (A100/H100) creates massive demand for GPU cost governance.', impact: 'Explosive Market Demand', action: 'Launch dedicated AI inference and GPU node utilization tracking modules.' },
        { title: 'Cloud Marketplace Co-Selling', desc: 'AWS and Azure enterprise customers have pre-committed cloud spend budgets they can draw down for third-party marketplace software.', impact: 'Procurement Scale', action: 'List on AWS and Azure marketplaces to enable drawdown against client cloud commitments.' },
        { title: 'Tier-2 Tech Hub Adoption', desc: 'Emerging tech hubs across India are maturing into multi-million-dollar cloud spenders needing professional FinOps.', impact: 'Regional Expansion', action: 'Conduct localized FinOps community roadshows across Hyderabad, Chennai, and Pune.' }
      ],
      threats: [
        { title: 'Native Cloud Provider Free Tools', desc: 'AWS Cost Explorer and Azure Cost Management provide basic built-in cost reports for free.', impact: 'Competitive Parity', action: 'Differentiate with multi-cloud aggregation, container pod attribution, and automated 1-click remediation.' },
        { title: 'Established Global Incumbents', desc: 'Global players (CloudHealth, Spot by NetApp) possess deep legacy brand presence in Fortune 500 accounts.', impact: 'Enterprise Competition', action: 'Win on dramatically faster setup (<15 minutes), modern UI, and disruptive Indian Rupee pricing.' }
      ]
    }
  },

  fitness_gym: {
    archetype: 'Modern Functional Fitness, CrossFit & Strength Training Facility',
    gross_margin: '62% – 70%',
    ltv_cac: '3.8x – 4.5x',
    payback_months: '4 – 6 Months',
    problem: 'Crowded commercial gyms with broken machines, lack of certified coaching, generic workout routines, and exorbitant annual lock-in contracts causing 70%+ member dropouts within 90 days.',
    solution: 'High-energy coach-led functional training, certified CrossFit coaching, dedicated Olympic lifting drop zones, flexible monthly memberships, and personalized transformation tracking.',
    customer_segments: [
      'Primary ICP: Working professionals, corporate executives, and fitness enthusiasts aged 20–42 seeking structured strength and conditioning',
      'Athletes & Powerlifters: Dedicated lifters needing heavy-duty calibrated barbells, bumper plates, and Olympic platforms',
      'Transformation Clients: Individuals seeking guided weight loss and body composition shifts through 1-on-1 personal training',
      'Corporate Accounts: Nearby tech offices and businesses funding employee wellness memberships'
    ],
    value_proposition: 'Delivers coach-led functional fitness in small energetic batches with zero machine queues, Olympic-grade equipment, and transparent monthly memberships.',
    channels: [
      'Hyperlocal Instagram & YouTube Shorts showcasing real member transformation results and live gym energy',
      'Google Business Profile SEO optimized for \'crossfit gym near me\', \'strength training gym\', and \'best gym in area\'',
      'Member-Get-Member Word-of-Mouth Referral Programs offering free monthly personal training credits',
      'Corporate Wellness Workshops and On-Site Ergonomic Fitness Screenings for Local Tech Companies'
    ],
    key_partners: [
      'Commercial Fitness Equipment Manufacturers (Olympic barbells, custom steel CrossFit rigs, bumper plates)',
      'Certified Sports Nutrition & Supplement Brands for In-Gym Protein Shake and Recovery Bar',
      'Sports Physiotherapy and Sports Massage Clinics for Member Injury Prevention Partnerships',
      'Local Corporate HR Teams for Sponsored Employee Annual Fitness Passes'
    ],
    key_activities: [
      'Delivering 6 daily high-energy coach-led functional fitness and CrossFit group training sessions',
      'Conducting weekly personal training sessions, lifting technique analysis, and mobility drills',
      'Daily equipment sanitization, barbell maintenance, and acoustic rubber floor upkeep',
      'Monthly InBody body composition tracking and member milestone celebrations'
    ],
    key_resources: [
      'High-street commercial facility (2,500–4,000 sq.ft) with structural clearance for barbell drop zones',
      'Certified Head Strength Coach and Level-1/Level-2 CrossFit certified coaching roster',
      'Heavy-duty modular CrossFit rig, Concept2 rowers, Assault air bikes, and Olympic plates',
      'Automated membership billing CRM and biometric turnstile access control'
    ],
    cost_structure: [
      'Commercial Property Lease & High-Street Rent (28% of monthly operating budget)',
      'Certified Head Coach & Trainer Salaries + Performance Incentives (32%)',
      'Facility Power, Commercial Air Conditioning & Utility Expenses (14%)',
      'Equipment Maintenance, Sanitation Supplies & Wear-and-Tear Reserve (10%)',
      'Local Performance Marketing, Social Media & Community Events (16%)'
    ],
    revenue_streams: [
      'Starter Floor Pass: ₹1,499 / month (₹14,390 / year, full gym floor & cardio access)',
      'Pro Athlete / CrossFit Pass: ₹2,999 / month (₹28,790 / year, unlimited daily coached batches)',
      'Elite Transformation & PT: ₹5,499 / month (₹52,790 / year, includes 8 1-on-1 trainer sessions)',
      'In-House Sports Nutrition Bar & Merchandise: ₹250 – ₹1,200 per transaction'
    ],
    key_metrics: [
      'Active Recurring Member Base & Monthly Renewal Rate (>82% target)',
      'Batch Capacity Utilization Rate (Target >75% in prime 6-9 AM / 6-9 PM slots)',
      'Average Revenue Per Member (ARPM > ₹2,800/mo via PT upsell)',
      'Member Lifetime Value to CAC Ratio (>3.8x)'
    ],
    unfair_advantage: 'Coach-led community culture paired with dedicated Olympic lifting drop-zone infrastructure and flexible monthly billing, delivering 3x higher attendance consistency than conventional commercial gyms.',
    pricing_tiers: [
      { tier: 'Starter Floor Pass', monthlyPrice: '₹1,499', annualPrice: '₹14,390', period: '/ month', target: 'Casual lifters & general gym regulars', features: ['Full cardio & free weights floor access', 'Locker facility', 'General fitness orientation', 'Shower access'] },
      { tier: 'Pro Athlete / CrossFit', monthlyPrice: '₹2,999', annualPrice: '₹28,790', period: '/ month', target: 'CrossFit athletes & functional fitness regulars', features: ['Unlimited daily CrossFit & HIIT batches', 'Expert coach form analysis', 'Olympic lifting platforms', 'Priority batch booking'], popular: true },
      { tier: 'Elite Transformation & PT', monthlyPrice: '₹5,499', annualPrice: '₹52,790', period: '/ month', target: 'Personalized coaching & body transformation', features: ['8 dedicated 1-on-1 personal trainer sessions/mo', 'Monthly InBody body composition scan', 'Customized macro nutrition plan', 'Recovery lounge access'] }
    ],
    swot: {
      strengths: [
        { title: 'Coach-to-Member Ratio & Community Cohesion', desc: 'Small batch sizes (<15 members) ensure dedicated trainer attention and build high social retention.', impact: 'Core Competency', action: 'Highlight trainer certifications and member transformation case studies across local media.' },
        { title: 'High Margin Personal Training Upsell', desc: '1-on-1 personal training delivers gross margins exceeding 65% on top of baseline membership fees.', impact: 'Revenue Multiplier', action: 'Offer complimentary 30-minute fitness assessment to every new member to drive PT conversions.' },
        { title: 'Low Marginal Serving Cost', desc: 'Once equipment CapEx is funded, operating marginal cost per additional member in existing batches is near zero.', impact: 'Operating Leverage', action: 'Maximize off-peak afternoon batch occupancy with special corporate and student discounts.' }
      ],
      weaknesses: [
        { title: 'Peak Hour Floor Capacity Bottlenecks', desc: 'Morning (6-9 AM) and Evening (6-9 PM) hours experience high demand while mid-day hours remain quiet.', impact: 'Capacity Constraint', action: 'Introduce mid-day flex memberships priced at 25% discount to balance footfall across the day.' },
        { title: 'Dependency on Key Trainer Retention', desc: 'Popular coaches can build personal followings that may follow them if they transition.', impact: 'Personnel Risk', action: 'Implement competitive revenue-share incentives and long-term trainer retention contracts.' }
      ],
      opportunities: [
        { title: 'Corporate Wellness & B2B Group Subscriptions', desc: 'Nearby technology parks and multinational corporate offices actively fund employee fitness allowances.', impact: 'Bulk Volume', action: 'Sign exclusive corporate wellness tie-ups with subsidized employee annual memberships.' },
        { title: 'Recovery Suite & Cryo / Sauna Add-ons', desc: 'Modern athletes increasingly pay premium add-on fees for ice baths, infrared saunas, and compression boots.', impact: 'High-Margin Expansion', action: 'Install a 4-person contrast therapy recovery zone funded from Month 6 operating cashflows.' },
        { title: 'Multi-Location Franchise Expansion', desc: 'Proving the unit economics in the first neighborhood unlocks multi-hub expansion across urban catchments.', impact: 'Geographic Scale', action: 'Codify operating standard operating procedures (SOPs) for turnkey 2nd location launch.' }
      ],
      threats: [
        { title: 'Discount Gym Chains & Low-Price Competitors', desc: 'Budget commercial gym franchises offer barebones gym floor access at ₹700–₹1,000/month.', impact: 'Price Pressure', action: 'Compete strictly on coaching quality, CrossFit results, and community rather than low price.' },
        { title: 'Commercial Real Estate Rent Escalation', desc: 'Prime high-street landlords may demand aggressive 5-8% annual rent escalations upon lease renewal.', impact: 'Margin Drag', action: 'Negotiate 5-year commercial lease agreements with capped 3% biennial rent escalations.' }
      ]
    }
  },

  artisan_bakery: {
    archetype: 'Artisanal Sourdough, French Patisserie & Specialty Cafe',
    gross_margin: '64% – 72%',
    ltv_cac: '3.8x – 4.5x',
    payback_months: '4 – 6 Months',
    problem: 'Mass-produced factory bread packed with chemical emulsifiers and artificial preservatives, lack of authentic European slow-fermented sourdough, and stale commercial bakery goods frustrating discerning consumers in India.',
    solution: 'Craft bakery atelier specializing in 36-hour slow-fermented sourdough breads, handcrafted French laminated butter croissants, artisanal patisserie desserts, and specialty pour-over coffee.',
    customer_segments: [
      'Primary ICP: Neighborhood residents, working professionals, and food connoisseurs seeking fresh artisanal bread',
      'Weekend Brunch Crowd: Families and couples seeking a charming European-style cafe ambiance',
      'Celebration & Event Hosts: Clients seeking custom designer celebration cakes and dessert tables',
      'Gourmet Cafes & Tech Offices: Local establishments seeking wholesale daily sourdough and pastry supply'
    ],
    value_proposition: 'Delivers European-standard artisanal breads slow-fermented for 36 hours with zero artificial additives, flaky French butter viennoiserie baked fresh daily at dawn, and bespoke celebration patisserie.',
    channels: [
      'High-visibility street-level storefront with open bakery display counter and intoxicating baking aroma',
      'Hyperlocal Instagram & Meta Reels showcasing sourdough ear blisters, croissant crumb cross-sections, and live baking',
      'Direct neighborhood WhatsApp morning broadcast for daily freshly baked specials and limited-edition pastries',
      'Selective listing on food apps (Swiggy Gourmet / Zomato) used strictly for brand discovery'
    ],
    key_partners: [
      'Specialized Flour Mills for organic unbleached stone-ground wheat, rye, and ancient grains',
      'Imported French & New Zealand Butter Importers for high-fat (84%) lamination butter sheets',
      'Specialty Coffee Roasters for single-origin Arabica espresso beans and pour-over roasts',
      'Custom Eco-Friendly Packaging Suppliers for biodegradable bakery boxes, bread sleeves, and cafe cups'
    ],
    key_activities: [
      'Daily pre-dawn sourdough dough shaping, long cold-fermentation, and high-heat deck oven baking',
      'Precision temperature-controlled butter lamination for 27-layer French croissants and cruffins',
      'Handcrafting high-end patisserie entremets, tarts, and custom designer celebration cakes',
      'Maintaining spotless HACCP kitchen hygiene, sourdough mother starter health, and equipment maintenance'
    ],
    key_resources: [
      'Charming commercial cafe and bakery facility (800–1,400 sq.ft) with high-footfall street frontage',
      'Commercial multi-deck stone ovens with steam injection, high-capacity spiral dough mixers, and reversible sheeters',
      'Master Baker & Pastry Chef with specialized culinary expertise in wild-yeast sourdough and French viennoiserie',
      'Initial capital reserves deployed for bakery machinery, cafe fit-out, and initial ingredients'
    ],
    cost_structure: [
      'Artisanal Ingredients: Specialty Flours, High-Fat Butter, Belgian Chocolate & Dairy (28% of revenue)',
      'Master Baker, Pastry Chefs & Front-of-House Barista Payroll (24%)',
      'Storefront Commercial Lease & High-Street High-Footfall Rent (18%)',
      'Commercial Bakery Electricity, Deck Oven Power & Clean Water Filtration (12%)',
      'Eco-Packaging, Waste Contingency & Local Performance Branding (18%)'
    ],
    revenue_streams: [
      'Daily Loaf & Coffee Combo: ₹349 (freshly baked sourdough loaf or butter croissant + specialty coffee)',
      'Weekly Sourdough & Patisserie Box: ₹1,299 / week (2 signature sourdough loaves + 4 artisanal pastries, morning delivery)',
      'Custom Celebration & Luxury Atelier: ₹3,499 / order (1.5kg tiered designer artisanal cake, custom flavor profiling)',
      'Artisanal Spreads & Pantry Retail: ₹280 – ₹750 (house-made cultured butter, berry jams, sourdough crackers)'
    ],
    key_metrics: [
      'Daily Sell-Through Rate (Target >92% of morning bake sold out by 7 PM)',
      'Average Transaction Value (AOV > ₹460 via coffee & pastry pairing)',
      'Ingredient Food Cost Percentage (Strictly controlled under 30%)',
      'Weekly Repeat Customer Rate (>40% neighborhood customer retention)'
    ],
    unfair_advantage: 'Living 5-year-old wild yeast sourdough mother starter delivering an irreplaceable, deep flavor profile and crust texture that commercial factory bakeries cannot replicate with commercial yeast.',
    pricing_tiers: [
      { tier: 'Daily Loaf & Coffee Combo', monthlyPrice: '₹349', annualPrice: '₹349', period: '/ combo', target: 'Walk-in neighborhood breakfast & brunch patrons', features: ['Freshly baked sourdough loaf or butter croissant', 'Artisanal pour-over specialty coffee', 'Freshly whipped cultured butter', 'Eco-friendly carry bag'] },
      { tier: 'Weekly Sourdough Box', monthlyPrice: '₹1,299', annualPrice: '₹1,299', period: '/ week', target: 'Local households & gourmet connoisseurs', features: ['2 specialty sourdough loaves (seeded/rye/country)', '4 handcrafted French patisserie pastries', 'Weekly rotating seasonal preserves', 'Free doorstep morning delivery'], popular: true },
      { tier: 'Luxury Celebration Atelier', monthlyPrice: '₹3,499', annualPrice: '₹3,499', period: '/ order', target: 'Celebrations, birthdays, anniversaries & tastings', features: ['1.5kg tiered designer artisanal celebration cake', 'Custom flavor profiling (Belgian chocolate / Madagascar vanilla)', 'Dessert table presentation box', 'Chef\'s tasting sampler'] }
    ],
    swot: {
      strengths: [
        { title: 'Signature Craft Quality & Irreplaceable Aroma', desc: 'Real sourdough baking creates a potent sensory draw that drives organic foot traffic and customer delight.', impact: 'Sensory Moat', action: 'Time oven bakes to align with morning (7:30 AM) and evening (5:00 PM) commuter rushes.' },
        { title: 'High-Margin Specialty Coffee Pairing', desc: 'Pour-over and espresso coffee sales deliver 75%+ gross margins on top of bread purchases.', impact: 'Margin Expansion', action: 'Train baristas on latte art and offer bundled coffee-and-croissant breakfast deals.' },
        { title: 'Lucrative Celebration Cake Bookings', desc: 'Pre-ordered designer celebration cakes command high average order values (₹3,500+) with zero ingredient wastage.', impact: 'Profit Driver', action: 'Feature a dedicated custom cake consultation corner in the front retail area.' }
      ],
      weaknesses: [
        { title: 'Daily Perishability of Fresh Baked Goods', desc: 'Artisanal breads baked without chemical preservatives must be sold on the day of baking.', impact: 'Inventory Risk', action: 'Repurpose unsold day-old sourdough into high-margin gourmet croutons, bread pudding, and sourdough crisps.' },
        { title: 'High Dependency on Specialized Head Baker', desc: 'Lamination and sourdough fermentation require nuanced technical mastery of dough temperature and humidity.', impact: 'Talent Risk', action: 'Codify exact hydration percentages, dough temperatures, and baking schedules into clear visual standard operating procedures (SOPs).' }
      ],
      opportunities: [
        { title: 'Weekly Sourdough Subscription Model', desc: 'Delivering fresh artisan loaves to subscribed residential apartments every Tuesday and Friday locks in recurring revenue.', impact: 'Predictable Cashflow', action: 'Launch the \'Crust Club\' weekly sourdough subscription pass with free doorstep delivery.' },
        { title: 'B2B Wholesale Supply to Boutique Cafes', desc: 'Independent local cafes and boutique hotels prefer outsourcing premium bread rather than operating expensive bakery machinery.', impact: 'Bulk Volume', action: 'Offer early-morning wholesale bread deliveries to 10 non-competing specialty cafes.' },
        { title: 'Weekend Sourdough & Baking Masterclasses', desc: 'Food enthusiasts enthusiastically pay ₹2,500–₹4,000 for hands-on weekend bread-making workshops during quiet mid-day hours.', impact: 'High-Margin Community', action: 'Host monthly Sunday afternoon sourdough masterclasses to build passionate brand advocates.' }
      ],
      threats: [
        { title: 'Rising Imported Ingredient Costs', desc: 'Fluctuations in the price of imported butter, specialty cocoa, and European chocolate can compress margins.', impact: 'Cost Squeeze', action: 'Partner directly with emerging Indian craft dairy and chocolate makers for premium domestic alternatives.' },
        { title: 'Commercial Bakery Imitators', desc: 'Industrial bakeries market factory-produced commercial bread with caramel coloring under misleading \'sourdough\' labels.', impact: 'Market Confusion', action: 'Educate patrons through transparent open-kitchen tours showcasing the live 36-hour slow-fermentation process.' }
      ]
    }
  },

  qsr_restaurant: {
    archetype: 'Authentic Hyderabadi Dum Biryani & Regional Food Service',
    gross_margin: '58% – 66%',
    ltv_cac: '3.6x – 4.2x',
    payback_months: '3 – 5 Months',
    problem: 'Commercial restaurant chains serving reheated, frozen biryani with synthetic essences and artificial colors, inflated menu markups, and long dining wait times frustrating college students and hungry commuters.',
    solution: 'Authentic firewood dum cooking using aged long-grain Basmati rice, farm-fresh tender poultry, aromatic hand-ground spices, clay-pot packaging, and express counter parcel service.',
    customer_segments: [
      'Primary ICP: University students, hostel residents, faculty members, and local commuters seeking hearty, delicious meals',
      'Family Diners & Group Celebrations: Weekend family dinner crowds and student birthday group parties seeking large handi packs',
      'Late-Night Delivery Patrons: University students and young professionals requiring late-night study-session biryani boxes',
      'Event & Campus Catering: College fests, corporate events, and family functions requiring bulk catering buffets'
    ],
    value_proposition: 'Delivers slow-cooked authentic Hyderabadi dum biryani prepared fresh twice daily, served piping hot with generous meat portions and complimentary mirchi ka salan in under 3 minutes.',
    channels: [
      'Prominent Campus-Front Retail Storefront with open live dum cooking display attracting heavy student foot-traffic',
      'WhatsApp Quick-Parcel Order Line for late-night hostel delivery and advance takeout pickup',
      'Student Ambassador Programs with campus societies and competitive sports teams',
      'Selective listing on Zomato and Swiggy used strictly for delivery discovery outside the immediate walking radius'
    ],
    key_partners: [
      'Poultry & Meat Wholesalers for direct daily supply of fresh, tender, antibiotic-free chicken and mutton',
      'Agricultural Mandis for bulk procurement of aged long-grain Basmati rice and whole aromatic spices',
      'Clay Pot Artisans and Biodegradable Food Container Manufacturers for leak-proof, heat-retentive takeaway handis',
      'Dairy Farmers for fresh thick curd, malai paneer, and pure cow ghee'
    ],
    key_activities: [
      'Daily morning and evening slow dum cooking cycles over authentic charcoal and wood fire',
      'Continuous counter parcel packing, billing reconciliation, and rapid table turnover management',
      'Maintaining spotless kitchen hygiene standards, food temperature safety, and oil freshness testing',
      'Campus festival bulk catering fulfillment and student combo meal promotion execution'
    ],
    key_resources: [
      'High-visibility commercial storefront (600–1,200 sq.ft) situated immediately opposite university main gate',
      'Heavy-duty copper and brass biryani handis, high-pressure gas burners, and commercial cold storage',
      'Master Ustad Dum Chef with over a decade of traditional authentic dum cooking expertise',
      'Initial working capital reserves deployed for commercial kitchen equipment, lease deposit, and ingredients'
    ],
    cost_structure: [
      'Raw Food Ingredients: Fresh Poultry, Basmati Rice, Pure Ghee, Dairy & Spices (36% of revenue)',
      'Master Dum Chef, Assistant Cooks & Kitchen Helper Wages (20%)',
      'Campus-Facing Commercial Storefront Lease & High-Street Rent (16%)',
      'Commercial LPG Cylinders, Electricity & Kitchen Exhaust Maintenance (10%)',
      'Biodegradable Takeaway Packaging, Parcel Containers & Local Student Promotion (18%)'
    ],
    revenue_streams: [
      'Student / Quick Meal Combo: ₹249 (single-portion signature dum biryani + boiled egg + raita + beverage)',
      'Family Feast / Handi Pack: ₹799 (full clay handi biryani for 3-4 pax + double salan & raita + gulab jamun)',
      'Party & Campus Catering: ₹4,999 / event booking (customized buffet for 15-25 pax with chafing dishes)',
      'Late-Night Hostel Parcels & Quick Takeaway: ₹180 – ₹380 per order'
    ],
    key_metrics: [
      'Daily Handi Count Sold (Target >14 handis / day, ~280 individual portions sold)',
      'Average Parcel Packaging Speed (<3 minutes per takeaway order ticket)',
      'Student Repeat Frequency (Average >2.8 visits / week per active student)',
      'Food Wastage Percentage (Strictly controlled under 2.5% via dual daily bake batches)'
    ],
    unfair_advantage: 'Irreplaceable prime campus-front location directly opposite university main gate paired with authentic charcoal dum cooking tradition and student-friendly pricing that commercial multi-cuisine restaurants cannot match.',
    pricing_tiers: [
      { tier: 'Student / Quick Meal Combo', monthlyPrice: '₹249', annualPrice: '₹249', period: '/ meal combo', target: 'Individual diners, students & commuters', features: ['Single-portion signature dum biryani', 'Complimentary beverage', 'Express takeaway counter pickup', 'Eco-friendly food packaging'] },
      { tier: 'Family Feast / Handi Pack', monthlyPrice: '₹799', annualPrice: '₹799', period: '/ meal pack', target: 'Families & friend groups (3-4 pax)', features: ['Full clay handi dum biryani', 'Double sides (mirchi ka salan & raita)', 'Signature dessert sampler', 'Priority dine-in table'], popular: true },
      { tier: 'Party & Campus Catering', monthlyPrice: '₹4,999', annualPrice: '₹4,999', period: '/ event booking', target: 'Campus fests, hostel birthdays & celebrations (15-25 pax)', features: ['Customized catering buffet setup', 'Chafing dishes with live food heating', 'Dedicated service steward', 'Custom spice levels'] }
    ],
    swot: {
      strengths: [
        { title: 'Irreplaceable Campus Proximity & Captive Footfall', desc: 'Located directly opposite Vignan University gates, capturing thousands of hungry students daily.', impact: 'Captive Market', action: 'Maintain express 3-minute takeaway packaging to handle peak 1:00 PM lunch rushes.' },
        { title: 'High-Volume Fast Inventory Turnover', desc: 'Biryani prepared in large batches yields high volume efficiency with near-zero leftover waste.', impact: 'Operating Efficiency', action: 'Schedule secondary 7:00 PM evening dum batch to serve hostel dinner rushes.' },
        { title: 'Authentic Charcoal Dum Preparation', desc: 'Slow cooking over coal creates authentic aroma and tender meat texture superior to commercial gas ovens.', impact: 'Product Moat', action: 'Showcase live handi de-sealing and steaming rice aroma at the front counter.' }
      ],
      weaknesses: [
        { title: 'University Academic Calendar Seasonality', desc: 'Semester breaks (May-June) and vacation holidays temporarily reduce student campus presence.', impact: 'Revenue Fluctuation', action: 'Expand delivery radius into Vadlamudi town residents and Chebrolu Mandal highway commuters during holidays.' },
        { title: 'High Volatility in Poultry & Vegetable Prices', desc: 'Fluctuations in chicken and onion mandi rates can squeeze gross profit margins.', impact: 'Cost Risk', action: 'Lock in monthly forward wholesale contracts with regional poultry suppliers.' }
      ],
      opportunities: [
        { title: 'Late-Night Hostel Midnight Canteen Delivery', desc: 'Hostel students studying for exams after 10:00 PM actively crave hot snacks and biryani parcels.', impact: 'Untapped Daypart', action: 'Launch dedicated 10:00 PM–1:00 AM WhatsApp midnight delivery window to student hostels.' },
        { title: 'College Fest & Department Event Bulk Catering', desc: 'Annual cultural fests, alumni meets, and engineering symposiums require large-scale meal catering.', impact: 'High-Margin Bulk Orders', action: 'Partner with student union committees as official food sponsor for campus festivals.' },
        { title: 'Branded Retail Gravy & Biryani Masala Packs', desc: 'Students and visiting parents frequently request packaged proprietary biryani spice blends to take home.', impact: 'Ancillary Revenue', action: 'Package and sell 200g artisanal biryani spice tins at the front cashier desk.' }
      ],
      threats: [
        { title: 'Local Street Food & Dhaba Competitors', desc: 'Low-cost roadside food stalls offer cut-price fried rice and snacks near the bus depot.', impact: 'Price Competition', action: 'Differentiate strongly on certified FSSAI food hygiene, clean drinking water, and generous meat portions.' },
        { title: 'Municipal Sanitation & Food Safety Inspections', desc: 'Commercial food operations require rigorous adherence to municipal health and safety guidelines.', impact: 'Regulatory Compliance', action: 'Maintain daily kitchen sanitation checklists and certified pest control contracts.' }
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
    pricing_tiers: isOffline ? (
      (ttl.toLowerCase().includes('gym') || ind.toLowerCase().includes('fitness')) ? [
        { tier: 'Starter Floor Pass', monthlyPrice: '₹1,499', annualPrice: '₹14,390', period: '/ month', target: 'Casual lifters & general gym regulars', features: ['Full cardio & free weights floor access', 'Locker & shower facility', 'General fitness orientation', 'Dedicated trainer floor support'] },
        { tier: 'Pro Athlete / CrossFit', monthlyPrice: '₹2,999', annualPrice: '₹28,790', period: '/ month', target: 'CrossFit athletes & group HIIT regulars', features: ['Unlimited daily coached CrossFit batches', 'Coach lifting form & technique analysis', 'Olympic lifting platforms', 'Priority batch reservation'], popular: true },
        { tier: 'Elite Transformation & PT', monthlyPrice: '₹5,499', annualPrice: '₹52,790', period: '/ month', target: 'Personalized coaching & body transformation', features: ['8 dedicated 1-on-1 personal trainer sessions/mo', 'Monthly InBody body composition scan', 'Customized macro nutrition plan', 'Recovery lounge access'] }
      ] : (ttl.toLowerCase().includes('bakery') || ind.toLowerCase().includes('bakery') || ttl.toLowerCase().includes('sourdough')) ? [
        { tier: 'Daily Loaf & Coffee Combo', monthlyPrice: '₹349', annualPrice: '₹349', period: '/ combo', target: 'Walk-in neighborhood breakfast & brunch patrons', features: ['Freshly baked sourdough loaf or butter croissant', 'Artisanal pour-over specialty coffee', 'Freshly whipped cultured butter', 'Eco-friendly carry bag'] },
        { tier: 'Weekly Sourdough Box', monthlyPrice: '₹1,299', annualPrice: '₹1,299', period: '/ week', target: 'Local households & gourmet connoisseurs', features: ['2 specialty sourdough loaves (seeded/rye/country)', '4 handcrafted French patisserie pastries', 'Weekly rotating seasonal preserves', 'Free doorstep morning delivery'], popular: true },
        { tier: 'Luxury Celebration Atelier', monthlyPrice: '₹3,499', annualPrice: '₹3,499', period: '/ order', target: 'Celebrations, birthdays, anniversaries & tastings', features: ['1.5kg tiered designer artisanal celebration cake', 'Custom flavor profiling (Belgian chocolate / Madagascar vanilla)', 'Dessert table presentation box', 'Chef\'s tasting sampler'] }
      ] : (ttl.toLowerCase().includes('biryani') || ind.toLowerCase().includes('food') || ind.toLowerCase().includes('restaurant') || ttl.toLowerCase().includes('dining')) ? [
        { tier: 'Student / Quick Meal Combo', monthlyPrice: '₹249', annualPrice: '₹249', period: '/ meal combo', target: 'Individual diners, students & commuters', features: ['Single-portion signature dum biryani', 'Complimentary beverage', 'Express takeaway counter pickup', 'Eco-friendly food packaging'] },
        { tier: 'Family Feast / Handi Pack', monthlyPrice: '₹799', annualPrice: '₹799', period: '/ meal pack', target: 'Families & friend groups (3-4 pax)', features: ['Full clay handi dum biryani', 'Double sides (mirchi ka salan & raita)', 'Signature dessert sampler', 'Priority dine-in table'], popular: true },
        { tier: 'Party & Corporate Catering', monthlyPrice: '₹4,999', annualPrice: '₹4,999', period: '/ event booking', target: 'Office parties, birthdays & celebrations (15-25 pax)', features: ['Customized catering buffet setup', 'Chafing dishes with live food heating', 'Dedicated service steward', 'Custom spice levels'] }
      ] : [
        { tier: 'Standard Walk-in / Base Pass', monthlyPrice: '₹499', annualPrice: '₹4,990', period: '/ month', target: 'Regular walk-ins & local patrons', features: [`Core on-premise ${ind} access`, 'Standard service fulfillment', 'Digital transaction receipt', 'Standard support'] },
        { tier: 'Preferred Regular Member', monthlyPrice: '₹1,499', annualPrice: '₹14,390', period: '/ month', target: 'Frequent neighborhood patrons', features: ['Unlimited monthly on-premise access', 'Priority queue booking', '10% discount on retail add-ons', 'Personalized customer care'], popular: true },
        { tier: 'VIP / Corporate Package', monthlyPrice: '₹3,999', annualPrice: '₹39,990', period: '/ month', target: 'VIP clients & corporate group accounts', features: ['Dedicated relationship coordinator', 'Zero-waiting priority slots', 'Custom accommodations', 'Complimentary perks'] }
      ]
    ) : isHybrid ? (
      (ttl.toLowerCase().includes('clinic') || ind.toLowerCase().includes('health') || ttl.toLowerCase().includes('carepoint') || ttl.toLowerCase().includes('doctor')) ? [
        { tier: 'OPD Walk-in & Digital Rx', monthlyPrice: '₹299', annualPrice: '₹299', period: '/ visit', target: 'Outpatient clinic walk-ins & single consultations', features: ['In-person doctor consultation', 'Instant ABHA digital health record sync', 'Digital prescription delivered via WhatsApp', 'Live digital token queue tracking'] },
        { tier: 'Family Health Pass', monthlyPrice: '₹899', annualPrice: '₹8,990', period: '/ month', target: 'Households seeking preventive & routine clinic care', features: ['3 doctor consultations/mo (in-clinic or teleconsult)', 'Free baseline vitals & blood sugar screening', '10% discount on in-house diagnostics & pharmacy', 'Priority weekend doctor appointment slots'], popular: true },
        { tier: 'Chronic Care Annual Pass', monthlyPrice: '₹2,499', annualPrice: '₹24,990', period: '/ year', target: 'Patients managing diabetes, hypertension & chronic conditions', features: ['Unlimited monthly OPD follow-up consultations', 'Quarterly comprehensive diagnostic blood panels', '24/7 WhatsApp emergency doctor helpline', 'Free home sample collection & medicine delivery'] }
      ] : (ttl.toLowerCase().includes('grocery') || ind.toLowerCase().includes('agri') || ttl.toLowerCase().includes('freshfarm')) ? [
        { tier: 'Everyday Shopper', monthlyPrice: 'Pay-as-you-go', annualPrice: 'Pay-as-you-go', period: '/ order', target: 'Casual walk-ins & periodic app orders', features: ['Direct farm-fresh organic produce', 'Wholesale mandi rates', 'Free storefront pickup', 'Zero subscription commitment'] },
        { tier: 'Fresh Club Member', monthlyPrice: '₹149', annualPrice: '₹1,490', period: '/ month', target: 'Frequent weekly grocery buyers', features: ['Unlimited free 15-minute home delivery', '5% cashback on all orders', 'Morning priority delivery slots (6-8 AM)', 'Guaranteed pesticide-free quality'], popular: true },
        { tier: 'Family Pantry Annual Pass', monthlyPrice: '₹999', annualPrice: '₹999', period: '/ year', target: 'Full household daily kitchen requirements', features: ['Daily unadulterated farm milk delivery before 7 AM', 'Zero surge delivery fees during peak hours', 'Free seasonal organic fruit box quarterly', 'Dedicated WhatsApp concierge'] }
      ] : [
        { tier: 'Basic Digital + Store Pass', monthlyPrice: '₹399', annualPrice: '₹3,830', period: '/ month', target: 'Periodic shoppers & digital users', features: ['Digital app access', 'Storefront express pickup', 'Order status tracking', 'Basic support'] },
        { tier: 'Omnichannel Prime Pass', monthlyPrice: '₹999', annualPrice: '₹9,590', period: '/ month', target: 'Weekly active patrons', features: ['Free doorstep fulfillment', 'Priority in-store service counter', '5% cashback on all orders', 'WhatsApp concierge'], popular: true },
        { tier: 'Family All-Access Executive', monthlyPrice: '₹2,499', annualPrice: '₹23,990', period: '/ month', target: 'Full household accounts', features: ['Unlimited free doorstep deliveries', 'Zero surge fees during peak hours', 'Dedicated relationship manager', 'Priority slots'] }
      ]
    ) : (ttl.toLowerCase().includes('resume') || ind.toLowerCase().includes('career') || ttl.toLowerCase().includes('portfolio')) ? [
      { tier: 'Starter Free', monthlyPrice: '₹0', annualPrice: '₹0', period: 'Free Forever', target: 'Job seekers & fresh graduates', features: ['1 ATS-optimized resume export', 'Standard template styles', 'Basic keyword matching', 'PDF download'] },
      { tier: 'Job Seeker Pro', monthlyPrice: '₹499', annualPrice: '₹1,499', period: '/ month', target: 'Active job seekers & career switchers', features: ['Unlimited AI bullet rewrites', 'Custom web portfolio with sub-domain', 'Real-time ATS match score against job descriptions', 'Cover letter generator', 'Priority WhatsApp support'], popular: true },
      { tier: 'Campus / Enterprise', monthlyPrice: '₹1,499', annualPrice: '₹14,388', period: '/ year', target: 'Placement cells & professional coaches', features: ['Batch resume reviews', 'Institutional branding & custom watermarks', 'Bulk export & analytics', 'Dedicated placement support'] }
    ] : (ttl.toLowerCase().includes('finops') || ttl.toLowerCase().includes('cloudcost') || ind.toLowerCase().includes('cloud')) ? [
      { tier: 'Developer / Team Tier', monthlyPrice: '₹3,999', annualPrice: '₹38,390', period: '/ month', target: 'Early-stage cloud startups (<$10k/mo cloud spend)', features: ['AWS CUR & Azure billing ingestion', 'Weekly automated waste detection', 'Slack & WhatsApp anomaly alerts', '2 admin seats'] },
      { tier: 'Scale / Multi-Cloud FinOps', monthlyPrice: '₹12,999', annualPrice: '₹1,24,790', period: '/ month', target: 'Growing SaaS companies ($10k–$80k/mo spend)', features: ['Kubernetes pod-level cost allocation', 'Automated RI/Savings Plan recommendations', 'CI/CD pull request cost estimation', 'Unlimited team seats'], popular: true },
      { tier: 'Enterprise Infrastructure', monthlyPrice: '₹39,999', annualPrice: '₹3,83,990', period: '/ month', target: 'Multi-cloud enterprise accounts (>$80k/mo spend)', features: ['1-click auto-remediation bots', 'Custom ERP & ServiceNow sync', 'SOC-2 audit reporting', 'Dedicated FinOps account manager'] }
    ] : [
      { tier: 'Starter', monthlyPrice: '₹499', annualPrice: '₹4,788', period: '/ month', target: 'Early adopters & small teams', features: [`Core ${ind} toolkit`, 'Standard analytics dashboard', 'Email & WhatsApp support', '2 user seats'] },
      { tier: 'Professional', monthlyPrice: '₹1,499', annualPrice: '₹14,388', period: '/ month', target: 'Growing businesses & active operators', features: ['Advanced automated workflows', 'Multi-seat team collaboration', 'Automated reporting', 'Priority support'], popular: true },
      { tier: 'Enterprise', monthlyPrice: '₹4,999', annualPrice: '₹47,988', period: '/ month', target: 'Large institutions & multi-location groups', features: ['Dedicated instance', 'Custom ERP integration', '99.9% uptime SLA guarantee', '24/7 dedicated account manager'] }
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
const getTierPricing = (tier, idx = 0, cycle = 'annual') => {
  // Low, realistic Indian startup monthly benchmarks:
  // Tier 0 (Starter): ₹499/mo | Annual: ₹399/mo (₹4,788/yr, save 20%)
  // Tier 1 (Pro): ₹1,499/mo | Annual: ₹1,199/mo (₹14,388/yr, save 20%)
  // Tier 2+ (Enterprise): ₹4,999/mo | Annual: ₹3,999/mo (₹47,988/yr, save 20%)
  const defaultMonthlyTiers = [499, 1499, 4999];
  let monthlyBase = defaultMonthlyTiers[idx] || (idx === 0 ? 499 : idx === 1 ? 1499 : 4999);

  if (tier && typeof tier === 'object') {
    const rawMonthly = tier.monthlyPrice || tier.monthly_price || (!String(tier.period || '').toLowerCase().includes('year') ? tier.price : null);
    if (rawMonthly) {
      const parsed = parseInt(String(rawMonthly).replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 49 && parsed <= 99999) {
        monthlyBase = parsed;
      }
    }
  } else if (typeof tier === 'string') {
    const parsed = parseInt(tier.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 49 && parsed <= 99999) {
      monthlyBase = parsed;
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
    if (/\b(resume|portfolio|career|ats|cv|job seeker|hiring|recruitment)\b/.test(text)) return 'career_tech';
    if (/\b(finops|cloudcost|cloud cost|kubernetes cost|cloud governance|aws cost)\b/.test(text)) return 'cloud_finops';
    if (/\b(gym|crossfit|fitness|strength|workout|powerlifting|athlete)\b/.test(text)) return 'fitness_gym';
    if (/\b(bakery|sourdough|bread|pastry|patisserie|croissant|crust & crumb)\b/.test(text)) return 'artisan_bakery';
    if (/\b(biryani|restaurant|qsr|dining|food service|canteen|dhaba|handi)\b/.test(text)) return 'qsr_restaurant';
    if (/\b(school|edtech|education|learn|student|college|timetable|tuition|lms)\b/.test(text)) return 'edtech';
    if (/\b(fintech|finance|payment|payments|bank|banking|wealth|invest|crypto|lending|upi)\b/.test(text)) return 'fintech';
    if (/\b(health|healthcare|doctor|patient|clinic|hospital|telemedicine|diagnostic|pharmacy|carepoint)\b/.test(text)) return 'healthtech';
    return null;
  };

  const sectorKey = getSectorKey();
  const fallbackProfile = sectorKey && FRONTEND_BUSINESS_INTELLIGENCE[sectorKey]
    ? FRONTEND_BUSINESS_INTELLIGENCE[sectorKey]
    : getUniversalDomainProfile(industry, title, sector);

  // Helper parser for bullet lists from string or array ensuring string children
  const parseItems = (val, fallbackList = []) => {
    if (!val) return fallbackList;
    if (Array.isArray(val)) {
      return val.length > 0
        ? val.map(item => (typeof item === 'object' && item !== null ? (item.title || item.name || item.desc || JSON.stringify(item)) : String(item)))
        : fallbackList;
    }
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

  // Ensure any legacy dollar values are safely sanitized into Indian Rupees (₹)
  const sanitizeInr = (items) => {
    return items.map(item => {
      if (typeof item !== 'string') return String(item);
      return item.replace(/\$(\d+(?:\.\d+)?)/g, (match, p1) => {
        const usd = parseFloat(p1);
        const inr = Math.round(usd * 85);
        return `₹${inr.toLocaleString('en-IN')}`;
      });
    });
  };

  const costStructure = sanitizeInr(parseItems(bm.cost_structure, fallbackProfile.cost_structure));
  const revenueStreams = sanitizeInr(parseItems(bm.revenue_streams, fallbackProfile.revenue_streams));
  const keyMetrics = parseItems(bm.key_metrics, fallbackProfile.key_metrics);
  const unfairAdvantage = bm.unfair_advantage || fallbackProfile.unfair_advantage;

  // Rock-solid pricing tiers normalization with guaranteed object fields
  const defaultFallbackTiers = [
    { tier: 'Starter', monthlyPrice: '₹499', annualPrice: '₹4,788', period: '/ month', target: 'Early adopters & small teams', features: ['Core platform tools', 'Standard analytics dashboard', 'Email & WhatsApp support', '2 user seats'] },
    { tier: 'Professional', monthlyPrice: '₹1,499', annualPrice: '₹14,388', period: '/ month', target: 'Growing businesses & active operators', features: ['Advanced automated workflows', 'Multi-seat team collaboration', 'Automated GST reporting', 'Priority webhook SLAs'], popular: true },
    { tier: 'Enterprise', monthlyPrice: '₹4,999', annualPrice: '₹47,988', period: '/ month', target: 'Large institutions & multi-location groups', features: ['Dedicated database tenant', 'Custom ERP bi-directional sync', '99.9% uptime SLA guarantee', '24/7 dedicated account manager'] }
  ];

  const candidateTiers = Array.isArray(bm.pricing_tiers) && bm.pricing_tiers.length > 0
    ? bm.pricing_tiers
    : (Array.isArray(fallbackProfile.pricing_tiers) && fallbackProfile.pricing_tiers.length > 0
        ? fallbackProfile.pricing_tiers
        : defaultFallbackTiers);

  const pricingTiers = candidateTiers.map((t, idx) => {
    const fallbackT = defaultFallbackTiers[idx] || defaultFallbackTiers[0];
    if (typeof t === 'string') {
      return {
        tier: `Plan ${idx + 1}`,
        target: 'Operational users & teams',
        monthlyPrice: t,
        annualPrice: t,
        period: '/ month',
        features: ['Core operational toolkit', 'Standard analytics'],
        popular: idx === 1
      };
    }
    return {
      tier: t?.tier || t?.name || fallbackT.tier,
      target: t?.target || t?.description || fallbackT.target,
      monthlyPrice: t?.monthlyPrice || t?.monthly_price || t?.price || fallbackT.monthlyPrice,
      annualPrice: t?.annualPrice || t?.annual_price || fallbackT.annualPrice,
      period: t?.period || '/ month',
      features: Array.isArray(t?.features)
        ? t.features
        : (typeof t?.features === 'string' ? t.features.split(/,\s*/).filter(Boolean) : fallbackT.features),
      popular: Boolean(t?.popular || idx === 1)
    };
  });

  const parseSwotQuadrant = (items, fallbackItems = []) => {
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item, idx) => {
        const fallback = fallbackItems[idx] || {};
        if (typeof item === 'object' && item !== null) {
          const title = item.title || item.name || item.heading || fallback.title || `Key Factor #${idx + 1}`;
          const desc = item.desc || item.description || item.detail || item.text || item.point || item.explanation || fallback.desc || '';
          const impact = item.impact || item.badge || item.priority || fallback.impact || 'Core Factor';
          const action = item.action || item.recommendation || item.strategy || item.mitigation || fallback.action || 'Execute strategic focus.';
          return {
            title,
            desc: desc || title,
            impact,
            action
          };
        }
        const str = String(item || '').trim();
        const parts = str.split(/:\s*/);
        if (parts.length > 1 && parts[0].length < 60) {
          return {
            title: parts[0].trim(),
            desc: parts.slice(1).join(': ').trim(),
            impact: fallback.impact || 'Core Factor',
            action: fallback.action || 'Execute strategic focus.'
          };
        }
        return {
          title: fallback.title || `Key Factor #${idx + 1}`,
          desc: str || fallback.desc || 'Strategic market element to monitor.',
          impact: fallback.impact || 'Core Factor',
          action: fallback.action || 'Execute strategic focus.'
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

  // Safe selected plan index & plan object
  const safeSelectedIdx = (selectedPlanIdx >= 0 && selectedPlanIdx < pricingTiers.length) ? selectedPlanIdx : 0;
  const currentSelectedPlan = pricingTiers[safeSelectedIdx] || pricingTiers[0] || defaultFallbackTiers[0];

  const handlePlanSelect = (idx) => {
    const validIdx = (idx >= 0 && idx < pricingTiers.length) ? idx : 0;
    setSelectedPlanIdx(validIdx);
    const plan = pricingTiers[validIdx] || pricingTiers[0] || defaultFallbackTiers[0];
    toast.success(`Selected Plan: ${plan.tier} (${billingCycle === 'annual' ? 'Annual Billing' : 'Monthly Billing'})`);
  };

  return (
    <div className="business-tab animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* ============================================================ */}
      {/* 1. EXECUTIVE STRATEGY COMMAND BANNER                          */}
      {/* ============================================================ */}
      <div className="biz-executive-header">
        <div className="biz-header-top">
          <div className="biz-title-area">
            <h3><FaBuilding style={{ color: '#0284c7' }} /> Business Model &amp; Unit Economics Architecture</h3>
            <p className="biz-subtitle">Strategic Lean Canvas, Unit Economics, and Monetization Architecture for <strong>{title}</strong></p>
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
            <div className="biz-kpi-value" style={{ color: '#059669' }}>{grossMargin}</div>
            <div className="biz-kpi-sub">Profitable Unit Economics</div>
          </div>

          <div className="biz-kpi-card">
            <div className="biz-kpi-label"><FaBullseye style={{ color: '#06b6d4' }} /> LTV : CAC Benchmark</div>
            <div className="biz-kpi-value" style={{ color: '#0284c7' }}>{ltvCac}</div>
            <div className="biz-kpi-sub">High Efficiency Ratio (&gt;3.0x)</div>
          </div>

          <div className="biz-kpi-card">
            <div className="biz-kpi-label"><FaCoins style={{ color: '#f59e0b' }} /> CAC Payback Period</div>
            <div className="biz-kpi-value" style={{ color: '#fbbf24' }}>{paybackMonths}</div>
            <div className="biz-kpi-sub">Fast Cash Conversion Cycle</div>
          </div>

          <div className="biz-kpi-card">
            <div className="biz-kpi-label"><FaCreditCard style={{ color: '#059669' }} /> Monetization Engine</div>
            <div className="biz-kpi-value" style={{ color: '#7c3aed', fontSize: '1.1rem' }}>
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
                <span className="biz-card-title"><FaExclamationTriangle style={{ color: '#ef4444' }} /> 1. Problem &amp; Friction</span>
                <span className="biz-card-tag" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>Pain Point</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>{problemText}</p>
            </div>

            {/* 2. Customer Segments */}
            <div className="biz-canvas-card segments">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaUsers style={{ color: '#ec4899' }} /> 2. Customer Segments</span>
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
                <span className="biz-card-tag" style={{ background: 'rgba(6,182,212,0.2)', color: '#0284c7' }}>Core Moat</span>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#0F172A', lineHeight: '1.65', fontWeight: '500' }}>
                {valuePropText}
              </p>
            </div>

            {/* 4. Solution */}
            <div className="biz-canvas-card solution">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaCheckCircle style={{ color: '#10b981' }} /> 4. Solution &amp; Workflows</span>
                <span className="biz-card-tag" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>Product Engine</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>{solutionText}</p>
            </div>

            {/* 5. Channels */}
            <div className="biz-canvas-card channels">
              <div className="biz-card-header">
                <span className="biz-card-title"><FaBullseye style={{ color: '#10b981' }} /> 5. Channels &amp; GTM</span>
                <span className="biz-card-tag" style={{ color: '#10b981', background: 'rgba(16, 185, 129,0.1)' }}>Distribution</span>
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
                <span className="biz-card-title"><FaLock style={{ color: '#f59e0b' }} /> 6. Unfair Advantage</span>
                <span className="biz-card-tag" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>Barrier to Entry</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>{unfairAdvantage}</p>
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
                <span className="biz-card-title"><FaCoins style={{ color: '#f97316' }} /> 8. Cost Structure (₹)</span>
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
                <span className="biz-card-title"><FaCreditCard style={{ color: '#10b981' }} /> 9. Revenue Streams (₹)</span>
                <span className="biz-card-tag" style={{ background: 'rgba(16,185,129,0.2)', color: '#059669' }}>Monetization</span>
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
                All 4 Quadrants
              </button>
              <button
                onClick={() => setSwotFilter('strengths')}
                className={`swot-filter-pill ${swotFilter === 'strengths' ? 'active-strengths' : ''}`}
                style={{ color: swotFilter === 'strengths' ? '#FFFFFF' : '#047857' }}
              >
                Strengths ({strengthsList.length})
              </button>
              <button
                onClick={() => setSwotFilter('weaknesses')}
                className={`swot-filter-pill ${swotFilter === 'weaknesses' ? 'active-weaknesses' : ''}`}
                style={{ color: swotFilter === 'weaknesses' ? '#FFFFFF' : '#B91C1C' }}
              >
                Weaknesses ({weaknessesList.length})
              </button>
              <button
                onClick={() => setSwotFilter('opportunities')}
                className={`swot-filter-pill ${swotFilter === 'opportunities' ? 'active-opportunities' : ''}`}
                style={{ color: swotFilter === 'opportunities' ? '#FFFFFF' : '#0369A1' }}
              >
                Opportunities ({opportunitiesList.length})
              </button>
              <button
                onClick={() => setSwotFilter('threats')}
                className={`swot-filter-pill ${swotFilter === 'threats' ? 'active-threats' : ''}`}
                style={{ color: swotFilter === 'threats' ? '#FFFFFF' : '#B45309' }}
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
                        <FaCheckCircle style={{ color: isSelected ? '#10b981' : '#0284c7' }} /> {feat}
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
            const selectedPricing = getTierPricing(currentSelectedPlan, safeSelectedIdx, billingCycle);
            const activeTierName = currentSelectedPlan?.tier || 'Selected';
            const activeTargetDesc = currentSelectedPlan?.target || 'your core target audience';
            return (
              <div className="plan-selected-summary">
                <div className="plan-summary-left">
                  <h4>
                    <FaRocket style={{ color: '#10b981' }} /> Active Strategy: {activeTierName} Plan ({billingCycle.toUpperCase()} BILLING)
                  </h4>
                  <p>
                    Targeted at {activeTargetDesc}. Designed to deliver maximum operational velocity with predictable {billingCycle} subscription cashflow.
                  </p>
                </div>

                <div className="plan-summary-right">
                  <div className="plan-price-callout">
                    <div className="price">{selectedPricing.summaryPrice}</div>
                    <div className="term">{selectedPricing.summarySub}</div>
                  </div>

                  <button
                    onClick={() => toast.success(`Confirmed ${activeTierName} plan at ${selectedPricing.summaryPrice}!`)}
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
              <h4 style={{ color: '#059669', marginBottom: '0.6rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

            <div className="glass-card p-md" style={{ borderLeft: '4px solid #0ea5e9' }}>
              <h4 style={{ color: '#0284c7', marginBottom: '0.6rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCreditCard /> Indian Payment & Billing Rails
              </h4>
              <ul className="biz-list">
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#0ea5e9' }} />
                  <span><strong>UPI AutoPay:</strong> Recurring mandate collection without SMS OTP drop-offs</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#0ea5e9' }} />
                  <span><strong>Payment Gateways:</strong> Native Razorpay / Cashfree routing with instant T+0 settlement</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#0ea5e9' }} />
                  <span><strong>e-NACH Mandates:</strong> Corporate bank debit mandates for annual subscriptions</span>
                </li>
                <li className="biz-list-item">
                  <span className="biz-item-bullet" style={{ background: '#0ea5e9' }} />
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
            <h4 style={{ color: '#0F172A', fontSize: '1.25rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaNetworkWired style={{ color: '#0ea5e9' }} /> End-to-End Strategic Value Chain &amp; Ecosystem Map
            </h4>
            <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
              How {title} coordinates upstream infrastructure, core operational workflows, downstream distribution, and regulatory guardians.
            </p>
          </div>

          <div className="ecosystem-chain-grid">
            
            {/* Step 1: Upstream */}
            <div className="ecosystem-chain-node" style={{ borderTop: '3px solid #0ea5e9' }}>
              <div className="chain-step-num">1</div>
              <div className="chain-node-title"><FaServer style={{ color: '#0284c7' }} /> Upstream Rails</div>
              <div className="chain-node-desc">
                AWS Mumbai ap-south-1 cloud hosting, NPCI payment switches, and core identity verification rails.
              </div>
              <span className="chain-partner-tag">AWS, NPCI, DigiLocker</span>
            </div>

            {/* Step 2: Core Engine */}
            <div className="ecosystem-chain-node" style={{ borderTop: '3px solid #10b981' }}>
              <div className="chain-step-num">2</div>
              <div className="chain-node-title"><FaCogs style={{ color: '#7c3aed' }} /> Operational Engine</div>
              <div className="chain-node-desc">
                Proprietary workflow heuristics, automated scheduling &amp; routing logic, and client telemetry databases.
              </div>
              <span className="chain-partner-tag">FastAPI, PostgreSQL, Redis</span>
            </div>

            {/* Step 3: Downstream */}
            <div className="ecosystem-chain-node" style={{ borderTop: '3px solid #10b981' }}>
              <div className="chain-step-num">3</div>
              <div className="chain-node-title"><FaRocket style={{ color: '#059669' }} /> Channels &amp; GTM</div>
              <div className="chain-node-desc">
                Direct institutional demos, B2B software app stores, and industry associations across Tier-1/2 trade hubs.
              </div>
              <span className="chain-partner-tag">Field Sales, Trade Summits</span>
            </div>

            {/* Step 4: Regulatory */}
            <div className="ecosystem-chain-node" style={{ borderTop: '3px solid #06b6d4' }}>
              <div className="chain-step-num">4</div>
              <div className="chain-node-title"><FaCertificate style={{ color: '#0284c7' }} /> Trust &amp; Compliance</div>
              <div className="chain-node-desc">
                Adherence to Indian statutory mandates, GST e-invoicing, DPDP Act 2023, and annual CERT-In security audits.
              </div>
              <span className="chain-partner-tag">GSTN, CERT-In, Audits</span>
            </div>

          </div>

          {/* 2. 5-DIMENSION MOAT DEFENSIBILITY RADAR */}
          <div className="moat-radar-box">
            <h4 style={{ color: '#0284c7', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <span className="moat-dim-score" style={{ color: '#10b981' }}>85% Defensibility</span>
              </div>
              <div className="moat-progress-track">
                <div className="moat-progress-fill" style={{ width: '85%', background: 'linear-gradient(90deg, #10b981, #059669)' }} />
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
            <div className="biz-moat-card" style={{ borderTop: '3px solid #0ea5e9' }}>
              <div className="biz-moat-top">
                <span className="biz-moat-title"><FaHandshake style={{ color: '#0284c7' }} /> Ecosystem Partners</span>
                <span className="biz-moat-score">Alliances</span>
              </div>
              <ul className="biz-list">
                {keyPartners.map((partner, i) => {
                  const text = typeof partner === 'object' && partner !== null ? (partner.name || partner.title || partner.desc || JSON.stringify(partner)) : String(partner);
                  return (
                    <li key={i} className="biz-list-item">
                      <span className="biz-item-bullet" style={{ background: '#0ea5e9' }} />
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Key Activities */}
            <div className="biz-moat-card" style={{ borderTop: '3px solid #10b981' }}>
              <div className="biz-moat-top">
                <span className="biz-moat-title"><FaCogs style={{ color: '#7c3aed' }} /> Operational Workflows</span>
                <span className="biz-moat-score">Core Ops</span>
              </div>
              <ul className="biz-list">
                {keyActivities.map((act, i) => {
                  const text = typeof act === 'object' && act !== null ? (act.name || act.title || act.desc || JSON.stringify(act)) : String(act);
                  return (
                    <li key={i} className="biz-list-item">
                      <span className="biz-item-bullet" style={{ background: '#10b981' }} />
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Key Resources */}
            <div className="biz-moat-card" style={{ borderTop: '3px solid #14b8a6' }}>
              <div className="biz-moat-top">
                <span className="biz-moat-title"><FaCube style={{ color: '#2dd4bf' }} /> Strategic Assets</span>
                <span className="biz-moat-score">IP &amp; Capital</span>
              </div>
              <ul className="biz-list">
                {keyResources.map((res, i) => {
                  const text = typeof res === 'object' && res !== null ? (res.name || res.title || res.desc || JSON.stringify(res)) : String(res);
                  return (
                    <li key={i} className="biz-list-item">
                      <span className="biz-item-bullet" style={{ background: '#14b8a6' }} />
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

// Resilient Error Boundary ensuring zero black screens even during unexpected exceptions
class BusinessTabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("BusinessTab render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2.5rem',
          textAlign: 'center',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '16px',
          margin: '2rem 0'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💼</div>
          <h3 style={{ color: '#DC2626', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
            Business Architecture Strategy
          </h3>
          <p style={{ color: '#64748B', maxWidth: '480px', margin: '0 auto 1.25rem', fontSize: '0.92rem' }}>
            A temporary display issue occurred while rendering this sub-view. Click below to reload.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Reload Business Section
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SafeBusinessTab = (props) => (
  <BusinessTabErrorBoundary>
    <BusinessTab {...props} />
  </BusinessTabErrorBoundary>
);

export default SafeBusinessTab;
