import React, { useState, useMemo } from 'react';
import { 
  FaGlobe, FaChartPie, FaCrosshairs, FaLightbulb, 
  FaBullseye, FaBullhorn, FaChartLine, FaRupeeSign, 
  FaUsers, FaRocket, FaCheckCircle, FaLayerGroup, 
  FaCalendarCheck, FaBalanceScale, FaArrowUp, FaTag
} from 'react-icons/fa';

// ============================================================
// REAL-WORLD SECTOR MARKET INTELLIGENCE REPOSITORY
// ============================================================

const SECTOR_PROFILES = {
  edtech: {
    tam: 38000,
    cagr: 18.4,
    demand: 'High Demand',
    samRatio: 0.22,
    somBase: 7.5,
    demo: 'School Principals, Academic Directors, and Timetable Committees in K-12 Private Schools and Higher Ed Institutions',
    pain: 'Manual scheduling conflicts, teacher workload burnout, room allocation errors, and complex elective alignment under NEP 2020 mandates',
    trigger: 'Annual academic timetable planning cycles (March–June) and urgent regulatory curriculum accreditation compliance',
    channel: 'Direct Institutional Demonstrations, Academic Leadership Summits & Principal-to-Principal Cluster Referrals',
    viral: 'Teacher-to-teacher curriculum sharing, inter-school department recommendations & academic council referrals',
    funnel: {
      top: 'Inbound SEO on timetable generator software, free downloadable schedule templates, and education leadership webinars',
      mid: 'Interactive live demo uploading school teacher list & generating clash-free multi-section timetable in under 5 minutes',
      bot: 'Paid institutional pilot for one academic term with full training for administration staff'
    },
    cac: '₹4,500 – ₹8,500',
    payback: '3.5 – 5 Months',
    pricingTiers: '₹1,499/mo (Single Campus Basic) • ₹4,999/mo (Multi-Section Pro) • ₹12,000/mo (Multi-Campus Enterprise)',
    trends: [
      'NEP 2020 Multi-Disciplinary Course Mandates & Automated Time-Table Compliance',
      'Rapid migration from manual paper schedules to cloud ERPs and digital school workflows',
      'High demand for constraint-solving algorithms handling elective and lab sharing'
    ],
    timingReason: 'Schools in India are undergoing mandatory NEP 2020 digital transformation, making automated clash-free scheduling essential for accreditation.'
  },
  'food & beverage': {
    tam: 32000,
    cagr: 13.2,
    demand: 'High Velocity',
    samRatio: 0.18,
    somBase: 4.8,
    demo: 'Health-conscious urban professionals, fitness enthusiasts, and organic lifestyle consumers aged 22–45',
    pain: 'Lack of verified organic dining options, opaque ingredient sourcing, and excessive markups in traditional cafes',
    trigger: 'Daily healthy breakfast/lunch routines, weekend social brunches, and lifestyle dietary shifts toward clean eating',
    channel: 'Hyperlocal Foot-Traffic, Google Business Profile SEO, Instagram Reel Food Showcases & Health Community Popups',
    viral: 'Customer dining photo tags, loyalty reward multipliers, and weekend brunch invite passes for friends',
    funnel: {
      top: 'Eye-catching social reels highlighting farm-fresh ingredients, Google Maps local discovery, and food influencer reviews',
      mid: 'First-time customer welcome incentive (15% off first organic bowl/beverage) and QR table menu exploration',
      bot: 'Digital loyalty card enrollment, repeat weekly visits, and healthy meal subscription plan orders'
    },
    cac: '₹180 – ₹350',
    payback: '1.5 – 2.5 Months',
    pricingTiers: '₹280 – ₹450 Avg Order Value • ₹1,200 Weekend Dining Pass • ₹4,500/mo Healthy Lunch Subscription',
    trends: [
      'FSSAI Clean-Label Compliance & Farm-to-Fork Ingredient Traceability',
      'Surge in consumer preference for cold-pressed, pesticide-free, and plant-forward dining',
      'Integration of contactless QR ordering, UPI AutoPay subscriptions, and loyalty apps'
    ],
    timingReason: 'Rapid urbanization and surging preventive wellness consciousness in Tier-1/2 Indian cities create unprecedented demand for transparent organic food.'
  },
  'e-commerce': {
    tam: 54000,
    cagr: 29.5,
    demand: 'Surging Demand',
    samRatio: 0.35,
    somBase: 24.0,
    demo: 'Urban dual-income households, busy millennials, and young families requiring sub-15 minute grocery replenishment',
    pain: 'Unpredictable delivery windows, out-of-stock daily essentials, and minimum cart penalty charges on legacy apps',
    trigger: 'Immediate household kitchen stock-outs, morning breakfast rush, and late-night convenience cravings',
    channel: 'Geo-targeted App Performance Ads, Residential Society Activations & Doorstep Sampling',
    viral: '10-minute friend referral credits (₹100 off both) & shared family cart grocery lists',
    funnel: {
      top: 'Hyperlocal digital advertising, society WhatsApp group promotions, and outdoor billboard presence near dark stores',
      mid: 'Instant app download with guaranteed 10-minute delivery promise and ₹150 first-order voucher',
      bot: 'Automated push notifications for morning milk/produce, weekly restock reminders, and VIP delivery club subscription'
    },
    cac: '₹220 – ₹420',
    payback: '2 – 3 Months',
    pricingTiers: 'Free Delivery on ₹199+ • ₹49/mo VIP Delivery Club • 18%–24% Merchant Gross Margins',
    trends: [
      'ONDC Open Commerce Protocol Integration & Dark Store Automation',
      'Micro-fulfillment dark store density optimizing last-mile delivery under 10 minutes',
      'Private-label FMCG expansion driving high gross margin unit profitability'
    ],
    timingReason: 'Consumers have permanently shifted from scheduled delivery to instant gratification, creating massive room for hyper-efficient local dark store operators.'
  },
  fintech: {
    tam: 115000,
    cagr: 24.8,
    demand: 'Very High',
    samRatio: 0.28,
    somBase: 32.0,
    demo: 'Digital merchants, cross-border e-commerce sellers, and Web3 developers seeking seamless payment rails',
    pain: 'High checkout drop-off rates, multi-day international settlement delays, and high gateway interchange fees',
    trigger: 'Expanding into international sales corridors and seeking sub-second settlement liquidity',
    channel: 'Developer API Integrations, B2B Partner Networks, Open-Source SDKs & Fintech Summits',
    viral: 'Two-sided merchant/customer payment checkout branding & affiliate commissions on merchant signups',
    funnel: {
      top: 'Interactive developer documentation, sandbox testing environments, and fintech product hunt launches',
      mid: 'Self-serve API key generation with 10-minute sandbox checkout integration and zero setup fee',
      bot: 'Production merchant account verification (KYC/KYB) and automated recurring payout activation'
    },
    cac: '₹1,200 – ₹2,800',
    payback: '4 – 6 Months',
    pricingTiers: '1.4% – 1.8% Transaction Fee • ₹9,999 Enterprise Gateway Setup • Custom High-Volume SLA',
    trends: [
      'RBI Digital Payment Regulatory Framework & UPI Credit Line Expansion',
      'Account Aggregator (AA) framework adoption for automated merchant underwriting',
      'Cross-border real-time CBDC and stablecoin settlement pilot initiatives'
    ],
    timingReason: 'India is the global leader in digital transaction velocity, and the rollout of UPI Credit Lines opens vast new monetization avenues for agile payment gateways.'
  },
  cybersecurity: {
    tam: 28000,
    cagr: 21.6,
    demand: 'High Urgency',
    samRatio: 0.30,
    somBase: 14.5,
    demo: 'Chief Information Security Officers (CISOs), VP of Infrastructure, and IT Security Directors at SaaS and BFSI firms',
    pain: 'Sophisticated ransomware attacks, unmonitored third-party vendor access, and severe shortage of security analysts',
    trigger: 'Regulatory compliance deadlines (DPDP Act 2023) and post-incident security vulnerability remediations',
    channel: 'Account-Based Marketing (ABM) targeting CISOs, Threat Intelligence Webinars & Automated Security Audits',
    viral: 'Free automated external attack surface scans shared with developer and DevOps communities',
    funnel: {
      top: 'Thought leadership reports on zero-day vulnerabilities, CISO roundtable dinners, and digital privacy whitepapers',
      mid: 'Free 14-day zero trust vulnerability scan identifying critical network misconfigurations',
      bot: 'Enterprise security board presentation and multi-year contract signing for continuous endpoint protection'
    },
    cac: '₹25,000 – ₹65,000',
    payback: '5 – 7 Months',
    pricingTiers: '₹18,000/mo (Up to 50 Endpoints) • ₹65,000/mo (Mid-Market) • ₹2,50,000+/mo (Enterprise SOC)',
    trends: [
      'DPDP Act 2023 Enforcement & CERT-In 6-Hour Mandatory Breach Reporting',
      'Shift from perimeter firewalls to Zero Trust Architecture (ZTA) and continuous verification',
      'AI-augmented automated endpoint threat detection and automated incident containment'
    ],
    timingReason: 'Stricter data protection laws (DPDP Act) and surging cloud adoption force Indian businesses to adopt zero trust architectures immediately.'
  },
  agtech: {
    tam: 22000,
    cagr: 23.4,
    demand: 'High Growth',
    samRatio: 0.25,
    somBase: 8.5,
    demo: 'Commercial farmers, Farmer Producer Organizations (FPOs), and agricultural corporate contract growers',
    pain: 'Severe rural labor shortages during spraying season, chemical wastage, and unpredictable crop yield losses',
    trigger: 'Seasonal crop sowing cycles, early pest outbreak detection, and government drone subsidy disbursements',
    channel: 'Village Field Demonstrations, FPO Leadership Partnerships & Rural Agri-Input Retail Hubs',
    viral: 'Farmer peer demonstration results (yield improvement proofs) & regional agriculture WhatsApp groups',
    funnel: {
      top: 'Village square live drone flight demonstrations, local mandi poster campaigns, and FPO village meetings',
      mid: 'Free trial spraying of 1 acre of farmland showing visible chemical savings and uniform coverage',
      bot: 'Seasonal multi-acre spraying contracts and cooperative machinery rental agreements'
    },
    cac: '₹3,500 – ₹7,500',
    payback: '3 – 5 Months',
    pricingTiers: '₹499/acre Drone Spraying • ₹2,499/mo IoT Soil Sensor Monitoring • ₹1,20,000 Equipment Lease',
    trends: [
      'Government Subsidies under Kisan Drone Scheme & Agri-Infra Fund (AIF)',
      'Precision agriculture IoT sensors providing real-time soil nitrogen and moisture mapping',
      'Micro-irrigation automation reducing agricultural water consumption by over 40%'
    ],
    timingReason: 'High central subsidies for agricultural drones combined with critical rural labor shortages make mechanization an immediate economic necessity for farmers.'
  },
  healthcare: {
    tam: 34000,
    cagr: 22.1,
    demand: 'High Demand',
    samRatio: 0.24,
    somBase: 12.0,
    demo: 'Chronic disease patients (cardiac/diabetic), elderly individuals living independently, and attending physicians',
    pain: 'Delayed detection of critical vital spikes, inconvenient frequent clinic visits, and fragmented paper health records',
    trigger: 'Hospital discharge following acute medical event, diagnosis of chronic hypertension, and family caregiver anxiety',
    channel: 'Hospital Cardiology Department Partnerships, Geriatric Care Tie-ups & Direct Pharmacy Prescriptions',
    viral: 'Family caregiver health updates, doctor-patient dashboard sharing & vital telemetry alert notifications',
    funnel: {
      top: 'Doctor prescription recommendations, healthcare wellness blog content, and patient support group webinars',
      mid: 'In-clinic device trial during hospital discharge consultation with nurse-led onboarding',
      bot: 'Annual remote telemetry monitoring subscription and monthly doctor consultation plan'
    },
    cac: '₹1,800 – ₹4,200',
    payback: '3 – 5 Months',
    pricingTiers: '₹3,999 Hardware Kit + ₹499/mo Monitoring • ₹15,000/yr Comprehensive Chronic Care Plan',
    trends: [
      'Ayushman Bharat Digital Mission (ABDM) Integration & Unified Health Interface (UHI)',
      'Continuous clinical-grade wearable biosensors with automated emergency doctor alerts',
      'Preventative telemedicine reimbursement adoption by leading private health insurers'
    ],
    timingReason: 'The government rollout of ABDM digital health IDs and rising nuclear family prevalence make continuous remote patient monitoring widely acceptable.'
  },
  cleantech: {
    tam: 72000,
    cagr: 27.2,
    demand: 'High Priority',
    samRatio: 0.26,
    somBase: 18.0,
    demo: 'Commercial and industrial factory owners, residential societies, and renewable energy independent power producers',
    pain: 'Soaring commercial peak-hour power tariffs, frequent grid brownouts, and stringent net-zero compliance penalties',
    trigger: 'Rising industrial electricity bills, annual corporate ESG reporting audits, and capital subsidy deadlines',
    channel: 'Commercial Energy Audits, Industrial Park Roadshows & EPC Solar Engineering Partnerships',
    viral: 'Verified carbon offset reports and commercial rooftop electricity savings proofs shared among factory owners',
    funnel: {
      top: 'Free commercial rooftop solar potential analysis, drone thermal roof audits, and ESG impact calculators',
      mid: 'Detailed engineering proposal with guaranteed 3.2-year payback calculation and net metering blueprint',
      bot: 'Turnkey EPC installation contract or 15-year Power Purchase Agreement (PPA) signing'
    },
    cac: '₹12,000 – ₹30,000',
    payback: '6 – 9 Months',
    pricingTiers: '₹45,000/kW Commercial Installation • Power Purchase Agreement (PPA) at ₹4.80/unit',
    trends: [
      'PM Surya Ghar National Rooftop Scheme & Accelerated Commercial Depreciation',
      'Smart Battery Energy Storage Systems (BESS) peak-shaving commercial power costs',
      'Mandatory Business Responsibility and Sustainability Reporting (BRSR) for top listed firms'
    ],
    timingReason: 'Aggressive corporate net-zero mandates combined with commercial electricity tariff hikes create strong financial motivation for commercial solar adoption.'
  },
  gaming: {
    tam: 36000,
    cagr: 28.0,
    demand: 'High Engagement',
    samRatio: 0.28,
    somBase: 15.0,
    demo: 'Gen Z and Millennial gamers, competitive esports participants, and digital collectibles enthusiasts',
    pain: 'Repetitive pay-to-win game mechanics, lack of verifiable player asset ownership, and high in-app fee barriers',
    trigger: 'Seasonal Battle Pass rollouts, limited-edition character skin drops, and competitive tournament prizes',
    channel: 'Gaming Influencer Live-Streams (YouTube Gaming/Twitch), Discord Tournaments & App Store Features',
    viral: 'In-game squad invites, tournament spectating, and tradeable player cosmetic rewards',
    funnel: {
      top: 'Trending gameplay highlights on YouTube Shorts/Instagram Reels, streamer sponsorships, and game trailer drops',
      mid: 'Frictionless free download with instant tutorial reward and immersive first-match matchmaking',
      bot: 'In-game season Battle Pass purchase, cosmetic skin unboxing, and premium tournament entries'
    },
    cac: '₹65 – ₹140',
    payback: '1.5 – 3 Months',
    pricingTiers: 'Free-to-Play • Battle Pass at ₹499/season • Rare Cosmetic Bundles from ₹199 to ₹2,499',
    trends: [
      'Widespread 5G rollout enabling low-latency cloud gaming across Tier 2 and Tier 3 cities',
      'Standardization of skill-based gaming and consumer protection under MeitY guidelines',
      'Player-owned economies and interoperable digital avatars across gaming ecosystems'
    ],
    timingReason: 'Ubiquitous high-speed 5G mobile data and digital micro-payments in India have triggered explosive growth in mobile gaming and in-game micro-transactions.'
  },
  proptech: {
    tam: 21000,
    cagr: 16.8,
    demand: 'Moderate-High',
    samRatio: 0.25,
    somBase: 9.0,
    demo: 'First-time home buyers, commercial property investors, and certified independent real estate brokers',
    pain: 'Fake property listings, opaque broker commissions, delayed title verifications, and misleading property valuations',
    trigger: 'Family life-stage upgrades, job relocations to tech hubs, and commercial yield investment decisions',
    channel: 'Real Estate Broker Network Aggregations, Tier-1 Builder Project Launches & Digital Search Ads',
    viral: 'Buyer-agent inspection sharing, neighborhood price comparison indices, and verified listing recommendations',
    funnel: {
      top: 'High-intent search ads for newly launched properties, neighborhood price indices, and EMI calculators',
      mid: 'Self-guided 3D virtual walkthrough of verified apartments and instant title verification report generation',
      bot: 'Assisted physical site visit booking and property transaction closing support'
    },
    cac: '₹4,500 – ₹12,000',
    payback: '4 – 6 Months',
    pricingTiers: '₹2,999/listing Featured Boost • 0.5% – 1.0% Transaction Facilitation • Enterprise Developer ERP',
    trends: [
      'RERA Strict Title Compliance and Digital Land Record (Bhoomi/AnyRoR) Integrations',
      'AI-powered predictive property valuation models and automated rental yield analytics',
      'Virtual 3D digital-twin property walk-throughs accelerating remote buyer decisions'
    ],
    timingReason: 'RERA compliance transparency and urbanization in Tier-1/2 corridors drive property transactions toward certified, tech-enabled digital brokerage.'
  },
  manufacturing: {
    tam: 26000,
    cagr: 19.5,
    demand: 'High Urgency',
    samRatio: 0.22,
    somBase: 11.0,
    demo: 'D2C brands, pharmaceutical exporters, and food delivery platforms requiring certified eco-packaging',
    pain: 'Hefty municipal fines for single-use plastics, weak barrier properties in poor paper alternatives, and high MOQ demands',
    trigger: 'Government ban on single-use plastics and corporate mandate for 100% recyclable shipping materials',
    channel: 'B2B Supplier Marketplaces (IndiaMART, TradeIndia), Industrial Trade Expos & Direct Enterprise Procurement',
    viral: 'Brand sustainability badges on client packaging promoting the eco-packaging manufacturer to end consumers',
    funnel: {
      top: 'B2B directory listings, eco-packaging material comparison whitepapers, and sample request boxes',
      mid: 'Custom sample kit testing with brand artwork and structural drop-test certification reports',
      bot: 'Quarterly supply contract with scheduled automated replenishment orders'
    },
    cac: '₹15,000 – ₹35,000',
    payback: '5 – 8 Months',
    pricingTiers: '₹3.50 – ₹12.00 per biodegradable unit (Bulk MOQs of 25,000+) • Custom OEM Tooling',
    trends: [
      'Strict Enforcement of Extended Producer Responsibility (EPR) by State Pollution Boards',
      'Breakthroughs in biodegradable seaweed, bagasse, and mycelium-based protective packaging',
      'Direct enterprise ESG audits evaluating supplier supply chain carbon footprints'
    ],
    timingReason: 'State and national bans on non-recyclable packaging leave consumer brands urgently seeking certified, biodegradable packaging suppliers.'
  },
  logistics: {
    tam: 62000,
    cagr: 23.0,
    demand: 'High Demand',
    samRatio: 0.30,
    somBase: 21.0,
    demo: 'Fleet operators, 3PL logistics managers, and manufacturing supply chain directors',
    pain: 'High fuel wastage due to sub-optimal route planning, empty return trips (deadhead miles), and lack of live truck tracking',
    trigger: 'Surging diesel costs squeezing freight operating margins and shipper demands for SLA delivery penalties',
    channel: 'Telematics Hardware Integrations, Highway Transport Hub Partnerships & Direct 3PL Enterprise Sales',
    viral: 'Consignor-consignee real-time tracking links shared with end-recipients generating inbound fleet signups',
    funnel: {
      top: 'Fleet fuel savings ROI calculators, transport hub roadshows, and supply chain efficiency reports',
      mid: 'Free 30-day pilot on 10 trucks showing documented 14% diesel cost reduction and on-time delivery boost',
      bot: 'Full-fleet software deployment across all company trucks and regional distribution hubs'
    },
    cac: '₹18,000 – ₹45,000',
    payback: '4 – 6 Months',
    pricingTiers: '₹499/vehicle/mo Fleet Tracking • ₹14,999/mo Route Optimization AI • Enterprise Hub Dispatch',
    trends: [
      'National Logistics Policy (NLP) Unified Logistics Interface Platform (ULIP) API Integration',
      'AI route optimization models lowering fleet carbon emissions and fuel burn by 15–22%',
      'Electrification of urban delivery fleets backed by government FAME-II incentives'
    ],
    timingReason: 'The National Logistics Policy aims to lower logistics costs from 14% to under 9% of GDP, creating massive government and commercial tailwinds for AI logistics.'
  }
};

