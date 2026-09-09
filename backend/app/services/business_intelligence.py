"""
business_intelligence.py
Comprehensive 25-Domain Business Model, Lean Canvas & Strategic SWOT Intelligence
Engineered for Vision2Venture to provide accurate, realistic, Indian-context business strategies.
Strictly adheres to Indian Rupee (₹) pricing and realistic startup unit economics.
"""
import re

def resolve_business_sector(industry: str = '', title: str = '', sector: str = '') -> str:
    """Resolves any startup context to one of 25 domain archetypes or delivery mode fallback."""
    text = f"{industry} {title} {sector}".lower()

    def matches(keywords):
        for kw in keywords:
            if ' ' in kw or '-' in kw:
                if kw in text:
                    return True
            else:
                if re.search(r'\b' + re.escape(kw) + r'\b', text):
                    return True
        return False

    if matches(['ev', 'electric vehicle', 'charging', 'battery swap', 'fleet electrification', 'scooter', 'fast charger']):
        return 'ev_mobility'
    if matches(['law', 'laws', 'legal', 'contract', 'contracts', 'compliance', 'advocate', 'vakil', 'court', 'ndas', 'litigation', 'trademark']):
        return 'legaltech'
    if matches(['pet', 'pets', 'dog', 'cat', 'veterinary', 'vet', 'grooming', 'animal']):
        return 'marketplace_ondemand'
    if matches(['on-demand', 'hyperlocal', 'gig', 'handyman', 'laundry', 'salon', 'home service', 'plumber', 'electrician', 'cleaning', 'services']):
        return 'marketplace_ondemand'
    if matches(['crm', 'erp', 'b2b saas', 'enterprise', 'workflow', 'billing saas', 'invoice software', 'procurement', 'inventory management']):
        return 'b2b_saas'
    if matches(['d2c', 'apparel', 'fashion', 'cosmetics', 'skincare', 'footwear', 'direct to consumer', 'jewelry', 'clothing', 'perfume', 'beauty']):
        return 'd2c_brand'
    if matches(['fitness', 'gym', 'workout', 'yoga', 'wellness', 'trainer', 'calisthenics', 'nutrition', 'physiotherapy', 'pilates']):
        return 'fitness_wellness'
    if matches(['biotech', 'pharma', 'genomics', 'molecular', 'clinical trial', 'drug discovery', 'deeptech', 'quantum', 'nanotech', 'diagnostics']):
        return 'biotech_deeptech'
    if matches(['social', 'community', 'creator', 'influencer', 'forum', 'dating', 'content platform', 'short video', 'podcasting']):
        return 'social_media'
    if matches(['travel', 'tourism', 'hotel', 'homestay', 'resort', 'flight', 'backpacking', 'itinerary', 'vacation', 'guided tour']):
        return 'travel_marketplace'
    if matches(['construction', 'contractor', 'civil', 'building material', 'site inspection', 'infra', 'cement', 'architect', 'real estate dev']):
        return 'construction_tech'
    if matches(['education', 'edtech', 'school', 'learn', 'student', 'college', 'course', 'timetable', 'tuition', 'lms', 'teacher', 'academy']):
        return 'edtech'
    if matches(['health', 'healthcare', 'doctor', 'patient', 'clinic', 'hospital', 'telemedicine', 'diagnostic', 'pharmacy', 'telehealth']):
        return 'healthtech'
    if matches(['fintech', 'finance', 'payment', 'payments', 'bank', 'banking', 'wealth', 'invest', 'crypto', 'lending', 'upi', 'neobank', 'credit', 'insurance']):
        return 'fintech'
    if matches(['e-commerce', 'ecommerce', 'retail', 'quick commerce', 'grocery', 'marketplace', 'shopping', 'storefront']):
        return 'e-commerce'
    if matches(['agri', 'agritech', 'farm', 'farming', 'crop', 'agriculture', 'farmer', 'irrigation', 'harvest', 'drone farm', 'soil', 'mandi', 'fpo']):
        return 'agritech'
    if matches(['clean', 'cleantech', 'solar', 'energy', 'renewable', 'carbon', 'waste', 'green', 'water treatment', 'recycling', 'climate']):
        return 'cleantech'
    if matches(['logistic', 'logistics', 'supply chain', 'freight', 'truck', 'trucking', 'warehouse', 'shipping', 'courier', 'delivery', 'fleet', 'cold chain']):
        return 'logistics'
    if matches(['real estate', 'proptech', 'property', 'rental', 'housing', 'tenant', 'broker', 'coworking', 'coliving', 'pg']):
        return 'proptech'
    if matches(['hr', 'hrtech', 'recruitment', 'staffing', 'job', 'jobs', 'talent', 'payroll', 'hiring', 'workforce', 'applicant', 'ats']):
        return 'hrtech'
    if matches(['security', 'cyber', 'cybersecurity', 'auth', 'threat', 'fraud', 'firewall', 'penetration', 'soc2', 'vapt', 'anti-fraud', 'identity']):
        return 'cybersecurity'
    if matches(['food', 'restaurant', 'cafe', 'cloud kitchen', 'dining', 'beverage', 'snack', 'bakery', 'qsr', 'catering', 'bar']):
        return 'food & beverage'
    if matches(['game', 'games', 'gaming', 'esport', 'esports', 'metaverse', 'ar/vr', 'casual game', 'arcade', 'vr', 'game studio']):
        return 'gaming'

    delivery = str(sector).lower().strip()
    if 'offline' in delivery or 'physical' in delivery:
        return 'offline_retail_operations'
    if 'hybrid' in delivery or 'phygital' in delivery:
        return 'omnichannel_hybrid'
    return 'universal_cloud_saas'


