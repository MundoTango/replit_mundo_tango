-- ESA-44x21 Database Security Implementation
-- Layer 5: Data Layer - Row Level Security (RLS) Policies
-- Created: August 2, 2025

-- Enable RLS on critical tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only view and update their own data
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = current_user_id());

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = current_user_id())
    WITH CHECK (id = current_user_id());

-- Admins can view all users
CREATE POLICY "users_admin_select" ON users
    FOR SELECT USING (is_admin());

-- Subscriptions table policies
-- Users can only view their own subscriptions
CREATE POLICY "subscriptions_select_own" ON subscriptions
    FOR SELECT USING (user_id = current_user_id());

-- Only system can insert/update subscriptions (via service account)
CREATE POLICY "subscriptions_system_insert" ON subscriptions
    FOR INSERT WITH CHECK (current_user = 'payment_service');

CREATE POLICY "subscriptions_system_update" ON subscriptions
    FOR UPDATE USING (current_user = 'payment_service');

-- Payments table policies
-- Users can only view their own payments
CREATE POLICY "payments_select_own" ON payments
    FOR SELECT USING (user_id = current_user_id());

-- Only system can insert payments
CREATE POLICY "payments_system_insert" ON payments
    FOR INSERT WITH CHECK (current_user = 'payment_service');

-- Payment methods table policies
-- Users can only view their own payment methods
CREATE POLICY "payment_methods_select_own" ON payment_methods
    FOR SELECT USING (user_id = current_user_id());

-- Users can delete their own payment methods
CREATE POLICY "payment_methods_delete_own" ON payment_methods
    FOR DELETE USING (user_id = current_user_id());

-- Only system can insert/update payment methods
CREATE POLICY "payment_methods_system_insert" ON payment_methods
    FOR INSERT WITH CHECK (current_user = 'payment_service');

CREATE POLICY "payment_methods_system_update" ON payment_methods
    FOR UPDATE USING (current_user = 'payment_service');

-- Webhook events table policies
-- Only system can access webhook events
CREATE POLICY "webhook_events_system_all" ON webhook_events
    FOR ALL USING (current_user = 'payment_service');

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION current_user_id() RETURNS INTEGER AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::INTEGER;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN current_setting('app.is_admin', true)::BOOLEAN;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to payment service account
GRANT SELECT, INSERT, UPDATE ON users TO payment_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO payment_service;
GRANT SELECT, INSERT, UPDATE ON payments TO payment_service;
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_methods TO payment_service;
GRANT ALL ON webhook_events TO payment_service;

-- Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS security_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient querying
CREATE INDEX idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_created_at ON security_audit_log(created_at);
CREATE INDEX idx_security_audit_action ON security_audit_log(action);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_sensitive_operation() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO security_audit_log (
        user_id,
        action,
        table_name,
        record_id,
        metadata
    ) VALUES (
        current_user_id(),
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
            ELSE NEW.id::TEXT
        END,
        jsonb_build_object(
            'timestamp', CURRENT_TIMESTAMP,
            'operation', TG_OP,
            'table', TG_TABLE_NAME
        )
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_payments_changes
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operation();

CREATE TRIGGER audit_subscriptions_changes
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operation();

CREATE TRIGGER audit_payment_methods_changes
    AFTER INSERT OR UPDATE OR DELETE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operation();

-- Data encryption functions for PII
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        encrypt(
            data::bytea,
            current_setting('app.encryption_key')::bytea,
            'aes'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(
        decrypt(
            decode(encrypted_data, 'base64'),
            current_setting('app.encryption_key')::bytea,
            'aes'
        ),
        'UTF8'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add security monitoring views
CREATE OR REPLACE VIEW security_metrics AS
SELECT
    COUNT(DISTINCT user_id) as unique_users_24h,
    COUNT(*) as total_operations_24h,
    COUNT(CASE WHEN action IN ('INSERT', 'UPDATE') THEN 1 END) as write_operations_24h,
    COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as delete_operations_24h
FROM security_audit_log
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- Failed payment attempts view
CREATE OR REPLACE VIEW failed_payment_attempts AS
SELECT
    user_id,
    COUNT(*) as failed_attempts,
    MAX(created_at) as last_attempt
FROM payments
WHERE status = 'failed'
AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) > 3;