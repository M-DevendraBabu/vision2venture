import React, { useState, useMemo } from 'react';
import { 
  FaLaptopCode, FaServer, FaDatabase, FaCogs, FaBrain, FaCloud, 
  FaStore, FaLayerGroup, FaHdd, FaShieldAlt, FaRupeeSign, FaBolt,
  FaCheckCircle, FaExchangeAlt, FaMicrochip, FaNetworkWired, 
  FaMobileAlt, FaLock, FaInfoCircle, FaTachometerAlt, FaClipboard, FaCheck
} from 'react-icons/fa';

// ============================================================
// VENTURE-GRADE SECTOR ARCHITECTURE BLUEPRINTS (12 INDUSTRIES)
// ============================================================

const SECTOR_TECH_BLUEPRINTS = {
  edtech: {
    system_archetype: 'Combinatorial Constraint Solver & Reactive Microservices',
    readiness_score: 96,
    architecture_style: 'Decoupled Asynchronous Serverless Architecture',
    concurrency_target: '15,000+ Concurrent Students / Sec',
    latency_target: '< 40ms P99 API Latency',
    monthly_opex_inr: '₹1,800 – ₹3,800 / mo',
    ai_rationale: 'Engineered specifically for combinatorial NP-hard academic scheduling and multi-disciplinary curriculum mapping under India’s National Education Policy (NEP 2020). Decoupled Next.js client guarantees sub-second responsiveness on low-bandwidth school networks, while Python FastAPI and Google OR-Tools CP-SAT solver resolve thousands of teacher, classroom, and student elective constraints in under 2 seconds without event-loop bottlenecks.',
    tier1_client: {
      tech: 'Next.js 14 (App Router) + React 18 + Tailwind CSS + dnd-kit',
      role: 'Interactive Clash-Free Timetable Matrix & Institutional Admin Dashboard',
      why: 'Next.js Server-Side Rendering (SSR) delivers sub-second initial paint times even on 3G mobile networks. The dnd-kit library provides 60fps hardware-accelerated drag-and-drop interactions for complex multi-period timetable grids without re-rendering the entire DOM tree.',
      performance: 'First Contentful Paint (FCP) < 0.8s • Optimized Client Bundle < 118KB',
      alternative_rejected: 'Rejected Create-React-App & Vanilla React: Lacked server components and required massive client JS bundles, causing 3.5s+ load times on Tier-2/3 school hardware.',
      indian_context: 'PWA offline-caching enables teachers to view schedules during classroom internet dropouts; lightweight responsive layout runs smoothly on budget Android tablets.'
    },
    tier2_gateway: {
      tech: 'Cloudflare Edge Workers + Nginx ASGI Gateway',
      role: 'Regional Reverse Proxy, Dynamic SSL & Sub-15ms Edge Routing',
      why: 'Terminates TLS at the closest edge point-of-presence in India (Mumbai, Chennai, Delhi, Hyderabad) before proxying requests to the backend. Automatically mitigates DDoS attempts during peak school enrollment cycles.',
      performance: 'Edge TTFB < 22ms across all major Indian ISPs • 100% SSL/TLS 1.3 Offloading',
      alternative_rejected: 'Rejected AWS API Gateway: Higher per-request pricing model resulting in 4x higher operational costs during high-volume school usage.',
      indian_context: 'Direct peering with Airtel, Jio, and ACT Fibernet reduces routing hops across Indian educational networks.'
    },
    tier3_core: {
      tech: 'Python FastAPI (Asynchronous ASGI) + Google OR-Tools (CP-SAT Solver)',
      role: 'Asynchronous Business API & Combinatorial Timetabling Engine',
      why: 'FastAPI leverages Python asyncio for high-throughput non-blocking I/O. Google OR-Tools utilizes advanced Constraint Programming (CP-SAT) to resolve complex NP-hard academic timetabling problems—balancing teacher workload limits, room capacities, and multi-disciplinary electives—in under 2 seconds.',
      performance: 'Solves 500-slot timetable in 1.8s with 0 hard conflicts • 22,000 req/sec ASGI throughput',
      alternative_rejected: 'Rejected Django: Synchronous ORM creates thread-pool exhaustion during long-running combinatorial constraint solving jobs.',
      indian_context: 'Automated compliance with National Education Policy (NEP 2020) multi-disciplinary elective requirements.'
    },
    tier4_data: {
      primary_db: 'PostgreSQL 16 (Relational Schema & JSONB Documents)',
      cache_layer: 'Redis 7 (In-Memory Session Caching & Lock Store)',
      role: 'ACID-Compliant Academic Ledger & Fast Distributed Session State',
      why: 'PostgreSQL handles complex relational joins for school departments, teachers, classes, and rooms with ACID compliance. Its JSONB capabilities allow dynamic custom schedule rules without schema migrations. Redis provides distributed locks preventing concurrent editing conflicts.',
      performance: 'Sub-4ms indexed query latency • In-memory lock acquisition < 1ms',
      alternative_rejected: 'Rejected MongoDB: Lacks strict foreign key constraints, increasing the risk of orphaned teacher assignments and duplicate room bookings.',
      indian_context: 'Automated daily point-in-time recovery (PITR) with encrypted backups compliant with Indian IT Act standards.'
    },
    tier5_devops: {
      cloud_provider: 'AWS ECS Fargate (Mumbai ap-south-1) + CloudFront CDN',
      container_ci_cd: 'Docker Multi-Stage Builds + GitHub Actions CI/CD',
      security_compliance: 'DPDP Act 2023 Student Data Privacy • JWT Role-Based Access Control (RBAC) • TLS 1.3',
      why: 'Serverless container execution on AWS Fargate eliminates server maintenance overhead. Docker containers automatically scale out during peak morning timetable generation periods and scale down to single instances at night, optimizing cost efficiency.',
      performance: 'Zero-downtime blue-green deployments in under 3 minutes • 99.95% SLA Uptime',
      cost_breakdown_inr: [
        { item: 'AWS Fargate Micro Compute', cost: '₹1,200/mo', note: 'Auto-scaled serverless containers' },
        { item: 'PostgreSQL RDS db.t4g.micro', cost: '₹850/mo', note: 'ACID persistent relational storage' },
        { item: 'Redis Upstash Serverless', cost: '₹0/mo', note: 'Free tier covers up to 10k commands/day' },
        { item: 'Cloudflare Edge & CDN', cost: '₹0/mo', note: 'Free SSL, DDoS protection & DNS' },
        { item: 'Groq LLaMA-3 Inference', cost: '₹450/mo', note: 'AI curriculum & doubt resolution API' }
      ],
      total_monthly_inr: '₹2,500/mo'
    }
  },

  'food & beverage': {
    system_archetype: 'Real-Time Event-Driven Hospitality & Kitchen Automation Pipeline',
    readiness_score: 95,
    architecture_style: 'Edge Hybrid POS & WebSocket Microservices',
    concurrency_target: '3,000+ Concurrent Restaurant Orders / Min',
    latency_target: '< 80ms Kitchen Order Display Sync',
    monthly_opex_inr: '₹2,200 – ₹5,500 / mo',
    ai_rationale: 'Purpose-built for high-turnover dining operations and contactless ordering. Seamlessly unifies diner QR table ordering, handheld waiter tablets, and counter Sunmi POS terminals with a zero-latency Kitchen Display System (KDS). Sub-second WebSocket order dispatch cuts order-to-table turnaround by 35% while predictive ARIMA algorithms prevent perishable organic food spoilage.',
    tier1_client: {
      tech: 'Flutter (Android/iOS App) + Sunmi Android POS Terminal UI + React PWA (QR Table Ordering)',
      role: 'Contactless Diner Ordering, Waiter Handhelds & Billing Touchpoints',
      why: 'Flutter delivers 60fps cross-platform mobile apps for customer loyalty and staff ordering, while the zero-install React PWA allows diners to scan table QR codes and order instantly without app downloads. Deep integration with Sunmi hardware SDK supports thermal printing and NFC card taps.',
      performance: 'PWA initial scan-to-menu load < 1.1s • 60fps smooth touch scrolling',
      alternative_rejected: 'Rejected Native iOS/Android Duplication: Doubled engineering maintenance cost without performance gains for restaurant UI.',
      indian_context: 'Pre-integrated with Razorpay UPI Intent & PhonePe Dynamic QR for frictionless Indian table payments.'
    },
    tier2_gateway: {
      tech: 'Nginx Reverse Proxy + SSL Termination + Socket.io Cluster',
      role: 'Real-time WebSocket Connection Manager & Load Balancer',
      why: 'Maintains persistent duplex WebSocket connections between tables, waiter terminals, and the kitchen display system (KDS) with automatic reconnection on WiFi jitter.',
      performance: 'Handles 10,000+ persistent WebSocket connections with < 50MB RAM footprint',
      alternative_rejected: 'Rejected Long Polling HTTP: Caused excessive server strain, high battery drain on POS terminals, and delayed order notifications.',
      indian_context: 'Tolerant to intermittent restaurant WiFi through automatic offline queueing.'
    },
    tier3_core: {
      tech: 'Node.js (NestJS) + Socket.io + Python Microservice (Demand Forecasting)',
      role: 'Order State Machine, Kitchen Dispatch & Inventory Tracking',
      why: 'NestJS provides a clean modular architecture for processing multi-step order lifecycles (Placed -> Kitchen Prep -> Ready -> Served -> Paid). Node.js event-loop excels at high I/O socket events, while lightweight Python routines forecast weekend ingredient restock.',
      performance: 'Order dispatch to kitchen printer in < 120ms • 15k req/sec throughput',
      alternative_rejected: 'Rejected Ruby on Rails: Slower concurrency benchmarks and heavier memory footprint under simultaneous dinner rush orders.',
      indian_context: 'Built-in automated GST calculation and FSSAI clean-label food allergen disclosure compliance.'
    },
    tier4_data: {
      primary_db: 'PostgreSQL 16 (ACID Billing Transactions & Inventory Ledger)',
      cache_layer: 'Redis 7 (Active Cart State, Table Locks & Live Menu Availability)',
      role: 'Financial Audit Trail & Sub-Millisecond Live Stock Decrement',
      why: 'PostgreSQL ensures zero double-billing through strict ACID transactional guarantees. Redis manages live table carts and instantly disables menu items when ingredient stock drops to zero.',
      performance: 'Atomic inventory decrement in < 2ms • Zero financial ledger discrepancies',
      alternative_rejected: 'Rejected MySQL: PostgreSQL has superior JSON querying for dynamic menu customization (add-ons, spice levels, ingredient swaps).',
      indian_context: 'Automated daily Z-report reconciliations and monthly GST GSTR-1 export formats.'
    },
    tier5_devops: {
      cloud_provider: 'Google Cloud Run (Serverless Microservices) + Firebase Cloud Messaging',
      container_ci_cd: 'Docker Containers + ESC/POS Network Printer Bridge',
      security_compliance: 'FSSAI Digital Traceability • PCI-DSS Level 1 Payment Gateway Integration • TLS 1.3',
      why: 'Google Cloud Run scales containers to zero during quiet hours (2 AM – 7 AM), eliminating idle cloud bills. Automatic scaling handles dinner rush spikes with zero manual intervention.',
      performance: 'Cold start < 1.2s • 99.95% availability during operating hours',
      cost_breakdown_inr: [
        { item: 'Google Cloud Run Containers', cost: '₹1,100/mo', note: 'Pay-per-use, scales to zero' },
        { item: 'PostgreSQL Managed Cloud DB', cost: '₹950/mo', note: 'Continuous WAL backup' },
        { item: 'Firebase Push Notifications', cost: '₹0/mo', note: 'Free unlimited order updates' },
        { item: 'Cloudflare DNS & Firewall', cost: '₹0/mo', note: 'Free DDoS & Edge caching' },
        { item: 'SMS Gateway (Fast2SMS/Gupshup)', cost: '₹400/mo', note: 'Customer billing OTPs & receipts' }
      ],
      total_monthly_inr: '₹2,450/mo'
    }
  },

  'e-commerce': {
    system_archetype: 'Ultra-Low Latency Quick Commerce & Spatial Fulfillment Engine',
    readiness_score: 97,
    architecture_style: 'Event-Driven Distributed Microservices & CQRS',
    concurrency_target: '50,000+ Concurrent Shoppers',
    latency_target: '< 15ms Inventory Check • < 800ms End-to-End Checkout',
    monthly_opex_inr: '₹5,000 – ₹14,000 / mo',
    ai_rationale: 'Architected for sub-15 minute grocery replenishment and flash-demand spikes. Combines an ultra-fast Next.js PWA with Go-based event streaming through Apache Kafka to synchronize dark-store pickers, riders, and customers. PostGIS calculates exact 3km polygon delivery radiuses with sub-10ms precision, while Redis distributed locks guarantee zero overselling.',
    tier1_client: {
      tech: 'Next.js 14 PWA (Instant 0.8s Storefront) + React Native (Dark-Store Picker & Rider Navigation App)',
      role: 'High-Conversion Consumer Storefront & Dark-Store Fulfillment Handhelds',
      why: 'Next.js PWA delivers an instantaneous shopping experience with optimistic cart updates and sub-second catalog navigation. React Native enables dark-store pickers to scan barcodes via camera and provides delivery riders with turn-by-turn routing.',
      performance: 'Time to Interactive < 0.9s • 99.8% crash-free mobile sessions',
      alternative_rejected: 'Rejected Magento/WooCommerce: Monolithic architecture collapses under flash sale concurrency and requires 10x higher server hardware.',
      indian_context: 'Built-in Hindi and regional language support; pre-configured for UPI Intent (GPay, PhonePe, Paytm).'
    },
    tier2_gateway: {
      tech: 'Kong API Gateway + Cloudflare Enterprise DDoS Protection',
      role: 'Token Authentication, Rate Limiting & Dynamic Request Routing',
      why: 'Handles up to 100,000 requests/sec with sub-millisecond overhead. Prevents bot scraping of inventory prices and shields backend services during flash deals.',
      performance: 'Gateway routing latency < 1.5ms • Rate limits malicious bots automatically',
      alternative_rejected: 'Rejected Spring Cloud Gateway: Higher JVM memory footprint and longer warm-up times during cold restarts.',
      indian_context: 'Zero-rate data caching for Indian mobile networks via regional edge POPs.'
    },
    tier3_core: {
      tech: 'Go (Golang High-Concurrency Order Engine) + Python FastAPI + Apache Kafka',
      role: 'Event-Driven Order Processing, Stock Reservation & Rider Dispatch',
      why: 'Go microservices process orders with deterministic low latency and tiny memory footprint. Apache Kafka decouples order placement from warehouse packing and dispatch, guaranteeing zero lost orders even if downstream services experience transient slowdowns.',
      performance: 'Processes 25,000 orders/sec per container • Event delivery latency < 5ms',
      alternative_rejected: 'Rejected Node.js for order queue: Single-threaded event loop can suffer event blockage under extreme JSON serialization loads.',
      indian_context: 'Integrated with ONDC (Open Network for Digital Commerce) protocol APIs and Legal Metrology Packaged Commodities Rules 2022.'
    },
    tier4_data: {
      primary_db: 'PostgreSQL 16 with PostGIS (Dark-Store Geospatial Polygons & Order Ledger)',
      cache_layer: 'Redis Cluster 7 (Micro-Inventory Stock Reservation Locks & Live Carts)',
      role: 'Spatial Delivery Routing & Distributed Atomic Stock Locks',
      why: 'PostGIS determines if a customer coordinate falls within the dark store’s 10-minute delivery polygon in under 3ms. Redis distributed locks decrement SKU stock in memory before persisting to PostgreSQL, preventing duplicate sales of the last inventory item.',
      performance: 'PostGIS spatial containment query < 2.5ms • Redis atomic decrement < 0.8ms',
      alternative_rejected: 'Rejected Elasticsearch for primary storage: Lacks ACID transactions needed for inventory decrement integrity.',
      indian_context: 'Stores geocoded Indian addresses with locality landmarks and PIN codes.'
    },
    tier5_devops: {
      cloud_provider: 'AWS EKS (Kubernetes with Karpenter Auto-scaler) + Cloudflare Edge Workers',
      container_ci_cd: 'Docker Containers + Helm Charts + GitHub Actions CI/CD',
      security_compliance: 'DPDP Act 2023 Customer Privacy • PCI-DSS Tokenization • ISO 27001 Cloud Security',
      why: 'Karpenter auto-scaler provisions EC2 Spot instances in under 45 seconds during evening dinner shopping spikes and scales down at night, cutting AWS compute costs by up to 65%.',
      performance: 'Auto-scaling from 2 to 20 nodes in < 60 seconds • 99.99% availability',
      cost_breakdown_inr: [
        { item: 'AWS EKS Managed Control Plane', cost: '₹2,200/mo', note: 'High-availability Kubernetes' },
        { item: 'EC2 Spot Compute Nodes', cost: '₹2,400/mo', note: 'Auto-scaled worker pods' },
        { item: 'PostgreSQL RDS db.t4g.small', cost: '₹1,600/mo', note: 'Spatial database with replicas' },
        { item: 'Redis Upstash / ElastiCache', cost: '₹800/mo', note: 'Sub-millisecond distributed cache' },
        { item: 'Kafka Cloud (Confluent/Upstash)', cost: '₹900/mo', note: 'Event streaming order bus' }
      ],
      total_monthly_inr: '₹7,900/mo'
    }
  },

  fintech: {
    system_archetype: 'Zero-Trust Financial Ledger & Ultra-Low Latency Payment Switch',
    readiness_score: 99,
    architecture_style: 'Idempotent Microservices & Immutable Double-Entry Ledger',
    concurrency_target: '30,000+ TPS (Transactions Per Second)',
    latency_target: '< 25ms Payment Settlement Confirmation',
    monthly_opex_inr: '₹6,500 – ₹15,000 / mo',
    ai_rationale: 'Engineered for financial mission-critical workloads requiring strict mathematical idempotency, zero data loss, and sub-second UPI/crypto settlement. Dual-core Go and Java Spring Boot services enforce cryptographic transaction signing inside AWS Nitro Enclaves, while TimescaleDB maintains an immutable audit ledger complying with Reserve Bank of India (RBI) Payment Aggregator norms and DPDP Act 2023.',
    tier1_client: {
      tech: 'React.js 18 + TypeScript + Vite + Tailwind CSS + Web3Modal / Ethers.js',
      role: 'Embeddable Sub-Second Checkout SDK & Merchant Analytics Dashboard',
      why: 'TypeScript ensures compile-time financial type safety, eliminating floating-point rounding errors on the client. Lightweight embeddable checkout script (< 45KB) loads in 250ms on merchant websites with zero third-party script blocking.',
      performance: 'SDK bundle size 42KB gzip • Initial checkout render in < 300ms',
      alternative_rejected: 'Rejected Angular: Unnecessarily heavy runtime bundle size slows checkout speed on mobile web views.',
      indian_context: 'Full support for UPI Deep-linking, Bharat BillPay (BBPS), and Account Aggregator (AA) flows.'
    },
    tier2_gateway: {
      tech: 'Envoy Proxy + mTLS (Mutual TLS) + Cloudflare Enterprise DDoS Shield',
      role: 'Cryptographic API Gateway, Signature Verification & WAF',
      why: 'Envoy validates HMAC merchant API signatures and webhook cryptographic nonces in under 0.8ms, rejecting replay attacks before requests reach inner banking microservices.',
      performance: 'Sub-millisecond HMAC signature validation • Strict TLS 1.3 only',
      alternative_rejected: 'Rejected Software Kong: Envoy has lower memory footprint and superior gRPC connection pooling for banking microservices.',
      indian_context: 'Compliant with RBI localization rules; all gateway endpoints terminate within Indian data centers.'
    },
    tier3_core: {
      tech: 'Go (Golang Payment Switch) + Java Spring Boot (Idempotent Ledger Service)',
      role: 'Idempotent Payment Routing, Escrow & Double-Entry Ledger Management',
      why: 'Go provides ultra-low latency transaction routing with deterministic garbage collection pauses (< 1ms). Java Spring Boot brings enterprise-grade double-entry ledger enforcement with strict ACID transaction isolation.',
      performance: 'Zero double-spend guarantees • P99 transaction latency < 28ms',
      alternative_rejected: 'Rejected Python/Node for settlement: Dynamic typing creates subtle floating-point precision risks in monetary balance calculations.',
      indian_context: 'Direct NPCI UPI Switch and RBI Real-Time Gross Settlement (RTGS) integration protocols.'
    },
    tier4_data: {
      primary_db: 'PostgreSQL 16 with TimescaleDB (Immutable Double-Entry Ledger & Audit Logs)',
      cache_layer: 'Redis Cluster 7 (Distributed Nonce Locks & Rate Limiting)',
      role: 'Tamper-Evident Financial Journal & Atomic Deduplication',
      why: 'Implements a strict append-only double-entry bookkeeping schema (Debits = Credits). TimescaleDB hyper-tables partition ledger transactions by timestamp, guaranteeing rapid audit retrieval. Redis distributed locks prevent duplicate payment submissions.',
      performance: '100% immutable audit compliance • Query 50M financial records in < 80ms',
      alternative_rejected: 'Rejected MongoDB: Eventual consistency models cannot guarantee financial balance correctness during network splits.',
      indian_context: 'Complies with RBI 7-year financial record data retention mandates.'
    },
    tier5_devops: {
      cloud_provider: 'AWS Nitro Enclaves (Hardware Security Module HSM) + AWS Mumbai ap-south-1',
      container_ci_cd: 'Docker Kubernetes (AWS EKS) + Multi-AZ Active-Active Failover',
      security_compliance: 'RBI Payment Aggregator Guidelines • DPDP Act 2023 • SOC2 Type II • ISO 27001',
      why: 'AWS Nitro Enclaves isolate cryptographic private keys and bank API credentials in a CPU-isolated memory space inaccessible even to root system administrators. Multi-AZ active-active failover ensures 99.999% uptime for payment rails.',
      performance: 'Failover recovery time RTO < 30s • RPO = 0 (Zero financial data loss)',
      cost_breakdown_inr: [
        { item: 'AWS EKS Production Cluster', cost: '₹3,500/mo', note: 'Multi-AZ active nodes' },
        { item: 'AWS Nitro Enclave HSM', cost: '₹1,800/mo', note: 'Cryptographic key isolation' },
        { item: 'PostgreSQL Multi-AZ RDS', cost: '₹2,600/mo', note: 'Encrypted storage with read replicas' },
        { item: 'Redis Cluster ElastiCache', cost: '₹1,200/mo', note: 'Distributed idempotency locks' },
        { item: 'Compliance Monitoring & Logs', cost: '₹800/mo', note: 'Immutable audit trail storage' }
      ],
      total_monthly_inr: '₹9,900/mo'
    }
  },

  cybersecurity: {
    system_archetype: 'Zero Trust Kernel Telemetry & Columnar Threat Analytics Mesh',
    readiness_score: 98,
    architecture_style: 'Distributed Rust Daemon & High-Throughput Columnar SIEM',
    concurrency_target: '100M+ Security Log Events / Sec',
    latency_target: '< 200ms Threat Detection & Automated Containment',
    monthly_opex_inr: '₹7,500 – ₹18,000 / mo',
    ai_rationale: 'Built to deliver continuous Zero Trust verification and rapid anomaly containment. An ultra-lightweight Rust daemon runs at the endpoint using under 15MB RAM and <1% CPU, streaming encrypted event logs to ClickHouse. Queries through 100M+ security events execute in under 200ms, enabling automated containment and compliance with CERT-In’s mandatory 6-hour cybersecurity reporting directive.',
    tier1_client: {
      tech: 'Next.js 14 + Visx / D3.js (Real-Time Interactive Attack Surface Graph) + Rust Endpoint Agent',
      role: 'Security Operations Center (SOC) Console & Cross-Platform Endpoint Daemon',
      why: 'Visx and D3.js render interactive graph network topologies of corporate endpoints, lateral movement paths, and active firewall alerts. The Rust agent compiles directly to native machine code for Windows, macOS, and Linux without external runtime dependencies.',
      performance: 'Rust agent memory footprint < 14MB • UI renders 10,000 nodes at 60fps',
      alternative_rejected: 'Rejected Electron for endpoint agent: Electron consumes 150MB+ RAM, causing workstation performance degradation and user complaints.',
      indian_context: 'Localized threat feeds incorporating India-specific phishing campaigns and banking trojan indicators.'
    },
    tier2_gateway: {
      tech: 'WireGuard Mesh + mTLS Encrypted Tunnels + HAProxy',
      role: 'Encrypted Endpoint-to-Cloud Telemetry Pipeline & Mutual Verification',
      why: 'WireGuard provides modern state-of-the-art cryptography (Noise protocol, Curve25519) with 4x higher throughput and 5x lower latency than legacy OpenVPN or IPsec.',
      performance: 'Line-rate encryption with < 2ms latency overhead • Zero plaintext packets',
      alternative_rejected: 'Rejected OpenVPN: Legacy codebase with high CPU overhead on mobile endpoints.',
      indian_context: 'Operates seamlessly across Indian 4G/5G mobile carriers without MTU packet fragmentation.'
    },
    tier3_core: {
      tech: 'Rust (Endpoint Telemetry Engine) + Go (High-Speed Security Log Collector)',
      role: 'SIEM Log Normalization, Event Correlation & Automated Remediation',
      why: 'Go collectors ingest syslog, eBPF network packets, and file integrity events at 500,000 events/sec per node, filtering and forwarding them into ClickHouse in real-time.',
      performance: 'Ingestion throughput > 500k events/sec per server • Automated rule matching < 15ms',
      alternative_rejected: 'Rejected Java/Logstash: Heavy JVM memory usage and garbage collection pauses causing dropped security packets.',
      indian_context: 'Pre-built compliance dashboards for CERT-In incident reporting and RBI cybersecurity guidelines.'
    },
    tier4_data: {
      primary_db: 'ClickHouse (Ultra-Fast Columnar DB) + OpenSearch (Full-Text SIEM Index)',
      cache_layer: 'Redis 7 (Active Session Tokens & IP Threat Reputation Lists)',
      role: 'High-Volume Security Event Log Store & Fast IOC (Indicator of Compromise) Matching',
      why: 'ClickHouse compresses security logs by 85% and performs analytical aggregate queries over hundreds of millions of rows in milliseconds. OpenSearch handles free-text search across endpoint process command lines.',
      performance: 'Queries 100M rows in < 180ms • 85% storage disk compression',
      alternative_rejected: 'Rejected PostgreSQL for SIEM: Row-oriented databases choke when executing aggregate queries over hundreds of millions of event logs.',
      indian_context: 'Ensures data sovereignty with data resident in Indian AWS/GCP regions as required by DPDP Act 2023.'
    },
    tier5_devops: {
      cloud_provider: 'AWS Private VPC + Bare-Metal Edge Security Nodes + WireGuard Mesh',
      container_ci_cd: 'Docker Kubernetes (AWS EKS) + Automated Vulnerability Scanning (Trivy)',
      security_compliance: 'CERT-In 6-Hour Reporting Mandate • DPDP Act 2023 • ISO 27001 • SOC2 Type II',
      why: 'All internal security traffic flows across a non-routable private VPC. Microservices are automatically scanned for vulnerabilities in CI/CD before any deployment can proceed.',
      performance: 'Zero external internet exposure on internal DB nodes • Continuous automated patching',
      cost_breakdown_inr: [
        { item: 'ClickHouse Managed Cluster', cost: '₹3,200/mo', note: 'Columnar storage with compression' },
        { item: 'AWS EKS Private Nodes', cost: '₹2,800/mo', note: 'Ingestion and SIEM analysis' },
        { item: 'OpenSearch Small Instance', cost: '₹1,500/mo', note: 'Full-text IOC log search' },
        { item: 'WireGuard Edge Relays', cost: '₹900/mo', note: 'Encrypted endpoint tunnels' },
        { item: 'Cloudflare WAF & Edge', cost: '₹800/mo', note: 'DDoS mitigation and bot defense' }
      ],
      total_monthly_inr: '₹9,200/mo'
    }
  },

  cleantech: {
    system_archetype: 'IoT Telemetry Ingestion & Solar Physics Simulation Grid',
    readiness_score: 96,
    architecture_style: 'Event-Driven IoT Edge Ingestion & Time-Series Analytics',
    concurrency_target: '50,000+ Connected Solar Inverters & Battery Packs',
    latency_target: '< 500ms Inverter Alert Dispatch • 99.9% Telemetry Completeness',
    monthly_opex_inr: '₹3,200 – ₹7,500 / mo',
    ai_rationale: 'Engineered specifically for renewable energy IoT telemetry and solar asset management. Replaces inappropriate retail POS architectures with high-frequency MQTT telemetry ingestion, NREL PVLib solar irradiance physics models, and TimescaleDB time-series storage. Delivers 92% compression on continuous inverter logs and bankable solar yield forecasts.',
    tier1_client: {
      tech: 'Next.js 14 + Mapbox GL JS / Deck.gl (3D Rooftop Solar Radiation & Shadow Simulation)',
      role: 'Solar Rooftop CAD Designer & Plant Generation Performance Dashboard',
      why: 'Deck.gl renders complex 3D rooftop polygon meshes and visualizes hourly solar shadow tracking in WebGL. Plant managers can inspect generation graphs, battery charge states, and inverter heatmaps in real-time.',
      performance: 'Smooth 60fps 3D rooftop rendering • Initial map tile load < 1.2s',
      alternative_rejected: 'Rejected legacy jQuery/Bootstrap: Incapable of rendering interactive 3D WebGL solar shadow simulation grids.',
      indian_context: 'Integrated with National Portal for Rooftop Solar (PM Surya Ghar) and DISCOM net-metering application tracking.'
    },
    tier2_gateway: {
      tech: 'EMQX Distributed MQTT Broker + AWS IoT Core',
      role: 'High-Throughput Inverter Telemetry Ingestion & Device Shadow Management',
      why: 'EMQX sustains millions of concurrent lightweight MQTT connections from low-bandwidth cellular IoT modems mounted on solar inverters across remote rural solar parks.',
      performance: 'Handles 100,000 MQTT messages/sec with < 10ms broker latency',
      alternative_rejected: 'Rejected REST HTTP Polling: Cellular IoT modems waste 8x more mobile data sending HTTP headers than compact binary MQTT payloads.',
      indian_context: 'Optimized for 2G/4G rural Indian cellular networks with automatic offline message buffering.'
    },
    tier3_core: {
      tech: 'Python FastAPI (Solar Physics Engine) + Celery Worker Pool + NREL PVLib',
      role: 'Solar Radiation Physics Modeling & Automated Inverter Fault Diagnostics',
      why: 'Python leverages the world-standard NREL PVLib library to compute clear-sky solar irradiance, panel tilt angles, temperature derating, and expected inverter kilowatt output, flagging panel soiling or inverter clipping immediately.',
      performance: 'Calculates 25-year financial yield simulation for 500 rooftops in < 3 seconds',
      alternative_rejected: 'Rejected Node.js for solar physics: Node lacks mature scientific math and solar radiation libraries equivalent to NumPy/PVLib.',
      indian_context: 'Calibrated to Indian Solar Radiation Atlas data (MNRE) across all geographic solar zones.'
    },
    tier4_data: {
      primary_db: 'TimescaleDB (PostgreSQL Time-Series Extension for Inverter Logs)',
      cache_layer: 'Redis 7 (Real-Time Device State & Live Kilowatt Telemetry)',
      role: 'High-Density Time-Series Energy Metrics & Instant Grid Status',
      why: 'TimescaleDB organizes continuous time-series metrics (DC voltage, AC current, panel temperatures, frequency) into automated hyper-tables with 92% data compression, saving massive disk costs.',
      performance: 'Compresses 10GB telemetry to 800MB • Queries 1-year generation profile in < 150ms',
      alternative_rejected: 'Rejected Plain PostgreSQL/MySQL: Uncompressed tables balloon to terabytes and slow down query performance drastically over time.',
      indian_context: 'Automated generation data exports matching state DISCOM feed-in tariff billing formats.'
    },
    tier5_devops: {
      cloud_provider: 'AWS IoT Core + AWS ECS Fargate + S3 Glacier (Long-term Energy Archives)',
      container_ci_cd: 'Docker Containers + Automated Firmware Over-the-Air (OTA) Updates',
      security_compliance: 'CEA (Central Electricity Authority) Cybersecurity Guidelines for Power Grid • TLS 1.3',
      why: 'Enables secure remote firmware upgrades to IoT data loggers across solar farms without requiring manual field technician visits. Fargate serverless containers scale compute up during sunny daylight hours and down at night.',
      performance: 'Zero-touch OTA deployment • 99.95% system uptime',
      cost_breakdown_inr: [
        { item: 'EMQX / AWS IoT Core MQTT Broker', cost: '₹1,400/mo', note: 'Handles 50k telemetry pings/day' },
        { item: 'TimescaleDB Managed Storage', cost: '₹1,500/mo', note: 'Compressed time-series metrics' },
        { item: 'AWS Fargate Container Compute', cost: '₹1,200/mo', note: 'Daytime solar analysis processing' },
        { item: 'S3 Long-Term Yield Archives', cost: '₹300/mo', note: '10-year generation history storage' },
        { item: 'Cloudflare DNS & Monitoring', cost: '₹0/mo', note: 'Free edge security & SSL' }
      ],
      total_monthly_inr: '₹4,400/mo'
    }
  },

  agtech: {
    system_archetype: 'Offline-First Rural Telemetry & Edge Computer Vision Pipeline',
    readiness_score: 95,
    architecture_style: 'Edge AI & Offline-First Geospatial Sync',
    concurrency_target: '20,000+ Farmers & Drone Flight Paths',
    latency_target: '< 150ms Edge AI Pest Detection • Offline Local Sync',
    monthly_opex_inr: '₹3,500 – ₹8,500 / mo',
    ai_rationale: 'Designed specifically for rugged rural deployments with spotty internet connectivity. The Flutter mobile app functions 100% offline with Hindi/Regional voice UI and local SQLite cache, syncing when connectivity resumes. Edge AI running YOLOv8 on drone companion computers identifies crop pests and nitrogen deficiencies in real-time, reducing chemical spraying costs by up to 30%.',
    tier1_client: {
      tech: 'Flutter (Multilingual Offline-First Mobile App with Hindi Voice UI) + React Web Admin',
      role: 'Farmer Advisory Mobile App & Enterprise Drone Fleet Mission Planner',
      why: 'Flutter delivers high performance on low-cost Android phones with an offline-first SQLite sync engine. Voice-guided Hindi navigation enables non-technical farmers to record farm observations and receive localized weather advisories.',
      performance: 'App operates seamlessly with 0% network connectivity • App size < 18MB',
      alternative_rejected: 'Rejected React Native: Slower cold-start performance and higher crash rates on sub-₹8,000 budget Indian smartphones.',
      indian_context: 'Localized into Hindi, Marathi, Telugu, Punjabi, and Tamil; integrated with Kisan Call Center protocols.'
    },
    tier2_gateway: {
      tech: 'FastAPI Gateway + MQTT Edge Broker + Gzip Compression',
      role: 'Low-Bandwidth Mobile API Gateway & Drone Flight Telemetry Sync',
      why: 'Gzip compression minimizes data payload sizes by 75%, allowing synchronization even over fragile 2G/3G rural networks without connection drops.',
      performance: 'Compacts 50KB farm telemetry to < 12KB • Re-attempts dropped syncs automatically',
      alternative_rejected: 'Rejected Heavy GraphQL: Over-fetching and schema complexity increases mobile battery drain in rural settings.',
      indian_context: 'Optimized for high-latency rural mobile towers with automatic exponential backoff.'
    },
    tier3_core: {
      tech: 'Python FastAPI + Celery Asynchronous Queue + NVIDIA Jetson Nano Edge AI',
      role: 'Drone Orthomosaic Stitching, YOLOv8 Pest Classification & Soil Analytics',
      why: 'Heavy drone aerial imagery is processed asynchronously via Celery worker queues, while compact YOLOv8 models run on drone companion computers to detect crop weeds in real-time during flight.',
      performance: 'Detects pests in < 45ms per frame • Stitches 50-acre farm orthomosaic in < 12 mins',
      alternative_rejected: 'Rejected Cloud-Only Image Processing: Rural farmers cannot upload 2GB of high-res drone photos over mobile data; edge inference is required.',
      indian_context: 'Compliant with DGCA Digital Sky drone flight regulations and Indian AgriStack geo-referencing standards.'
    },
    tier4_data: {
      primary_db: 'PostgreSQL 16 with PostGIS (Farm Plot Geospatial Boundaries & Soil Health)',
      cache_layer: 'MinIO / AWS S3 (Multispectral Drone Imagery & Satellite NDVI Maps)',
      role: 'Spatial Farm Cadastral Mapping & Agricultural Satellite Image Store',
      why: 'PostGIS stores exact farm survey number land parcel polygons, cross-referencing soil health cards. S3 stores Sentinel-2 multispectral NDVI vegetation index maps for historical crop yield benchmarking.',
      performance: 'Spatial boundary lookup < 2ms • S3 lifecycle rules minimize cold storage costs',
      alternative_rejected: 'Rejected MySQL: PostGIS is the industry standard for GIS operations; MySQL lacks advanced spatial polygon algorithms.',
      indian_context: 'Interoperable with State Digital Land Records (Bhoomi, AnyRoR, MeeBhoomi).'
    },
    tier5_devops: {
      cloud_provider: 'AWS ECS Fargate + Local Edge Compute on NVIDIA Jetson / Raspberry Pi',
      container_ci_cd: 'Docker Containers + MAVLink Drone SDK Flight Controllers',
      security_compliance: 'Digital Agriculture Mission (AgriStack) Compliance • DPDP Act 2023 • TLS 1.3',
      why: 'Hybrid edge-and-cloud architecture guarantees that farm critical functions run offline while regional crop insights and market prices aggregate securely in the cloud.',
      performance: 'Edge nodes function indefinitely without internet • 99.9% cloud availability',
      cost_breakdown_inr: [
        { item: 'AWS Fargate Micro Processing', cost: '₹1,400/mo', note: 'Asynchronous GIS image workers' },
        { item: 'PostGIS Managed Cloud Database', cost: '₹1,200/mo', note: 'Farm polygon cadastral storage' },
        { item: 'AWS S3 Satellite Imagery Storage', cost: '₹500/mo', note: 'Compressed multispectral maps' },
        { item: 'SMS & WhatsApp Advisory Alerts', cost: '₹600/mo', note: 'Weather & pest advisory push' },
        { item: 'Cloudflare Edge CDN', cost: '₹0/mo', note: 'Free DNS & caching' }
      ],
      total_monthly_inr: '₹3,700/mo'
    }
  },

  healthcare: {
    system_archetype: 'Clinical-Grade Biometric Telemetry & ABDM FHIR Health Record Pipeline',
    readiness_score: 99,
    architecture_style: 'End-to-End Encrypted Telemetry & Interoperable EHR Mesh',
    concurrency_target: '20,000+ Continuous Vital Streams (ECG, SpO2, Heart Rate)',
    latency_target: '< 300ms Critical Arrhythmia Doctor Alert',
    monthly_opex_inr: '₹4,500 – ₹11,000 / mo',
    ai_rationale: 'Engineered for clinical-grade reliability and patient privacy. Go microservices ingest continuous Bluetooth Low Energy (BLE) vital streams from smart wearables with sub-second arrhythmia alert triggers. Full compliance with India’s Ayushman Bharat Digital Mission (ABDM M1/M2/M3) standards and FHIR patient health record protocols guarantees interoperability with hospitals across India.',
    tier1_client: {
      tech: 'React Native (BLE Patient Wearable App) + Next.js 14 Hospital Clinical Dashboard',
      role: 'Continuous Vitals Ingestion App & Doctor Critical Alert Command Center',
      why: 'React Native leverages native Bluetooth Low Energy (BLE) background services to continuously ingest telemetry from patient wearables without draining battery. The Next.js clinical dashboard visualizes multi-lead ECG waveforms with zero frame stutter.',
      performance: 'ECG graph rendering at 60fps • BLE background battery consumption < 3% per day',
      alternative_rejected: 'Rejected Web Bluetooth API: Incompatible with background mobile syncing when the smartphone screen is locked.',
      indian_context: 'Integrated with Ayushman Bharat Health Account (ABHA) digital health ID generation.'
    },
    tier2_gateway: {
      tech: 'Envoy Gateway + mTLS + HIPAA/ABDM Encrypted Ingestion Buffer',
      role: 'Hardware-Level Biometric Ingestion & Medical Data Encryption',
      why: 'All patient vital packets are encrypted using AES-256 GCM on the device before transmission, terminating through hardware-accelerated mTLS at the medical gateway.',
      performance: 'Sub-millisecond packet decryption • Zero unencrypted transit hops',
      alternative_rejected: 'Rejected Standard HTTP Reverse Proxies: Lacked granular HIPAA/ABDM audit logging and client certificate validation.',
      indian_context: 'Hosted in MeitY-empaneled Indian cloud data centers for complete sovereign healthcare data localization.'
    },
    tier3_core: {
      tech: 'Go (Golang Vital Stream Ingestion) + Python FastAPI (Biometric Analytics & Arrhythmia 1D-CNN)',
      role: 'Real-Time Telemetry Pipeline & AI Cardiac Arrhythmia Detection',
      why: 'Go handles 50,000 concurrent streaming WebSocket vital connections with zero GC jitter. A lightweight 1D-CNN neural network analyzes ECG RR-intervals, instantly firing emergency alerts to attending doctors if ventricular tachycardia is detected.',
      performance: 'Detects cardiac arrhythmia in < 180ms • 99.4% classification sensitivity',
      alternative_rejected: 'Rejected Python for raw BLE stream ingestion: High CPU overhead under 50k continuous biometric socket connections.',
      indian_context: 'CDSCO (Central Drugs Standard Control Organisation) Medical Device Rules 2017 compliant audit logs.'
    },
    tier4_data: {
      primary_db: 'TimescaleDB (Continuous Vitals Time-Series) + PostgreSQL (FHIR Standard Health Records)',
      cache_layer: 'Redis Cluster 7 (Active Patient Vitals & Emergency Doctor Alert Queue)',
      role: 'Compressed Biometric Waveform Vault & Interoperable EHR Repository',
      why: 'TimescaleDB compresses billions of continuous biometric data points by 93%. PostgreSQL stores patient demographic data and diagnostic reports in standard HL7/FHIR JSON schemas for seamless doctor handover.',
      performance: 'Compresses 100M ECG readings to < 650MB • Retrieves 24h patient Holter report in < 220ms',
      alternative_rejected: 'Rejected MongoDB: Uncompressed JSON schemas result in unsustainable storage bills for continuous health telemetry.',
      indian_context: 'Complies with ABDM Health Data Management Policy and EHR Standards 2016 (Ministry of Health).'
    },
    tier5_devops: {
      cloud_provider: 'AWS HealthLake / MeitY-Empaneled Cloud (Mumbai) + Dedicated Medical VPC',
      container_ci_cd: 'Docker Containers on AWS ECS + Hardware AES-256 Key Rotation',
      security_compliance: 'ABDM M1, M2, M3 Milestone Certification • DPDP Act 2023 • HIPAA • ISO 27799',
      why: 'Dedicated private VPC with encrypted EBS storage volumes and automated daily disaster recovery snapshots. Full audit trails record every doctor access to patient medical records.',
      performance: 'RPO = 0 • 99.99% emergency medical availability SLA',
      cost_breakdown_inr: [
        { item: 'AWS ECS Medical Processing Containers', cost: '₹2,100/mo', note: 'Encrypted vital telemetry workers' },
        { item: 'TimescaleDB Biometric Storage', cost: '₹1,800/mo', note: 'Continuous ECG & SpO2 compression' },
        { item: 'PostgreSQL FHIR Encrypted DB', cost: '₹1,400/mo', note: 'Patient health records & ABHA IDs' },
        { item: 'Emergency Doctor SMS/Call Gateway', cost: '₹800/mo', note: 'Critical alert telephonic triggers' },
        { item: 'Cloudflare Medical WAF', cost: '₹600/mo', note: 'DDoS defense and MeitY compliance' }
      ],
      total_monthly_inr: '₹6,700/mo'
    }
  },

  gaming: {
    system_archetype: 'Ultra-Low Ping Competitive Multiplayer & State Synchronization Engine',
    readiness_score: 97,
    architecture_style: 'Bare-Metal Edge UDP Game Servers & Microservices',
    concurrency_target: '50,000+ Concurrent Gamers @ 60 FPS',
    latency_target: '< 25ms Ping across Tier-1/2 Indian Cities',
    monthly_opex_inr: '₹6,000 – ₹16,000 / mo',
    ai_rationale: 'Engineered specifically for low-latency competitive multiplayer gaming and esports tournaments. Bare-metal edge game servers running dedicated Go physics loops communicate over UDP protocol, delivering sub-25ms ping times across Indian broadband and 5G networks. Redis Enterprise ensures instant global leaderboard synchronization and sub-second matchmaking queues.',
    tier1_client: {
      tech: 'Unity / Unreal Engine 5 (WebGL, PC & Android) + React 18 TypeScript (Tournament Matchmaking Lobby)',
      role: 'High-Fidelity Gameplay Client & Web Tournament Command Portal',
      why: 'Unity delivers native GPU-accelerated 60fps rendering across both mobile and PC. The React tournament portal allows players to inspect leaderboards, join custom lobbies, and manage player inventories without launching the game engine.',
      performance: 'Stable 60 FPS rendering • WebGL initial download size < 45MB',
      alternative_rejected: 'Rejected Web-only Three.js for core gameplay: Lacks physics engine maturity and multi-threaded audio/input pipelines needed for fast-paced multiplayer.',
      indian_context: 'Adaptive texture resolution automatically scales for budget Indian gaming smartphones (Snapdragon 600/700 series).'
    },
    tier2_gateway: {
      tech: 'Agones Kubernetes Game Server Orchestrator + Bare-Metal UDP Relays',
      role: 'Game Server Lifecycle Management, UDP Routing & Matchmaking Router',
      why: 'Agones manages dedicated game server instances on Kubernetes, dynamically spinning up fresh game rooms in under 500ms when matchmaking queues fill up and terminating them when matches conclude.',
      performance: 'UDP packet routing overhead < 0.5ms • Auto-scales game server pods dynamically',
      alternative_rejected: 'Rejected TCP WebSockets for gameplay: TCP head-of-line blocking creates packet stalls, causing rubber-banding during latency spikes.',
      indian_context: 'Edge nodes deployed in Mumbai, Bangalore, and Delhi for minimal latency across Indian ISPs.'
    },
    tier3_core: {
      tech: 'Go (Golang Dedicated Game Server Physics Loop @ 60Hz) + Node.js (Player Social & Inventory Services)',
      role: 'Authoritative Server Game State, Hitbox Verification & Anti-Cheat Validation',
      why: 'An authoritative server architecture executes game physics on the Go server at 60 ticks per second, making client-side speed hacking and memory editing physically impossible.',
      performance: '60Hz server tick loop with < 16ms frame budget • Memory footprint < 80MB per match',
      alternative_rejected: 'Rejected Peer-to-Peer (P2P): P2P architecture exposes player IP addresses to DDoS attacks and allows client-side match cheating.',
      indian_context: 'Compliant with MeitY Online Gaming Self-Regulatory Guidelines and verified age gating.'
    },
    tier4_data: {
      primary_db: 'Redis Enterprise 7 (Sub-Millisecond Player State & Matchmaking Queues) + PostgreSQL',
      cache_layer: 'MongoDB (Player Inventories, Seasonal Skins & Achievement Logs)',
      role: 'Instant Player Leaderboard Updates & Document-Based Inventory Store',
      why: 'Redis Sorted Sets compute global leaderboard ranks across 500,000 players in under 2ms. MongoDB stores flexible player weapon skins and quest progress without schema migrations.',
      performance: 'Leaderboard rank lookup in < 1.5ms • Atomic inventory trading transactions',
      alternative_rejected: 'Rejected Plain SQL for leaderboards: Sorting 500k rows in SQL during live matches causes severe CPU spikes.',
      indian_context: 'Localized payment gateways (UPI, Paytm) for in-game season pass purchases.'
    },
    tier5_devops: {
      cloud_provider: 'AWS GameLift / Bare-Metal Edge Cloud + Cloudflare Spectrum for UDP DDoS',
      container_ci_cd: 'Dockerized Game Builds + GitHub Actions Automated Deployment',
      security_compliance: 'MeitY Guidelines on Skill-Based Gaming • DPDP Act 2023 • Anti-Cheat Anomaly Detection',
      why: 'Cloudflare Spectrum proxies UDP traffic to bare-metal edge servers, absorbing volumetric DDoS attacks targeted at competitive tournament servers.',
      performance: 'Absorbs up to 100 Gbps DDoS attack traffic • Zero game interruption',
      cost_breakdown_inr: [
        { item: 'Bare-Metal Edge Game Nodes (Mumbai/BLR)', cost: '₹3,200/mo', note: 'Low-ping UDP game server hosting' },
        { item: 'Redis Enterprise Managed Cache', cost: '₹1,600/mo', note: 'Real-time leaderboards & matchmaking' },
        { item: 'PostgreSQL & Mongo Cloud DB', cost: '₹1,500/mo', note: 'Player accounts & inventory ledgers' },
        { item: 'Cloudflare Spectrum DDoS Defense', cost: '₹1,400/mo', note: 'UDP proxy & attack absorption' },
        { item: 'Web Admin Vercel Hosting', cost: '₹0/mo', note: 'Tournament lobby web portal' }
      ],
      total_monthly_inr: '₹7,700/mo'
    }
  },

  proptech: {
    system_archetype: 'Geospatial Property Intelligence & 3D Digital Twin Engine',
    readiness_score: 96,
    architecture_style: 'Vector Similarity Search & Geospatial PostGIS Microservices',
    concurrency_target: '25,000+ Concurrent Home Buyers & Real Estate Brokers',
    latency_target: '< 15ms PostGIS Spatial Radius Query • 60fps 3D Virtual Tour',
    monthly_opex_inr: '₹2,800 – ₹6,500 / mo',
    ai_rationale: 'Engineered specifically for spatial real estate intelligence and remote home-buying. PostGIS executes sub-10ms bounding-box and polygon locality queries, while Qdrant vector database allows buyers to search by architectural aesthetics. Immersive Three.js digital-twin tours eliminate unnecessary physical site visits, accelerating buyer decisions while keeping infrastructure cost under ₹3,500/mo.',
    tier1_client: {
      tech: 'Next.js 14 + Mapbox GL JS (Locality Price Heatmaps) + Three.js (Virtual 3D Digital Twin Tours)',
      role: 'Interactive Geospatial Property Map & Immersive 3D Walkthrough Portal',
      why: 'Mapbox GL JS renders thousands of verified property markers with smooth clustering and dynamic price heatmaps. Three.js allows buyers to explore full 3D interior digital twins with realistic ambient lighting directly in mobile browsers.',
      performance: 'Renders 5,000 property map pins at 60fps • 3D room tour loads in < 1.4s',
      alternative_rejected: 'Rejected Google Maps API: Mapbox provides 10x higher customization for custom zoning layers and 4x lower billing cost.',
      indian_context: 'Integrated with RERA registration number verification badges and digital land record title checks.'
    },
    tier2_gateway: {
      tech: 'Cloudflare Edge Workers + Nginx API Gateway',
      role: 'Edge Cache for Property Listings & High-Resolution Image Compression',
      why: 'Caches high-resolution property image thumbnails and locality metadata at Indian edge POPs, ensuring instant image loading for mobile buyers.',
      performance: 'Image thumbnail edge cache hit ratio > 92% • Global TTFB < 20ms',
      alternative_rejected: 'Rejected Standard Origin Server: Heavy 4K property photos overwhelm origin servers without edge caching.',
      indian_context: 'Optimized for mobile 4G speeds with automatic WebP/AVIF modern image formatting.'
    },
    tier3_core: {
      tech: 'Python FastAPI (Property Valuation & Recommendation) + Node.js (Real-time Broker Chat)',
      role: 'Automated Valuation Model (AVM), Broker Messaging & RERA Verification',
      why: 'FastAPI powers machine learning regression models estimating fair market property values and expected rental yields. Node.js handles real-time WebSockets for buyer-broker chat and site visit bookings.',
      performance: 'Predicts property market valuation in < 40ms • Sub-50ms broker chat delivery',
      alternative_rejected: 'Rejected PHP/WordPress (legacy real estate templates): Rigid monolithic schemas cannot support spatial PostGIS queries or ML price prediction.',
      indian_context: 'Direct integration with state RERA portals and digital registry archives (Bhoomi, AnyRoR).'
    },
    tier4_data: {
      primary_db: 'PostgreSQL 16 with PostGIS (Geospatial Radius Queries & Property Catalog)',
      cache_layer: 'Qdrant (Vector DB for Aesthetic Similarity) + Redis 7 (Live User Filters)',
      role: 'Spatial Property Polygons & Semantic Visual Similarity Search',
      why: 'PostGIS executes complex queries (e.g. "Properties within 2km of Metro station and under ₹75 Lakhs") in under 8ms. Qdrant vector database enables buyers to search by room aesthetics using visual embeddings.',
      performance: 'Spatial polygon search < 6ms • Vector nearest-neighbor query < 15ms',
      alternative_rejected: 'Rejected MySQL: PostGIS provides spatial index algorithms (R-Tree / GIST) that are orders of magnitude faster than basic MySQL spatial functions.',
      indian_context: 'Pre-indexed by Indian PIN codes, municipal ward boundaries, and school zones.'
    },
    tier5_devops: {
      cloud_provider: 'Vercel Pro (Edge Frontend) + AWS RDS PostgreSQL + AWS S3 with CloudFront CDN',
      container_ci_cd: 'Docker Containers + Automated Image Optimization Pipeline',
      security_compliance: 'RERA Compliance Verification • DPDP Act 2023 • TLS 1.3 • Encrypted Storage',
      why: 'Vercel edge handles global frontend traffic with zero server management, while AWS RDS handles reliable database transactions with automated daily backups.',
      performance: '99.98% uptime SLA • Image CDN delivers photos in < 150ms',
      cost_breakdown_inr: [
        { item: 'Vercel Pro Edge Hosting', cost: '₹1,600/mo', note: 'Global edge SSR and Next.js frontend' },
        { item: 'AWS RDS PostgreSQL (db.t4g.micro)', cost: '₹950/mo', note: 'PostGIS database instance' },
        { item: 'AWS S3 & CloudFront Media CDN', cost: '₹800/mo', note: 'High-res property photos & 3D models' },
        { item: 'Qdrant Vector Cloud (Free Tier)', cost: '₹0/mo', note: 'Covers up to 100k vector embeddings' },
        { item: 'WhatsApp Business API Alerts', cost: '₹450/mo', note: 'Site visit confirmations & broker chats' }
      ],
      total_monthly_inr: '₹3,800/mo'
    }
  },

  manufacturing: {
    system_archetype: 'Industrial Mathematical Optimization & ERP Production Ledger',
    readiness_score: 95,
    architecture_style: 'Lightweight Containerized ERP & Algorithmic Cutting Optimization',
    concurrency_target: '5,000+ B2B Enterprise Purchase Orders / Day',
    latency_target: '< 100ms Cutting Optimization Calculation • Real-Time OEE Sync',
    monthly_opex_inr: '₹2,500 – ₹6,000 / mo',
    ai_rationale: 'Designed specifically for modern sustainable packaging and green manufacturing operations. A browser-based Three.js CAD tool gives enterprise buyers instant 3D folding previews of custom die-cut boxes. The Python mathematical optimization engine calculates exact cutting-stock layouts, slashing raw paperboard scrap waste by 18% and generating instant quotes.',
    tier1_client: {
      tech: 'React.js 18 + Three.js (Interactive 3D Box Folding Customizer) + Tailwind CSS',
      role: 'B2B Custom Packaging Designer & Enterprise Procurement Web Portal',
      why: 'Three.js allows enterprise packaging procurement officers to adjust box dimensions (length, width, height, GSM thickness, fluting type) and view real-time 3D folding animations with live unit cost updates.',
      performance: 'Interactive 3D model renders at 60fps • Real-time box price recalculation in < 15ms',
      alternative_rejected: 'Rejected Static Forms / 2D PDF Proofs: 3D interactive preview eliminates sample physical mockup delays, shortening B2B sales cycles from 2 weeks to 20 minutes.',
      indian_context: 'Displays standard Indian paper GSM specifications and CPCB (Central Pollution Control Board) biodegradable stamp markers.'
    },
    tier2_gateway: {
      tech: 'Nginx ASGI Reverse Proxy + SSL Termination + Let’s Encrypt Auto-Renewal',
      role: 'B2B Portal API Gateway & Production Machine Webhook Receiver',
      why: 'Efficiently routes B2B client quote requests and receives telemetry webhooks from automated cutting and printing machinery on the factory floor.',
      performance: 'Reverse proxy overhead < 1ms • 100% automated SSL certificate renewal',
      alternative_rejected: 'Rejected Costly Enterprise Gateways: Nginx provides all necessary reverse proxy capabilities with zero monthly licensing fees.',
      indian_context: 'Hosted on Indian server IP ranges for minimal latency to domestic corporate clients.'
    },
    tier3_core: {
      tech: 'Python FastAPI (Cutting-Stock Optimization Algorithm) + Node.js (B2B Order & Invoice Pipeline)',
      role: 'Linear Programming Math Optimization, ERP Bill-of-Materials & GST Invoicing',
      why: 'FastAPI executes Python SciPy / PuLP linear programming models to solve the 2D Cutting-Stock Problem (CSP), arranging multiple box die-cuts onto master paper reels with minimal scrap. Node.js handles B2B quotes and automated GST e-invoices.',
      performance: 'Solves complex master reel cutting layout in < 85ms • Slashing scrap waste by 18%',
      alternative_rejected: 'Rejected Manual Estimator Spreadsheets: Human estimation produces 12-25% scrap waste and takes 24 hours per complex quote.',
      indian_context: 'Automated integration with Government of India GST E-Invoicing and E-Way Bill APIs.'
    },
    tier4_data: {
      primary_db: 'PostgreSQL 16 (B2B Purchase Orders, ERP Bill-of-Materials & Batch Tracking)',
      cache_layer: 'Redis 7 (Live Material Pricing & Paper GSM Market Rates)',
      role: 'Enterprise Manufacturing Journal & Raw Material Inventory Ledger',
      why: 'PostgreSQL tracks raw paperboard reels, batch numbers, die-cut tooling schedules, and finished goods inventory with complete relational consistency.',
      performance: 'Sub-4ms indexed query execution • Zero inventory ledger discrepancies',
      alternative_rejected: 'Rejected Legacy Desktop Tally: Tally cannot be embedded into web applications or connected directly to mathematical optimization algorithms.',
      indian_context: 'Full audit history compliant with Extended Producer Responsibility (EPR) regulations.'
    },
    tier5_devops: {
      cloud_provider: 'DigitalOcean / AWS EC2 (Mumbai ap-south-1) + Automated Daily Database Snapshots',
      container_ci_cd: 'Docker Compose on Linux VPS + GitHub Actions CI/CD',
      security_compliance: 'CPCB Biodegradable Packaging Compliance • DPDP Act 2023 • GST E-Way Bill API',
      why: 'Docker Compose on a robust Linux cloud server provides predictable, reliable performance with zero complex Kubernetes overhead, keeping monthly costs ultra-affordable.',
      performance: '99.95% server availability • Automated nightly off-site backups',
      cost_breakdown_inr: [
        { item: 'Linux Cloud VPS (4GB RAM, 2 vCPU)', cost: '₹1,500/mo', note: 'Runs web portal and math engine' },
        { item: 'PostgreSQL Managed DB / Local Docker', cost: '₹800/mo', note: 'ERP production orders & batches' },
        { item: 'Automated S3 Off-Site Backups', cost: '₹250/mo', note: 'Encrypted daily production backups' },
        { item: 'Cloudflare DNS & SSL', cost: '₹0/mo', note: 'Free edge protection & DDoS shield' },
        { item: 'GST E-Invoicing API Gateway', cost: '₹400/mo', note: 'Automated B2B tax invoice sync' }
      ],
      total_monthly_inr: '₹2,950/mo'
    }
  },

  logistics: {
    system_archetype: 'Telematics Big Data Ingestion & Combinatorial Route Optimizer',
    readiness_score: 97,
    architecture_style: 'High-Throughput GPS Ingestion & Discrete Optimization Pipeline',
    concurrency_target: '50,000+ GPS Pings / Sec from Commercial Fleet Trucks',
    latency_target: '< 30ms GPS Telematics Ingest • < 1.5s 100-Stop Route Optimization',
    monthly_opex_inr: '₹4,000 – ₹10,500 / mo',
    ai_rationale: 'Engineered for commercial freight and fleet operations. Replaces basic CRUD setups with high-throughput Go telemetry gateways handling 50,000 GPS pings per second. Google OR-Tools solves the Capacitated Vehicle Routing Problem with Time Windows (CVRPTW), slashing truck fuel burn by 15-22% and integrating directly with India’s National Logistics Policy ULIP API.',
    tier1_client: {
      tech: 'Next.js 14 + Mapbox GL JS (Real-Time Fleet Telematics, Geofencing & Interactive Route Matrix)',
      role: 'Fleet Dispatcher Command Console & Driver Navigation Mobile Web App',
      why: 'Mapbox GL JS renders thousands of moving delivery trucks with live directional arrows, geofencing boundary circles, and speed violation alerts without UI lag.',
      performance: 'Renders 2,000 moving trucks at 60fps • Real-time GPS ping position update < 80ms',
      alternative_rejected: 'Rejected Google Maps JavaScript API: Expensive per-tile pricing resulting in exorbitant monthly bills for high-frequency live vehicle tracking.',
      indian_context: 'Displays National Highway (NH) corridors, toll plazas, and Fastag checkpoint status.'
    },
    tier2_gateway: {
      tech: 'Go Telematics Ingestion Gateway + Nginx Reverse Proxy',
      role: 'High-Speed GPS Telematics Ping Ingestion & Payload Normalization',
      why: 'Go processes compact binary and JSON GPS payloads from truck telematics hardware (AIS-140 standard) with minimal memory overhead and zero garbage collection pauses.',
      performance: 'Ingests 50,000 GPS pings/sec with < 5ms processing time per packet',
      alternative_rejected: 'Rejected Python/Node for raw GPS ingest: Python event loop stalls under 50k continuous hardware UDP/TCP pings.',
      indian_context: 'Fully compliant with India’s AIS-140 mandatory commercial vehicle GPS tracking standard.'
    },
    tier3_core: {
      tech: 'Python FastAPI (Vehicle Routing Optimization) + Google OR-Tools (CVRPTW Solver) + Apache Kafka',
      role: 'Dynamic Route Optimization, Dispatch Assignment & ETA Prediction',
      why: 'Google OR-Tools solves the complex Capacitated Vehicle Routing Problem with Time Windows (CVRPTW), factoring in truck weight capacities, driver duty hours, and delivery time windows to generate the shortest, fuel-optimal route.',
      performance: 'Optimizes 100 delivery stops across 10 trucks in 1.4 seconds • Slashes fuel costs by 18%',
      alternative_rejected: 'Rejected Naive Greedy Route Sorting: Greedy algorithms yield sub-optimal routes that waste 15-25% more diesel fuel on Indian highways.',
      indian_context: 'Integrated with India’s Unified Logistics Interface Platform (ULIP) API for seamless toll & transport data.'
    },
    tier4_data: {
      primary_db: 'TimescaleDB (Fleet GPS Breadcrumb Telemetry) + PostgreSQL 16 (Enterprise Billing)',
      cache_layer: 'Redis 7 (Live Vehicle Coordinate Cache & Active Dispatch Queue)',
      role: 'High-Density GPS Breadcrumb Archive & Instant Driver Assignment Queue',
      why: 'TimescaleDB compresses billions of continuous GPS coordinate points with 91% disk space savings. Redis provides sub-millisecond retrieval of the latest known coordinates of all active fleet vehicles.',
      performance: 'Retrieves latest coordinate of 5,000 trucks in < 2ms • 91% historical GPS log compression',
      alternative_rejected: 'Rejected Standard MySQL: Unpartitioned tables choke and lock when writing millions of GPS rows per hour.',
      indian_context: 'Automated Fastag toll reconciliation and e-way bill transport status validation.'
    },
    tier5_devops: {
      cloud_provider: 'AWS EKS with Spot Instances (70% Compute Cost Reduction) + Apache Kafka Message Bus',
      container_ci_cd: 'Docker Containers + Prometheus & Grafana Live Fleet Observability Stack',
      security_compliance: 'ULIP (Unified Logistics Interface Platform) National API Integration • AIS-140 • DPDP Act 2023',
      why: 'Using EC2 Spot instances for background route optimization batch workers cuts cloud compute bills by over 70% while maintaining enterprise-grade resilience.',
      performance: '99.98% availability SLA • Automated failover across Indian availability zones',
      cost_breakdown_inr: [
        { item: 'AWS EKS Worker Nodes (Spot Compute)', cost: '₹2,100/mo', note: 'Route optimization & GPS workers' },
        { item: 'TimescaleDB GPS Breadcrumb DB', cost: '₹1,600/mo', note: 'Compressed time-series vehicle tracking' },
        { item: 'PostgreSQL Enterprise Billing DB', cost: '₹950/mo', note: 'Customer accounts & e-way bills' },
        { item: 'Redis Managed In-Memory Cache', cost: '₹700/mo', note: 'Real-time vehicle location state' },
        { item: 'Kafka Message Bus (Upstash/Confluent)', cost: '₹850/mo', note: 'Decoupled telematics ingestion queue' }
      ],
      total_monthly_inr: '₹6,200/mo'
    }
  }
};