SECTOR_PROFILES = {
    "edtech": {
        "archetype": "B2B Institutional SaaS & Campus Workflows",
        "gross_margin": "78% – 85%",
        "ltv_cac": "4.2x – 4.8x",
        "payback_months": "6 – 8 Months",
        "problem": "Manual timetable scheduling, severe teacher workload burnout, and complex multidisciplinary elective alignment under NEP 2020 causing administrative gridlock in 85%+ of Indian schools and colleges.",
        "solution": "Automated algorithmic scheduling platform with real-time teacher substitution management, NEP credit-framework compliance, and multi-campus timetable optimization for {title}.",
        "customer_segments": [
            "Primary ICP: K-12 Private & CBSE/ICSE Schools with 500+ students seeking automated timetable compliance",
            "Higher Education: State/Central Universities and Autonomous Engineering Colleges managing 100+ multi-branch electives",
            "EdTech Coaching Institutes: Multi-center test-prep academies requiring dynamic batch and faculty scheduling",
            "Decision Makers: School Principals, Academic Deans, Vice Chancellors, and Institutional Trustees"
        ],
        "value_proposition": "Reduces institutional timetable generation time from 3 weeks to under 15 minutes, eliminates 100% of teacher scheduling clashes, and guarantees full compliance with NEP 2020 multidisciplinary guidelines.",
        "channels": [
            "Direct Institutional Field Sales & Regional Academic Demos targeting School Associations (CBSE Sahodaya, CMA)",
            "Academic Leadership Summits & EdTech Conferences across Tier-1 & Tier-2 state capitals",
            "Inbound Case Studies & Whitepapers on Teacher Workload Burnout & NEP Academic Structuring",
            "Channel Partnerships with School ERP Vendors (Fedena, Entab, Teachmint) for marketplace add-on distribution"
        ],
        "key_partners": [
            "School ERP & Student Information System (SIS) Software Providers",
            "Regional Private School Management Associations & Education Trusts",
            "Payment Gateways supporting automated school fee & subscription collection (Razorpay, Easebuzz)",
            "AWS Mumbai Cloud Infrastructure & Cloudflare CDN for zero-downtime exam-season traffic"
        ],
        "key_activities": [
            "Heuristic algorithm refinement for complex multi-constraint scheduling (room capacities, teacher leaves)",
            "School administrator onboarding, institutional data migration, and faculty training workshops",
            "Continuous regulatory tracking of UGC, AICTE, and CBSE syllabus/credit shifts",
            "Enterprise SLA customer support during peak academic semester transitions (April–July)"
        ],
        "key_resources": [
            "Proprietary constraint-satisfaction scheduling engine & room-faculty matching graph",
            "Institutional client historical scheduling datasets & teacher workload benchmarks",
            "Dedicated Indian education domain specialists & customer success engineers",
            "Initial capitalization of ₹{budget:,.0f} allocated for enterprise sales & engineering"
        ],
        "cost_structure": [
            "Core Software Engineering & Algorithm Optimization (35% of total OPEX)",
            "Institutional Field Sales, Travel & School Principals Summit Sponsorships (30%)",
            "Cloud Infrastructure, Database Hosting & Backup Storage on AWS ap-south-1 (15%)",
            "Customer Onboarding, Faculty Training & School Dedicated Account Management (12%)",
            "Legal, CBSE/UGC Regulatory Compliance & Audit Certifications (8%)"
        ],
        "revenue_streams": [
            "Tier 1 Starter (Single School): ₹18,000 – ₹35,000 / year (up to 40 faculty members)",
            "Tier 2 Pro (Multi-Wing School / College): ₹65,000 – ₹1,20,000 / year (unlimited batches & elective optimization)",
            "Tier 3 Enterprise (University / Group of Schools): ₹2,50,000+ / year with custom ERP bi-directional sync & dedicated support",
            "Implementation & Faculty Onboarding Fee: ₹10,000 – ₹25,000 one-time setup charge"
        ],
        "key_metrics": [
            "Annual Contract Value (ACV) & Institutional Net Revenue Retention (NRR > 115%)",
            "School Renewal Rate (>92% post-first academic cycle)",
            "Average Timetable Generation Latency (<10 minutes for 1,500 students)",
            "Customer Acquisition Cost (CAC) Payback (<7 months)"
        ],
        "unfair_advantage": "Proprietary Indian curriculum constraint rules pre-configured for CBSE, ICSE, and state university elective credit patterns, delivering instant out-of-the-box schedules without manual rule configuration.",
        "detailed_explanation": "{title} operates a high-retention B2B institutional SaaS model tailored specifically to the Indian education ecosystem. By turning weeks of administrative frustration into automated, NEP-compliant schedules, the platform achieves high switching barriers and predictable annual recurring revenue.",
        "pricing_tiers": [
            {"tier": "Starter Academy", "price": "₹24,000", "period": "/ year", "target": "Single K-12 Schools (<600 students)", "features": "Automated schedule solver, teacher leave substitution, WhatsApp alert digest, 2 admin seats"},
            {"tier": "Campus Pro", "price": "₹75,000", "period": "/ year", "target": "Large Schools & Junior Colleges (600–2,500 students)", "features": "NEP elective credit matrix, lab room allocation, bi-directional SIS sync, unlimited staff logins"},
            {"tier": "University Enterprise", "price": "₹2,20,000+", "period": "/ year", "target": "Multi-Campus Universities & School Chains", "features": "Multi-department scheduling, cross-faculty load balancing, custom API hooks, 24/7 dedicated account manager"}
        ],
        "swot": {
            "strengths": [
                {"title": "Proprietary NEP-Compliant Scheduling Engine", "desc": "Pre-configured constraint solvers optimized specifically for Indian school elective and teacher substitution patterns.", "impact": "Core Competency", "action": "File provisional patent on the constraint-optimization heuristic to build an intellectual property moat."},
                {"title": "High Institutional Retention & Switching Barrier", "desc": "Once an entire school's academic timetable is codified in the software, annual renewal rates exceed 90%.", "impact": "High Moat", "action": "Lock institutions into multi-year 3-year contracts with grandfathered pricing tiers."},
                {"title": "Low Marginal Serving Cost", "desc": "Cloud-native compute cost per school is under ₹150/month, delivering gross margins above 80%.", "impact": "High Efficiency", "action": "Reinvest surplus unit margins into direct institutional sales territory expansion."}
            ],
            "weaknesses": [
                {"title": "Long Institutional Procurement Cycles", "desc": "School purchase decisions are heavily concentrated between January and May before the new academic year.", "impact": "Cash Flow Seasonality", "action": "Offer early-bird discounts and free trial semester runs during October–December to secure commitments early."},
                {"title": "High Reliance on Administrator Tech Literacy", "desc": "Older school administrators may resist transitioning from manual paper charts to software.", "impact": "Adoption Friction", "action": "Deploy dedicated WhatsApp voice-support onboarding and simple Excel-import wizards."}
            ],
            "opportunities": [
                {"title": "NEP 2020 Multidisciplinary Credit Mandate", "desc": "Over 1.5 million schools and colleges in India must restructure schedules to support flexible electives.", "impact": "Growth Catalyst", "action": "Launch national marketing campaign positioned as the 'Official NEP-Ready Scheduling Partner'."},
                {"title": "White-Label ERP Integration", "desc": "Large school ERPs like Teachmint, Fedena, and Edunext lack native advanced scheduling engines.", "impact": "Distribution Scale", "action": "Establish OEM revenue-share API partnerships with leading school ERP vendors."},
                {"title": "Expansion into Coaching Institutes & Universities", "desc": "Test-prep chains (Allen, FIITJEE, Aakash) require complex room-faculty rotation across cities.", "impact": "Enterprise Upsell", "action": "Develop enterprise multi-campus module with centralized faculty dispatch."}
            ],
            "threats": [
                {"title": "Bundling by Monolithic School ERP Providers", "desc": "Large all-in-one ERP platforms could build basic in-house timetable features and bundle them for free.", "impact": "Competitive Threat", "action": "Keep scheduling algorithms dramatically superior with AI substitution forecasting and NEP compliance."},
                {"title": "Resistance to Technology Budgets in Budget Private Schools", "desc": "Low-fee private schools may be hesitant to allocate annual software subscriptions.", "impact": "Price Sensitivity", "action": "Offer a lightweight ad-supported or freemium basic edition to capture massive top-of-funnel volume."}
            ],
            "overall_assessment": "{title} is primed for sustained profitability in the Indian EdTech B2B market. While school sales cycles require seasonal discipline, the platform's high switching costs, NEP compliance tailwinds, and 80%+ gross margins create an exceptional venture profile."
        }
    },

    "fintech": {
        "archetype": "Transaction Commission & Embedded Financial Infrastructure",
        "gross_margin": "65% – 75%",
        "ltv_cac": "3.8x – 4.5x",
        "payback_months": "5 – 7 Months",
        "problem": "High merchant transaction failure rates, exorbitant payment gateway markups (2.2%+ MDR), and sluggish multi-day settlement cycles crippling cash flows for MSMEs across India.",
        "solution": "Next-generation payment routing gateway with sub-second UPI AutoPay orchestration, dynamic settlement algorithms, and automated reconciliation for {title}.",
        "customer_segments": [
            "Primary ICP: Digital-first MSMEs, D2C brands, and retail merchants processing ₹5L–₹50L monthly GMV",
            "Enterprise Segment: B2B wholesalers and SaaS platforms requiring split-payment escrow & instant vendor payouts",
            "Consumer Base: Mobile-first digital shoppers utilizing UPI, RuPay credit cards, and Buy-Now-Pay-Later (BNPL)",
            "Decision Makers: Chief Financial Officers (CFOs), Head of Treasury, and E-commerce Founders"
        ],
        "value_proposition": "Boosts transaction success rates by 14.2% via multi-bank dynamic routing, slashes payment processing fees by 35%, and delivers instant T+0 merchant settlements.",
        "channels": [
            "Product-Led Integration with OpenCart, WooCommerce, and Shopify Merchant App Stores",
            "B2B FinTech Aggregator Partnerships & CA/Accountant Referral Networks across Tier-1/2 trade hubs",
            "Developer API Evangelism & Hackathon Sponsorships targeting web3 and startup engineers",
            "High-intent Search Marketing on 'UPI payment gateway', 'instant settlement API', and 'low MDR payment gateway'"
        ],
        "key_partners": [
            "Scheduled Commercial Banks (HDFC, ICICI, Axis Bank) for Escrow & Payment Aggregator (PA) Sponsorship",
            "National Payments Corporation of India (NPCI) for Direct UPI & RuPay Credit Rails",
            "Credit Bureaus (CIBIL, Experian) & Account Aggregators (Setu, Finvu) for credit underwriting telemetry",
            "AWS Mumbai Financial-Grade VPC with PCI-DSS Level 1 Hardware Security Modules (HSM)"
        ],
        "key_activities": [
            "Multi-bank API routing latency optimization and automated intelligent failover handling",
            "Strict compliance monitoring under RBI Master Directions on Payment Aggregators (PA-PG guidelines)",
            "Continuous automated fraud scoring, anti-money laundering (AML), and chargeback arbitration",
            "24/7 bank settlement reconciliation and merchant treasury float management"
        ],
        "key_resources": [
            "Proprietary smart payment routing algorithm with sub-50ms bank health heartbeat monitors",
            "RBI In-Principle PA authorization status and PCI-DSS Level 1 certified cloud infrastructure",
            "Experienced banking relations team and compliance legal counsel",
            "Initial capital reserves of ₹{budget:,.0f} for bank escrow guarantees & risk underwriting"
        ],
        "cost_structure": [
            "Bank Interchange Fees & NPCI Network Switching Charges (45% of gross revenue)",
            "Financial-Grade Cloud Infrastructure, Hardware Security Modules & Cyber Insurance (20%)",
            "Merchant Acquisition Sales, Integration Engineering & B2B Performance Marketing (18%)",
            "Risk Underwriting, Regulatory Compliance, Audits & Legal Retainers (12%)",
            "Tier-1 Merchant Success & 24/7 Fraud Prevention Operations (5%)"
        ],
        "revenue_streams": [
            "Domestic Payment Processing Fee: 0.9% – 1.4% per transaction on Credit Cards, Net Banking & Wallets",
            "UPI P2M Transactions: 0% MDR on basic UPI; ₹0.15 flat fee for value-added routing & dispute protection",
            "Instant T+0 Settlement Surcharge: 0.20% flat on accelerated fund disbursements",
            "Enterprise Subscription: ₹4,999 – ₹18,000 / month for custom checkout branding, analytics & webhook SLAs"
        ],
        "key_metrics": [
            "Gross Merchandise Value (GMV Processed / month)",
            "Transaction Success Rate (>94.5% across peak UPI festival spikes)",
            "Net Take Rate (55–75 bps post-interchange)",
            "Merchant Monthly Churn (<1.5% with positive net expansion)"
        ],
        "unfair_advantage": "Direct NPCI switch connectivity combined with predictive multi-bank latency routing, achieving sub-1.2 second UPI payment completion times compared to legacy 3.5s gateway average.",
        "detailed_explanation": "{title} scales on high-volume payment velocity with structural defensibility. By aligning with India's expanding digital payments revolution (surpassing 14 billion monthly UPI transactions), it captures recurring take-rate margins while monetizing instant liquidity features.",
        "pricing_tiers": [
            {"tier": "Growth Merchant", "price": "₹0 / mo", "period": "+ 1.2% per tx", "target": "Early-stage startups processing <₹10L GMV", "features": "Standard UPI & Card checkout, T+1 settlement, plug-and-play Shopify plugin, standard support"},
            {"tier": "Scale Business", "price": "₹4,999", "period": "/ mo + 0.95% tx", "target": "Growing brands processing ₹10L–₹50L GMV", "features": "Instant T+0 settlement, custom checkout UI, automated GST reconciliation, priority webhook SLAs"},
            {"tier": "Enterprise Tier", "price": "Custom", "period": "volume contract", "target": "High-volume marketplaces processing >₹50L GMV", "features": "Dedicated multi-bank routing switch, split escrow payouts, Account Aggregator integration, 24/7 SLA"}
        ],
        "swot": {
            "strengths": [
                {"title": "High Payment Conversion & Low Latency Switch", "desc": "Predictive routing directs transactions only to banks with 98%+ current operational uptime.", "impact": "Core Competency", "action": "Highlight success-rate benchmark dashboards in all B2B enterprise merchant pitches."},
                {"title": "Compounding Unit Economics with Volume", "desc": "As GMV scales, bank interchange discounts improve margins by 15-25 bps without increasing user pricing.", "impact": "Operating Leverage", "action": "Negotiate quarterly interchange tier discounts with partner commercial banks as GMV milestones hit."},
                {"title": "Frictionless UPI Native Integration", "desc": "Built for seamless 1-click UPI Intent and AutoPay mandate approvals without SMS OTP drop-offs.", "impact": "User Delight", "action": "Expand QR soundbox and WhatsApp Commerce checkout extensions."}
            ],
            "weaknesses": [
                {"title": "Tight Gross Margins on Zero-MDR UPI", "desc": "Standard consumer UPI transactions generate zero merchant discount rate under Indian government regulations.", "impact": "Unit Economics Squeeze", "action": "Cross-sell high-margin instant settlements, fraud guarantees, and B2B vendor credit lines."},
                {"title": "High Vulnerability to Bank API Downtimes", "desc": "External public sector bank core banking server outages can temporarily degrade transaction completion.", "impact": "External Dependency", "action": "Implement automatic 3-tier bank fallback routing within 250 milliseconds of bank timeouts."}
            ],
            "opportunities": [
                {"title": "Credit-on-UPI & RuPay Expansion", "desc": "RBI's linking of RuPay credit cards to UPI rails creates massive new MDR-bearing payment volume.", "impact": "High Growth", "action": "Deploy specialized 1-click credit-on-UPI checkout widgets for consumer merchants."},
                {"title": "Account Aggregator Ecosystem Integration", "desc": "Open banking enables instant cash-flow based underwriting for merchant working capital loans.", "impact": "Fintech Multiplier", "action": "Partner with NBFCs to offer embedded credit lines directly inside the merchant dashboard."},
                {"title": "Cross-Border B2B Invoicing & Remittances", "desc": "Indian exporters face heavy fees when receiving payments from global clients.", "impact": "High Margin Market", "action": "Integrate low-cost SWIFT / multi-currency virtual accounts for software and service exporters."}
            ],
            "threats": [
                {"title": "Aggressive Pricing from Dominant Incumbents", "desc": "Large players like Razorpay, Cashfree, and PhonePe offer predatory bundled discounts to lock in large accounts.", "impact": "Margin Pressure", "action": "Win on specialized developer experience, lower latency, and zero-fee instant settlement perks."},
                {"title": "Stringent RBI Regulatory Tightening", "desc": "Evolving capital adequacy norms and stringent KYC guidelines can increase compliance overhead.", "impact": "Regulatory Overhead", "action": "Maintain an in-house audit committee and proactive engagement with RBI regulatory sandbox."}
            ],
            "overall_assessment": "{title} occupies a strategic high-velocity position in India's digital economy. By focusing on superior routing algorithms and monetizing value-added merchant liquidity, it overcomes zero-MDR headwinds and builds a highly defensible fintech franchise."
        }
    },

    "healthtech": {
        "archetype": "ABDM-Compliant Digital Health & Clinical Workflow SaaS",
        "gross_margin": "72% – 80%",
        "ltv_cac": "4.5x – 5.2x",
        "payback_months": "6 – 9 Months",
        "problem": "Fragmented patient medical records, 45+ minute doctor clinic waiting room congestion, and lack of Ayushman Bharat Digital Mission (ABDM) integration across 90% of private clinics and nursing homes in India.",
        "solution": "Integrated clinical operating system featuring ABDM Ayushman Bharat health account (ABHA) record sync, smart appointment queuing, digital EMR prescriptions, and teleconsultation for {title}.",
        "customer_segments": [
            "Primary ICP: Independent Private Practitioners, Polyclinics, and 10–50 Bed Nursing Homes across Tier-1 and Tier-2 cities",
            "Patients: Chronic disease patients and working families requiring seamless digital prescriptions & health history tracking",
            "Diagnostic & Pharmacy Partners: Neighborhood pathology labs and local medical stores fulfilling digital orders",
            "Decision Makers: Lead Doctors, Clinic Medical Directors, and Hospital Administrators"
        ],
        "value_proposition": "Cuts clinic administrative overhead by 60%, automates 100% of ABDM digital record compliance in under 3 clicks, and reduces patient clinic wait times from 45 mins to under 12 mins.",
        "channels": [
            "Hyperlocal Medical Representative (MR) Outreach & Indian Medical Association (IMA) Branch Sponsorships",
            "Accredited Continuing Medical Education (CME) Workshops on ABDM Compliance & Electronic Health Records",
            "Doctor-to-Doctor Referral Programs offering clinical hardware peripherals (thermal prescription printers)",
            "Digital Inbound SEO targeting 'ABDM certified EMR software' and 'clinic appointment management app'"
        ],
        "key_partners": [
            "National Health Authority (NHA) & Ayushman Bharat Digital Mission (ABDM) for Sandbox & Production Rails",
            "Accredited Diagnostic Laboratory Chains (Thyrocare, Dr. Lal PathLabs) for bi-directional report sync",
            "e-Pharmacy Fulfillment Networks (Tata 1mg, Apollo 24|7) for automated prescription delivery",
            "AWS Mumbai Health Data Compliant Cloud with HIPAA & DISHA encryption compliance"
        ],
        "key_activities": [
            "Continuous clinical workflow optimization for fast 30-second doctor digital prescription generation",
            "National Health Authority (NHA) ABDM Milestone 1, 2, and 3 certification compliance maintenance",
            "On-site clinic staff training, doctor onboarding, and WhatsApp patient reminder configuration",
            "HIPAA/DISHA health data security audits, data encryption at rest, and audit trail logging"
        ],
        "key_resources": [
            "Proprietary clinical terminology engine mapped to ICD-10 & SNOMED CT medical standards",
            "NHA certified Health Information Provider (HIP) & Health Information User (HIU) gateway",
            "Clinical advisory board of senior doctors and medical informatics experts",
            "Initial capital allocation of ₹{budget:,.0f} for clinic sales expansion and regulatory certification"
        ],
        "cost_structure": [
            "Clinical Software Development & ABDM/SNOMED Protocol Engineering (34% of OPEX)",
            "On-Ground Clinic Sales Executives & Medical Conference Presence (28%)",
            "HIPAA/DISHA Compliant Cloud Hosting, Data Backups & Encryption (16%)",
            "Clinic Staff Onboarding, Hardware Kits & WhatsApp Messaging Gateway Fees (14%)",
            "Medical Regulatory Legal Counsel, Data Protection & Security Audits (8%)"
        ],
        "revenue_streams": [
            "Clinic SaaS Subscription: ₹1,499 – ₹3,999 / month per doctor (unlimited EMR, queueing & ABDM sync)",
            "Polyclinic / Nursing Home Enterprise License: ₹12,000 – ₹35,000 / month for multi-doctor facilities",
            "Teleconsultation Platform Convenience Fee: ₹25 – ₹50 per remote video consultation",
            "Diagnostic & Pharmacy Marketplace Integration Fee: 6% – 10% commission on fulfilled home lab tests & medicine orders"
        ],
        "key_metrics": [
            "Monthly Active Prescribing Doctors (MAPD)",
            "Digital Prescriptions Generated per Clinic / Day (>30 avg)",
            "ABDM Patient ABHA Linkage Rate (>85%)",
            "Doctor Annual Subscription Renewal Rate (>90%)"
        ],
        "unfair_advantage": "Seamless NHA-certified ABDM Milestone 1-3 gateway integration coupled with custom voice-to-prescription shortcuts adapted to Indian doctor shorthand and regional medicine brands.",
        "detailed_explanation": "{title} leverages mandatory government tailwinds under the Ayushman Bharat Digital Mission (ABDM). By giving private practitioners an effortless way to digitize clinics without disrupting their clinical speed, it achieves sticky recurring SaaS subscriptions with strong multi-sided marketplace expansion.",
        "pricing_tiers": [
            {"tier": "Solo Practitioner", "price": "₹1,999", "period": "/ month", "target": "Individual Clinic Doctors", "features": "Digital EMR, ABDM ABHA generation, WhatsApp patient reminders, queue display screen app"},
            {"tier": "Polyclinic Suite", "price": "₹6,999", "period": "/ month", "target": "Multi-specialty clinics (3–8 doctors)", "features": "Multi-doctor scheduling, centralized billing & GST receipts, in-house lab integration, custom letterhead"},
            {"tier": "Hospital Enterprise", "price": "₹22,000+", "period": "/ month", "target": "Nursing Homes & Daycare Hospitals", "features": "IPD/OPD ward management, insurance TPA pre-authorization workflows, dedicated account manager, ABDM HIU/HIP gateway"}
        ],
        "swot": {
            "strengths": [
                {"title": "Government ABDM Regulatory Tailwinds", "desc": "India's push for universal digital health IDs (ABHA) mandates clinic software compatibility nationwide.", "impact": "Growth Driver", "action": "Position platform as the #1 ABDM compliance partner across tier-2 cities."},
                {"title": "Ultra-Low Prescribing Latency", "desc": "Custom Indian brand medicine database enables doctors to generate a compliant digital Rx in under 30 seconds.", "impact": "User Retention", "action": "Protect doctor adoption by ensuring zero clicks are added to the existing clinical workflow."},
                {"title": "Multiple Monetization Expansion Hooks", "desc": "Every digital prescription creates high-margin downstream revenue opportunities in lab tests and e-pharmacy.", "impact": "LTV Multiplier", "action": "Activate verified local neighborhood chemist delivery networks to preserve patient trust."}
            ],
            "weaknesses": [
                {"title": "Doctor Habitual Resistance to Typing", "desc": "Senior physicians prefer handwriting on paper prescription pads and resist desktop data entry.", "impact": "Sales Friction", "action": "Provide hybrid smart-pen paper OCR and mobile voice-to-text prescription entry."},
                {"title": "High Customer Success & Field Support Overhead", "desc": "Clinic reception staff in smaller towns require frequent on-site troubleshooting and handholding.", "impact": "Operational Cost", "action": "Build vernacular interactive video tutorials and a 24/7 dedicated WhatsApp support desk."}
            ],
            "opportunities": [
                {"title": "Insurance TPA Cashless OPD Integration", "desc": "Insurance companies are rapidly launching outpatient (OPD) cashless coverage requiring digital EMR proof.", "impact": "Massive Market", "action": "Partner with health insurers to become their preferred OPD cashless claim settlement platform."},
                {"title": "Chronic Disease AI Management Programs", "desc": "Longitudinal diabetic and hypertension data allows structured monthly patient care plans.", "impact": "High-Margin SaaS", "action": "Launch patient companion subscription apps for automated blood sugar and blood pressure tracking."},
                {"title": "Tier-2/3 Medical Hub Expansion", "desc": "Tier-2 cities like Indore, Coimbatore, and Lucknow are experiencing rapid private healthcare modernization.", "impact": "Untapped Demand", "action": "Deploy regional sales agents focused on tier-2 medical clusters and doctor hubs."}
            ],
            "threats": [
                {"title": "Free EMR Bundling by Diagnostic Chains", "desc": "Large diagnostic labs sometimes give free basic software to doctors in exchange for exclusive sample referrals.", "impact": "Competitive Pricing", "action": "Differentiate on superior clinical depth, ABDM certification, and non-captive multi-lab choice."},
                {"title": "Stringent Medical Data Privacy Liability", "desc": "The Digital Personal Data Protection (DPDP) Act imposes severe penalties for patient health record leaks.", "impact": "Legal Exposure", "action": "Maintain end-to-end zero-knowledge encryption and annual third-party CERT-In security audits."}
            ],
            "overall_assessment": "{title} holds high strategic value by digitizing India's fragmented outpatient healthcare ecosystem. By solving the dual challenges of doctor time constraints and mandatory ABDM compliance, it establishes an irreplaceable clinical moat."
        }
    }
}

