-- Vision2Venture Database Schema
-- MySQL 8.0+ | Character Set: utf8mb4

CREATE DATABASE IF NOT EXISTS vision2venture_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE vision2venture_db;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- 2. USER SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (token(255))
) ENGINE=InnoDB;

-- ============================================================
-- 3. STARTUP IDEAS
-- ============================================================
CREATE TABLE IF NOT EXISTS startup_ideas (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    industry VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    target_customers TEXT NOT NULL,
    budget DECIMAL(15, 2) NOT NULL,
    team_skills TEXT NOT NULL,
    sector VARCHAR(50) NOT NULL DEFAULT 'online',
    pricing_model VARCHAR(100) NOT NULL,
    team_size INT NOT NULL,
    business_stage VARCHAR(100) NOT NULL,
    revenue_goal DECIMAL(15, 2) NOT NULL,
    funding_required DECIMAL(15, 2) NOT NULL,
    analysis_status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ideas_user (user_id),
    INDEX idx_ideas_status (analysis_status)
) ENGINE=InnoDB;

-- ============================================================
-- 4. STARTUP ANALYSIS (NLP Output)
-- ============================================================
CREATE TABLE IF NOT EXISTS startup_analysis (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    business_domain VARCHAR(255) NOT NULL,
    target_users TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    solution TEXT NOT NULL,
    keywords JSON NOT NULL,
    business_category VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. MARKET ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS market_analysis (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    market_size VARCHAR(255) NOT NULL,
    growth_rate DECIMAL(5, 2) NOT NULL,
    demand_level VARCHAR(100) NOT NULL,
    opportunity_score DECIMAL(5, 2) NOT NULL,
    industry_trends JSON NOT NULL,
    market_analysis_explanation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. COMPETITORS
-- ============================================================
CREATE TABLE IF NOT EXISTS competitors (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    similarity_score DECIMAL(5, 2) NOT NULL,
    strengths TEXT NOT NULL,
    weaknesses TEXT NOT NULL,
    competitive_gap TEXT NOT NULL,
    usp TEXT NOT NULL,
    analysis_explanation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE,
    INDEX idx_competitors_idea (idea_id)
) ENGINE=InnoDB;

-- ============================================================
-- 7. TECHNOLOGY RECOMMENDATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS technology_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    frontend VARCHAR(255) NOT NULL,
    backend VARCHAR(255) NOT NULL,
    database_system VARCHAR(255) NOT NULL,
    cloud_platform VARCHAR(255) NOT NULL,
    ai_framework VARCHAR(255) NOT NULL,
    deployment VARCHAR(255) NOT NULL,
    reasoning TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. BUSINESS MODELS (Canvas)
-- ============================================================
CREATE TABLE IF NOT EXISTS business_models (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    customer_segments TEXT NOT NULL,
    value_proposition TEXT NOT NULL,
    revenue_streams TEXT NOT NULL,
    channels TEXT NOT NULL,
    key_partners TEXT NOT NULL,
    key_activities TEXT NOT NULL,
    key_resources TEXT NOT NULL,
    cost_structure TEXT NOT NULL,
    detailed_explanation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. SWOT ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS swot_analysis (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    strengths JSON NOT NULL,
    weaknesses JSON NOT NULL,
    opportunities JSON NOT NULL,
    threats JSON NOT NULL,
    overall_assessment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. FINANCIAL ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_analysis (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    subscription_revenue DECIMAL(15, 2) DEFAULT 0,
    freemium_conversion DECIMAL(5, 2) DEFAULT 0,
    monthly_recurring_revenue DECIMAL(15, 2) DEFAULT 0,
    customer_acquisition_cost DECIMAL(15, 2) DEFAULT 0,
    lifetime_value DECIMAL(15, 2) DEFAULT 0,
    churn_rate DECIMAL(5, 2) DEFAULT 0,
    daily_customers_estimate INT DEFAULT 0,
    average_order_value DECIMAL(15, 2) DEFAULT 0,
    monthly_revenue DECIMAL(15, 2) DEFAULT 0,
    rent_cost DECIMAL(15, 2) DEFAULT 0,
    staff_cost DECIMAL(15, 2) DEFAULT 0,
    raw_material_cost DECIMAL(15, 2) DEFAULT 0,
    utility_cost DECIMAL(15, 2) DEFAULT 0,
    marketing_cost DECIMAL(15, 2) DEFAULT 0,
    development_cost DECIMAL(15, 2) NOT NULL,
    monthly_operating_cost DECIMAL(15, 2) NOT NULL,
    break_even_analysis TEXT NOT NULL,
    roi DECIMAL(10, 2) NOT NULL,
    profit_margins DECIMAL(5, 2) NOT NULL,
    detailed_explanation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. RISK ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_analysis (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    technical_risk JSON NOT NULL,
    market_risk JSON NOT NULL,
    competition_risk JSON NOT NULL,
    financial_risk JSON NOT NULL,
    operational_risk JSON NOT NULL,
    overall_risk DECIMAL(5, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. FEASIBILITY ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS feasibility_analysis (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    market_score DECIMAL(5, 2) NOT NULL,
    technical_score DECIMAL(5, 2) NOT NULL,
    financial_score DECIMAL(5, 2) NOT NULL,
    innovation_score DECIMAL(5, 2) NOT NULL,
    overall_feasibility DECIMAL(5, 2) NOT NULL,
    explanation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 13. INVESTOR READINESS
-- ============================================================
CREATE TABLE IF NOT EXISTS investor_readiness (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    scalability DECIMAL(5, 2) NOT NULL,
    innovation DECIMAL(5, 2) NOT NULL,
    business_model DECIMAL(5, 2) NOT NULL,
    market DECIMAL(5, 2) NOT NULL,
    investor_score DECIMAL(5, 2) NOT NULL,
    explanation TEXT NOT NULL,
    suggestions JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 14. IMPLEMENTATION ROADMAP
-- ============================================================
CREATE TABLE IF NOT EXISTS implementation_roadmap (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    phase_1 JSON NOT NULL,
    phase_2 JSON NOT NULL,
    phase_3 JSON NOT NULL,
    phase_4 JSON NOT NULL,
    phase_5 JSON NOT NULL,
    timeline VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 15. REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY,
    idea_id VARCHAR(36) UNIQUE NOT NULL,
    pdf_location VARCHAR(512) NOT NULL,
    download_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
) ENGINE=InnoDB;