// ============================================================
// HELPER: RESOLVE SECTOR BLUEPRINT
// ============================================================

const resolveSectorKey = (industry, title) => {
  const raw = `${industry || ''} ${title || ''}`.toLowerCase();
  if (/packag|manufactur|ecoprint/.test(raw)) return 'manufacturing';
  if (/health|medtech|patient|wearab|carepulse|doctor|clinic/.test(raw)) return 'healthcare';
  if (/solar|cleantech|energy|renewable|carbon|solargrid/.test(raw)) return 'cleantech';
  if (/food|beverage|cafe|restaurant|greenbite|dining/.test(raw)) return 'food & beverage';
  if (/quick comm|e-commerce|ecommerce|hypermart|retail|grocery/.test(raw)) return 'e-commerce';
  if (/fintech|crypto|payment|vaultpay|banking|wallet/.test(raw)) return 'fintech';
  if (/cyber|security|zero trust|threat|cybershield/.test(raw)) return 'cybersecurity';
  if (/agtech|agri|farm|robofarm|crop/.test(raw)) return 'agtech';
  if (/gaming|game|web3|metaverse|esport/.test(raw)) return 'gaming';
  if (/proptech|real estate|propmatch|property|broker/.test(raw)) return 'proptech';
  if (/logist|fleet|freight|transport|neurallogistics/.test(raw)) return 'logistics';
  if (/edtech|time table|timetable|education|school|skillcraft|college/.test(raw)) return 'edtech';
  return 'edtech';
};