def get_universal_business_profile(context: dict, sector_key: str) -> dict:
    """Generates an executive-grade, customized business model profile for any domain."""
    title = context.get('title', 'Startup Project')
    ind = context.get('industry', 'Technology')
    budget = float(context.get('budget') or 20000)

    domain_meta = {
        "ev_mobility": {
            "archetype": "IoT Smart Mobility & Clean Infrastructure",
            "gross_margin": "45% – 55%", "ltv_cac": "4.8x", "payback": "8 – 11 Months",
            "problem": f"Severe charging anxiety, charger unreliability, and lack of fleet-grade telemetry in {ind}.",
            "solution": f"Smart IoT charging management, automated battery health analytics, and instant UPI payment routing for {title}.",
            "pricing_unit": "₹14 – ₹18 / kWh + ₹3,500/mo fleet SaaS"
        },
        "legaltech": {
            "archetype": "B2B Legal Workflow Automation SaaS",
            "gross_margin": "82% – 88%", "ltv_cac": "5.4x", "payback": "5 – 7 Months",
            "problem": f"Cumbersome contract drafting, tedious manual redlining, and compliance delays in {ind}.",
            "solution": f"AI-powered contract intelligence, instant clause risk scoring, and automated DigiLocker e-Sign for {title}.",
            "pricing_unit": "₹3,999 – ₹15,000 / month per organization"
        },
        "marketplace_ondemand": {
            "archetype": "Hyperlocal Two-Sided On-Demand Marketplace",
            "gross_margin": "22% – 28%", "ltv_cac": "3.5x", "payback": "4 – 6 Months",
            "problem": f"Fragmented service providers, lack of verified quality assurance, and pricing ambiguity in {ind}.",
            "solution": f"Sub-second geospatial technician dispatch, standardized upfront pricing, and escrow payment release for {title}.",
            "pricing_unit": "14% – 18% take-rate per completed booking"
        },
        "b2b_saas": {
            "archetype": "Enterprise Productivity & Workflow SaaS",
            "gross_margin": "80% – 86%", "ltv_cac": "5.2x", "payback": "6 – 8 Months",
            "problem": f"Disparate manual spreadsheets, lack of department sync, and lost operational productivity in {ind}.",
            "solution": f"Unified cloud platform with automated reporting, role-based workflows, and ERP sync for {title}.",
            "pricing_unit": "₹800 – ₹2,400 / seat / month (Annual ACV)"
        },
        "d2c_brand": {
            "archetype": "Direct-to-Consumer Omnichannel Brand",
            "gross_margin": "58% – 66%", "ltv_cac": "3.2x", "payback": "3 – 5 Months",
            "problem": f"Mass-produced generic goods, high middleman markups, and lack of verified ingredient transparency in {ind}.",
            "solution": f"Premium clean-label product formulation, direct digital community storefront, and fast delivery for {title}.",
            "pricing_unit": "Average Order Value (AOV) of ₹1,250 – ₹2,800"
        },
        "fitness_wellness": {
            "archetype": "Hybrid Digital Wellness & Connected Fitness",
            "gross_margin": "70% – 78%", "ltv_cac": "3.9x", "payback": "4 – 6 Months",
            "problem": f"High gym membership dropouts, lack of personalized progress tracking, and generic workout routines in {ind}.",
            "solution": f"Personalized workout scheduling, wearable biometrics sync, and tailored nutrition coaching for {title}.",
            "pricing_unit": "₹999 – ₹2,999 / month membership"
        },
        "biotech_deeptech": {
            "archetype": "DeepTech IP & Enterprise Computational Platform",
            "gross_margin": "85% – 92%", "ltv_cac": "6.0x", "payback": "12 – 18 Months",
            "problem": f"High cost of wet-lab research, multi-year discovery timelines, and complex biological simulation hurdles in {ind}.",
            "solution": f"Accelerated in-silico computational screening, molecular prediction algorithms, and IP licensing for {title}.",
            "pricing_unit": "Enterprise Research Grants & ₹5L+ Annual Licenses"
        },
        "social_media": {
            "archetype": "Creator Economy & Community Engagement Platform",
            "gross_margin": "75% – 82%", "ltv_cac": "3.6x", "payback": "5 – 7 Months",
            "problem": f"Algorithm fatigue on legacy platforms, low monetization share for micro-creators, and spam in {ind}.",
            "solution": f"Niche vertical community networking, direct fan monetization tipping, and high-trust moderation for {title}.",
            "pricing_unit": "5% – 10% creator tip take-rate + Sponsored Brand Hubs"
        },
        "travel_marketplace": {
            "archetype": "Curated Experiential Travel & Hospitality Marketplace",
            "gross_margin": "20% – 26%", "ltv_cac": "3.4x", "payback": "4 – 6 Months",
            "problem": f"Standardized cookie-cutter tourist packages, opaque cancellation policies, and poor local guide discovery in {ind}.",
            "solution": f"Handpicked boutique itineraries, transparent escrow booking, and verified local guide experiences for {title}.",
            "pricing_unit": "10% – 15% booking take-rate + Merchant SaaS"
        },
        "construction_tech": {
            "archetype": "Industrial PropTech & Field Worksite Management SaaS",
            "gross_margin": "72% – 79%", "ltv_cac": "4.6x", "payback": "7 – 9 Months",
            "problem": f"Unmonitored site material wastage, contractor payment disputes, and delayed milestone tracking in {ind}.",
            "solution": f"Mobile-first site inspection logging, daily material inventory tracking, and RERA milestone audits for {title}.",
            "pricing_unit": "₹12,000 – ₹45,000 / active project / month"
        },
        "e-commerce": {
            "archetype": "Quick Commerce & Specialized Digital Retail",
            "gross_margin": "24% – 32%", "ltv_cac": "3.6x", "payback": "4 – 6 Months",
            "problem": f"High delivery fees, out-of-stock items, and slow 3-day transit times frustrating consumers in {ind}.",
            "solution": f"Hyperlocal micro-warehouse fulfillment, instant inventory sync, and rapid doorstep delivery for {title}.",
            "pricing_unit": "12% – 20% merchant take-rate + convenience fee"
        },
        "agritech": {
            "archetype": "Agri-Commerce & Rural Supply Chain Platform",
            "gross_margin": "18% – 25%", "ltv_cac": "4.0x", "payback": "6 – 9 Months",
            "problem": f"Exploitative middleman commission, lack of APMC mandi price discovery, and harvest wastage in {ind}.",
            "solution": f"Direct farm-gate procurement, transparent quality grading, and direct B2B buyer logistics for {title}.",
            "pricing_unit": "4% – 7% commodity trade margin + Farm IoT SaaS"
        },
        "cleantech": {
            "archetype": "Clean Energy Infrastructure & Sustainability SaaS",
            "gross_margin": "35% – 45%", "ltv_cac": "5.0x", "payback": "8 – 12 Months",
            "problem": f"High upfront Capex friction, complex DISCOM net metering approvals, and opaque carbon accounting in {ind}.",
            "solution": f"Zero-Capex solar financing coordination, automated solar yield telemetry, and carbon credit audits for {title}.",
            "pricing_unit": "PPA Tariffs ₹4.50/kWh + EPC Commission"
        },
        "logistics": {
            "archetype": "Digital Freight Brokerage & Fleet Telematics",
            "gross_margin": "16% – 22%", "ltv_cac": "3.8x", "payback": "5 – 8 Months",
            "problem": f"Empty return truck trips, fuel theft, FASTag toll tracking chaos, and delayed GST e-Way bills in {ind}.",
            "solution": f"Intelligent load matching, real-time GPS fleet telemetry, and automated e-Way bill compliance for {title}.",
            "pricing_unit": "3% – 6% freight commission + ₹399/truck/mo SaaS"
        },
        "proptech": {
            "archetype": "Digital Real Estate Transaction & Management Platform",
            "gross_margin": "65% – 75%", "ltv_cac": "4.2x", "payback": "6 – 9 Months",
            "problem": f"Fake property listings, predatory brokerage markups, and lack of verified RERA documentation in {ind}.",
            "solution": f"100% verified 3D digital tours, online rental agreement drafting, and direct owner matching for {title}.",
            "pricing_unit": "₹1,499 listing fee + 15 days brokerage savings"
        },
        "hrtech": {
            "archetype": "Workforce Management & Automated Hiring SaaS",
            "gross_margin": "76% – 84%", "ltv_cac": "4.8x", "payback": "5 – 7 Months",
            "problem": f"High candidate ghosting, manual resume screening fatigue, and delayed payroll compliance in {ind}.",
            "solution": f"Automated skills screening tests, 1-click candidate scheduling, and automated PF/ESI payroll for {title}.",
            "pricing_unit": "₹99 – ₹199 / employee / month + Hiring Success Fee"
        },
        "cybersecurity": {
            "archetype": "Continuous Threat Detection & Compliance Automation SaaS",
            "gross_margin": "82% – 88%", "ltv_cac": "5.5x", "payback": "5 – 7 Months",
            "problem": f"Complex SOC-2 / ISO 27001 audit preparations, DPDP Act 2023 legal penalties, and zero-day threats in {ind}.",
            "solution": f"Automated cloud security posture management, continuous vulnerability scanning, and audit readiness for {title}.",
            "pricing_unit": "₹15,000 – ₹65,000 / month based on cloud assets"
        },
        "food & beverage": {
            "archetype": "Smart QSR & Food Service Operations",
            "gross_margin": "55% – 65%", "ltv_cac": "3.5x", "payback": "4 – 6 Months",
            "problem": f"High aggregator commissions (25%+), kitchen order delays, and inventory ingredient spoilage in {ind}.",
            "solution": f"Direct dynamic QR table ordering, real-time Kitchen Display System (KDS), and automated inventory reordering for {title}.",
            "pricing_unit": "Average Ticket Size ₹350 – ₹850 + Direct Orders"
        },
        "gaming": {
            "archetype": "Interactive Entertainment & Esports Tournament Platform",
            "gross_margin": "68% – 76%", "ltv_cac": "3.7x", "payback": "4 – 6 Months",
            "problem": f"High latency matchmaking, cheater injection attacks, and 28% GST compliance burdens in {ind}.",
            "solution": f"Sub-30ms regional game servers, automated tournament brackets, and fair-play anti-cheat algorithms for {title}.",
            "pricing_unit": "In-app passes ₹99 – ₹499 + 10% Tournament Pool"
        },
        "offline_retail_operations": {
            "archetype": "Physical Retail & POS Hardware-Integrated Commerce",
            "gross_margin": "40% – 50%", "ltv_cac": "3.2x", "payback": "3 – 5 Months",
            "problem": f"Cash reconciliation leakages, long checkout queues, and unorganized manual stock bookkeeping in {ind}.",
            "solution": f"Smart Android POS counter billing, instant UPI soundbox confirmation, and local barcode inventory sync for {title}.",
            "pricing_unit": "Counter Retail Margin (30%–45%) + ₹799/mo POS Lease"
        },
        "omnichannel_hybrid": {
            "archetype": "Phygital Omnichannel Retail & Service Network",
            "gross_margin": "50% – 60%", "ltv_cac": "4.0x", "payback": "4 – 6 Months",
            "problem": f"Disconnected in-store and online inventories leading to double-sales and customer disappointment in {ind}.",
            "solution": f"Unified real-time inventory ledger, click-and-collect fulfillment, and centralized customer loyalty for {title}.",
            "pricing_unit": "Blended Retail Sales & Digital Subscriptions"
        },
        "universal_cloud_saas": {
            "archetype": "Cloud-Native Multi-Tenant Enterprise SaaS",
            "gross_margin": "80% – 88%", "ltv_cac": "5.0x", "payback": "5 – 8 Months",
            "problem": f"Fragmented manual workflows, lack of centralized reporting, and inefficient team collaboration in {ind}.",
            "solution": f"Scalable cloud-native operating system with automated task queues, real-time dashboards, and open API hooks for {title}.",
            "pricing_unit": "₹999 – ₹4,999 / month tiered subscription"
        }
    }

    meta = domain_meta.get(sector_key, domain_meta['universal_cloud_saas'])

    return {
        "archetype": meta['archetype'],
        "gross_margin": meta['gross_margin'],
        "ltv_cac": meta['ltv_cac'],
        "payback_months": meta['payback'],
        "problem": meta['problem'],
        "solution": meta['solution'],
        "customer_segments": [
            f"Primary Target ICP: High-intent organizations and users in {ind} seeking modernized workflows",
            f"Secondary Segment: Mid-market businesses operating in Tier-1 & Tier-2 Indian hubs seeking cost reduction",
            "Early Adopters: Tech-forward founders and decision-makers prioritizing speed, compliance, and ROI",
            f"Consumer / End-User Persona: Digital-first users requiring seamless UPI payments and intuitive mobile interfaces"
        ],
        "value_proposition": f"Empowers customers of {title} in the {ind} ecosystem to eliminate operational bottlenecks, reduce monthly overhead by up to 40%, and achieve superior customer satisfaction.",
        "channels": [
            "Inbound Search Engine Optimization (SEO) & High-Intent Google Search Campaigns",
            "Targeted B2B LinkedIn Outreach & Professional Association Webinars",
            "Performance Digital Marketing across Meta, YouTube & Industry Portals",
            "Strategic Ecosystem Partnerships with Complementary Technology Providers"
        ],
        "key_partners": [
            "Leading Payment Gateways (Razorpay, Cashfree, PhonePe) for Automated UPI & Card Billing",
            "Indian Cloud Infrastructure (AWS Mumbai ap-south-1) for High-Speed Domestic Data Residency",
            "Regional Channel Distribution Partners & Trade Association Networks",
            "Compliance, Legal & Technical Audit Advisors"
        ],
        "key_activities": [
            f"Continuous development and refinement of core software features for {title}",
            "Customer onboarding, live support, and proactive account success management",
            "Product marketing, case study publication, and inbound funnel conversion optimization",
            "Compliance adherence with Indian regulatory mandates, data privacy, and security best practices"
        ],
        "key_resources": [
            f"Proprietary software codebase and domain-specific algorithms tailored to {ind}",
            "Founding team technical expertise, operational leadership, and customer relationships",
            f"Initial financial runway of ₹{budget:,.0f} deployed for targeted sales & engineering milestones",
            "Secure, high-availability cloud infrastructure and validated customer transaction data"
        ],
        "cost_structure": [
            "Core Product Engineering, UI/UX Design & Architecture (35% of total spend)",
            "Customer Acquisition, Digital Marketing & Field Sales Operations (28%)",
            "Cloud Hosting, Database Storage & Security Tooling on AWS Mumbai (16%)",
            "Customer Onboarding, Training & Operations Support (13%)",
            "Regulatory Filings, GST/Tax Accounting & Legal Retainers (8%)"
        ],
        "revenue_streams": [
            f"Starter Tier: ₹999 – ₹1,999 / month (Entry-level features for individual practitioners & small teams)",
            f"Growth Tier: ₹3,999 – ₹7,999 / month (Complete operational toolkit, multi-seat access, and advanced reporting)",
            f"Enterprise Tier: ₹18,000 – ₹45,000+ / month (Custom integrations, dedicated account manager, and SLA guarantees)",
            f"Value-Added Services: Setup fees, priority onboarding, and custom module development"
        ],
        "key_metrics": [
            "Customer Acquisition Cost (CAC) & Payback Velocity (<7 months target)",
            "Customer Lifetime Value to CAC Ratio (Target >3.5x)",
            "Monthly Recurring Revenue (MRR) & Annualized Run Rate (ARR)",
            "Net Revenue Retention (NRR > 110%) & Gross Churn (<2.0% monthly)"
        ],
        "unfair_advantage": f"Deeply customized domain architecture engineered specifically for Indian market nuances ({meta['pricing_unit']}), creating superior localized value compared to generic foreign software.",
        "detailed_explanation": f"{title} operates a defensible, high-margin business model in the {ind} sector. By solving acute operational pain points and leveraging scalable digital channels, the company is structured for capital-efficient growth and rapid unit economic profitability.",
        "pricing_tiers": [
            {"tier": "Starter", "price": "₹1,499", "period": "/ month", "target": "Early adopters & small teams", "features": f"Core {ind} toolkit, standard analytics, email & chat support, 2 user seats"},
            {"tier": "Professional", "price": "₹4,999", "period": "/ month", "target": "Growing businesses & active operators", "features": "Advanced workflows, multi-seat collaboration, automated reporting, priority webhook SLAs"},
            {"tier": "Enterprise", "price": "₹18,000+", "period": "/ month", "target": "Large institutions & multi-location groups", "features": "Dedicated database tenant, custom ERP integration, 99.9% uptime SLA, 24/7 account manager"}
        ],
        "swot": {
            "strengths": [
                {"title": f"Tailored {ind} Solution Architecture", "desc": f"Built from the ground up to address specific friction points in {ind}, rather than using generic off-the-shelf tools.", "impact": "Core Competency", "action": "Highlight vertical-specific ROI and workflow time savings in sales collateral."},
                {"title": "Lean and Agile Operating Structure", "desc": "Capital-efficient team structure enables rapid product deployment and customer-led iteration.", "impact": "Operational Agility", "action": "Maintain weekly feature shipping cycles based on direct early-user feedback."},
                {"title": "High Margin Profile", "desc": f"Projected gross margins of {meta['gross_margin']} allow healthy unit economic reinvestment into organic growth.", "impact": "High Efficiency", "action": "Reinvest margin surpluses into high-converting organic SEO and customer referral engines."}
            ],
            "weaknesses": [
                {"title": "Early Brand Awareness vs Legacy Incumbents", "desc": "As an emerging startup, prospective clients may initially compare brand longevity with established vendors.", "impact": "Sales Cycle Length", "action": "Offer risk-free 30-day proof-of-concept trials and highlight published customer case studies."},
                {"title": "Initial Resource & Go-To-Market Constraints", "desc": f"Operating with an initial runway of ₹{budget:,.0f} requires strict prioritization of marketing spend.", "impact": "Budget Discipline", "action": "Focus exclusively on highest-ROI acquisition channels (inbound SEO, referral networks) before paid ads."}
            ],
            "opportunities": [
                {"title": f"Rapid Digital Transformation in {ind}", "desc": "Indian enterprises and consumers are actively upgrading from legacy manual processes to modern cloud platforms.", "impact": "Growth Catalyst", "action": "Position platform as the modern, high-speed alternative to outdated legacy systems."},
                {"title": "Tier-2 & Tier-3 Regional Market Expansion", "desc": "Rapid internet and UPI penetration outside metro cities opens up massive unserved merchant and consumer demand.", "impact": "Untapped Demand", "action": "Support vernacular UI navigation and lightweight mobile PWA performance."},
                {"title": "Ecosystem API & Channel Partnerships", "desc": "Integrating with complementary software providers creates frictionless distribution channels.", "impact": "Distribution Scale", "action": "Publish open developer APIs and partner with established industry service aggregators."}
            ],
            "threats": [
                {"title": "Potential Fast-Follower Competition", "desc": "Low barriers to initial software creation mean competitors could attempt to copy feature sets.", "impact": "Competitive Risk", "action": "Deepen defensible data moats, customer workflow integrations, and proprietary algorithms."},
                {"title": "Macroeconomic Price Sensitivity", "desc": "Economic tightening could lead corporate clients to review software subscription budgets.", "impact": "Churn Pressure", "action": "Continuously demonstrate hard cash savings and undeniable productivity ROI to maintain essential status."}
            ],
            "overall_assessment": f"{title} possesses strong commercial viability within {ind}. By executing a focused customer acquisition strategy, maintaining lean unit economics, and building deep customer lock-in, the startup is well positioned to establish a sustainable market leadership position."
        }
    }


