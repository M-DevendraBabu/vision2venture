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
    if matches(['finops', 'cloud cost', 'cloud spend', 'aws cost', 'azure cost', 'gcp cost', 'kubernetes cost', 'cloud optimization']):
        return 'cloud_finops'
    if matches(['resume', 'portfolio', 'jobseeker', 'ats resume', 'ats', 'cv builder', 'career accelerator']):
        return 'career_tech'
    if matches(['smart clinic', 'omnichannel clinic', 'polyclinic', 'carepoint']):
        return 'smart_clinic'
    if matches(['grocery', 'freshfarm', 'farm to table', 'organic grocery', 'supermarket', 'fresh produce']):
        return 'hyperlocal_grocery'
    if matches(['bakery', 'sourdough', 'patisserie', 'croissant', 'artisan bread', 'crust & crumb', 'pastry']):
        return 'artisan_bakery'
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
            "Tier 1 Starter (Single School): ₹499 / month (₹399 / mo on annual plan, up to 40 faculty members)",
            "Tier 2 Pro (Multi-Wing School / College): ₹1,499 / month (₹1,199 / mo on annual plan, unlimited batches)",
            "Tier 3 Enterprise (University / Group of Schools): ₹4,999 / month (₹3,999 / mo on annual plan, custom ERP sync)",
            "Implementation & Faculty Onboarding Fee: ₹999 – ₹1,999 one-time setup charge"
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
            {"tier": "Starter Academy", "price": "₹499", "monthly_price": "₹499", "annual_price": "₹4,788", "period": "/ month", "target": "Single K-12 Schools (<600 students)", "features": "Automated schedule solver, teacher leave substitution, WhatsApp alert digest, 2 admin seats"},
            {"tier": "Campus Pro", "price": "₹1,499", "monthly_price": "₹1,499", "annual_price": "₹14,388", "period": "/ month", "target": "Large Schools & Junior Colleges (600–2,500 students)", "features": "NEP elective credit matrix, lab room allocation, bi-directional SIS sync, unlimited staff logins", "popular": True},
            {"tier": "University Enterprise", "price": "₹4,999", "monthly_price": "₹4,999", "annual_price": "₹47,988", "period": "/ month", "target": "Multi-Campus Universities & School Chains", "features": "Multi-department scheduling, cross-faculty load balancing, custom API hooks, 24/7 dedicated account manager"}
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
            "Starter Platform Fee: ₹499 / month (₹399 / mo on annual plan) + standard UPI rails",
            "Growth Merchant Subscription: ₹1,499 / month (₹1,199 / mo on annual plan) for automated recon & instant settlement",
            "Enterprise Tier: ₹4,999 / month (₹3,999 / mo on annual plan) for dedicated multi-bank switch routing",
            "Instant T+0 Settlement Surcharge: 0.15% flat on accelerated fund disbursements"
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
            {"tier": "Growth Merchant", "price": "₹499", "monthly_price": "₹499", "annual_price": "₹4,788", "period": "/ month", "target": "Early-stage startups processing <₹10L GMV", "features": "Standard UPI & Card checkout, T+1 settlement, Shopify plugin, standard email support"},
            {"tier": "Scale Business", "price": "₹1,499", "monthly_price": "₹1,499", "annual_price": "₹14,388", "period": "/ month", "target": "Growing brands processing ₹10L–₹50L GMV", "features": "Instant T+0 settlement, custom checkout UI, automated GST reconciliation, priority webhook SLAs", "popular": True},
            {"tier": "Enterprise Tier", "price": "₹4,999", "monthly_price": "₹4,999", "annual_price": "₹47,988", "period": "/ month", "target": "High-volume marketplaces processing >₹50L GMV", "features": "Dedicated multi-bank routing switch, split escrow payouts, Account Aggregator integration, 24/7 SLA"}
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
            "High-intent Search Engine Campaigns on 'ABDM certified EMR', 'clinic queue management', and 'digital prescription software'"
        ],
        "key_partners": [
            "National Health Authority (NHA) & Ayushman Bharat Digital Mission (ABDM) Sandbox",
            "Indian Medical Association (IMA) State Chapters & Polyclinic Associations",
            "Diagnostic Aggregators (Thyrocare, Lal PathLabs, Redcliffe) for API test routing",
            "Leading WhatsApp Business Solution Providers for automated appointment updates"
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
            "Solo Practitioner Clinic License: ₹499 / month (₹399 / mo on annual plan, single doctor)",
            "Polyclinic Suite: ₹1,499 / month (₹1,199 / mo on annual plan, 3–8 doctors)",
            "Hospital Enterprise License: ₹4,999 / month (₹3,999 / mo on annual plan, nursing homes)",
            "Teleconsultation Platform Convenience Fee: ₹10 – ₹25 per remote video consultation"
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
            {"tier": "Solo Practitioner", "price": "₹499", "monthly_price": "₹499", "annual_price": "₹4,788", "period": "/ month", "target": "Individual Clinic Doctors", "features": "Digital EMR, ABDM ABHA generation, WhatsApp patient reminders, queue display screen app"},
            {"tier": "Polyclinic Suite", "price": "₹1,499", "monthly_price": "₹1,499", "annual_price": "₹14,388", "period": "/ month", "target": "Multi-specialty clinics (3–8 doctors)", "features": "Multi-doctor scheduling, centralized billing & GST receipts, in-house lab integration, custom letterhead", "popular": True},
            {"tier": "Hospital Enterprise", "price": "₹4,999", "monthly_price": "₹4,999", "annual_price": "₹47,988", "period": "/ month", "target": "Nursing Homes & Daycare Hospitals", "features": "IPD/OPD ward management, insurance TPA pre-authorization workflows, dedicated account manager, ABDM HIU/HIP gateway"}
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
    },

    "fitness_wellness": {
        "archetype": "Hybrid Digital Wellness & Connected Fitness",
        "gross_margin": "70% – 78%",
        "ltv_cac": "3.9x – 4.5x",
        "payback_months": "4 – 6 Months",
        "problem": "Generic overcrowded commercial gyms, lack of structured functional training form checks, and high upfront annual lock-in fees leaving fitness enthusiasts unmotivated and prone to injury in India.",
        "solution": "Modern high-intensity CrossFit and functional strength facility combining Olympic lifting platforms, certified coach form assessments, and transparent monthly membership tiers for {title}.",
        "customer_segments": [
            "Primary ICP: Working professionals, corporate executives, and students aged 20–42 seeking high-energy fitness",
            "Functional Athletes: CrossFitters, marathoners, and powerlifters requiring Olympic barbell drop zones",
            "Weight Transformation: Individuals seeking structured 1-on-1 personal training and nutritional guidance",
            "Corporate Wellness: Local tech park employees looking for morning/evening stress relief workouts"
        ],
        "value_proposition": "Delivers expert coach-led strength and conditioning with sub-15 member batch limits, premium Olympic lifting equipment, and flexible monthly memberships with zero hidden lock-ins.",
        "channels": [
            "Hyperlocal Instagram & Meta Reels showcasing member PRs, lifting form, and community workouts",
            "Community Weekend Open WODs & Free Mobility Workshops within 3 km catchment radius",
            "Corporate Wellness Partnerships with nearby IT hubs and business offices",
            "Referral Word-of-Mouth: 'Bring a Friend' free trial pass with 15% renewal cashback"
        ],
        "key_partners": [
            "Commercial Strength & Fitness Equipment Manufacturers (custom rigs, barbells, bumper plates)",
            "Certified Sports Nutrition & Supplement Brands for in-house retail protein bar",
            "Local Physiotherapists & Sports Chiropractors for member recovery referrals",
            "Biometric Access & Gym Management Software Providers (RFID check-ins & AutoPay billing)"
        ],
        "key_activities": [
            "Daily workout programming (WODs) tailored for scalability across beginner to advanced athletes",
            "Continuous trainer form coaching, injury prevention audits, and member technique workshops",
            "Equipment sanitation, barbell maintenance, and acoustic rubber floor upkeep",
            "Monthly InBody body composition tracking and member milestone celebrations"
        ],
        "key_resources": [
            "High-street commercial facility (2,500–4,000 sq.ft) with structural clearance for barbell drop zones",
            "Certified Head Strength Coach and Level-1/Level-2 CrossFit certified coaching roster",
            "Heavy-duty modular CrossFit rig, Concept2 rowers, Assault air bikes, and Olympic plates",
            "Automated membership billing CRM and biometric turnstile access control"
        ],
        "cost_structure": [
            "Commercial Property Lease & High-Street Rent (28% of monthly operating budget)",
            "Certified Head Coach & Trainer Salaries + Performance Incentives (32%)",
            "Facility Power, Commercial Air Conditioning & Utility Expenses (14%)",
            "Equipment Maintenance, Sanitation Supplies & Wear-and-Tear Reserve (10%)",
            "Local Performance Marketing, Social Media & Community Events (16%)"
        ],
        "revenue_streams": [
            "Starter Floor Pass: ₹1,499 / month (₹14,390 / year, full gym floor & cardio access)",
            "Pro Athlete / CrossFit Pass: ₹2,999 / month (₹28,790 / year, unlimited daily coached batches)",
            "Elite Transformation & PT: ₹5,499 / month (₹52,790 / year, includes 8 1-on-1 trainer sessions)",
            "In-House Sports Nutrition Bar & Merchandise: ₹250 – ₹1,200 per transaction"
        ],
        "key_metrics": [
            "Active Recurring Member Base & Monthly Renewal Rate (>82% target)",
            "Batch Capacity Utilization Rate (Target >75% in prime 6-9 AM / 6-9 PM slots)",
            "Average Revenue Per Member (ARPM > ₹2,800/mo via PT upsell)",
            "Member Lifetime Value to CAC Ratio (>3.8x)"
        ],
        "unfair_advantage": "Coach-led community culture paired with dedicated Olympic lifting drop-zone infrastructure and flexible monthly billing, delivering 3x higher attendance consistency than conventional commercial gyms.",
        "detailed_explanation": "{title} combines high-energy group functional training with high-margin 1-on-1 personal coaching. By maintaining lean operational overhead and building an authentic fitness community, unit economics achieve rapid break-even within 6 months.",
        "pricing_tiers": [
            {"tier": "Starter Floor Pass", "price": "₹1,499", "monthly_price": "₹1,499", "annual_price": "₹14,390", "period": "/ month", "target": "Casual lifters & general gym regulars", "features": "Full cardio & free weights floor access, locker facility, general fitness orientation, shower access"},
            {"tier": "Pro Athlete / CrossFit", "price": "₹2,999", "monthly_price": "₹2,999", "annual_price": "₹28,790", "period": "/ month", "target": "CrossFit athletes & functional fitness regulars", "features": "Unlimited daily CrossFit & HIIT batches, expert coach form analysis, Olympic lifting platforms, priority batch booking", "popular": True},
            {"tier": "Elite Transformation & PT", "price": "₹5,499", "monthly_price": "₹5,499", "annual_price": "₹52,790", "period": "/ month", "target": "Personalized coaching & body transformation", "features": "8 dedicated 1-on-1 personal trainer sessions/mo, monthly InBody body composition scan, customized macro nutrition plan, recovery lounge access"}
        ],
        "swot": {
            "strengths": [
                {"title": "Coach-to-Member Ratio & Community Cohesion", "desc": "Small batch sizes (<15 members) ensure dedicated trainer attention and build high social retention.", "impact": "Core Competency", "action": "Highlight trainer certifications and member transformation case studies across local media."},
                {"title": "High Margin Personal Training Upsell", "desc": "1-on-1 personal training delivers gross margins exceeding 65% on top of baseline membership fees.", "impact": "Revenue Multiplier", "action": "Offer complimentary 30-minute fitness assessment to every new member to drive PT conversions."},
                {"title": "Low Marginal Serving Cost", "desc": "Once equipment CapEx is funded, operating marginal cost per additional member in existing batches is near zero.", "impact": "Operating Leverage", "action": "Maximize off-peak afternoon batch occupancy with special corporate and student discounts."}
            ],
            "weaknesses": [
                {"title": "Peak Hour Floor Capacity Bottlenecks", "desc": "Morning (6-9 AM) and Evening (6-9 PM) hours experience high demand while mid-day hours remain quiet.", "impact": "Capacity Constraint", "action": "Introduce mid-day flex memberships priced at 25% discount to balance footfall across the day."},
                {"title": "Dependency on Key Trainer Retention", "desc": "Popular coaches can build personal followings that may follow them if they transition.", "impact": "Personnel Risk", "action": "Implement competitive revenue-share incentives and long-term trainer retention contracts."}
            ],
            "opportunities": [
                {"title": "Corporate Wellness & B2B Group Subscriptions", "desc": "Nearby technology parks and multinational corporate offices actively fund employee fitness allowances.", "impact": "Bulk Volume", "action": "Sign exclusive corporate wellness tie-ups with subsidized employee annual memberships."},
                {"title": "Recovery Suite & Cryo / Sauna Add-ons", "desc": "Modern athletes increasingly pay premium add-on fees for ice baths, infrared saunas, and compression boots.", "impact": "High-Margin Expansion", "action": "Install a 4-person contrast therapy recovery zone funded from Month 6 operating cashflows."},
                {"title": "Multi-Location Franchise Expansion", "desc": "Proving the unit economics in the first neighborhood unlocks multi-hub expansion across urban catchments.", "impact": "Geographic Scale", "action": "Codify operating standard operating procedures (SOPs) for turnkey 2nd location launch."}
            ],
            "threats": [
                {"title": "Discount Gym Chains & Low-Price Competitors", "desc": "Budget commercial gym franchises offer barebones gym floor access at ₹700–₹1,000/month.", "impact": "Price Pressure", "action": "Compete strictly on coaching quality, CrossFit results, and community rather than low price."},
                {"title": "Commercial Real Estate Rent Escalation", "desc": "Prime high-street landlords may demand aggressive 5-8% annual rent escalations upon lease renewal.", "impact": "Margin Drag", "action": "Negotiate 5-year commercial lease agreements with capped 3% biennial rent escalations."}
            ],
            "overall_assessment": "{title} demonstrates strong commercial viability in Fitness & Wellness. By focusing on coach-led community workouts and premium 1-on-1 transformation packages, the business achieves high member retention and rapid unit payback."
        }
    },

    "food & beverage": {
        "archetype": "Specialized QSR, Artisanal Dining & Cloud Kitchen",
        "gross_margin": "60% – 68%",
        "ltv_cac": "3.5x – 4.2x",
        "payback_months": "4 – 6 Months",
        "problem": "Inconsistent taste quality, long dining wait times, and high food aggregator commissions (22%+) eroding margins for food operators while delivering lukewarm food to customers across India.",
        "solution": "High-efficiency culinary kitchen model focusing on authentic signature recipes, rapid counter takeaway, and direct localized delivery for {title}.",
        "customer_segments": [
            "Primary ICP: Students, young professionals, and local residents seeking authentic, hygienic meals",
            "Family Diners: Multi-generational households looking for weekend feast packs and celebratory platters",
            "Corporate Offices: Tech firms and institutions requiring reliable executive lunch boxes and meeting platters",
            "Event Hosts: Local birthday parties, functions, and campus events needing bulk catering"
        ],
        "value_proposition": "Delivers slow-cooked authentic taste with strict hygiene standards, express counter takeaway under 6 minutes, and generous family portions at honest local prices.",
        "channels": [
            "Direct Walk-in Counter & High-Visibility Street Frontage with Open Kitchen Display",
            "Direct WhatsApp / QR Code Table Ordering with Zero Aggregator Markups",
            "Local Foodie Influencer Reviews & Instagram Reels showcasing live dum-pot opening",
            "Selective Aggregator Presence (Swiggy / Zomato) used strictly as top-of-funnel customer discovery"
        ],
        "key_partners": [
            "Direct wholesale suppliers for daily fresh ingredients, dairy, staples and spices",
            "Packaging Manufacturers for leak-proof, heat-retentive clay pots and biodegradable boxes",
            "FSSAI Food Safety Auditors & Commercial Kitchen Equipment Maintenance Vendors",
            "Local Delivery Fleets for direct neighborhood order fulfillment"
        ],
        "key_activities": [
            "Daily batch preparation of signature marinade, slow dum cooking, and fresh pastry baking",
            "Strict HACCP & FSSAI hygiene protocols, temperature logging, and quality checks",
            "Counter takeaway order packaging speed optimization (target <5 minutes)",
            "Managing customer feedback, review generation, and loyalty stamp cards"
        ],
        "key_resources": [
            "Prime commercial kitchen location (600–1,200 sq.ft) with high foot-traffic street frontage",
            "Experienced Master Chef (Ustad / Head Baker) and trained kitchen prep line staff",
            "Commercial grade convection ovens, high-capacity dum burners, and cold-room storage",
            "Touchscreen POS terminal with automated recipe inventory consumption tracking"
        ],
        "cost_structure": [
            "Raw Food Ingredients & Consumables / COGS (34% of monthly operating revenue)",
            "Kitchen Staff & Front-Counter Team Payroll (22%)",
            "Storefront Commercial Rent & Lease Maintenance (18%)",
            "Commercial LPG Gas, Electricity & Kitchen Power (10%)",
            "Packaging, Delivery Logistics & Local Marketing (16%)"
        ],
        "revenue_streams": [
            "Student / Quick Meal Combo: ₹249 / meal (express counter pickup with complimentary drink)",
            "Family / Sharing Pack: ₹799 / pack (signature sharing platter for 3-4 pax)",
            "Corporate & Party Catering: ₹4,999 / event (buffet setup for 15-25 pax with chafing dishes)",
            "Beverage & Dessert Add-ons: ₹50 – ₹180 per order (sweet lassi, gulab jamun, signature pastries)"
        ],
        "key_metrics": [
            "Daily Order Volume & Average Order Value (Target AOV > ₹480)",
            "Food Cost Percentage / COGS (Strictly controlled under 35%)",
            "Table Turnover / Counter Throughput Latency (<6 minutes per takeaway parcel)",
            "Direct Re-order / Repeat Customer Rate (>30% within 30 days)"
        ],
        "unfair_advantage": "Proprietary slow-cooked dum recipe and spice blend delivering irreplaceable signature taste, paired with direct WhatsApp ordering that bypasses third-party platform commissions.",
        "detailed_explanation": "{title} leverages lean, high-throughput kitchen operations to drive superior gross margins. By balancing high-volume walk-in takeaway with profitable direct party catering, the venture achieves sustainable profitability within months.",
        "pricing_tiers": [
            {"tier": "Student / Quick Meal Combo", "price": "₹249", "monthly_price": "₹249", "annual_price": "₹249", "period": "/ meal combo", "target": "Individual diners, students & commuters", "features": "Single-portion signature item, complimentary beverage, express takeaway counter pickup, eco-friendly packaging"},
            {"tier": "Family / Sharing Pack", "price": "₹799", "monthly_price": "₹799", "annual_price": "₹799", "period": "/ meal pack", "target": "Families & friend groups (3-4 pax)", "features": "Full signature sharing platter, two house accompaniments, dessert sampler, priority dine-in table", "popular": True},
            {"tier": "Party & Corporate Catering", "price": "₹4,999", "monthly_price": "₹4,999", "annual_price": "₹4,999", "period": "/ event booking", "target": "Office parties, birthdays & celebrations (15-25 pax)", "features": "Customized catering buffet setup, chafing dishes with live food heating, dedicated service steward, complimentary dessert counter, custom spice levels"}
        ],
        "swot": {
            "strengths": [
                {"title": "Signature Recipe & Flavor Consistency", "desc": "Standardized spice formulas and batch cooking times guarantee identical great taste every single day.", "impact": "Core Competency", "action": "Pre-package signature spice masalas centrally to protect intellectual property."},
                {"title": "High Table Turnover & Takeaway Volume", "desc": "Fast prep cycle (<5 mins) maximizes peak lunch and dinner hour order volume.", "impact": "High Throughput", "action": "Implement a dedicated express takeaway counter to avoid walk-in dining congestion."},
                {"title": "Lucrative Corporate Catering Margins", "desc": "Pre-booked bulk orders provide high gross margins (68%+) with zero food wastage risk.", "impact": "Margin Expansion", "action": "Distribute corporate catering tasting boxes to HR managers at nearby business hubs."}
            ],
            "weaknesses": [
                {"title": "Raw Ingredient Price Volatility", "desc": "Spikes in onion, tomato, dairy, or poultry prices can compress gross margins if not hedged.", "impact": "Cost Pressure", "action": "Secure quarterly fixed-rate supply contracts with regional wholesale poultry and dairy vendors."},
                {"title": "Dependency on Core Kitchen Talent", "desc": "Loss of the head cook could disrupt daily food consistency and kitchen morale.", "impact": "Operational Risk", "action": "Document exact ingredient grammage measurements in written SOPs to ensure any cook can execute."}
            ],
            "opportunities": [
                {"title": "Direct D2C WhatsApp Ordering Channel", "desc": "Encouraging regular customers to order directly via WhatsApp saves 20-25% aggregator commission fees.", "impact": "Profit Protection", "action": "Offer a free beverage or 10% instant discount on direct WhatsApp pickup orders."},
                {"title": "Late Night & Weekend Midnight Delivery", "desc": "University campuses and IT corridors experience intense late-night food cravings between 11 PM and 2 AM.", "impact": "Incremental Revenue", "action": "Extend cloud kitchen delivery hours on weekends to capture high-margin night sales."},
                {"title": "Packaged Gourmet Mixes & Sauces", "desc": "Retail sales of signature spice blends, dry mixes or bottled sauces create an omnichannel revenue stream.", "impact": "Brand Extension", "action": "Package signature blends in retail jars for front-counter display sales."}
            ],
            "threats": [
                {"title": "Aggressive Discounting from Delivery Aggregators", "desc": "Swiggy and Zomato promote deeply-discounted cloud kitchen brands that undercut storefront prices.", "impact": "Price Competition", "action": "Focus marketing on dine-in freshness, authentic clay-pot aroma, and direct customer relationships."},
                {"title": "Stringent Food Safety Inspections", "desc": "FSSAI compliance audits require rigorous hygiene, pest control, and food safety certifications.", "impact": "Regulatory Compliance", "action": "Conduct bi-weekly third-party hygiene audits and maintain spotless kitchen transparency."}
            ],
            "overall_assessment": "{title} possesses outstanding commercial potential in Food & Beverage. By combining an authentic signature culinary identity with rapid counter throughput and direct catering orders, the brand builds strong localized defensibility."
        }
    },

    "career_tech": {
        "archetype": "AI-Native Career Tech & Placement Acceleration SaaS",
        "gross_margin": "82% – 88%",
        "ltv_cac": "4.5x – 5.2x",
        "payback_months": "4 – 6 Months",
        "problem": "Severe ATS resume rejection rates (>75%), lack of personalized job description tailoring, and generic static portfolios causing candidates to miss top-tier job opportunities across India and globally.",
        "solution": "AI-powered career suite featuring automated job description keyword optimization, ATS resume scoring, dynamic developer portfolio generators with live demo hosting, and automated cover letters for {title}.",
        "customer_segments": [
            "Primary ICP: Job seekers, software engineers, and mid-career professionals actively interviewing",
            "College Graduates: Final-year engineering and MBA students preparing for campus placements",
            "Career Switchers: Non-tech professionals transitioning into data, product, or software roles",
            "Institutional Buyers: College placement cells and coding bootcamps providing placement software"
        ],
        "value_proposition": "Increases interview invitation rates by 2.4x with automated ATS-optimized resumes, creates instant developer portfolios with live demo showcases, and slashes job application prep time by 80%.",
        "channels": [
            "Organic LinkedIn viral growth and student placement community word-of-mouth",
            "Inbound SEO targeting 'ATS resume checker', 'developer portfolio builder', and 'free AI resume generator'",
            "Placement cell partnerships with tier-1/2 engineering colleges across India",
            "YouTube and Tech Influencer resume review livestreams and placement preparation guides"
        ],
        "key_partners": [
            "OpenAI & DeepSeek LLM inference infrastructure for sub-second text tailoring",
            "Razorpay & Stripe for seamless domestic UPI and international multi-currency subscription collection",
            "College placement boards and tech recruitment communities",
            "AWS Mumbai & Vercel edge networks for zero-latency portfolio hosting"
        ],
        "key_activities": [
            "Continuous refinement of LLM prompts for high-scoring ATS keyword extraction",
            "Expanding modern developer portfolio templates with interactive GitHub project widgets",
            "User acquisition funnel optimization and freemium-to-paid conversion experiments",
            "Placement season promotional campaigns (August–November & January–April)"
        ],
        "key_resources": [
            "Proprietary resume parsing and ATS scoring algorithm trained on 50k+ job descriptions",
            "Dynamic portfolio rendering engine with custom subdomain hosting",
            "Agile full-stack engineering team with deep generative AI expertise",
            "Initial growth runway of ₹{budget:,.0f} deployed for product development and organic SEO"
        ],
        "cost_structure": [
            "LLM API Token Inference & Cloud Edge Hosting (26% of total spend)",
            "Product Engineering, Full-Stack Development & UI/UX Design (38%)",
            "Growth Marketing, Content Creation & Campus Ambassador Programs (22%)",
            "Payment Gateway Processing Fees & Corporate Legal Compliance (8%)",
            "Customer Support & Community Management (6%)"
        ],
        "revenue_streams": [
            "Free Explorer Tier: ₹0 (1 AI resume, 3 ATS scans/mo, basic web portfolio)",
            "Jobseeker Pro: ₹499 / month (₹3,990 / year, unlimited tailoring, custom domain, cover letter AI)",
            "Career Accelerator VIP: ₹1,499 / quarter (₹3,999 / year, AI mock interviews, recruiter matching)",
            "Institutional Placement License: ₹45,000 – ₹1,50,000 / college / annual placement cycle"
        ],
        "key_metrics": [
            "Monthly Active Users (MAU) & Free-to-Paid Conversion Rate (Target >4.2%)",
            "ATS Score Improvement Rate (Average +32 points post-tailoring)",
            "Customer Acquisition Cost (CAC < ₹350 via viral referral loops)",
            "Monthly Recurring Revenue (MRR Growth > 25% MoM)"
        ],
        "unfair_advantage": "Combined ATS keyword optimization with instant interactive portfolio hosting, providing candidates a complete personal branding engine rather than just a static PDF exporter.",
        "detailed_explanation": "{title} operates a high-margin freemium software model with virality embedded in shared portfolio URLs. By monetizing high-intent job seekers during critical career transitions, the business achieves high gross margins (85%+) and rapid payback.",
        "pricing_tiers": [
            {"tier": "Free Explorer", "price": "₹0", "monthly_price": "₹0", "annual_price": "₹0", "period": "/ forever free", "target": "Students & active job seekers", "features": "1 AI resume, 3 ATS keyword scans/mo, standard PDF export, basic web portfolio link"},
            {"tier": "Jobseeker Pro", "price": "₹499", "monthly_price": "₹499", "annual_price": "₹3,990", "period": "/ month", "target": "Ambitious professionals & active job hunters", "features": "Unlimited AI resume tailoring, 50+ ATS optimization scans, custom portfolio domain, AI cover letter generator, LinkedIn keyword optimizer", "popular": True},
            {"tier": "Career Accelerator VIP", "price": "₹1,499", "monthly_price": "₹1,499", "annual_price": "₹3,999", "period": "/ quarter", "target": "Senior executives, tech talent & career switchers", "features": "AI mock interview simulator, direct recruiter match alerts, high-score ATS guarantee, custom portfolio domain hosting, priority 24-hr expert resume review"}
        ],
        "swot": {
            "strengths": [
                {"title": "Organic Viral Growth Loop", "desc": "Every public developer portfolio created on the platform contains a 'Built with {title}' attribution link, generating free compounding top-of-funnel traffic.", "impact": "Viral Acquisition", "action": "Incentivize portfolio sharing with 5 free premium ATS scans per referral signup."},
                {"title": "High Software Gross Margins (>82%)", "desc": "Pure SaaS economics with low marginal serving cost per user enables healthy reinvestment into organic product marketing.", "impact": "Unit Economics", "action": "Maintain lean cloud infrastructure and cache common ATS keyword embeddings to minimize LLM token costs."},
                {"title": "Immediate Time-to-Value", "desc": "Users achieve a tailored, professional resume in under 3 minutes, driving instant product satisfaction.", "impact": "User Delight", "action": "Implement 1-click LinkedIn profile import for instant zero-effort resume onboarding."}
            ],
            "weaknesses": [
                {"title": "Inherent Customer Lifecycle Churn", "desc": "Once a job seeker lands a job, their immediate need for active resume tailoring diminishes until their next career search.", "impact": "Churn Exposure", "action": "Introduce continuous career portfolio monitoring, quarterly compensation benchmark alerts, and skill gap trackers to sustain year-round engagement."},
                {"title": "Sensitivity to Free Alternatives", "desc": "Casual users may initially experiment with generic free AI tools before understanding specialized ATS formatting nuances.", "impact": "Conversion Friction", "action": "Clearly showcase real-world recruiter ATS parsing diffs to prove why generic tools fail automated applicant filters."}
            ],
            "opportunities": [
                {"title": "B2B College Placement Cell Licensing", "desc": "Over 4,000 engineering and management colleges in India require placement readiness software for accreditation.", "impact": "Enterprise Scale", "action": "Launch institutional campus dashboard with bulk student resume audits and placement analytics."},
                {"title": "Direct Employer Recruitment Marketplace", "desc": "Closing the loop by connecting verified high-scoring candidates with tech recruiters creates a secondary monetization channel.", "impact": "New Revenue Stream", "action": "Monetize recruiter candidate discovery with verified ATS skill tags."},
                {"title": "Global English-Speaking Market Expansion", "desc": "Software developers and professionals across the US, UK, and Europe pay higher subscription rates ($15–$29/mo).", "impact": "ARPU Multiplier", "action": "Enable Stripe multi-currency checkout targeting international software engineers."}
            ],
            "threats": [
                {"title": "Commoditization from General Purpose LLMs", "desc": "Base AI models (ChatGPT, Claude) could improve native document formatting features.", "impact": "Competitive Pressure", "action": "Double down on real-time recruiter ATS parsing rules, interactive live-demo portfolio hosting, and verified recruiter networks that general LLMs cannot replicate."},
                {"title": "Changing Recruiter Screening Algorithms", "desc": "Enterprise ATS vendors (Workday, Greenhouse, Lever) continuously update screening heuristics.", "impact": "Technical Risk", "action": "Continuously benchmark outputs against major enterprise ATS engines with automated weekly regression testing."}
            ],
            "overall_assessment": "{title} is positioned in a high-demand, high-velocity consumer SaaS segment. By solving the acute pain of job search rejection with automated ATS optimization and viral portfolio hosting, the platform builds a capital-efficient, high-margin venture."
        }
    },

    "cloud_finops": {
        "archetype": "Autonomous Cloud FinOps & Infrastructure Cost Optimization SaaS",
        "gross_margin": "84% – 90%",
        "ltv_cac": "5.5x – 6.2x",
        "payback_months": "5 – 7 Months",
        "problem": "Uncontrolled cloud sprawl, surprise AWS/Azure/GCP bills, idle compute resources, and lack of engineering accountability leading to 30%+ wasted cloud expenditure for tech companies across India and globally.",
        "solution": "Agentic cloud FinOps platform providing automated anomaly detection, idle resource shutoff, shift-left CI/CD pull request cost diffs, and automated spot/RI arbitrage for {title}.",
        "customer_segments": [
            "Primary ICP: Growth-stage software companies and tech startups spending ₹3L–₹35L ($4k–$40k) monthly on cloud",
            "Engineering Leadership: CTOs, VP of Engineering, and DevOps Leads accountable for cloud budgets",
            "Finance & Operations: CFOs and FinOps practitioners seeking automated departmental cost allocation",
            "Cloud Consultancies: MSPs and system integrators managing multi-tenant client cloud environments"
        ],
        "value_proposition": "Instantly reduces multi-cloud bills by 22–35% through autonomous waste elimination, detects cost anomalies within 15 minutes, and prevents expensive infrastructure misconfigurations before deployment.",
        "channels": [
            "Product-Led Growth (PLG) via GitHub / GitLab Marketplace apps and free read-only cloud cost audits",
            "High-intent DevOps community content on 'AWS cost optimization', 'Kubernetes FinOps', and 'Terraform cost diff'",
            "Direct B2B Outbound targeting CTOs of Series-A and Series-B venture-backed tech startups",
            "Cloud Marketplace listings on AWS Marketplace, GCP Marketplace, and Microsoft Azure"
        ],
        "key_partners": [
            "AWS Partner Network (APN), Google Cloud Partner Advantage, and Microsoft Azure Partner Ecosystem",
            "Datadog, New Relic, and Prometheus ecosystem connectors for observability data ingestion",
            "Payment Aggregators supporting automated enterprise invoicing and card mandates",
            "Indian and global FinOps Foundation chapters and open-source community groups"
        ],
        "key_activities": [
            "Continuous optimization of automated cloud billing telemetry ingestion and anomaly ML models",
            "Developing zero-risk autonomous resource rightsizing algorithms (idle EBS, unattached IPs, oversized RDS)",
            "Enterprise security compliance maintenance (SOC 2 Type II, ISO 27001, read-only IAM policies)",
            "Customer success onboarding reviews and quarterly cloud architecture cost optimization reports"
        ],
        "key_resources": [
            "Proprietary cloud cost attribution engine with container/pod-level Kubernetes breakdown",
            "SOC 2 certified secure cloud infrastructure with zero access to client customer data",
            "Specialized FinOps engineering team and certified AWS/GCP cloud architects",
            "Initial capitalization of ₹{budget:,.0f} deployed for enterprise engineering and SOC 2 audits"
        ],
        "cost_structure": [
            "Core Product Engineering, Infrastructure Security & CI/CD Tooling (42% of total spend)",
            "Enterprise B2B Sales, Account Executives & DevOps Community Marketing (28%)",
            "Cloud Ingestion Servers, Big Data Analytics & Elastic Storage on AWS Mumbai (15%)",
            "SOC 2 Audits, Cyber Insurance & Regulatory Legal Counsel (10%)",
            "Customer Success & 24/7 Enterprise SLA Support (5%)"
        ],
        "revenue_streams": [
            "Cloud Starter Tier: ₹2,999 / month (₹28,790 / year, up to ₹3L cloud spend, anomaly alerts, 1 account)",
            "Growth FinOps Tier: ₹8,999 / month (₹86,390 / year, up to ₹25L spend, K8s allocation, CI/CD diffs, 5 accounts)",
            "Enterprise Sentinel: ₹24,999 / month (₹2,39,990 / year, unlimited spend, autonomous arbitrage, dedicated architect)",
            "Gain-Share Performance Fee: 15% of validated hard net cloud savings above guaranteed threshold"
        ],
        "key_metrics": [
            "Total Cloud Spend Under Management (CSUM)",
            "Net Revenue Retention (NRR > 125% via cloud spend expansion)",
            "Average Monthly Client Cloud Savings (Target >25% hard cost reduction)",
            "Customer Acquisition Cost (CAC) Payback Velocity (<6 months)"
        ],
        "unfair_advantage": "Shift-left developer integration with pull request cost diffs combined with non-invasive read-only IAM permissions, eliminating enterprise security friction while catching waste before code merges.",
        "detailed_explanation": "{title} addresses an urgent, high-budget operational pain point with undeniable ROI. By delivering 4x–8x hard cash savings relative to software subscription cost, the platform achieves industry-leading retention and capital-efficient growth.",
        "pricing_tiers": [
            {"tier": "Cloud Starter", "price": "₹2,999", "monthly_price": "₹2,999", "annual_price": "₹28,790", "period": "/ month", "target": "Early startups spending <₹3L monthly on cloud", "features": "Real-time cost anomaly alerts, idle compute resource detection, daily Slack/WhatsApp budget digest, 1 cloud account"},
            {"tier": "Growth FinOps", "price": "₹8,999", "monthly_price": "₹8,999", "annual_price": "₹86,390", "period": "/ month", "target": "Scaling engineering teams spending ₹3L–₹25L/mo", "features": "Automated RI/Savings Plans recommendations, Kubernetes pod-level allocation, CI/CD pull request cost diff checks, 5 cloud accounts", "popular": True},
            {"tier": "Enterprise Sentinel", "price": "₹24,999", "monthly_price": "₹24,999", "annual_price": "₹2,39,990", "period": "/ month", "target": "High-scale tech companies spending >₹25L/mo", "features": "Automated spot instance arbitrage, custom FinOps governance policies, role-based departmental chargeback, dedicated FinOps cloud architect, 99.9% SLA"}
        ],
        "swot": {
            "strengths": [
                {"title": "Undeniable Hard-Dollar ROI", "desc": "Clients typically save ₹50,000–₹3,00,000/month while paying ₹8,999/month, making subscription renewal a straightforward financial decision.", "impact": "High Retention", "action": "Quantify and prominently display verified cumulative net cash saved on the customer executive dashboard."},
                {"title": "Zero-Risk Read-Only Architecture", "desc": "Platform requires only read-only cloud metadata permissions without touching sensitive customer database records.", "impact": "Low Security Friction", "action": "Feature one-click CloudFormation / Terraform read-only IAM deployment scripts."},
                {"title": "Expansion Revenue Model", "desc": "As client companies grow and their cloud consumption increases, FinOps tier upgrades occur naturally.", "impact": "Net Negative Churn", "action": "Structure contract pricing tied to cloud spend brackets with automatic volume tiering."}
            ],
            "weaknesses": [
                {"title": "Enterprise Security Audit Gatekeeping", "desc": "Large corporate clients require extensive InfoSec questionnaires and vendor risk approvals before granting cloud access.", "impact": "Sales Cycle Delay", "action": "Complete SOC 2 Type II compliance and publish self-serve security whitepapers."},
                {"title": "Multi-Cloud Complexity Maintenance", "desc": "Simultaneously maintaining accurate billing logic across AWS, GCP, Azure, and Oracle Cloud requires continuous engineering vigilance.", "impact": "Engineering Overhead", "action": "Prioritize AWS and GCP billing adapters first before expanding into niche cloud platforms."}
            ],
            "opportunities": [
                {"title": "AI Workload Cost Surge (GPU / LLM FinOps)", "desc": "Explosive enterprise adoption of generative AI is creating massive, unmonitored GPU cloud spending spikes.", "impact": "Massive Market Tailwind", "action": "Launch dedicated OpenAI, Anthropic, and AWS Bedrock API spend tracking and prompt cost optimization module."},
                {"title": "Cloud Marketplace Co-Selling", "desc": "Enterprises can use their committed AWS EDP or Google Cloud enterprise discount budgets to purchase software.", "impact": "Frictionless Procurement", "action": "List platform on AWS and GCP Marketplace to allow clients to burn pre-committed cloud credits."},
                {"title": "Cross-Border Enterprise Expansion", "desc": "US and European mid-market companies face identical FinOps pressures and pay 3x–4x higher software fees in USD.", "impact": "Global Revenue", "action": "Expand inbound SEO and B2B outbound targeting US engineering leadership."}
            ],
            "threats": [
                {"title": "Native Cloud Provider Cost Tools", "desc": "AWS Cost Explorer and Azure Cost Management continuously release basic incremental cost analysis features.", "impact": "Feature Encroachment", "action": "Differentiate on cross-cloud unified visibility, sub-hour anomaly detection, and CI/CD pull request cost prevention that native single-cloud tools cannot provide."},
                {"title": "Entrenched Legacy Competitors", "desc": "Established US enterprise tools (CloudHealth, Spot by NetApp) hold large legacy enterprise accounts.", "impact": "Enterprise Competition", "action": "Win agile engineering teams on modern developer-friendly UI, rapid setup (<10 mins), and transparent pricing without multi-year lock-ins."}
            ],
            "overall_assessment": "{title} occupies an exceptional commercial niche in enterprise software. By turning complex cloud billing data into automated, actionable savings, the company builds deep customer reliance and exceptional unit economics."
        }
    },

    "smart_clinic": {
        "archetype": "Omnichannel Phygital Healthcare & Smart Clinic Network",
        "gross_margin": "58% – 66%",
        "ltv_cac": "4.2x – 4.9x",
        "payback_months": "5 – 7 Months",
        "problem": "Chaotic clinic waiting rooms (45+ min wait times), fragmented paper prescriptions, lack of preventative follow-up, and disconnected in-clinic vs digital consultation records frustrating Indian families.",
        "solution": "Integrated omnichannel smart clinic blending high-efficiency physical outpatient care (OPD) with 24/7 digital teleconsults, ABDM ABHA health record sync, and chronic care management for {title}.",
        "customer_segments": [
            "Primary ICP: Working urban families requiring reliable, hygienic neighborhood outpatient care for children & seniors",
            "Chronic Care Patients: Individuals managing diabetes, hypertension, and thyroid requiring monthly monitoring",
            "Corporate Tech Workers: Professionals seeking zero-wait in-clinic appointments or instant video consults",
            "Local Neighborhood Residents: Walk-in patients seeking immediate qualified physician care and diagnostics"
        ],
        "value_proposition": "Eliminates clinic waiting room delays to under 10 minutes with smart digital tokens, unifies in-person visits with 24/7 follow-up teleconsults, and delivers full ABDM digital health record compliance.",
        "channels": [
            "Hyperlocal residential apartment health screening camps and doctor wellness talks",
            "Google Business Profile localized search targeting 'clinic near me', 'pediatrician near me', and 'smart clinic'",
            "Corporate employee wellness tie-ups with nearby business parks and IT corridors",
            "Satisfied patient word-of-mouth and family referral passes with diagnostic discounts"
        ],
        "key_partners": [
            "Certified Diagnostic Pathology Chains (Thyrocare, Lal PathLabs) for fast laboratory sample processing",
            "National Health Authority (NHA) for Ayushman Bharat Digital Mission (ABDM) compliance",
            "Pharmaceutical Distributors for direct inventory supply of authentic medicines",
            "Medical Equipment Suppliers for digital vitals monitors, ECG machines, and point-of-care analyzers"
        ],
        "key_activities": [
            "Delivering high-standard outpatient clinical consultations across general medicine and pediatrics",
            "Maintaining spotless clinical hygiene, calibrated diagnostic equipment, and cold-chain vaccine storage",
            "Managing patient digital queues, electronic health records, and automated WhatsApp follow-up alerts",
            "Executing monthly preventative health checkup drives in local residential societies"
        ],
        "key_resources": [
            "Modern, welcoming physical clinic facility (800–1,500 sq.ft) with consultation rooms and observation bay",
            "Roster of licensed, empathetic MBBS/MD physicians and certified nursing staff",
            "Proprietary smart queue management software and ABDM-certified EMR system",
            "Initial capital reserves of ₹{budget:,.0f} deployed for clinical fit-out, equipment, and operating runway"
        ],
        "cost_structure": [
            "Physician & Certified Clinical Staff Payroll (34% of monthly operating budget)",
            "Commercial Clinic Property Lease & High-Street Location Rent (22%)",
            "Pharmacy Inventory, Rapid Diagnostic Test Kits & Medical Consumables (18%)",
            "Clinic Facility Utilities, High-Speed Internet & Medical Waste Management (10%)",
            "Hyperlocal Marketing, Community Health Camps & Digital Operations (16%)"
        ],
        "revenue_streams": [
            "Walk-In OPD & Tele-Consult: ₹499 / visit (in-person doctor consultation or 24/7 video call + 3-day chat)",
            "Family Health & Preventive Care Pass: ₹2,499 / year (4 free OPD visits, unlimited teleconsults, 20% lab discount)",
            "Comprehensive Chronic Care VIP: ₹4,999 / year (dedicated family doctor, IoT vitals, free home sample collection)",
            "In-Clinic Rapid Diagnostics & Pharmacy Fulfillment: ₹250 – ₹1,800 per transaction"
        ],
        "key_metrics": [
            "Daily In-Clinic Footfall & Average Wait Time (<10 minutes target)",
            "Annual Family Care Plan Renewal Rate (Target >78%)",
            "Average Revenue Per Patient (ARPP > ₹1,850 via integrated pharmacy & lab tests)",
            "Net Promoter Score (NPS > +65 based on clinic hygiene and empathy)"
        ],
        "unfair_advantage": "Seamless phygital integration combining neighborhood physical clinic trust with instant 24/7 digital telemedicine and ABDM digital record portability, delivering higher patient retention than pure online apps or disorganized standalone clinics.",
        "detailed_explanation": "{title} bridges the gap between disconnected telemedicine apps and crowded traditional clinics. By capturing upfront recurring revenue through annual family health passes and monetizing in-house pharmacy and diagnostic tests, the clinic achieves high customer lifetime value and rapid unit profitability.",
        "pricing_tiers": [
            {"tier": "Walk-in OPD & Tele-Consult", "price": "₹499", "monthly_price": "₹499", "annual_price": "₹499", "period": "/ consultation", "target": "Walk-in patients & quick virtual consults", "features": "In-person doctor consultation or 24/7 video call, digital ABDM ABHA prescription, instant WhatsApp vitals summary, 3-day free follow-up chat"},
            {"tier": "Family Health Pass", "price": "₹2,499", "monthly_price": "₹249", "annual_price": "₹2,499", "period": "/ year", "target": "Urban families (up to 4 members)", "features": "4 free in-clinic OPD consultations/yr, unlimited 24/7 teleconsults, 20% discount on in-house diagnostics & pharmacy, smart clinic queue jump, annual preventative blood screening", "popular": True},
            {"tier": "Chronic Care VIP", "price": "₹4,999", "monthly_price": "₹499", "annual_price": "₹4,999", "period": "/ year", "target": "Diabetic, hypertension & senior citizen patients", "features": "Dedicated personal family physician, continuous IoT glucose & BP vitals monitoring, monthly free home blood sample collection, doorstep medicine delivery with 15% discount, emergency priority OPD triage"}
        ],
        "swot": {
            "strengths": [
                {"title": "High Trust Phygital Model", "desc": "Patients trust physical doctors significantly more than faceless online telemedicine apps, while valuing the digital convenience of instant chat follow-ups.", "impact": "Competitive Moat", "action": "Position clinic as the permanent family healthcare home for local residents."},
                {"title": "Compounding Annual Membership Cashflows", "desc": "Upfront family health pass subscriptions generate predictable recurring cashflows independent of seasonal illness spikes.", "impact": "Financial Stability", "action": "Drive annual membership conversions at every first-time walk-in OPD consultation."},
                {"title": "Integrated Ancillary Margins", "desc": "On-site pharmacy fulfillment and diagnostic laboratory tie-ups generate 40–50% gross margins on top of doctor consultation fees.", "impact": "Margin Expansion", "action": "Standardize doctor prescription links to instant in-clinic medicine dispensation."}
            ],
            "weaknesses": [
                {"title": "High Reliance on Quality Physician Talent", "desc": "Patient loyalty is closely tied to the interpersonal empathy and clinical competence of the primary consulting doctors.", "impact": "Operational Risk", "action": "Institute competitive doctor profit-share incentives and structured clinical standard operating procedures."},
                {"title": "Physical Clinic Capacity Constraints", "desc": "Consultation room capacity is physically capped during evening rush hours (6:00–9:00 PM).", "impact": "Revenue Ceiling", "action": "Incentivize afternoon visits and routine follow-up video consults during off-peak hours."}
            ],
            "opportunities": [
                {"title": "Cashless Outpatient (OPD) Health Insurance", "desc": "Indian health insurance providers are aggressively rolling out OPD insurance coverage that requires digital EMR integration.", "impact": "Massive Demand", "action": "Partner with major TPAs and health insurers to become a preferred cashless OPD network clinic."},
                {"title": "Chronic Disease AI Management Programs", "desc": "India has over 100 million diabetic and hypertensive patients requiring lifelong structured management.", "impact": "High LTV", "action": "Launch dedicated diabetic reversal and cardiac wellness annual care cohorts."},
                {"title": "Multi-Hub Hub-and-Spoke Expansion", "desc": "Proving the unit economics in the first neighborhood unlocks rapid expansion into adjacent residential clusters.", "impact": "Scale", "action": "Codify clinical and operational playbooks for turnkey second clinic launch."}
            ],
            "threats": [
                {"title": "Aggressive Hospital Chain Polyclinics", "desc": "Large corporate hospital chains (Apollo Clinic, Manipal Clinic) possess deep corporate marketing budgets.", "impact": "Brand Competition", "action": "Compete on warmer neighborhood community relationships, transparent pricing, and sub-10 minute wait times."},
                {"title": "Stringent Medical Regulatory Norms", "desc": "Clinical Establishment Acts and bio-medical waste disposal regulations require strict compliance.", "impact": "Compliance Overhead", "action": "Maintain dedicated quarterly regulatory audit checklists and certified medical waste disposal contracts."}
            ],
            "overall_assessment": "{title} represents the future of Indian outpatient healthcare. By pairing the deep human trust of a modern physical clinic with the friction-free efficiency of digital health subscriptions, the venture achieves exceptional customer loyalty and durable profitability."
        }
    },

    "hyperlocal_grocery": {
        "archetype": "Direct Farm-to-Table Hyperlocal Grocery & Phygital Retail",
        "gross_margin": "26% – 34%",
        "ltv_cac": "3.6x – 4.2x",
        "payback_months": "4 – 6 Months",
        "problem": "Pesticide-laden produce, multi-day supply chain delays causing nutritional loss, inflated middleman markups, and frustrating delivery delays for urban households seeking fresh organic food in India.",
        "solution": "Farm-to-fork hyperlocal supply network connecting regional organic farmer cooperatives directly with neighborhood micro-hubs, offering 30-minute doorstep delivery and walk-in retail for {title}.",
        "customer_segments": [
            "Primary ICP: Health-conscious urban families and young parents seeking certified chemical-free organic groceries",
            "Fitness & Wellness Enthusiasts: Individuals prioritizing pesticide-free vegetables, cold-pressed oils, and farm milk",
            "Daily Kitchen Shoppers: Households requiring daily morning deliveries of fresh greens, herbs, and unadulterated dairy",
            "Commercial Buyers: Local artisanal cafes and boutique bakeries seeking farm-fresh organic ingredients"
        ],
        "value_proposition": "Delivers freshly harvested pesticide-free organic produce directly from certified farms to kitchen counters in under 30 minutes at honest, transparent farm-gate prices.",
        "channels": [
            "Hyperlocal apartment resident association (RWA) morning sample tasting booths",
            "Localized Instagram and Meta video campaigns showcasing partner organic farms and harvest stories",
            "Google Local Business listing and high-visibility storefront signage in prime residential neighborhoods",
            "Neighbor referral loyalty programs: 'Gift a Fresh Organic Basket' with mutual wallet credits"
        ],
        "key_partners": [
            "Certified Organic Farmer Producer Organizations (FPOs) and regional agricultural cooperatives",
            "Electric Two-Wheeler (EV) fleet operators for zero-emission neighborhood delivery",
            "Biodegradable and eco-friendly packaging manufacturers for plastic-free vegetable crates",
            "Third-party organic certification and pesticide residue testing laboratories"
        ],
        "key_activities": [
            "Daily early morning farm harvest aggregation, quality grading, and cold-chain transit to micro-hub",
            "Strict chemical residue screening and freshness sorting before customer dispatch",
            "Micro-hub store inventory management, weight-based barcode scanning, and order packing (<4 mins)",
            "Customer subscription management for daily morning milk and curated vegetable baskets"
        ],
        "key_resources": [
            "Prime neighborhood ground-floor micro-hub (1,000–1,800 sq.ft) with cold-room storage and walk-in counter",
            "Direct procurement tie-ups with 20+ verified organic agricultural farms",
            "Dedicated, trained delivery fleet equipped with insulated temperature-controlled crates",
            "Initial capital reserves of ₹{budget:,.0f} deployed for cold-chain staging, store setup, and working inventory"
        ],
        "cost_structure": [
            "Direct Farm Produce Procurement & COGS (64% of gross revenue)",
            "Storefront Lease & Cold-Chain Micro-Hub Rent (12%)",
            "Delivery Fleet Rider Payouts, EV Charging & Logistics (11%)",
            "Store Operations Staff & Produce Handling Payroll (7%)",
            "Eco-Packaging, Quality Audits & Hyperlocal Marketing (6%)"
        ],
        "revenue_streams": [
            "Everyday Farm Fresh Shopper: ₹0 pay-per-order (direct farm-gate rates, free delivery >₹499)",
            "FreshClub Monthly Prime: ₹299 / month (₹2,499 / year, unlimited free 30-min delivery, 5% cashback, early slots)",
            "Farm-to-Table Family Annual VIP: ₹2,499 / year (daily milk/greens before 7 AM, quarterly fruit box, concierge)",
            "Private-Label Organic Pantry Staples: ₹150 – ₹850 per unit (cold-pressed oils, stone-ground flours, wild honey)"
        ],
        "key_metrics": [
            "Daily Order Volume & Average Order Value (Target AOV > ₹480)",
            "Produce Transit & Sorting Spoilage Rate (Strictly controlled under 3.5%)",
            "Order Dispatch Latency (<4 minutes from order ping to delivery rider bag)",
            "30-Day Customer Retention Rate (>65% for FreshClub subscribers)"
        ],
        "unfair_advantage": "Direct-from-farm procurement cutting out 3 traditional intermediary mandis, guaranteeing sub-12 hour harvest-to-table freshness while capturing 10–12% higher gross margin than conventional grocery aggregators.",
        "detailed_explanation": "{title} combines high-frequency daily kitchen essentials with high-margin organic staples. By pairing high-density delivery routes around neighborhood micro-hubs with upfront annual Prime subscriptions, the business achieves sustainable unit economics and rapid inventory turnover.",
        "pricing_tiers": [
            {"tier": "Everyday Farm Fresh Shopper", "price": "₹0", "monthly_price": "₹0", "annual_price": "₹0", "period": "/ pay-per-order", "target": "Casual walk-in retail shoppers & periodic app orders", "features": "Direct farm-gate organic vegetables & fruits, zero subscription commitment, free in-store click-and-collect, free doorstep delivery on orders above ₹499"},
            {"tier": "FreshClub Monthly Prime", "price": "₹299", "monthly_price": "₹299", "annual_price": "₹2,499", "period": "/ month", "target": "Weekly active households & organic cooking enthusiasts", "features": "Unlimited free 30-minute doorstep delivery, 5% cashback on all organic staples, early-morning harvest delivery slots (6:00–8:00 AM), zero peak-hour surge fees", "popular": True},
            {"tier": "Farm-to-Table Family Annual VIP", "price": "₹2,499", "monthly_price": "₹249", "annual_price": "₹2,499", "period": "/ year", "target": "Health-conscious families with daily kitchen consumption", "features": "Daily unadulterated farm milk & fresh greens delivery before 7:00 AM, weekly curated seasonal organic fruit box, dedicated WhatsApp nutritionist concierge, invitation to weekend farm tours"}
        ],
        "swot": {
            "strengths": [
                {"title": "Irreplaceable Harvest Freshness", "desc": "Produce reaches consumer kitchens within 12 hours of harvest compared to 48–72 hours for traditional supermarket chains.", "impact": "Core Product Moat", "action": "Stamp exact harvest time and partner farm name on every delivery parcel."},
                {"title": "High Order Frequency & Habitual Purchasing", "desc": "Households reorder fresh groceries 3–4 times per week, driving continuous cashflow velocity.", "impact": "High Customer LTV", "action": "Incentivize recurring automated morning milk and green vegetable subscription calendars."},
                {"title": "High-Margin Organic Private Label Add-Ons", "desc": "Packaging stone-ground flours, pure cow ghee, and cold-pressed oils yields 45%+ gross margins to subsidize fresh produce.", "impact": "Margin Multiplier", "action": "Prominently display private-label organic pantry staples at the checkout counter and app cart screen."}
            ],
            "weaknesses": [
                {"title": "Perishable Inventory Spoilage Risk", "desc": "Leafy greens and soft fruits degrade quickly if daily demand forecasting is inaccurate.", "impact": "Margin Erosion", "action": "Deploy dynamic evening flash sales and convert surplus produce into in-house cold-pressed juices."},
                {"title": "Agricultural Climate & Seasonality Dependency", "desc": "Monsoon rains or unseasonal heatwaves can temporarily disrupt specific vegetable yields.", "impact": "Supply Volatility", "action": "Diversify agricultural sourcing across 3 geographically distinct farming clusters."}
            ],
            "opportunities": [
                {"title": "Rising Consumer Demand for Clean Organic Food", "desc": "The Indian organic food market is growing at a 22% CAGR driven by health consciousness in Tier-1/2 metro cities.", "impact": "Market Expansion", "action": "Position brand as the ultimate trusted family source for verified chemical-free nutrition."},
                {"title": "B2B Supply to Premium Cafes & Cloud Kitchens", "desc": "High-end restaurants and health cafes pay premium contracted rates for reliable daily organic produce supply.", "impact": "Bulk Volume", "action": "Launch B2B institutional supply division with scheduled commercial morning deliveries."},
                {"title": "Micro-Hub Franchise Replicability", "desc": "A proven dark-store micro-hub model can be replicated across 20+ neighborhood catchments within the same city.", "impact": "Geographic Scale", "action": "Standardize micro-hub setup blueprint, cold-chain specs, and inventory SOPs."}
            ],
            "threats": [
                {"title": "Fierce Quick-Commerce Aggregator Competition", "desc": "Blinkit, Zepto, and Instamart compete aggressively with massive investor capital reserves.", "impact": "Price Pressure", "action": "Compete on authentic certified organic quality, farm traceability, and taste rather than subsidized junk food speed."},
                {"title": "Commodity Wholesale Price Fluctuations", "desc": "Spikes in wholesale vegetable prices during off-seasons can compress retail gross margins.", "impact": "Cost Squeeze", "action": "Sign seasonal fixed-price contracts with partner FPOs to insulate margins from spot mandi price spikes."}
            ],
            "overall_assessment": "{title} thrives by capturing the massive shift toward health-conscious, clean-label household consumption. By bypassing exploitative mandis and monetizing high-frequency grocery deliveries with private-label pantry staples, the business builds an enduring hyperlocal franchise."
        }
    },

    "artisan_bakery": {
        "archetype": "Artisanal Sourdough, French Patisserie & Specialty Cafe",
        "gross_margin": "64% – 72%",
        "ltv_cac": "3.8x – 4.5x",
        "payback_months": "4 – 6 Months",
        "problem": "Mass-produced factory bread packed with chemical emulsifiers and artificial preservatives, lack of authentic European slow-fermented sourdough, and stale commercial bakery goods frustrating discerning consumers in India.",
        "solution": "Craft bakery atelier specializing in 36-hour slow-fermented sourdough breads, handcrafted French laminated butter croissants, artisanal patisserie desserts, and specialty pour-over coffee for {title}.",
        "customer_segments": [
            "Primary ICP: Neighborhood residents, working professionals, and food connoisseurs seeking fresh artisanal bread",
            "Weekend Brunch Crowd: Families and couples seeking a charming European-style cafe ambiance",
            "Celebration & Event Hosts: Clients seeking custom designer celebration cakes and dessert tables",
            "Gourmet Cafes & Tech Offices: Local establishments seeking wholesale daily sourdough and pastry supply"
        ],
        "value_proposition": "Delivers European-standard artisanal breads slow-fermented for 36 hours with zero artificial additives, flaky French butter viennoiserie baked fresh daily at dawn, and bespoke celebration patisserie.",
        "channels": [
            "High-visibility street-level storefront with open bakery display counter and intoxicating baking aroma",
            "Hyperlocal Instagram & Meta Reels showcasing sourdough ear blisters, croissant crumb cross-sections, and live baking",
            "Direct neighborhood WhatsApp morning broadcast for daily freshly baked specials and limited-edition pastries",
            "Selective listing on food apps (Swiggy Gourmet / Zomato) used strictly for brand discovery"
        ],
        "key_partners": [
            "Specialized Flour Mills for organic unbleached stone-ground wheat, rye, and ancient grains",
            "Imported French & New Zealand Butter Importers for high-fat (84%) lamination butter sheets",
            "Specialty Coffee Roasters for single-origin Arabica espresso beans and pour-over roasts",
            "Custom Eco-Friendly Packaging Suppliers for biodegradable bakery boxes, bread sleeves, and cafe cups"
        ],
        "key_activities": [
            "Daily pre-dawn sourdough dough shaping, long cold-fermentation, and high-heat deck oven baking",
            "Precision temperature-controlled butter lamination for 27-layer French croissants and cruffins",
            "Handcrafting high-end patisserie entremets, tarts, and custom designer celebration cakes",
            "Maintaining spotless HACCP kitchen hygiene, sourdough mother starter health, and equipment maintenance"
        ],
        "key_resources": [
            "Charming commercial cafe and bakery facility (800–1,400 sq.ft) with high-footfall street frontage",
            "Commercial multi-deck stone ovens with steam injection, high-capacity spiral dough mixers, and reversible sheeters",
            "Master Baker & Pastry Chef with specialized culinary expertise in wild-yeast sourdough and French viennoiserie",
            "Initial capital reserves of ₹{budget:,.0f} deployed for bakery machinery, cafe fit-out, and initial ingredients"
        ],
        "cost_structure": [
            "Artisanal Ingredients: Specialty Flours, High-Fat Butter, Belgian Chocolate & Dairy (28% of revenue)",
            "Master Baker, Pastry Chefs & Front-of-House Barista Payroll (24%)",
            "Storefront Commercial Lease & High-Street High-Footfall Rent (18%)",
            "Commercial Bakery Electricity, Deck Oven Power & Clean Water Filtration (12%)",
            "Eco-Packaging, Waste Contingency & Local Performance Branding (18%)"
        ],
        "revenue_streams": [
            "Daily Loaf & Coffee Combo: ₹349 (freshly baked sourdough loaf or butter croissant + specialty coffee)",
            "Weekly Sourdough & Patisserie Box: ₹1,299 / week (2 signature sourdough loaves + 4 artisanal pastries, morning delivery)",
            "Custom Celebration & Luxury Atelier: ₹3,499 / order (1.5kg tiered designer artisanal cake, custom flavor profiling)",
            "Artisanal Spreads & Pantry Retail: ₹280 – ₹750 (house-made cultured butter, berry jams, sourdough crackers)"
        ],
        "key_metrics": [
            "Daily Sell-Through Rate (Target >92% of morning bake sold out by 7 PM)",
            "Average Transaction Value (AOV > ₹460 via coffee & pastry pairing)",
            "Ingredient Food Cost Percentage (Strictly controlled under 30%)",
            "Weekly Repeat Customer Rate (>40% neighborhood customer retention)"
        ],
        "unfair_advantage": "Living 5-year-old wild yeast sourdough mother starter delivering an irreplaceable, deep flavor profile and crust texture that commercial factory bakeries cannot replicate with commercial yeast.",
        "detailed_explanation": "{title} marries the irresistible aroma of freshly baked craft bread with high-margin specialty coffee and luxury celebratory cakes. By maintaining lean morning bake cycles and establishing direct weekly sourdough subscription deliveries, the bakery maximizes revenue per square foot and achieves rapid operational break-even.",
        "pricing_tiers": [
            {"tier": "Daily Loaf & Coffee Combo", "price": "₹349", "monthly_price": "₹349", "annual_price": "₹349", "period": "/ combo", "target": "Walk-in neighborhood breakfast & brunch patrons", "features": "Freshly baked sourdough loaf or butter croissant, artisanal pour-over specialty coffee, freshly whipped cultured butter, eco-friendly carry bag"},
            {"tier": "Weekly Sourdough Box", "price": "₹1,299", "monthly_price": "₹4,899", "annual_price": "₹1,299", "period": "/ week", "target": "Local households & gourmet connoisseurs", "features": "2 specialty sourdough loaves (seeded/rye/country), 4 handcrafted French patisserie pastries, weekly rotating seasonal preserves, free doorstep morning delivery", "popular": True},
            {"tier": "Luxury Celebration Atelier", "price": "₹3,499", "monthly_price": "₹3,499", "annual_price": "₹3,499", "period": "/ order", "target": "Celebrations, birthdays, anniversaries & tastings", "features": "1.5kg tiered designer artisanal celebration cake, custom flavor profiling (Belgian chocolate / Madagascar vanilla), dessert table presentation box, chef's tasting sampler"}
        ],
        "swot": {
            "strengths": [
                {"title": "Signature Craft Quality & Irreplaceable Aroma", "desc": "Real sourdough baking creates a potent sensory draw that drives organic foot traffic and customer delight.", "impact": "Sensory Moat", "action": "Time oven bakes to align with morning (7:30 AM) and evening (5:00 PM) commuter rushes."},
                {"title": "High-Margin Specialty Coffee Pairing", "desc": "Pour-over and espresso coffee sales deliver 75%+ gross margins on top of bread purchases.", "impact": "Margin Expansion", "action": "Train baristas on latte art and offer bundled coffee-and-croissant breakfast deals."},
                {"title": "Lucrative Celebration Cake Bookings", "desc": "Pre-ordered designer celebration cakes command high average order values (₹3,500+) with zero ingredient wastage.", "impact": "Profit Driver", "action": "Feature a dedicated custom cake consultation corner in the front retail area."}
            ],
            "weaknesses": [
                {"title": "Daily Perishability of Fresh Baked Goods", "desc": "Artisanal breads baked without chemical preservatives must be sold on the day of baking.", "impact": "Inventory Risk", "action": "Repurpose unsold day-old sourdough into high-margin gourmet croutons, bread pudding, and sourdough crisps."},
                {"title": "High Dependency on Specialized Head Baker", "desc": "Lamination and sourdough fermentation require nuanced technical mastery of dough temperature and humidity.", "impact": "Talent Risk", "action": "Codify exact hydration percentages, dough temperatures, and baking schedules into clear visual standard operating procedures (SOPs)."}
            ],
            "opportunities": [
                {"title": "Weekly Sourdough Subscription Model", "desc": "Delivering fresh artisan loaves to subscribed residential apartments every Tuesday and Friday locks in recurring revenue.", "impact": "Predictable Cashflow", "action": "Launch the 'Crust Club' weekly sourdough subscription pass with free doorstep delivery."},
                {"title": "B2B Wholesale Supply to Boutique Cafes", "desc": "Independent local cafes and boutique hotels prefer outsourcing premium bread rather than operating expensive bakery machinery.", "impact": "Bulk Volume", "action": "Offer early-morning wholesale bread deliveries to 10 non-competing specialty cafes."},
                {"title": "Weekend Sourdough & Baking Masterclasses", "desc": "Food enthusiasts enthusiastically pay ₹2,500–₹4,000 for hands-on weekend bread-making workshops during quiet mid-day hours.", "impact": "High-Margin Community", "action": "Host monthly Sunday afternoon sourdough masterclasses to build passionate brand advocates."}
            ],
            "threats": [
                {"title": "Rising Imported Ingredient Costs", "desc": "Fluctuations in the price of imported butter, specialty cocoa, and European chocolate can compress margins.", "impact": "Cost Squeeze", "action": "Partner directly with emerging Indian craft dairy and chocolate makers for premium domestic alternatives."},
                {"title": "Commercial Bakery Imitators", "desc": "Industrial bakeries market factory-produced commercial bread with caramel coloring under misleading 'sourdough' labels.", "impact": "Market Confusion", "action": "Educate patrons through transparent open-kitchen tours showcasing the live 36-hour slow-fermentation process."}
            ],
            "overall_assessment": "{title} occupies a prestigious and highly profitable position in modern urban gastronomy. By blending authentic European baking craftsmanship with high-margin specialty coffee and recurring weekly bread subscriptions, the bakery establishes a defensible, beloved neighborhood institution."
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
            f"Starter Tier: ₹499 / month (₹399 / mo on annual plan, core essentials for small operators)",
            f"Growth Tier: ₹1,499 / month (₹1,199 / mo on annual plan, multi-seat collaboration & analytics)",
            f"Enterprise Tier: ₹4,999 / month (₹3,999 / mo on annual plan, custom integrations & SLAs)",
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
        "pricing_tiers": (
            [
                {"tier": "Standard Walk-in / Base Pass", "price": "₹499", "monthly_price": "₹499", "annual_price": "₹4,990", "period": "/ month", "target": "Regular local customers & walk-ins", "features": f"Core on-premise {ind} access, standard service fulfillment, digital receipt"},
                {"tier": "Preferred Regular Member", "price": "₹1,499", "monthly_price": "₹1,499", "annual_price": "₹14,390", "period": "/ month", "target": "High-frequency local patrons", "features": f"Unlimited monthly access, priority queue booking, 10% discount on add-ons, personalized service", "popular": True},
                {"tier": "VIP / Corporate Package", "price": "₹3,999", "monthly_price": "₹3,999", "annual_price": "₹39,990", "period": "/ month", "target": "VIP clients & corporate group accounts", "features": f"Dedicated relationship coordinator, zero-waiting priority slots, custom requested accommodations, complimentary hospitality perks"}
            ] if ('offline' in (str(context.get('sector', '')) + ' ' + str(context.get('business_type', ''))).lower() or 'physical' in (str(context.get('sector', '')) + ' ' + str(context.get('business_type', ''))).lower()) else (
            [
                {"tier": "Basic Digital + Store Pass", "price": "₹299", "monthly_price": "₹299", "annual_price": "₹2,870", "period": "/ month", "target": "Periodic shoppers & digital users", "features": f"Digital app access, storefront express pickup, standard tracking alerts"},
                {"tier": "Omnichannel Prime Pass", "price": "₹899", "monthly_price": "₹899", "annual_price": "₹8,630", "period": "/ month", "target": "Weekly active patrons", "features": f"Free doorstep fulfillment, priority in-store service counter, 5% cashback on all orders, WhatsApp concierge", "popular": True},
                {"tier": "Family All-Access Executive", "price": "₹2,499", "monthly_price": "₹2,499", "annual_price": "₹23,990", "period": "/ month", "target": "Full household accounts", "features": f"Unlimited free doorstep deliveries, zero surge fees during peak hours, dedicated relationship manager, priority slots"}
            ] if ('hybrid' in (str(context.get('sector', '')) + ' ' + str(context.get('business_type', ''))).lower() or 'phygital' in (str(context.get('sector', '')) + ' ' + str(context.get('business_type', ''))).lower()) else
            [
                {"tier": "Starter", "price": "₹499", "monthly_price": "₹499", "annual_price": "₹4,788", "period": "/ month", "target": "Early adopters & small teams", "features": f"Core {ind} toolkit, standard analytics, email & chat support, 2 user seats"},
                {"tier": "Professional", "price": "₹1,499", "monthly_price": "₹1,499", "annual_price": "₹14,388", "period": "/ month", "target": "Growing businesses & active operators", "features": "Advanced workflows, multi-seat collaboration, automated reporting, priority support", "popular": True},
                {"tier": "Enterprise", "price": "₹4,999", "monthly_price": "₹4,999", "annual_price": "₹47,988", "period": "/ month", "target": "Large institutions & multi-location groups", "features": "Dedicated instance, custom ERP integration, 99.9% uptime SLA, 24/7 account manager"}
            ]
        )),
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
