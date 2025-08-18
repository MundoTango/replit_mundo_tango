-- GDPR Compliance Database Schema
-- Implements data subject rights and privacy-by-design

-- Privacy Consent Management
CREATE TABLE IF NOT EXISTS privacy_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- 'marketing', 'analytics', 'functional', 'necessary'
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_date TIMESTAMP DEFAULT NOW(),
    consent_withdrawn_date TIMESTAMP NULL,
    legal_basis TEXT NOT NULL, -- 'consent', 'legitimate_interest', 'contract', 'legal_obligation'
    purpose TEXT NOT NULL,
    data_categories TEXT[] NOT NULL, -- ['personal_data', 'usage_data', 'location_data']
    retention_period INTEGER, -- days
    consent_version TEXT NOT NULL DEFAULT '1.0',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Data Subject Rights Requests (Articles 15-22 GDPR)
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL, -- 'access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
    email TEXT NOT NULL,
    identity_verified BOOLEAN DEFAULT false,
    verification_method TEXT, -- 'email', 'manual', 'oauth'
    request_details JSONB,
    response_data JSONB,
    fulfillment_date TIMESTAMP NULL,
    rejection_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- GDPR Audit Log
CREATE TABLE IF NOT EXISTS gdpr_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'data_access', 'data_modification', 'consent_change', 'data_export'
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    legal_basis TEXT,
    purpose TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    automated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_type ON privacy_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_user_id ON data_subject_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_email ON data_subject_requests(email);
CREATE INDEX IF NOT EXISTS idx_gdpr_audit_log_user_id ON gdpr_audit_log(user_id);

-- Function to log GDPR-compliant actions
CREATE OR REPLACE FUNCTION log_gdpr_action(
    p_user_id INTEGER,
    p_action_type TEXT,
    p_table_name TEXT DEFAULT NULL,
    p_record_id TEXT DEFAULT NULL,
    p_legal_basis TEXT DEFAULT 'legitimate_interest',
    p_purpose TEXT DEFAULT 'system_operation'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO gdpr_audit_log (
        user_id, action_type, table_name, record_id,
        legal_basis, purpose, automated
    ) VALUES (
        p_user_id, p_action_type, p_table_name, p_record_id,
        p_legal_basis, p_purpose, true
    );
EXCEPTION WHEN OTHERS THEN
    -- Don't fail operations due to audit logging issues
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;