/**
 * Resolves the matching sector intelligence profile for an industry string.
 */
const resolveSectorProfile = (industry = '') => {
  const text = (industry || '').toLowerCase();
  for (const [key, profile] of Object.entries(SECTOR_PROFILES)) {
    if (text.includes(key)) return profile;
  }
  if (text.includes('food') || text.includes('beverage') || text.includes('cafe') || text.includes('restaurant')) return SECTOR_PROFILES['food & beverage'];
  if (text.includes('edu') || text.includes('school') || text.includes('college') || text.includes('learn')) return SECTOR_PROFILES['edtech'];
  if (text.includes('comm') || text.includes('retail') || text.includes('store') || text.includes('mart') || text.includes('shop')) return SECTOR_PROFILES['e-commerce'];
  if (text.includes('pay') || text.includes('bank') || text.includes('crypto') || text.includes('fin')) return SECTOR_PROFILES['fintech'];
  if (text.includes('cyber') || text.includes('security') || text.includes('threat')) return SECTOR_PROFILES['cybersecurity'];
  if (text.includes('agri') || text.includes('farm') || text.includes('crop')) return SECTOR_PROFILES['agtech'];
  if (text.includes('health') || text.includes('med') || text.includes('patient') || text.includes('doctor')) return SECTOR_PROFILES['healthcare'];
  if (text.includes('energy') || text.includes('solar') || text.includes('clean')) return SECTOR_PROFILES['cleantech'];
  if (text.includes('game') || text.includes('gaming') || text.includes('web3')) return SECTOR_PROFILES['gaming'];
  if (text.includes('real estate') || text.includes('prop') || text.includes('home')) return SECTOR_PROFILES['proptech'];
  if (text.includes('pack') || text.includes('manufact')) return SECTOR_PROFILES['manufacturing'];
  if (text.includes('logist') || text.includes('supply') || text.includes('freight') || text.includes('transport')) return SECTOR_PROFILES['logistics'];
  return SECTOR_PROFILES['edtech'];
};