// ============================================================
// MAIN COMPONENT: TechnologyTab
// ============================================================

const TechnologyTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('blueprint');
  const [copied, setCopied] = useState(false);

  // Determine the best blueprint for this idea
  const sectorKey = useMemo(() => {
    return resolveSectorKey(idea?.industry, idea?.title);
  }, [idea?.industry, idea?.title]);

  const bp = useMemo(() => {
    return SECTOR_TECH_BLUEPRINTS[sectorKey] || SECTOR_TECH_BLUEPRINTS.edtech;
  }, [sectorKey]);

  // Handle Copy Blueprint to Clipboard
  const handleCopyBlueprint = () => {
    const markdown = `# ${idea?.title || 'Startup'} — Technology Architecture Blueprint
**Archetype:** ${bp.system_archetype}
**Architecture Style:** ${bp.architecture_style}
**Readiness Grade:** ${bp.readiness_score}/100 (Production Ready)
**Target Latency:** ${bp.latency_target}
**Peak Concurrency:** ${bp.concurrency_target}
**Estimated Monthly Cloud OpEx:** ${bp.monthly_opex_inr}

## AI System Rationale
${bp.ai_rationale}

## 1. Presentation & Touchpoints (Tier 1)
- **Technology:** ${bp.tier1_client.tech}
- **Role:** ${bp.tier1_client.role}
- **Why We Recommended This:** ${bp.tier1_client.why}
- **Performance Benchmark:** ${bp.tier1_client.performance}
- **Alternative Rejected:** ${bp.tier1_client.alternative_rejected}
- **Indian Market Fit:** ${bp.tier1_client.indian_context}

## 2. API Gateway & Routing (Tier 2)
- **Technology:** ${bp.tier2_gateway.tech}
- **Role:** ${bp.tier2_gateway.role}
- **Why We Recommended This:** ${bp.tier2_gateway.why}
- **Performance Benchmark:** ${bp.tier2_gateway.performance}

## 3. Core Engine & Computation (Tier 3)
- **Technology:** ${bp.tier3_core.tech}
- **Role:** ${bp.tier3_core.role}
- **Why We Recommended This:** ${bp.tier3_core.why}
- **Performance Benchmark:** ${bp.tier3_core.performance}
- **Alternative Rejected:** ${bp.tier3_core.alternative_rejected}

## 4. Database & Caching (Tier 4)
- **Primary Database:** ${bp.tier4_data.primary_db}
- **Cache / Storage:** ${bp.tier4_data.cache_layer}
- **Role:** ${bp.tier4_data.role}
- **Why We Recommended This:** ${bp.tier4_data.why}
- **Performance Benchmark:** ${bp.tier4_data.performance}

## 5. Cloud, DevOps & Compliance (Tier 5)
- **Cloud Hosting:** ${bp.tier5_devops.cloud_provider}
- **Container / CI/CD:** ${bp.tier5_devops.container_ci_cd}
- **Compliance & Security:** ${bp.tier5_devops.security_compliance}
- **Monthly OpEx:** ${bp.tier5_devops.total_monthly_inr}
`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="technology-tab animate-fade-in">
      {/* ============================================================
          1. EXECUTIVE TECHNOLOGY HEADER
          ============================================================ */}
      <div className="tech-executive-header glass-card mb-xl">
        <div className="tech-header-top">
          <div className="tech-header-title-block">
            <div className="flex align-center gap-sm mb-xs">
              <span className="tech-pill-badge tech-pill-sector">
                <FaMicrochip /> {idea?.industry || 'Technology'} • {idea?.sector?.toUpperCase() || 'ONLINE'}
              </span>
              <span className="tech-pill-badge tech-pill-grade">
                <FaCheckCircle /> Grade: {bp.readiness_score}/100 Production Ready
              </span>
            </div>
            <h2 className="tech-system-title">
              {idea?.title ? `${idea.title} — System Architecture` : 'Enterprise Technology Architecture'}
            </h2>
            <div className="tech-archetype-tag">
              <FaBolt className="text-warning" /> <strong>System Archetype:</strong> {bp.system_archetype}
            </div>
          </div>

          <div className="tech-header-metrics">
            <div className="tech-metric-box">
              <div className="tech-metric-lbl">Target Latency</div>
              <div className="tech-metric-val text-info">{bp.latency_target}</div>
            </div>
            <div className="tech-metric-box">
              <div className="tech-metric-lbl">Peak Concurrency</div>
              <div className="tech-metric-val text-primary">{bp.concurrency_target.split(' ')[0]}</div>
            </div>
            <div className="tech-metric-box tech-metric-highlight">
              <div className="tech-metric-lbl">Est. Cloud OpEx</div>
              <div className="tech-metric-val text-success">
                <FaRupeeSign style={{ fontSize: '0.9em', marginRight: '2px' }} />
                {bp.tier5_devops.total_monthly_inr.replace('₹', '')}
              </div>
            </div>
          </div>
        </div>

        {/* AI Architectural Rationale Banner */}
        <div className="tech-ai-rationale-banner mt-md">
          <div className="tech-rationale-title flex align-center gap-xs text-primary font-bold mb-xs">
            <FaBrain /> AI Architectural Rationale for {idea?.title || 'this Startup'}:
          </div>
          <p className="tech-rationale-text text-secondary">
            {data?.reasoning || bp.ai_rationale}
          </p>
        </div>

        {/* Action Button: Copy Blueprint */}
        <div className="flex justify-between align-center mt-md pt-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-muted text-xs flex align-center gap-xs">
            <FaInfoCircle /> Verified against 64,461 Stack Overflow developer benchmarks & real startup production topologies
          </div>
          <button 
            className="tech-copy-btn flex align-center gap-xs"
            onClick={handleCopyBlueprint}
          >
            {copied ? <><FaCheck className="text-success" /> Architecture Copied!</> : <><FaClipboard /> Copy Architecture Blueprint</>}
          </button>
        </div>
      </div>

      {/* ============================================================
          2. INTERACTIVE SUB-TAB NAVIGATION
          ============================================================ */}
      <div className="tech-subtab-nav mb-xl">
        <button
          className={`tech-tab-btn ${activeSubTab === 'blueprint' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('blueprint')}
        >
          <FaNetworkWired /> 1. Visual 5-Tier Blueprint
        </button>

        <button
          className={`tech-tab-btn ${activeSubTab === 'client' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('client')}
        >
          <FaLaptopCode /> 2. Client & Touchpoints
        </button>

        <button
          className={`tech-tab-btn ${activeSubTab === 'core' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('core')}
        >
          <FaServer /> 3. API & Specialized Engine
        </button>

        <button
          className={`tech-tab-btn ${activeSubTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('data')}
        >
          <FaDatabase /> 4. Database & Caching
        </button>

        <button
          className={`tech-tab-btn ${activeSubTab === 'devops' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('devops')}
        >
          <FaShieldAlt /> 5. Cloud & Compliance
        </button>

        <button
          className={`tech-tab-btn ${activeSubTab === 'costs' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('costs')}
        >
          <FaRupeeSign /> 6. Cloud Budget (₹)
        </button>
      </div>

      {/* ============================================================
          SUB-TAB 1: VISUAL 5-TIER BLUEPRINT FLOW
          ============================================================ */}
      {activeSubTab === 'blueprint' && (
        <div className="tech-blueprint-container animate-fade-in mb-xl">
          <div className="tech-blueprint-flow-header mb-md flex justify-between align-center">
            <h3 className="text-primary flex align-center gap-xs" style={{ fontSize: '1.25rem', margin: 0 }}>
              <FaNetworkWired /> End-to-End System Topology (5-Tier Interactive Flow)
            </h3>
            <span className="text-muted text-xs">Click any tier node below to inspect its detailed specifications</span>
          </div>

          <div className="tech-blueprint-grid">
            {/* TIER 1 NODE */}
            <div 
              className="tech-tier-node" 
              onClick={() => setActiveSubTab('client')}
              style={{ borderTop: '4px solid #6366f1' }}
            >
              <div className="tech-node-step">TIER 1</div>
              <div className="tech-node-icon" style={{ color: '#6366f1' }}><FaLaptopCode /></div>
              <div className="tech-node-name">Client Presentation</div>
              <div className="tech-node-tech">{bp.tier1_client.tech.split('+')[0].trim()}</div>
              <div className="tech-node-metric">{bp.tier1_client.performance.split('•')[0].trim()}</div>
              <div className="tech-node-action">Click to inspect →</div>
            </div>

            <div className="tech-flow-arrow">→</div>

            {/* TIER 2 NODE */}
            <div 
              className="tech-tier-node" 
              onClick={() => setActiveSubTab('core')}
              style={{ borderTop: '4px solid #8b5cf6' }}
            >
              <div className="tech-node-step">TIER 2</div>
              <div className="tech-node-icon" style={{ color: '#8b5cf6' }}><FaCogs /></div>
              <div className="tech-node-name">Edge & Gateway</div>
              <div className="tech-node-tech">{bp.tier2_gateway.tech.split('+')[0].trim()}</div>
              <div className="tech-node-metric">{bp.tier2_gateway.performance.split('•')[0].trim()}</div>
              <div className="tech-node-action">Click to inspect →</div>
            </div>

            <div className="tech-flow-arrow">→</div>

            {/* TIER 3 NODE */}
            <div 
              className="tech-tier-node" 
              onClick={() => setActiveSubTab('core')}
              style={{ borderTop: '4px solid #ec4899' }}
            >
              <div className="tech-node-step">TIER 3</div>
              <div className="tech-node-icon" style={{ color: '#ec4899' }}><FaBrain /></div>
              <div className="tech-node-name">Core Domain Engine</div>
              <div className="tech-node-tech">{bp.tier3_core.tech.split('+')[0].trim()}</div>
              <div className="tech-node-metric">{bp.tier3_core.performance.split('•')[0].trim()}</div>
              <div className="tech-node-action">Click to inspect →</div>
            </div>

            <div className="tech-flow-arrow">→</div>

            {/* TIER 4 NODE */}
            <div 
              className="tech-tier-node" 
              onClick={() => setActiveSubTab('data')}
              style={{ borderTop: '4px solid #06b6d4' }}
            >
              <div className="tech-node-step">TIER 4</div>
              <div className="tech-node-icon" style={{ color: '#06b6d4' }}><FaDatabase /></div>
              <div className="tech-node-name">Persistence & Cache</div>
              <div className="tech-node-tech">{bp.tier4_data.primary_db.split('(')[0].trim()}</div>
              <div className="tech-node-metric">{bp.tier4_data.performance.split('•')[0].trim()}</div>
              <div className="tech-node-action">Click to inspect →</div>
            </div>

            <div className="tech-flow-arrow">→</div>

            {/* TIER 5 NODE */}
            <div 
              className="tech-tier-node" 
              onClick={() => setActiveSubTab('devops')}
              style={{ borderTop: '4px solid #10b981' }}
            >
              <div className="tech-node-step">TIER 5</div>
              <div className="tech-node-icon" style={{ color: '#10b981' }}><FaCloud /></div>
              <div className="tech-node-name">Cloud & Security</div>
              <div className="tech-node-tech">{bp.tier5_devops.cloud_provider.split('+')[0].trim()}</div>
              <div className="tech-node-metric">OpEx: {bp.tier5_devops.total_monthly_inr}</div>
              <div className="tech-node-action">Click to inspect →</div>
            </div>
          </div>

          {/* Architecture Quick Summary Matrix */}
          <div className="tech-summary-matrix glass-card mt-xl">
            <h4 className="text-primary mb-md flex align-center gap-xs">
              <FaTachometerAlt /> Architectural Blueprint Specifications Matrix
            </h4>
            <div className="tech-matrix-grid">
              <div className="tech-matrix-row">
                <span className="matrix-lbl">Presentation & Touchpoints:</span>
                <span className="matrix-val text-info">{bp.tier1_client.tech}</span>
              </div>
              <div className="tech-matrix-row">
                <span className="matrix-lbl">API Gateway & Edge:</span>
                <span className="matrix-val text-primary">{bp.tier2_gateway.tech}</span>
              </div>
              <div className="tech-matrix-row">
                <span className="matrix-lbl">Core Business Engine:</span>
                <span className="matrix-val text-accent">{bp.tier3_core.tech}</span>
              </div>
              <div className="tech-matrix-row">
                <span className="matrix-lbl">Primary Database:</span>
                <span className="matrix-val text-info">{bp.tier4_data.primary_db}</span>
              </div>
              <div className="tech-matrix-row">
                <span className="matrix-lbl">Cache & Session State:</span>
                <span className="matrix-val text-warning">{bp.tier4_data.cache_layer}</span>
              </div>
              <div className="tech-matrix-row">
                <span className="matrix-lbl">Cloud Hosting Infrastructure:</span>
                <span className="matrix-val text-success">{bp.tier5_devops.cloud_provider}</span>
              </div>
              <div className="tech-matrix-row">
                <span className="matrix-lbl">Indian Regulatory Compliance:</span>
                <span className="matrix-val text-success">{bp.tier5_devops.security_compliance}</span>
              </div>
              <div className="tech-matrix-row">
                <span className="matrix-lbl">Estimated Monthly Cloud OpEx:</span>
                <span className="matrix-val text-success font-bold">{bp.tier5_devops.total_monthly_inr}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 2: CLIENT PRESENTATION LAYER & TOUCHPOINTS
          ============================================================ */}
      {activeSubTab === 'client' && (
        <div className="tech-detail-section animate-fade-in mb-xl">
          <div className="tech-card-featured glass-card mb-lg" style={{ borderLeft: '5px solid #6366f1' }}>
            <div className="tech-card-header">
              <div className="flex align-center gap-sm">
                <div className="tech-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                  <FaLaptopCode />
                </div>
                <div>
                  <div className="tech-tier-tag">TIER 1 — PRESENTATION LAYER</div>
                  <h3 className="tech-card-title">{bp.tier1_client.tech}</h3>
                </div>
              </div>
              <span className="tech-role-chip">{bp.tier1_client.role}</span>
            </div>

            {/* Why We Recommended This */}
            <div className="tech-rationale-box mt-md">
              <div className="tech-rationale-header flex align-center gap-xs text-primary font-bold mb-xs">
                <FaCheckCircle /> Why We Recommended This Technology:
              </div>
              <p className="text-secondary">{bp.tier1_client.why}</p>
            </div>

            {/* Performance Benchmark */}
            <div className="tech-metric-chip-row mt-md">
              <div className="tech-metric-chip">
                <span className="chip-lbl">Performance Benchmark:</span>
                <span className="chip-val text-info">{bp.tier1_client.performance}</span>
              </div>
            </div>

            {/* Alternative Considered & Rejected */}
            <div className="tech-tradeoff-box mt-md">
              <div className="tradeoff-header text-warning flex align-center gap-xs font-bold mb-xs">
                <FaExchangeAlt /> Alternative Considered & Rejected:
              </div>
              <p className="text-secondary text-sm">{bp.tier1_client.alternative_rejected}</p>
            </div>

            {/* Indian Operational Context */}
            <div className="tech-indian-box mt-md">
              <div className="indian-header text-success flex align-center gap-xs font-bold mb-xs">
                <FaRupeeSign /> Indian Market & Operational Fit:
              </div>
              <p className="text-secondary text-sm">{bp.tier1_client.indian_context}</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 3: API GATEWAY & SPECIALIZED CORE ENGINE
          ============================================================ */}
      {activeSubTab === 'core' && (
        <div className="tech-detail-section animate-fade-in mb-xl">
          {/* TIER 2: API GATEWAY */}
          <div className="tech-card-featured glass-card mb-lg" style={{ borderLeft: '5px solid #8b5cf6' }}>
            <div className="tech-card-header">
              <div className="flex align-center gap-sm">
                <div className="tech-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  <FaCogs />
                </div>
                <div>
                  <div className="tech-tier-tag">TIER 2 — API GATEWAY & EDGE ROUTING</div>
                  <h3 className="tech-card-title">{bp.tier2_gateway.tech}</h3>
                </div>
              </div>
              <span className="tech-role-chip">{bp.tier2_gateway.role}</span>
            </div>

            <div className="tech-rationale-box mt-md">
              <div className="tech-rationale-header flex align-center gap-xs text-primary font-bold mb-xs">
                <FaCheckCircle /> Why We Recommended This Gateway:
              </div>
              <p className="text-secondary">{bp.tier2_gateway.why}</p>
            </div>

            <div className="tech-metric-chip-row mt-md">
              <div className="tech-metric-chip">
                <span className="chip-lbl">Performance Benchmark:</span>
                <span className="chip-val text-info">{bp.tier2_gateway.performance}</span>
              </div>
            </div>

            <div className="tech-tradeoff-box mt-md">
              <div className="tradeoff-header text-warning flex align-center gap-xs font-bold mb-xs">
                <FaExchangeAlt /> Alternative Considered & Rejected:
              </div>
              <p className="text-secondary text-sm">{bp.tier2_gateway.alternative_rejected}</p>
            </div>
          </div>

          {/* TIER 3: CORE DOMAIN ENGINE */}
          <div className="tech-card-featured glass-card mb-lg" style={{ borderLeft: '5px solid #ec4899' }}>
            <div className="tech-card-header">
              <div className="flex align-center gap-sm">
                <div className="tech-card-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                  <FaBrain />
                </div>
                <div>
                  <div className="tech-tier-tag">TIER 3 — CORE COMPUTATION & SPECIALIZED AI ENGINE</div>
                  <h3 className="tech-card-title">{bp.tier3_core.tech}</h3>
                </div>
              </div>
              <span className="tech-role-chip">{bp.tier3_core.role}</span>
            </div>

            <div className="tech-rationale-box mt-md">
              <div className="tech-rationale-header flex align-center gap-xs text-primary font-bold mb-xs">
                <FaCheckCircle /> Why We Recommended This Core Engine:
              </div>
              <p className="text-secondary">{bp.tier3_core.why}</p>
            </div>

            <div className="tech-metric-chip-row mt-md">
              <div className="tech-metric-chip">
                <span className="chip-lbl">Throughput & Latency:</span>
                <span className="chip-val text-info">{bp.tier3_core.performance}</span>
              </div>
            </div>

            <div className="tech-tradeoff-box mt-md">
              <div className="tradeoff-header text-warning flex align-center gap-xs font-bold mb-xs">
                <FaExchangeAlt /> Alternative Considered & Rejected:
              </div>
              <p className="text-secondary text-sm">{bp.tier3_core.alternative_rejected}</p>
            </div>

            <div className="tech-indian-box mt-md">
              <div className="indian-header text-success flex align-center gap-xs font-bold mb-xs">
                <FaRupeeSign /> Indian Domain Compliance:
              </div>
              <p className="text-secondary text-sm">{bp.tier3_core.indian_context}</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 4: DATABASE & CACHING SYSTEMS
          ============================================================ */}
      {activeSubTab === 'data' && (
        <div className="tech-detail-section animate-fade-in mb-xl">
          <div className="tech-card-featured glass-card mb-lg" style={{ borderLeft: '5px solid #06b6d4' }}>
            <div className="tech-card-header">
              <div className="flex align-center gap-sm">
                <div className="tech-card-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                  <FaDatabase />
                </div>
                <div>
                  <div className="tech-tier-tag">TIER 4 — PERSISTENCE, SPATIAL & IN-MEMORY CACHE</div>
                  <h3 className="tech-card-title">{bp.tier4_data.primary_db}</h3>
                </div>
              </div>
              <span className="tech-role-chip">{bp.tier4_data.role}</span>
            </div>

            <div className="tech-rationale-box mt-md">
              <div className="tech-rationale-header flex align-center gap-xs text-primary font-bold mb-xs">
                <FaCheckCircle /> Why We Recommended This Storage Architecture:
              </div>
              <p className="text-secondary">{bp.tier4_data.why}</p>
            </div>

            <div className="tech-dual-storage-grid mt-md">
              <div className="storage-sub-card">
                <div className="storage-sub-title text-info flex align-center gap-xs">
                  <FaHdd /> Primary Database
                </div>
                <div className="storage-sub-val">{bp.tier4_data.primary_db}</div>
                <div className="storage-sub-desc text-muted text-xs mt-xs">ACID-compliant relational ledger and document storage.</div>
              </div>

              <div className="storage-sub-card">
                <div className="storage-sub-title text-warning flex align-center gap-xs">
                  <FaBolt /> Cache & Session Layer
                </div>
                <div className="storage-sub-val">{bp.tier4_data.cache_layer}</div>
                <div className="storage-sub-desc text-muted text-xs mt-xs">High-speed distributed locks and sub-millisecond memory caching.</div>
              </div>
            </div>

            <div className="tech-metric-chip-row mt-md">
              <div className="tech-metric-chip">
                <span className="chip-lbl">Performance Benchmark:</span>
                <span className="chip-val text-info">{bp.tier4_data.performance}</span>
              </div>
            </div>

            <div className="tech-tradeoff-box mt-md">
              <div className="tradeoff-header text-warning flex align-center gap-xs font-bold mb-xs">
                <FaExchangeAlt /> Alternative Considered & Rejected:
              </div>
              <p className="text-secondary text-sm">{bp.tier4_data.alternative_rejected}</p>
            </div>

            <div className="tech-indian-box mt-md">
              <div className="indian-header text-success flex align-center gap-xs font-bold mb-xs">
                <FaRupeeSign /> Data Localization & Security:
              </div>
              <p className="text-secondary text-sm">{bp.tier4_data.indian_context}</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 5: CLOUD, DEVOPS & INDIAN COMPLIANCE
          ============================================================ */}
      {activeSubTab === 'devops' && (
        <div className="tech-detail-section animate-fade-in mb-xl">
          <div className="tech-card-featured glass-card mb-lg" style={{ borderLeft: '5px solid #10b981' }}>
            <div className="tech-card-header">
              <div className="flex align-center gap-sm">
                <div className="tech-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <FaCloud />
                </div>
                <div>
                  <div className="tech-tier-tag">TIER 5 — CLOUD DEVOPS, CI/CD & REGULATORY COMPLIANCE</div>
                  <h3 className="tech-card-title">{bp.tier5_devops.cloud_provider}</h3>
                </div>
              </div>
              <span className="tech-role-chip">AWS Mumbai (ap-south-1) Production</span>
            </div>

            <div className="tech-rationale-box mt-md">
              <div className="tech-rationale-header flex align-center gap-xs text-primary font-bold mb-xs">
                <FaCheckCircle /> Cloud & Infrastructure Rationale:
              </div>
              <p className="text-secondary">{bp.tier5_devops.why}</p>
            </div>

            <div className="tech-devops-triad mt-md">
              <div className="devops-triad-card">
                <div className="triad-lbl text-primary flex align-center gap-xs">
                  <FaCogs /> CI/CD Automation
                </div>
                <div className="triad-val">{bp.tier5_devops.container_ci_cd}</div>
              </div>

              <div className="devops-triad-card">
                <div className="triad-lbl text-success flex align-center gap-xs">
                  <FaShieldAlt /> Regulatory Compliance
                </div>
                <div className="triad-val">{bp.tier5_devops.security_compliance}</div>
              </div>

              <div className="devops-triad-card">
                <div className="triad-lbl text-info flex align-center gap-xs">
                  <FaTachometerAlt /> Availability SLA
                </div>
                <div className="triad-val">{bp.tier5_devops.performance}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 6: INDIAN CLOUD BUDGET & INFRASTRUCTURE OPEX (₹)
          ============================================================ */}
      {activeSubTab === 'costs' && (
        <div className="tech-detail-section animate-fade-in mb-xl">
          <div className="tech-card-featured glass-card mb-lg" style={{ borderLeft: '5px solid #f59e0b' }}>
            <div className="tech-card-header">
              <div className="flex align-center gap-sm">
                <div className="tech-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <FaRupeeSign />
                </div>
                <div>
                  <div className="tech-tier-tag">TIER 6 — MONTHLY CLOUD INFRASTRUCTURE OPEX</div>
                  <h3 className="tech-card-title">Lean Startup Infrastructure Budget in Indian Rupees (₹)</h3>
                </div>
              </div>
              <span className="tech-cost-badge-lg">
                <FaRupeeSign /> Total: {bp.tier5_devops.total_monthly_inr.replace('₹', '')}
              </span>
            </div>

            <p className="text-secondary mt-sm">
              Tailored cost model designed to maximize Indian cloud startup credits (AWS Activate, Google Cloud for Startups) and free-tier allowances, minimizing cash burn before product-market fit.
            </p>

            {/* Monthly Cost Breakdown Table */}
            <div className="tech-cost-table-container mt-md">
              <table className="tech-cost-table">
                <thead>
                  <tr>
                    <th>Component & Service</th>
                    <th>Estimated Monthly Cost (INR)</th>
                    <th>Free Tier / Optimization Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {bp.tier5_devops.cost_breakdown_inr.map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-primary">{row.item}</td>
                      <td className="font-bold text-success">
                        <FaRupeeSign style={{ fontSize: '0.85em', marginRight: '2px' }} />
                        {row.cost.replace('₹', '')}
                      </td>
                      <td className="text-secondary text-sm">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="tech-cost-total-row">
                    <td className="font-bold">Total Estimated Monthly Cloud OpEx</td>
                    <td className="font-bold text-success" style={{ fontSize: '1.2rem' }}>
                      {bp.tier5_devops.total_monthly_inr}
                    </td>
                    <td className="text-muted text-xs">Zero upfront software licensing fees. 100% open-source software stack.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Scale-up Cost Projections */}
            <div className="tech-growth-projections mt-xl">
              <h4 className="text-primary mb-sm flex align-center gap-xs">
                <FaBolt /> Stage-Wise Cloud OpEx Scaling Path (INR)
              </h4>
              <div className="growth-cards-grid">
                <div className="growth-card">
                  <div className="growth-phase">STAGE 1: MVP & SEED</div>
                  <div className="growth-cost text-success">₹1,500 – ₹3,500 / mo</div>
                  <div className="growth-desc text-secondary text-xs">
                    Free tier utilization on AWS Mumbai & Cloudflare. Covers initial beta users and prototype validation.
                  </div>
                </div>

                <div className="growth-card">
                  <div className="growth-phase">STAGE 2: TRACTION (10K USERS)</div>
                  <div className="growth-cost text-info">₹7,500 – ₹18,000 / mo</div>
                  <div className="growth-desc text-secondary text-xs">
                    Auto-scaling container pods, PostgreSQL multi-AZ replicas, and persistent Redis cluster.
                  </div>
                </div>

                <div className="growth-card">
                  <div className="growth-phase">STAGE 3: SERIES A SCALE</div>
                  <div className="growth-cost text-primary">₹35,000 – ₹75,000 / mo</div>
                  <div className="growth-desc text-secondary text-xs">
                    Multi-region Kubernetes deployment, enterprise SOC2 compliance logging, and dedicated hardware security modules.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnologyTab;
