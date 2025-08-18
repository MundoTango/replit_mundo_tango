-- COMPREHENSIVE DATABASE SECURITY IMPLEMENTATION
-- Based on 23L Framework Analysis
-- =============================================

-- =============================================
-- PART 1: AUDIT SYSTEM IMPLEMENTATION
-- =============================================

-- Create audit schema if not exists
CREATE SCHEMA IF NOT EXISTS audit;

-- Create audit log table with optimized structure
CREATE TABLE IF NOT EXISTS audit.logs (
    id BIGSERIAL PRIMARY KEY,
    table_name text NOT NULL,
    user_id INTEGER, -- Changed from UUID to match our users.id type
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    row_data jsonb,
    changed_fields jsonb,
    query text,
    ip_address inet,
    timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create optimized indexes for audit performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit.logs (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_table ON audit.logs (timestamp DESC, table_name);

-- Enable RLS on audit logs
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
DROP POLICY IF EXISTS admin_audit_access ON audit.logs;
CREATE POLICY admin_audit_access ON audit.logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE u.id = current_setting('app.current_user_id', true)::INTEGER
            AND r.name IN ('super_admin', 'admin')
        )
    );

-- Create the audit trigger function
CREATE OR REPLACE FUNCTION audit.create_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    row_data jsonb;
    changed_fields jsonb;
    current_user_id INTEGER;
BEGIN
    IF TG_WHEN <> 'AFTER' THEN
        RAISE EXCEPTION 'audit.create_audit_trigger() may only run as an AFTER trigger';
    END IF;

    -- Get current user ID from session
    BEGIN
        current_user_id := current_setting('app.current_user_id', true)::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    -- Determine which row to log
    CASE TG_OP
        WHEN 'INSERT' THEN
            row_data = to_jsonb(NEW);
            changed_fields = NULL;
        WHEN 'UPDATE' THEN
            -- Only log if something actually changed
            IF NEW IS DISTINCT FROM OLD THEN
                row_data = to_jsonb(OLD);
                
                -- Calculate changed fields
                SELECT jsonb_object_agg(key, jsonb_build_object('old', OLD_TABLE.value, 'new', NEW_TABLE.value))
                INTO changed_fields
                FROM jsonb_each(to_jsonb(OLD)) OLD_TABLE
                JOIN jsonb_each(to_jsonb(NEW)) NEW_TABLE ON OLD_TABLE.key = NEW_TABLE.key
                WHERE OLD_TABLE.value IS DISTINCT FROM NEW_TABLE.value;
            ELSE
                -- No actual change, skip logging
                RETURN NULL;
            END IF;
        WHEN 'DELETE' THEN
            row_data = to_jsonb(OLD);
            changed_fields = NULL;
        WHEN 'TRUNCATE' THEN
            row_data = NULL;
            changed_fields = NULL;
        ELSE
            RAISE EXCEPTION 'audit.create_audit_trigger() triggered for unhandled event: %', TG_OP;
    END CASE;

    -- Build the audit log entry
    INSERT INTO audit.logs (
        table_name,
        user_id,
        action,
        row_data,
        changed_fields,
        query,
        ip_address
    )
    VALUES (
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        current_user_id,
        TG_OP,
        row_data,
        changed_fields,
        current_query(),
        inet_client_addr()
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Helper function to add audit triggers
CREATE OR REPLACE FUNCTION audit.add_audit_trigger(target_table regclass)
RETURNS void AS $$
DECLARE
    trigger_name text;
    table_name text;
BEGIN
    -- Get table name
    SELECT relname INTO table_name FROM pg_class WHERE oid = target_table;
    
    -- Generate trigger name
    trigger_name := 'audit_trigger_' || table_name;
    
    -- Create the trigger
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', trigger_name, target_table);
    EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH ROW EXECUTE FUNCTION audit.create_audit_trigger()', 
        trigger_name, 
        target_table
    );
    
    RAISE NOTICE 'Added audit trigger to table: %', target_table;
END;
$$ LANGUAGE plpgsql;