def generate_business_model(context: dict) -> dict:
    """Returns a full 9-pillar Lean Canvas and Business Model specification."""
    sector_key = resolve_business_sector(
        context.get('industry', ''),
        context.get('title', ''),
        context.get('sector', '')
    )

    if sector_key in SECTOR_PROFILES:
        profile = SECTOR_PROFILES[sector_key]
    else:
        profile = get_universal_business_profile(context, sector_key)

    title = context.get('title', 'Startup Project')
    ind = context.get('industry', 'Technology')
    budget = float(context.get('budget') or 20000)

    def interp(val):
        if isinstance(val, str):
            return val.replace('{title}', title).replace('{ind}', ind).replace('{budget:,.0f}', f"{budget:,.0f}")
        elif isinstance(val, list):
            return [interp(x) for x in val]
        return val

    customer_segments = interp(profile['customer_segments'])
    value_proposition = interp(profile['value_proposition'])
    revenue_streams = interp(profile['revenue_streams'])
    channels = interp(profile['channels'])
    key_partners = interp(profile['key_partners'])
    key_activities = interp(profile['key_activities'])
    key_resources = interp(profile['key_resources'])
    cost_structure = interp(profile['cost_structure'])
    problem = interp(profile['problem'])
    solution = interp(profile['solution'])
    key_metrics = interp(profile.get('key_metrics', []))
    unfair_advantage = interp(profile.get('unfair_advantage', ''))
    detailed_explanation = interp(profile['detailed_explanation'])

    return {
        "sector_key": sector_key,
        "archetype": profile['archetype'],
        "gross_margin": profile['gross_margin'],
        "ltv_cac": profile['ltv_cac'],
        "payback_months": profile['payback_months'],
        "problem": problem,
        "solution": solution,
        "customer_segments": customer_segments,
        "value_proposition": value_proposition,
        "revenue_streams": revenue_streams,
        "channels": channels,
        "key_partners": key_partners,
        "key_activities": key_activities,
        "key_resources": key_resources,
        "cost_structure": cost_structure,
        "key_metrics": key_metrics,
        "unfair_advantage": unfair_advantage,
        "detailed_explanation": detailed_explanation,
        "pricing_tiers": profile.get('pricing_tiers', []),

        # Flattened string representations for standard database storage
        "customer_segments_str": "\n• ".join([""] + customer_segments).strip(),
        "value_proposition_str": value_proposition,
        "revenue_streams_str": "\n• ".join([""] + revenue_streams).strip(),
        "channels_str": "\n• ".join([""] + channels).strip(),
        "key_partners_str": "\n• ".join([""] + key_partners).strip(),
        "key_activities_str": "\n• ".join([""] + key_activities).strip(),
        "key_resources_str": "\n• ".join([""] + key_resources).strip(),
        "cost_structure_str": "\n• ".join([""] + cost_structure).strip(),
        "detailed_explanation_str": detailed_explanation
    }


