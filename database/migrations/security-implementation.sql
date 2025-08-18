-- ============================================
-- DATABASE SECURITY IMPLEMENTATION FOR SUPABASE
-- Using 23L Framework for Production Security
-- ============================================

-- Step 1: Create audit schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Step 2: Create audit logs table with proper UUID type for Supabase Auth
CREATE TABLE IF NOT EXISTS audit.logs (
    id BIGSERIAL PRIMARY KEY,
    table_name text NOT NULL,
    user_id UUID,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    row_data jsonb,
    changed_fields jsonb,
    query text,
    ip_address inet,
    timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for audit performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit.logs (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_table ON audit.logs (timestamp DESC, table_name);

-- Step 3: Create Supabase-compatible get_current_user_id function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    -- Use Supabase Auth first
    RETURN auth.uid();
EXCEPTION WHEN OTHERS THEN
    -- Fallback for system operations
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Step 4: Create audit trigger function
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_old_data JSONB;
    v_new_data JSONB;
    v_changed_fields JSONB;
BEGIN
    -- Get current user ID
    v_user_id := get_current_user_id();
    
    -- Handle different operations
    IF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);
        INSERT INTO audit.logs (table_name, user_id, action, row_data, query)
        VALUES (TG_TABLE_NAME, v_user_id, TG_OP, v_old_data, current_query());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        
        -- Calculate changed fields
        SELECT jsonb_object_agg(key, value) INTO v_changed_fields
        FROM (
            SELECT key, value
            FROM jsonb_each(v_new_data)
            WHERE v_old_data->key IS DISTINCT FROM value
        ) changes;
        
        INSERT INTO audit.logs (table_name, user_id, action, row_data, changed_fields, query)
        VALUES (TG_TABLE_NAME, v_user_id, TG_OP, v_old_data, v_changed_fields, current_query());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        v_new_data := to_jsonb(NEW);
        INSERT INTO audit.logs (table_name, user_id, action, row_data, query)
        VALUES (TG_TABLE_NAME, v_user_id, TG_OP, v_new_data, current_query());
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Enable RLS on critical tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- Step 6: Apply audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_trigger_users ON users;
CREATE TRIGGER audit_trigger_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

DROP TRIGGER IF EXISTS audit_trigger_posts ON posts;
CREATE TRIGGER audit_trigger_posts
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

DROP TRIGGER IF EXISTS audit_trigger_memories ON memories;
CREATE TRIGGER audit_trigger_memories
AFTER INSERT OR UPDATE OR DELETE ON memories
FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

DROP TRIGGER IF EXISTS audit_trigger_events ON events;
CREATE TRIGGER audit_trigger_events
AFTER INSERT OR UPDATE OR DELETE ON events
FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

DROP TRIGGER IF EXISTS audit_trigger_user_roles ON user_roles;
CREATE TRIGGER audit_trigger_user_roles
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

DROP TRIGGER IF EXISTS audit_trigger_event_participants ON event_participants;
CREATE TRIGGER audit_trigger_event_participants
AFTER INSERT OR UPDATE OR DELETE ON event_participants
FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

DROP TRIGGER IF EXISTS audit_trigger_media_assets ON media_assets;
CREATE TRIGGER audit_trigger_media_assets
AFTER INSERT OR UPDATE OR DELETE ON media_assets
FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

-- Step 7: Enable RLS on audit logs
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for audit logs - only admins can read
CREATE POLICY admin_only_access ON audit.logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_name IN ('admin', 'super_admin')
    )
);

-- Step 8: Create health check functions
CREATE OR REPLACE FUNCTION quick_health_check()
RETURNS text AS $$
DECLARE
    rls_count INTEGER;
    audit_count INTEGER;
    index_count INTEGER;
BEGIN
    SELECT count(*) INTO rls_count 
    FROM pg_class 
    WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') 
    AND relrowsecurity = true;
    
    SELECT count(*) INTO audit_count 
    FROM audit.logs 
    WHERE timestamp > now() - interval '1 hour';
    
    SELECT count(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    RETURN format('RLS Tables: %s, Audit Logs (1h): %s, Indexes: %s', 
                  rls_count, audit_count, index_count);
END;
$$ LANGUAGE plpgsql STABLE;

-- Comprehensive health check
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    WITH stats AS (
        SELECT 
            (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
            (SELECT count(*) FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND relrowsecurity = true) as tables_with_rls,
            (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
            (SELECT pg_database_size(current_database())) as database_size,
            (SELECT count(*) FROM pg_stat_activity) as active_connections,
            (SELECT count(*) FROM audit.logs WHERE timestamp > now() - interval '24 hours') as audit_logs_24h
    )
    SELECT json_build_object(
        'database_size_mb', round((database_size / 1024.0 / 1024.0)::numeric, 2),
        'total_tables', total_tables,
        'tables_with_rls', tables_with_rls,
        'rls_coverage_percent', round((tables_with_rls::numeric / NULLIF(total_tables, 0) * 100)::numeric, 2),
        'total_indexes', total_indexes,
        'active_connections', active_connections,
        'audit_logs_24h', audit_logs_24h
    ) INTO result
    FROM stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create health check logs table
CREATE TABLE IF NOT EXISTS health_check_logs (
    id SERIAL PRIMARY KEY,
    check_type VARCHAR(50) NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for health check logs
CREATE INDEX IF NOT EXISTS idx_health_check_logs_created_at ON health_check_logs(created_at DESC);

-- Step 9: Create basic RLS policies for critical tables
-- Posts: Public read, authenticated write
CREATE POLICY "Public can view posts" ON posts
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own posts" ON posts
FOR UPDATE TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own posts" ON posts
FOR DELETE TO authenticated
USING (auth.uid()::text = user_id::text);

-- Memories: Emotion-based visibility
CREATE POLICY "Public memories are viewable by all" ON memories
FOR SELECT USING (
    'joy' = ANY(emotion_tags) OR 
    'excitement' = ANY(emotion_tags) OR
    'pride' = ANY(emotion_tags)
);

CREATE POLICY "Users can manage own memories" ON memories
FOR ALL TO authenticated
USING (auth.uid()::text = user_id::text);

-- Events: Public read, authenticated management
CREATE POLICY "Public can view events" ON events
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Event creators can manage events" ON events
FOR UPDATE TO authenticated
USING (auth.uid()::text = user_id::text);

-- User roles: Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
FOR SELECT TO authenticated
USING (auth.uid()::text = user_id::text);

-- Notifications: Users can view own notifications
CREATE POLICY "Users can view own notifications" ON notifications
FOR SELECT TO authenticated
USING (auth.uid()::text = user_id::text);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA audit TO authenticated;
GRANT SELECT ON audit.logs TO authenticated; -- Will be filtered by RLS

-- ============================================
-- VERIFICATION QUERIES (Run these separately)
-- ============================================
-- SELECT quick_health_check();
-- SELECT check_database_health();
-- SELECT count(*) FROM pg_class WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND relrowsecurity = true;