-- Create audit summary views
CREATE OR REPLACE VIEW audit.recent_activity AS
SELECT 
    l.id,
    l.table_name,
    u.username,
    u.name as user_name,
    l.action,
    l.changed_fields,
    l.timestamp,
    l.ip_address
FROM 
    audit.logs l
LEFT JOIN 
    users u ON l.user_id = u.id
WHERE 
    l.timestamp > (now() - interval '24 hours')
ORDER BY 
    l.timestamp DESC;

-- Create activity summary for dashboard
CREATE OR REPLACE VIEW audit.activity_summary AS
SELECT 
    date_trunc('hour', timestamp) AS hour,
    table_name,
    action,
    count(*) AS action_count
FROM 
    audit.logs
WHERE 
    timestamp > (now() - interval '7 days')
GROUP BY 
    date_trunc('hour', timestamp),
    table_name,
    action
ORDER BY 
    hour DESC;

-- =============================================
-- PART 2: RLS IMPROVEMENTS
-- =============================================

-- Enable RLS on tables that need it
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::INTEGER;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Policies for post_comments
CREATE POLICY "Users can view all public post comments" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" ON post_comments
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update their own comments" ON post_comments
    FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete their own comments" ON post_comments
    FOR DELETE USING (user_id = get_current_user_id());

-- RLS Policies for post_likes
CREATE POLICY "Users can view all likes" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can unlike posts" ON post_likes
    FOR DELETE USING (user_id = get_current_user_id());

-- RLS Policies for stories
CREATE POLICY "Users can view active stories" ON stories
    FOR SELECT USING (expires_at > now() OR user_id = get_current_user_id());

CREATE POLICY "Users can create their own stories" ON stories
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update their own stories" ON stories
    FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can delete their own stories" ON stories
    FOR DELETE USING (user_id = get_current_user_id());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = get_current_user_id());

-- RLS Policies for event_participants
CREATE POLICY "Anyone can view event participants" ON event_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can RSVP to events" ON event_participants
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can update their RSVP" ON event_participants
    FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can cancel their RSVP" ON event_participants
    FOR DELETE USING (user_id = get_current_user_id());

-- =============================================
-- PART 3: PERFORMANCE INDEXES
-- =============================================

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility) WHERE visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);

CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_visibility ON memories(visibility);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_start ON events(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_user_created ON memories(user_id, created_at DESC);

-- =============================================
-- PART 4: SECURITY HEALTH CHECK FUNCTIONS
-- =============================================

-- Function to check tables without RLS
CREATE OR REPLACE FUNCTION check_tables_without_rls()
RETURNS TABLE(table_name text, has_sensitive_data boolean) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        CASE 
            WHEN t.tablename IN ('users', 'posts', 'messages', 'events', 'memories') THEN true
            ELSE false
        END as has_sensitive_data
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM pg_class c
        WHERE c.relname = t.tablename
        AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND c.relrowsecurity = true
    )
    ORDER BY has_sensitive_data DESC, t.tablename;
END;
$$ LANGUAGE plpgsql;

-- Function to check database health
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
        'audit_logs_24h', audit_logs_24h,
        'cache_hit_ratio', (
            SELECT round(
                (sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100)::numeric, 
                2
            )
            FROM pg_statio_user_tables
        )
    ) INTO result
    FROM stats;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Quick health check function
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
$$ LANGUAGE plpgsql;

-- =============================================
-- PART 5: APPLY AUDIT TRIGGERS
-- =============================================

-- Apply audit triggers to critical tables
SELECT audit.add_audit_trigger('users');
SELECT audit.add_audit_trigger('posts');
SELECT audit.add_audit_trigger('memories');
SELECT audit.add_audit_trigger('events');
SELECT audit.add_audit_trigger('user_roles');
SELECT audit.add_audit_trigger('event_participants');
SELECT audit.add_audit_trigger('media_assets');

-- Create table to track health check results
CREATE TABLE IF NOT EXISTS health_check_logs (
    id SERIAL PRIMARY KEY,
    check_type VARCHAR(50) NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for health check logs
CREATE INDEX idx_health_check_logs_created_at ON health_check_logs(created_at DESC);

-- Grant permissions for health check
GRANT SELECT ON health_check_logs TO authenticated;