def generate_swot_analysis(context: dict) -> dict:
    """Returns a full 4-quadrant Strategic SWOT Matrix with impact annotations."""
    sector_key = resolve_business_sector(
        context.get('industry', ''),
        context.get('title', ''),
        context.get('sector', '')
    )

    if sector_key in SECTOR_PROFILES:
        profile = SECTOR_PROFILES[sector_key]
    else:
        profile = get_universal_business_profile(context, sector_key)

    title = context.get('title', 'Startup Project')
    ind = context.get('industry', 'Technology')

    swot_raw = profile['swot']

    def interp_item(item):
        return {
            "title": item['title'].replace('{title}', title).replace('{ind}', ind),
            "desc": item['desc'].replace('{title}', title).replace('{ind}', ind),
            "impact": item.get('impact', 'High Impact'),
            "action": item.get('action', 'Focus on systematic execution.').replace('{title}', title).replace('{ind}', ind)
        }

    strengths = [interp_item(x) for x in swot_raw['strengths']]
    weaknesses = [interp_item(x) for x in swot_raw['weaknesses']]
    opportunities = [interp_item(x) for x in swot_raw['opportunities']]
    threats = [interp_item(x) for x in swot_raw['threats']]
    overall_assessment = swot_raw['overall_assessment'].replace('{title}', title).replace('{ind}', ind)

    strengths_simple = [f"{x['title']}: {x['desc']}" for x in strengths]
    weaknesses_simple = [f"{x['title']}: {x['desc']}" for x in weaknesses]
    opportunities_simple = [f"{x['title']}: {x['desc']}" for x in opportunities]
    threats_simple = [f"{x['title']}: {x['desc']}" for x in threats]

    return {
        "sector_key": sector_key,
        "strengths": strengths_simple,
        "weaknesses": weaknesses_simple,
        "opportunities": opportunities_simple,
        "threats": threats_simple,
        "strengths_detailed": strengths,
        "weaknesses_detailed": weaknesses,
        "opportunities_detailed": opportunities,
        "threats_detailed": threats,
        "overall_assessment": overall_assessment
    }
