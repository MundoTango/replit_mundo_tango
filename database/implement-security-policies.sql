-- Database Security Implementation Script
-- Based on 23L Security Audit Results

-- Enable RLS on vulnerable sensitive tables
ALTER TABLE compliance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_ceo_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_ceo_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followed_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

-- Create RLS policies for host_homes
CREATE POLICY "Anyone can view active host homes" ON host_homes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage own listings" ON host_homes
    FOR ALL USING (host_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

-- Create RLS policies for recommendations
CREATE POLICY "Anyone can view active recommendations" ON recommendations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own recommendations" ON recommendations
    FOR ALL USING (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

-- Create RLS policies for user_followed_cities
CREATE POLICY "Users can view own followed cities" ON user_followed_cities
    FOR SELECT USING (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

CREATE POLICY "Users can manage own followed cities" ON user_followed_cities
    FOR ALL USING (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

-- Create RLS policies for sessions
CREATE POLICY "Users can access own sessions" ON sessions
    FOR ALL USING (sess::jsonb->>'passport'->>'user'->'id' = (SELECT COALESCE(current_setting('app.current_user_id', true), '0')));

-- Create RLS policies for privacy_consents
CREATE POLICY "Users can view own consents" ON privacy_consents
    FOR SELECT USING (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

CREATE POLICY "Users can manage own consents" ON privacy_consents
    FOR ALL USING (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

-- Create RLS policies for life_ceo_chat_messages
CREATE POLICY "Users can view own Life CEO messages" ON life_ceo_chat_messages
    FOR SELECT USING (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

CREATE POLICY "Users can create own Life CEO messages" ON life_ceo_chat_messages
    FOR INSERT WITH CHECK (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

-- Create RLS policies for life_ceo_user_roles
CREATE POLICY "Users can view own Life CEO roles" ON life_ceo_user_roles
    FOR SELECT USING (user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0)));

CREATE POLICY "Admins can manage Life CEO roles" ON life_ceo_user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM life_ceo_user_roles lr
            JOIN life_ceo_roles r ON lr.role_id = r.id
            WHERE lr.user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0))
            AND r.name IN ('super_admin', 'admin')
        )
    );

-- Create RLS policies for compliance_audit_logs
CREATE POLICY "Only admins can view compliance logs" ON compliance_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = (SELECT COALESCE(current_setting('app.current_user_id', true)::int, 0))
            AND r.name IN ('super_admin', 'admin')
        )
    );

-- Create audit logging function
CREATE OR REPLACE FUNCTION audit_user_changes() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            table_name, action, user_id, record_id, new_data, created_at
        ) VALUES (
            TG_TABLE_NAME, TG_OP, 
            COALESCE(current_setting('app.current_user_id', true)::int, 0),
            NEW.id, row_to_json(NEW), NOW()
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            table_name, action, user_id, record_id, old_data, new_data, created_at
        ) VALUES (
            TG_TABLE_NAME, TG_OP,
            COALESCE(current_setting('app.current_user_id', true)::int, 0),
            NEW.id, row_to_json(OLD), row_to_json(NEW), NOW()
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            table_name, action, user_id, record_id, old_data, created_at
        ) VALUES (
            TG_TABLE_NAME, TG_OP,
            COALESCE(current_setting('app.current_user_id', true)::int, 0),
            OLD.id, row_to_json(OLD), NOW()
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

CREATE TRIGGER audit_host_homes_changes
    AFTER INSERT OR UPDATE OR DELETE ON host_homes
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

CREATE TRIGGER audit_recommendations_changes
    AFTER INSERT OR UPDATE OR DELETE ON recommendations
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

CREATE TRIGGER audit_life_ceo_user_roles_changes
    AFTER INSERT OR UPDATE OR DELETE ON life_ceo_user_roles
    FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

-- Create indexes for performance on foreign keys without indexes
CREATE INDEX IF NOT EXISTS idx_host_homes_host_id ON host_homes(host_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_post_id ON recommendations(post_id);
CREATE INDEX IF NOT EXISTS idx_life_ceo_chat_messages_user_id ON life_ceo_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_life_ceo_chat_messages_session_id ON life_ceo_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_life_ceo_user_roles_user_id ON life_ceo_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_life_ceo_user_roles_role_id ON life_ceo_user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_followed_cities_user_id ON user_followed_cities(user_id);

-- Create security monitoring function
CREATE OR REPLACE FUNCTION check_security_health() RETURNS TABLE (
    metric TEXT,
    value TEXT,
    status TEXT
) AS $$
BEGIN
    -- Total tables with RLS
    RETURN QUERY
    SELECT 
        'Tables with RLS enabled'::TEXT,
        COUNT(*)::TEXT,
        CASE 
            WHEN COUNT(*) > 30 THEN '✅ Good'
            ELSE '⚠️ Needs improvement'
        END
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public' AND c.relrowsecurity;

    -- Audit log size
    RETURN QUERY
    SELECT 
        'Audit log entries'::TEXT,
        COUNT(*)::TEXT,
        '📊 Active'::TEXT
    FROM audit_logs;

    -- Active user sessions
    RETURN QUERY
    SELECT 
        'Active sessions'::TEXT,
        COUNT(*)::TEXT,
        CASE 
            WHEN COUNT(*) < 100 THEN '✅ Normal'
            ELSE '⚠️ High load'
        END
    FROM sessions
    WHERE expire > NOW();

    -- Failed login attempts (last 24h)
    RETURN QUERY
    SELECT 
        'Failed logins (24h)'::TEXT,
        COUNT(*)::TEXT,
        CASE 
            WHEN COUNT(*) < 10 THEN '✅ Normal'
            WHEN COUNT(*) < 50 THEN '⚠️ Elevated'
            ELSE '🚨 High - Possible attack'
        END
    FROM audit_logs
    WHERE table_name = 'users'
    AND action = 'LOGIN_FAILED'
    AND created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Summary of security improvements
SELECT 
    'Security Implementation Complete' as status,
    '9 tables secured with RLS' as tables_secured,
    '4 audit triggers added' as audit_triggers,
    '9 performance indexes created' as indexes_added,
    '1 security monitoring function' as monitoring_tools;