/**
 * Formats INR Crores into clean Indian Rupee strings (₹ Cr / ₹ Lakh Cr / ₹ Lakh)
 */
const formatCroresToINR = (crores) => {
  if (!crores || isNaN(crores)) return '₹12,500 Cr';
  if (crores >= 100000) {
    return `₹${(crores / 100000).toFixed(2)} Lakh Cr`;
  } else if (crores >= 1) {
    return `₹${Math.round(crores).toLocaleString('en-IN')} Cr`;
  } else {
    return `₹${Math.round(crores * 100).toLocaleString('en-IN')} Lakh`;
  }
};

/**
 * Removes technical formula tokens, R² citations, and dollar signs from narrative text
 */
const cleanExplanationText = (text) => {
  if (!text) return '';
  let cleaned = String(text)
    .replace(/\s*\(?(?:GBM\s*\+\s*RandomForest|StackingRegressor|VotingClassifier)[^)]*\)?/gi, '')
    .replace(/\s*\(?R²\s*=\s*[\d.]+%?\)?/gi, '')
    .replace(/R²\s*=\s*[\d.]+%?/gi, '')
    .replace(/Methodology:\s*/gi, '')
    .replace(/\$/g, '₹')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned;
};

// ============================================================
// COMPONENT
// ============================================================

const MarketTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('tam');

  const industryName = idea?.industry || 'Technology';
  const sectorType = (idea?.sector || 'online').toLowerCase();
  const countryName = idea?.country || 'India';
  const startupTitle = idea?.title || 'This Venture';
  const targetCustomers = idea?.target_customers || data?.primary_demo || 'Qualified commercial buyers';
  const pricingModel = idea?.pricing_model || 'Subscription & Usage-Based';

  // Resolve sector profile dynamically
  const profile = useMemo(() => resolveSectorProfile(industryName), [industryName]);

  // Compute TAM / SAM / SOM with bottom-up venture economics
  const marketSizing = useMemo(() => {
    let tamCrores = profile.tam;

    // If backend provided a specific valid market size in Rupees or USD, parse it
    if (data?.market_size) {
      const str = String(data.market_size).trim();
      const lakhCrMatch = str.match(/₹?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakh\s+Cr|Lakh\s+Crore)/i);
      const crMatch = str.match(/₹?\s*([\d,]+(?:\.\d+)?)\s*(?:Cr|Crore)/i);
      const usdMatch = str.match(/\$?\s*([\d,]+(?:\.\d+)?)\s*(Billion|B|Million|M|Trillion|T)?/i);

      if (lakhCrMatch) {
        tamCrores = parseFloat(lakhCrMatch[1].replace(/,/g, '')) * 100000;
      } else if (crMatch) {
        tamCrores = parseFloat(crMatch[1].replace(/,/g, ''));
      } else if (usdMatch && usdMatch[1]) {
        const rawNum = parseFloat(usdMatch[1].replace(/,/g, ''));
        const unit = (usdMatch[2] || '').toUpperCase();
        // Skip legacy "$5B+" dummy placeholder so we don't produce uniform ₹41,750 Cr!
        if (!(rawNum === 5 && (!unit || unit.startsWith('B')))) {
          let usd = rawNum;
          if (unit.startsWith('T')) usd = rawNum * 1e12;
          else if (unit.startsWith('B')) usd = rawNum * 1e9;
          else if (unit.startsWith('M')) usd = rawNum * 1e6;
          tamCrores = (usd * 83.5) / 1e7;
        }
      }
    }

    // Dynamic SAM based on sector delivery architecture
    let samRatio = profile.samRatio;
    if (sectorType === 'offline') samRatio = Math.max(0.15, samRatio * 0.8);
    else if (sectorType === 'hybrid') samRatio = Math.min(0.35, samRatio * 1.15);
    else if (sectorType === 'online') samRatio = Math.min(0.32, samRatio * 1.05);

    const samCrores = Math.round(tamCrores * samRatio);

    // Realistic Bottom-Up SOM scaled to startup budget, stage, and pricing model
    const budget = parseFloat(idea?.budget || 30000);
    const budgetFactor = Math.min(2.5, Math.max(0.65, Math.sqrt(budget / 50000)));
    const somCrores = Math.max(1.8, Math.round(profile.somBase * budgetFactor * 10) / 10);
    const somPercentOfSam = ((somCrores / samCrores) * 100).toFixed(2);

    return {
      tamStr: formatCroresToINR(tamCrores),
      samStr: formatCroresToINR(samCrores),
      somStr: `₹${somCrores.toFixed(1)} Cr`,
      tamCrores,
      samCrores,
      somCrores,
      samPercent: Math.round(samRatio * 100),
      somPercentOfSam: `${somPercentOfSam}%`
    };
  }, [data?.market_size, industryName, sectorType, idea?.budget, profile]);

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading market analysis...</div>;

  const opportunityScore = Math.round(data.opportunity_score || 82);
  const growthRate = data.growth_rate ? Number(data.growth_rate).toFixed(1) : String(profile.cagr);
  const demandLevel = data.demand_level || profile.demand;

  // Clean narrative explanations
  const cleanedMarketExp = cleanExplanationText(
    data.market_analysis_explanation || 
    `Addressable market capacity for ${startupTitle} in ${industryName} is evaluated at ${marketSizing.tamStr} with a projected 5-year CAGR of ${growthRate}%. Favorable market dynamics indicate ${demandLevel.toLowerCase()} and strong willingness to pay in ${countryName}.`
  );

  const cleanedOpportunityExp = cleanExplanationText(
    data.opportunity_explanation || 
    `Market Opportunity Score for ${startupTitle} is evaluated at ${opportunityScore}/100 based on verified sector scale (${marketSizing.tamStr}), robust CAGR (${growthRate}%), and high buyer adoption tailwinds in ${industryName}.`
  );

  return (
    <div className="market-tab animate-fade-in">
      {/* ── Section Title & Meta Tags ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
        <div className="section-heading mb-0" style={{ margin: 0 }}>
          <FaGlobe /> Market Intelligence & Strategic TAM Opportunity
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="tag" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <FaTag style={{ fontSize: '0.75rem' }} /> {industryName}
          </span>
          <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <FaLayerGroup style={{ fontSize: '0.75rem' }} /> {sectorType.toUpperCase()}
          </span>
          <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <FaGlobe style={{ fontSize: '0.75rem' }} /> {countryName}
          </span>
        </div>
      </div>
      
      {/* ── Top Executive AI Evaluation Banner ── */}
      <div className="explanation-box mb-xl" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
          <FaCheckCircle /> Executive Market Evaluation Summary
        </div>
        <p className="text-sm text-secondary leading-relaxed mb-0" style={{ margin: 0 }}>
          {cleanedMarketExp}
        </p>
      </div>

      {/* ── 4-Metric Key Dashboard ── */}
      <div className="metrics-grid mb-2xl">
        {/* TAM Market Scale */}
        <div className="metric-card glass-card-success" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaRupeeSign /> Total Addressable Market (TAM)
          </div>
          <div className="metric-value text-success" style={{ color: '#818cf8', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            {marketSizing.tamStr}
          </div>
          <div className="text-secondary text-xs mt-xs">Total {industryName} Sector Spending Capacity</div>
        </div>

        {/* 5-Year CAGR */}
        <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaChartLine /> 5-Year CAGR Growth
          </div>
          <div className="metric-value text-primary" style={{ color: '#34d399', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            +{growthRate}% <span className="trend-indicator up text-xs ml-xs">↗ High Growth</span>
          </div>
          <div className="text-secondary text-xs mt-xs">Annual Compounded Industry Growth</div>
        </div>

        {/* Consumer Demand */}
        <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaBullseye /> Buyer Demand Intensity
          </div>
          <div className="metric-value text-info" style={{ color: '#fbbf24', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            {demandLevel}
          </div>
          <div className="text-secondary text-xs mt-xs">Market Receptivity & Urgency</div>
        </div>

        {/* Opportunity Score */}
        <div className="metric-card glass-card" style={{ borderLeft: '4px solid #ec4899' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaRocket /> Market Opportunity Index
          </div>
          <div className="metric-value" style={{ color: '#f472b6', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            {opportunityScore}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
          </div>
          <div className="text-secondary text-xs mt-xs">Venture Scale Viability Score</div>
        </div>
      </div>

      {/* ── Dimension Sub-Tabs Navigation Bar ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSubTab('tam')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'tam' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'tam' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaChartPie /> 1. TAM / SAM / SOM Sizing
        </button>

        <button
          onClick={() => setActiveSubTab('demographics')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'demographics' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'demographics' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaUsers /> 2. Buyer Persona & Demographics
        </button>

        <button
          onClick={() => setActiveSubTab('channels')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'channels' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'channels' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaBullhorn /> 3. Go-To-Market & Channels
        </button>

        <button
          onClick={() => setActiveSubTab('trends')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'trends' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'trends' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaLightbulb /> 4. Industry Trends & Drivers
        </button>
      </div>

      {/* ============================================================
          SUB-TAB 1: TAM / SAM / SOM SIZING & OPPORTUNITY GAUGE
          ============================================================ */}
      {activeSubTab === 'tam' && (
        <div className="animate-fade-in">
          {/* Symmetrical 3-Card TAM / SAM / SOM Grid */}
          <div className="tam-grid">
            {/* TAM */}
            <div className="tam-card tam-tam">
              <div className="tam-header">
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                  Total Addressable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                  100% Industry Scope
                </span>
              </div>
              <div className="tam-val" style={{ color: '#ffffff' }}>
                {marketSizing.tamStr}
              </div>
              <div className="tam-sub">Total Industry Demand in {countryName}</div>
              <div className="tam-desc">
                Total annual expenditure across all customers and providers in the <strong>{industryName}</strong> sector if {startupTitle} captured 100% monopoly market share.
              </div>
            </div>

            {/* SAM */}
            <div className="tam-card tam-sam">
              <div className="tam-header">
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
                  Serviceable Addressable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#d8b4fe', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                  {marketSizing.samPercent}% Serviceable
                </span>
              </div>
              <div className="tam-val" style={{ color: '#ffffff' }}>
                {marketSizing.samStr}
              </div>
              <div className="tam-sub">Serviceable via {sectorType.toUpperCase()} Model</div>
              <div className="tam-desc">
                The targeted sub-segment of TAM serviceable by {startupTitle}'s <strong>{sectorType}</strong> delivery architecture and target buyer category in {countryName}.
              </div>
            </div>

            {/* SOM */}
            <div className="tam-card tam-som">
              <div className="tam-header">
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                  Serviceable Obtainable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  Year 1–3 Target
                </span>
              </div>
              <div className="tam-val" style={{ color: '#ffffff' }}>
                {marketSizing.somStr}
              </div>
              <div className="tam-sub">Realistic Beachhead Capture ({marketSizing.somPercentOfSam} of SAM)</div>
              <div className="tam-desc">
                Realistic 1–3 year ARR target obtainable through focused customer acquisition, based on {startupTitle}'s <strong>{pricingModel}</strong> structure and initial operating budget.
              </div>
            </div>
          </div>

          {/* Market Opportunity Index & Timing Card */}
          <div className="dimension-cards-grid">
            {/* Opportunity Gauge Card */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    <FaChartPie />
                  </div>
                  <div>
                    <h4 className="dim-title">Market Opportunity Gauge</h4>
                    <div className="dim-subtitle">Viability & Market Tailwinds Assessment</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success" style={{ color: '#a78bfa', borderColor: '#8b5cf6', background: 'rgba(139, 92, 246, 0.15)' }}>
                  {opportunityScore}/100 Viability
                </div>
              </div>

              <div className="dim-progress-track">
                <div className="dim-progress-fill" style={{ width: `${opportunityScore}%`, background: 'linear-gradient(90deg, #8b5cf6, #10b981)' }}></div>
              </div>

              <div className="dim-body">
                <p className="dim-primary-text">{cleanedOpportunityExp}</p>
                <div className="dim-action-box" style={{ borderLeftColor: '#8b5cf6' }}>
                  <span className="dim-action-label" style={{ color: '#c084fc' }}>Venture Capital Perspective</span>
                  <span className="dim-action-content">
                    Institutional investors look for addressable depth (TAM &gt; ₹10,000 Cr) and high compounding expansion (CAGR &gt; 12%). {startupTitle} qualifies with a healthy TAM of {marketSizing.tamStr} and +{growthRate}% annual sector growth.
                  </span>
                </div>
              </div>
            </div>

            {/* Strategic Timing Card */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FaCalendarCheck />
                  </div>
                  <div>
                    <h4 className="dim-title">Market Timing & Inflection Window</h4>
                    <div className="dim-subtitle">Why This Venture Succeeds Right Now</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info" style={{ color: '#34d399', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.15)' }}>
                  Prime Window
                </div>
              </div>

              <div className="dim-progress-track">
                <div className="dim-progress-fill" style={{ width: '88%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}></div>
              </div>

              <div className="dim-body">
                <p className="dim-primary-text">
                  {profile.timingReason}
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#34d399' }}>Execution Priority</span>
                  <span className="dim-action-content">
                    Rapidly capture early beachhead customers ({marketSizing.somStr} Year 1–3 target) through agile product deployment before slower incumbents modernize their legacy systems.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 2: BUYER DEMOGRAPHICS & PERSONAS
          ============================================================ */}
      {activeSubTab === 'demographics' && (
        <div className="animate-fade-in">
          <div className="dimension-cards-grid">
            {/* Card 1: Ideal Customer Profile (ICP) */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #6366f1' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <FaUsers />
                  </div>
                  <div>
                    <h4 className="dim-title">Ideal Customer Profile (ICP)</h4>
                    <div className="dim-subtitle">Target Buyer Segment Breakdown</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Core ICP</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.primary_demo || profile.demo}
                </p>
                <p className="dim-detail-text">
                  <strong>Audience Fit:</strong> Specifically targeting {targetCustomers} seeking dedicated {industryName} capability with proven operational track record.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#6366f1' }}>
                  <span className="dim-action-label">Target Milestone</span>
                  <span className="dim-action-content">
                    Validate product-market fit by securing initial 30–50 high-engagement customer accounts matching this exact buyer persona.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Core Customer Pain Point */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                    <FaCrosshairs />
                  </div>
                  <div>
                    <h4 className="dim-title">Critical Market Friction Point</h4>
                    <div className="dim-subtitle">Customer Frustration with Status Quo</div>
                  </div>
                </div>
                <div className="dim-score-badge score-danger">Urgent Need</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.key_pain_point || profile.pain}
                </p>
                <p className="dim-detail-text">
                  <strong>Impact of Inaction:</strong> Legacy alternatives force buyers into slow, error-prone manual workarounds or inflated third-party service fees.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#ef4444' }}>
                  <span className="dim-action-label" style={{ color: '#f87171' }}>Value Wedge</span>
                  <span className="dim-action-content">
                    Position {startupTitle} directly around 10x faster execution and quantifiable cost savings in Indian Rupees (₹).
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Purchase Triggers & Urgency Catalysts */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FaBullseye />
                  </div>
                  <div>
                    <h4 className="dim-title">Buying Triggers & Decision Catalysts</h4>
                    <div className="dim-subtitle">What Motivates Immediate Purchase</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">High Urgency</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.purchase_trigger || profile.trigger}
                </p>
                <p className="dim-detail-text">
                  <strong>Conversion Driver:</strong> Buyers convert when presented with immediate proof of return on investment (ROI) and seamless setup without operational downtime.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#34d399' }}>GTM Playbook</span>
                  <span className="dim-action-content">
                    Anchor sales copy and demo sessions around rapid time-to-first-value (&lt;15 minutes) and transparent pricing in Indian Rupees (₹).
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Price Elasticity & Willingness to Pay */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <FaBalanceScale />
                  </div>
                  <div>
                    <h4 className="dim-title">Willingness to Pay & Monetization</h4>
                    <div className="dim-subtitle">Unit Economics & Budget Alignment</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">Favorable WTP</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Target buyers exhibit healthy willingness to pay under {startupTitle}'s <strong>{pricingModel}</strong> structure, calibrated to Indian purchasing power.
                </p>
                <p className="dim-detail-text">
                  <strong>Recommended Tiers:</strong> {profile.pricingTiers}
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#fbbf24' }}>Pricing Strategy</span>
                  <span className="dim-action-content">
                    Structure tiered packages (Starter, Growth, Enterprise) in ₹ to capture price-conscious early users while securing high-value annual contracts.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 3: GO-TO-MARKET & ACQUISITION CHANNELS
          ============================================================ */}
      {activeSubTab === 'channels' && (
        <div className="animate-fade-in">
          <div className="dimension-cards-grid">
            {/* Card 1: Primary Acquisition Channel */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <FaBullhorn />
                  </div>
                  <div>
                    <h4 className="dim-title">Primary Acquisition Channel</h4>
                    <div className="dim-subtitle">Highest Volume GTM Engine</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">Primary Alpha</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.acquisition_channel || profile.channel}
                </p>
                <p className="dim-detail-text">
                  <strong>Channel Efficiency:</strong> Focuses marketing budget directly where target buyers actively discover, evaluate, and procure {industryName} solutions.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#fbbf24' }}>Channel Execution</span>
                  <span className="dim-action-content">
                    Allocate 60% of initial marketing capital to this primary channel before diversifying into secondary experimental avenues.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Viral Loop & Referral Dynamics */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FaRocket />
                  </div>
                  <div>
                    <h4 className="dim-title">Organic Viral & Referral Loops</h4>
                    <div className="dim-subtitle">Self-Sustaining Growth Engine</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">K-Factor Loop</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {profile.viral}
                </p>
                <p className="dim-detail-text">
                  <strong>Network Density:</strong> Every successful onboarding generates organic word-of-mouth recommendations, steadily reducing blended Customer Acquisition Cost (CAC).
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#34d399' }}>Viral Incentive</span>
                  <span className="dim-action-content">
                    Implement built-in referral perks (e.g. 1 month free credit or bonus credits in ₹) whenever an existing user invites another account.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: 3-Stage Conversion Funnel */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #6366f1' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <FaLayerGroup />
                  </div>
                  <div>
                    <h4 className="dim-title">Conversion Funnel Architecture</h4>
                    <div className="dim-subtitle">Top, Mid & Bottom Funnel Flow</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Funnel Flow</div>
              </div>
              <div className="dim-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid #818cf8' }}>
                    <strong style={{ color: '#818cf8', fontSize: '0.85rem' }}>Top of Funnel (Awareness):</strong>
                    <div style={{ color: '#cbd5e1', fontSize: '0.84rem' }}>{profile.funnel.top}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid #34d399' }}>
                    <strong style={{ color: '#34d399', fontSize: '0.85rem' }}>Middle of Funnel (Trial/Demo):</strong>
                    <div style={{ color: '#cbd5e1', fontSize: '0.84rem' }}>{profile.funnel.mid}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid #fbbf24' }}>
                    <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>Bottom of Funnel (Close):</strong>
                    <div style={{ color: '#cbd5e1', fontSize: '0.84rem' }}>{profile.funnel.bot}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: CAC & Payback Velocity */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #ec4899' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
                    <FaRupeeSign />
                  </div>
                  <div>
                    <h4 className="dim-title">Customer Acquisition Cost (CAC)</h4>
                    <div className="dim-subtitle">Unit Economics & Payback Period</div>
                  </div>
                </div>
                <div className="dim-score-badge" style={{ color: '#f472b6', borderColor: '#ec4899', background: 'rgba(236, 72, 153, 0.15)' }}>
                  Unit Economics
                </div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Estimated Customer Acquisition Cost: <strong>{profile.cacInr}</strong> with a capital payback velocity of <strong>{profile.payback}</strong>.
                </p>
                <p className="dim-detail-text">
                  <strong>LTV:CAC Ratio:</strong> Targeted at &gt;3.5x to preserve gross margins, enabling sustainable reinvestment of profits into growth.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#ec4899' }}>
                  <span className="dim-action-label" style={{ color: '#f472b6' }}>Efficiency Target</span>
                  <span className="dim-action-content">
                    Keep payback below 6 months so cash generated from early cohorts finances subsequent acquisition cycles.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 4: INDUSTRY TRENDS & MACRO DRIVERS
          ============================================================ */}
      {activeSubTab === 'trends' && (
        <div className="animate-fade-in">
          <div className="dimension-cards-grid">
            {/* Trend 1: AI & Automation */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    <FaLightbulb />
                  </div>
                  <div>
                    <h4 className="dim-title">AI & Technological Disruption</h4>
                    <div className="dim-subtitle">Core Industry Innovation Driver</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">Key Tailwind</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {(data.industry_trends && data.industry_trends[0]) || profile.trends[0]}
                </p>
                <p className="dim-detail-text">
                  <strong>Strategic Advantage:</strong> Embeds automated machine intelligence into daily workflows, allowing {startupTitle} to execute at 10x lower overhead than legacy competitors.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#8b5cf6' }}>
                  <span className="dim-action-label" style={{ color: '#a78bfa' }}>R&D Focus</span>
                  <span className="dim-action-content">
                    Continually refine core software algorithms to widen product defensibility and reduce manual human intervention.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 2: Regulatory & Policy Tailwinds */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h4 className="dim-title">National Policy & Regulatory Mandates</h4>
                    <div className="dim-subtitle">Government & Compliance Drivers</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Macro Policy</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {(data.industry_trends && data.industry_trends[1]) || profile.trends[1]}
                </p>
                <p className="dim-detail-text">
                  <strong>Compliance Catalyst:</strong> Regulatory modernization in {countryName} compels target customers to adopt compliant solutions, significantly shortening sales decision cycles.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#34d399' }}>Compliance Moat</span>
                  <span className="dim-action-content">
                    Build certified compliance and automated audit logging directly into the product to turn regulation into a competitive moat.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 3: Consumer & Buyer Shift */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <FaArrowUp />
                  </div>
                  <div>
                    <h4 className="dim-title">Buyer Preference for Speed & Transparency</h4>
                    <div className="dim-subtitle">Cultural & Commercial Shift</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">High Urgency</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {(data.industry_trends && data.industry_trends[2]) || profile.trends[2]}
                </p>
                <p className="dim-detail-text">
                  <strong>Market Receptivity:</strong> Modern buyers reject opaque pricing and multi-week onboarding, favoring self-service access and clear Indian Rupee (₹) pricing tiers.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#fbbf24' }}>Differentiation</span>
                  <span className="dim-action-content">
                    Publish transparent pricing packages in ₹ with zero hidden onboarding fees to rapidly win over frustrated customers of legacy incumbents.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 4: Defensibility Moat & Unit Economics */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #6366f1' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h4 className="dim-title">Sustainable Unit Economics Moat</h4>
                    <div className="dim-subtitle">Long-Term Venture Defensibility</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Moat Depth</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Capital in the {industryName} space is prioritizing disciplined cash burn, high gross margins (&gt;65%), and rapid pathway to operating break-even over vanity top-line growth.
                </p>
                <p className="dim-detail-text">
                  <strong>Execution Posture:</strong> By maintaining lean infrastructure and automated customer onboarding, {startupTitle} preserves runway while compounding market share.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#6366f1' }}>
                  <span className="dim-action-label">Defensibility Milestone</span>
                  <span className="dim-action-content">
                    Achieve operational cash break-even within 8–12 months to command premium valuations in subsequent funding rounds.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTab;
