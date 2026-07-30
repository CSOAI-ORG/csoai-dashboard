-- Performance Optimization: Database Indexes for Common Query Patterns
-- This script adds indexes to improve query performance across the application
-- Estimated improvement: 30-50% faster queries on frequently accessed data

-- Dashboard Statistics Indexes
-- Optimize dashboard stats queries
CREATE INDEX IF NOT EXISTS idx_ai_systems_user_id ON ai_systems(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_systems_status ON ai_systems(status);
CREATE INDEX IF NOT EXISTS idx_ai_systems_risk_level ON ai_systems(risk_level);

-- PDCA Cycle Indexes
-- Optimize PDCA cycle queries
CREATE INDEX IF NOT EXISTS idx_pdca_cycles_user_id ON pdca_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_pdca_cycles_ai_system_id ON pdca_cycles(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_pdca_cycles_phase ON pdca_cycles(phase);
CREATE INDEX IF NOT EXISTS idx_pdca_cycles_status ON pdca_cycles(status);
CREATE INDEX IF NOT EXISTS idx_pdca_cycles_created_at ON pdca_cycles(created_at);

-- Compliance Assessment Indexes
-- Optimize compliance assessment queries
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_user_id ON compliance_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_ai_system_id ON compliance_assessments(ai_system_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_framework_id ON compliance_assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_status ON compliance_assessments(status);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_created_at ON compliance_assessments(created_at);

-- Watchdog Reports Indexes
-- Optimize watchdog report queries
CREATE INDEX IF NOT EXISTS idx_watchdog_reports_user_id ON watchdog_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_watchdog_reports_status ON watchdog_reports(status);
CREATE INDEX IF NOT EXISTS idx_watchdog_reports_severity ON watchdog_reports(severity);
CREATE INDEX IF NOT EXISTS idx_watchdog_reports_created_at ON watchdog_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_watchdog_reports_public ON watchdog_reports(is_public);

-- User Indexes
-- Optimize user queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- Training Progress Indexes
-- Optimize training progress queries
CREATE INDEX IF NOT EXISTS idx_user_training_progress_user_id ON user_training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_training_progress_module_id ON user_training_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_training_progress_status ON user_training_progress(status);

-- Certification Test Indexes
-- Optimize certification test queries
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_user_id ON user_test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_test_id ON user_test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_created_at ON user_test_attempts(created_at);

-- Case Assignment Indexes
-- Optimize case assignment queries
CREATE INDEX IF NOT EXISTS idx_case_assignments_analyst_id ON case_assignments(analyst_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_status ON case_assignments(status);
CREATE INDEX IF NOT EXISTS idx_case_assignments_created_at ON case_assignments(created_at);

-- Analyst Performance Indexes
-- Optimize analyst performance queries
CREATE INDEX IF NOT EXISTS idx_analyst_performance_user_id ON analyst_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_analyst_performance_created_at ON analyst_performance(created_at);

-- API Keys Indexes
-- Optimize API key queries
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Composite Indexes for Common Query Patterns
-- These optimize queries that filter on multiple columns

-- Dashboard: Get user's AI systems by status
CREATE INDEX IF NOT EXISTS idx_ai_systems_user_status ON ai_systems(user_id, status);

-- PDCA: Get cycles for a user's AI system
CREATE INDEX IF NOT EXISTS idx_pdca_cycles_user_system ON pdca_cycles(user_id, ai_system_id);

-- PDCA: Get cycles by phase and status
CREATE INDEX IF NOT EXISTS idx_pdca_cycles_phase_status ON pdca_cycles(phase, status);

-- Compliance: Get assessments for a system
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_system_framework ON compliance_assessments(ai_system_id, framework_id);

-- Watchdog: Get reports by user and status
CREATE INDEX IF NOT EXISTS idx_watchdog_reports_user_status ON watchdog_reports(user_id, status);

-- Watchdog: Get public reports sorted by date
CREATE INDEX IF NOT EXISTS idx_watchdog_reports_public_date ON watchdog_reports(is_public, created_at DESC);

-- Training: Get user's progress by module
CREATE INDEX IF NOT EXISTS idx_training_progress_user_module ON user_training_progress(user_id, module_id);

-- Case Assignments: Get analyst's active cases
CREATE INDEX IF NOT EXISTS idx_case_assignments_analyst_status ON case_assignments(analyst_id, status);

-- Subscription: Get active subscriptions
CREATE INDEX IF NOT EXISTS idx_users_subscription_active ON users(subscription_status, subscription_tier);

-- Analyze indexes to update statistics (for query optimizer)
-- This helps the database engine make better decisions about index usage
ANALYZE;
