-- ============================================================
-- Migration 002: Allow NULL scores and add data_source tracking
-- Database: MySQL 8.0+ (vision2venture_db)
-- ============================================================

USE vision2venture_db;

-- 1. Modify startup_analysis to allow NULL overall_score
ALTER TABLE startup_analysis MODIFY overall_score DECIMAL(5, 2) NULL DEFAULT NULL;

-- 2. Modify market_analysis to allow NULL growth_rate and opportunity_score
ALTER TABLE market_analysis MODIFY growth_rate DECIMAL(5, 2) NULL DEFAULT NULL;
ALTER TABLE market_analysis MODIFY opportunity_score DECIMAL(5, 2) NULL DEFAULT NULL;

-- 3. Add data_source column to analysis tables for data provenance tracking
-- Run these lines if data_source column does not already exist:
ALTER TABLE market_analysis ADD COLUMN data_source VARCHAR(100) NULL;
ALTER TABLE business_models ADD COLUMN data_source VARCHAR(100) NULL;
ALTER TABLE swot_analysis ADD COLUMN data_source VARCHAR(100) NULL;
ALTER TABLE financial_analysis ADD COLUMN data_source VARCHAR(100) NULL;
