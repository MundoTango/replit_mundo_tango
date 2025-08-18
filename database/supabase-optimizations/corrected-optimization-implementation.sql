-- CORRECTED DATABASE OPTIMIZATION IMPLEMENTATION
-- Fixed to match actual database schema

-- =============================================
-- PART 1: ROW LEVEL SECURITY (RLS) SETUP
-- =============================================

-- First, enable RLS on tables that don't have it yet
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing function and recreate
DROP FUNCTION IF EXISTS get_current_user_id();
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER
LANGUAGE SQL SECURITY DEFINER
AS $$
  -- Get user ID from session context (set by middleware)
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::INTEGER;
$$;

-- Create RLS policies for all tables

-- post_comments policies (using follows instead of friends)
DROP POLICY IF EXISTS "Users can view comments on posts they can see" ON post_comments;
CREATE POLICY "Users can view comments on posts they can see" 
ON post_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM posts p 
    WHERE p.id = post_comments.post_id 
    AND (
      p.user_id = get_current_user_id() 
      OR p.visibility = 'public'
      OR (p.visibility = 'friends' AND EXISTS (
        SELECT 1 FROM follows f 
        WHERE f.follower_id = get_current_user_id() 
        AND f.followed_id = p.user_id
      ))
    )
  )
);

DROP POLICY IF EXISTS "Users can create their own comments" ON post_comments;
CREATE POLICY "Users can create their own comments" 
ON post_comments FOR INSERT WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" 
ON post_comments FOR UPDATE USING (
  user_id = get_current_user_id()
) WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" 
ON post_comments FOR DELETE USING (
  user_id = get_current_user_id()
);

-- post_likes policies (using follows instead of friends)
DROP POLICY IF EXISTS "Users can view likes on posts they can see" ON post_likes;
CREATE POLICY "Users can view likes on posts they can see" 
ON post_likes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM posts p 
    WHERE p.id = post_likes.post_id 
    AND (
      p.user_id = get_current_user_id() 
      OR p.visibility = 'public'
      OR (p.visibility = 'friends' AND EXISTS (
        SELECT 1 FROM follows f 
        WHERE f.follower_id = get_current_user_id() 
        AND f.followed_id = p.user_id
      ))
    )
  )
);

DROP POLICY IF EXISTS "Users can create their own likes" ON post_likes;
CREATE POLICY "Users can create their own likes" 
ON post_likes FOR INSERT WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can delete their own likes" ON post_likes;
CREATE POLICY "Users can delete their own likes" 
ON post_likes FOR DELETE USING (
  user_id = get_current_user_id()
);

-- stories policies (using follows)
DROP POLICY IF EXISTS "Users can view stories from followed users" ON stories;
CREATE POLICY "Users can view stories from followed users" 
ON stories FOR SELECT USING (
  user_id = get_current_user_id() 
  OR EXISTS (
    SELECT 1 FROM follows f 
    WHERE f.follower_id = get_current_user_id() 
    AND f.followed_id = stories.user_id
  )
);

DROP POLICY IF EXISTS "Users can create their own stories" ON stories;
CREATE POLICY "Users can create their own stories" 
ON stories FOR INSERT WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can update their own stories" ON stories;
CREATE POLICY "Users can update their own stories" 
ON stories FOR UPDATE USING (
  user_id = get_current_user_id()
) WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can delete their own stories" ON stories;
CREATE POLICY "Users can delete their own stories" 
ON stories FOR DELETE USING (
  user_id = get_current_user_id()
);

-- story_views policies (using user_id not viewer_id)
DROP POLICY IF EXISTS "Users can view their own story views" ON story_views;
CREATE POLICY "Users can view their own story views" 
ON story_views FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM stories s 
    WHERE s.id = story_views.story_id 
    AND s.user_id = get_current_user_id()
  )
  OR user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can create story views" ON story_views;
CREATE POLICY "Users can create story views" 
ON story_views FOR INSERT WITH CHECK (
  user_id = get_current_user_id()
);

-- notifications policies (using user_id not recipient_id)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT USING (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE USING (
  user_id = get_current_user_id()
) WITH CHECK (
  user_id = get_current_user_id()
);

-- event_participants policies (events table doesn't have organizer_id)
DROP POLICY IF EXISTS "Users can view event participants" ON event_participants;
CREATE POLICY "Users can view event participants" 
ON event_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_participants.event_id 
    AND e.is_public = true
  )
  OR user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can register for events" ON event_participants;
CREATE POLICY "Users can register for events" 
ON event_participants FOR INSERT WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can update their event participation" ON event_participants;
CREATE POLICY "Users can update their event participation" 
ON event_participants FOR UPDATE USING (
  user_id = get_current_user_id()
) WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can remove themselves from events" ON event_participants;
CREATE POLICY "Users can remove themselves from events" 
ON event_participants FOR DELETE USING (
  user_id = get_current_user_id()
);

-- user_roles policies (using role_name not role)
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" 
ON user_roles FOR SELECT USING (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
CREATE POLICY "Admins can manage user roles" 
ON user_roles USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = get_current_user_id() 
    AND ur.role_name IN ('admin', 'super_admin')
  )
);

-- media_assets policies
DROP POLICY IF EXISTS "Users can view their own media assets" ON media_assets;
CREATE POLICY "Users can view their own media assets" 
ON media_assets FOR SELECT USING (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can create their own media assets" ON media_assets;
CREATE POLICY "Users can create their own media assets" 
ON media_assets FOR INSERT WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can update their own media assets" ON media_assets;
CREATE POLICY "Users can update their own media assets" 
ON media_assets FOR UPDATE USING (
  user_id = get_current_user_id()
) WITH CHECK (
  user_id = get_current_user_id()
);

DROP POLICY IF EXISTS "Users can delete their own media assets" ON media_assets;
CREATE POLICY "Users can delete their own media assets" 
ON media_assets FOR DELETE USING (
  user_id = get_current_user_id()
);

-- media_tags policies (using media_assets instead of media)
DROP POLICY IF EXISTS "Users can view media tags" ON media_tags;
CREATE POLICY "Users can view media tags" 
ON media_tags FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM media_assets m 
    WHERE m.id = media_tags.media_id::text 
    AND (
      m.visibility = 'public' 
      OR m.user_id = get_current_user_id()
      OR (m.visibility = 'mutual' AND EXISTS (
        SELECT 1 FROM follows f 
        WHERE f.follower_id = get_current_user_id() 
        AND f.followed_id = m.user_id
      ))
    )
  )
);

DROP POLICY IF EXISTS "Users can tag their own media" ON media_tags;
CREATE POLICY "Users can tag their own media" 
ON media_tags FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM media_assets m 
    WHERE m.id = media_tags.media_id::text 
    AND m.user_id = get_current_user_id()
  )
);

DROP POLICY IF EXISTS "Users can delete tags from their own media" ON media_tags;
CREATE POLICY "Users can delete tags from their own media" 
ON media_tags FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM media_assets m 
    WHERE m.id = media_tags.media_id::text 
    AND m.user_id = get_current_user_id()
  )
);

-- memory_media policies (using follows and checking visibility)
DROP POLICY IF EXISTS "Users can view memory media they have access to" ON memory_media;
CREATE POLICY "Users can view memory media they have access to" 
ON memory_media FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memories m 
    WHERE m.id = memory_media.memory_id 
    AND (
      m.user_id = get_current_user_id()
      OR m.visibility = 'Public'
      OR (m.visibility = 'Mutual' AND EXISTS (
        SELECT 1 FROM follows f 
        WHERE f.follower_id = get_current_user_id() 
        AND f.followed_id = m.user_id
      ))
    )
  )
);

DROP POLICY IF EXISTS "Users can add media to their own memories" ON memory_media;
CREATE POLICY "Users can add media to their own memories" 
ON memory_media FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories m 
    WHERE m.id = memory_media.memory_id 
    AND m.user_id = get_current_user_id()
  )
);

DROP POLICY IF EXISTS "Users can delete media from their own memories" ON memory_media;
CREATE POLICY "Users can delete media from their own memories" 
ON memory_media FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM memories m 
    WHERE m.id = memory_media.memory_id 
    AND m.user_id = get_current_user_id()
  )
);

-- =============================================
-- PART 2: HEALTH CHECK FUNCTIONS
-- =============================================

-- Create health_check_logs table
CREATE TABLE IF NOT EXISTS health_check_logs (
    id SERIAL PRIMARY KEY,
    check_type TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Only allow admins to access health check logs
ALTER TABLE health_check_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can access health check logs" ON health_check_logs;
CREATE POLICY "Only admins can access health check logs" 
ON health_check_logs USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = get_current_user_id() 
    AND ur.role_name IN ('admin', 'super_admin')
  )
);

-- Quick health check function
CREATE OR REPLACE FUNCTION quick_health_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSONB;
    db_size NUMERIC;
    active_connections INTEGER;
    health_status TEXT := 'Working';
BEGIN
    -- Get database size
    SELECT pg_database_size(current_database())/1024/1024 INTO db_size;
    
    -- Get active connections
    SELECT count(*) INTO active_connections 
    FROM pg_stat_activity 
    WHERE state = 'active';
    
    -- Create result JSON
    result := jsonb_build_object(
        'database_size_mb', round(db_size::numeric, 2),
        'active_connections', active_connections,
        'health_status', health_status,
        'timestamp', now()
    );
    
    -- Log the check
    INSERT INTO public.health_check_logs (check_type, status, details)
    VALUES ('quick_health_check', health_status, result);
    
    RETURN result;
END;
$$;

-- Comprehensive database health check
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSONB;
    db_size NUMERIC;
    table_count INTEGER;
    index_count INTEGER;
    cache_hit_ratio NUMERIC;
    deadlocks INTEGER;
    long_running_queries JSONB;
    health_status TEXT := 'Working';
    issues TEXT[] := '{}';
BEGIN
    -- Get database size
    SELECT pg_database_size(current_database())/1024/1024 INTO db_size;
    
    -- Count tables
    SELECT count(*) INTO table_count 
    FROM pg_tables 
    WHERE schemaname = 'public';
    
    -- Count indexes
    SELECT count(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Calculate cache hit ratio
    SELECT 
        CASE 
            WHEN sum(heap_blks_hit) + sum(heap_blks_read) = 0 THEN 100
            ELSE sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) * 100 
        END
    INTO cache_hit_ratio 
    FROM pg_statio_user_tables;
    
    -- Check for deadlocks
    SELECT deadlocks INTO deadlocks 
    FROM pg_stat_database 
    WHERE datname = current_database();
    
    -- Get long running queries
    SELECT jsonb_agg(jsonb_build_object(
        'pid', pid,
        'duration', now() - query_start,
        'query', query
    )) INTO long_running_queries
    FROM pg_stat_activity 
    WHERE state = 'active' 
    AND query_start < now() - interval '5 minutes'
    AND query NOT ILIKE '%pg_stat_activity%';
    
    -- Check for issues
    IF cache_hit_ratio < 90 THEN
        issues := array_append(issues, 'Low cache hit ratio: ' || round(cache_hit_ratio, 2) || '%');
        health_status := 'Warning';
    END IF;
    
    IF deadlocks > 0 THEN
        issues := array_append(issues, 'Deadlocks detected: ' || deadlocks);
        health_status := 'Warning';
    END IF;
    
    IF long_running_queries IS NOT NULL AND jsonb_array_length(long_running_queries) > 0 THEN
        issues := array_append(issues, 'Long running queries detected: ' || jsonb_array_length(long_running_queries));
        health_status := 'Warning';
    END IF;
    
    -- Create result JSON
    result := jsonb_build_object(
        'database_size_mb', round(db_size::numeric, 2),
        'table_count', table_count,
        'index_count', index_count,
        'cache_hit_ratio', round(cache_hit_ratio, 2),
        'deadlocks', deadlocks,
        'long_running_queries', COALESCE(long_running_queries, '[]'::jsonb),
        'health_status', health_status,
        'issues', issues,
        'timestamp', now()
    );
    
    -- Log the check
    INSERT INTO public.health_check_logs (check_type, status, details)
    VALUES ('check_database_health', health_status, result);
    
    RETURN result;
END;
$$;

-- Table-specific health check
CREATE OR REPLACE FUNCTION check_table_health(table_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSONB;
    row_count BIGINT;
    table_size NUMERIC;
    index_size NUMERIC;
    seq_scans BIGINT;
    index_scans BIGINT;
    dead_tuples BIGINT;
    mod_since_analyze BIGINT;
    health_status TEXT := 'Working';
    issues TEXT[] := '{}';
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
        RETURN jsonb_build_object('error', 'Table does not exist');
    END IF;
    
    -- Get row count
    EXECUTE format('SELECT count(*) FROM public.%I', table_name) INTO row_count;
    
    -- Get table size
    SELECT pg_total_relation_size('public.' || table_name)/1024/1024 INTO table_size;
    
    -- Get index size
    SELECT sum(pg_relation_size(indexrelid))/1024/1024 
    FROM pg_index i
    JOIN pg_class c ON i.indexrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND i.indrelid = ('public.' || table_name)::regclass
    INTO index_size;
    
    -- Get scan statistics
    SELECT seq_scan, idx_scan, n_dead_tup, n_mod_since_analyze
    INTO seq_scans, index_scans, dead_tuples, mod_since_analyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'public' AND relname = table_name;
    
    -- Check for issues
    IF seq_scans > 0 AND index_scans = 0 THEN
        issues := array_append(issues, 'Table has sequential scans but no index scans');
        health_status := 'Warning';
    END IF;
    
    IF dead_tuples > row_count * 0.1 AND row_count > 1000 THEN
        issues := array_append(issues, 'High number of dead tuples: ' || dead_tuples);
        health_status := 'Warning';
    END IF;
    
    IF mod_since_analyze > row_count * 0.2 AND row_count > 1000 THEN
        issues := array_append(issues, 'Table needs ANALYZE: ' || mod_since_analyze || ' modifications since last analyze');
        health_status := 'Warning';
    END IF;
    
    -- Create result JSON
    result := jsonb_build_object(
        'table_name', table_name,
        'row_count', row_count,
        'table_size_mb', round(table_size::numeric, 2),
        'index_size_mb', round(COALESCE(index_size, 0)::numeric, 2),
        'sequential_scans', seq_scans,
        'index_scans', index_scans,
        'dead_tuples', dead_tuples,
        'mods_since_analyze', mod_since_analyze,
        'health_status', health_status,
        'issues', issues,
        'timestamp', now()
    );
    
    -- Log the check
    INSERT INTO public.health_check_logs (check_type, status, details)
    VALUES ('check_table_health', health_status, jsonb_build_object('table_name', table_name, 'result', result));
    
    RETURN result;
END;
$$;

-- =============================================
-- PART 3: AUDIT LOGGING SYSTEM
-- =============================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id INTEGER,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB,
    user_id INTEGER,
    client_info JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on audit_logs for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Only allow admins to access audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can access audit logs" ON audit_logs;
CREATE POLICY "Only admins can access audit logs" 
ON audit_logs USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = get_current_user_id() 
    AND ur.role_name IN ('admin', 'super_admin')
  )
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    old_data JSONB := '{}';
    new_data JSONB := '{}';
    changed_fields JSONB := '{}';
    excluded_fields TEXT[] := ARRAY['updated_at', 'created_at'];
    current_user_id INTEGER;
    client_info JSONB;
    excluded_field TEXT;
BEGIN
    -- Get current user ID
    BEGIN
        current_user_id := get_current_user_id();
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;
    
    -- Get client info
    BEGIN
        client_info := jsonb_build_object(
            'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
            'user_agent', current_setting('request.headers', true)::json->>'user-agent'
        );
    EXCEPTION WHEN OTHERS THEN
        client_info := '{}'::jsonb;
    END;
    
    -- Handle different operations
    IF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        
        -- Remove excluded fields
        FOREACH excluded_field IN ARRAY excluded_fields LOOP
            old_data := old_data - excluded_field;
        END LOOP;
        
        INSERT INTO public.audit_logs (
            table_name, 
            record_id, 
            operation, 
            old_data,
            user_id,
            client_info
        )
        VALUES (
            TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
            OLD.id,
            TG_OP,
            old_data,
            current_user_id,
            client_info
        );
        
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Calculate changed fields
        SELECT jsonb_object_agg(key, new_data->key)
        INTO changed_fields
        FROM jsonb_each(new_data)
        WHERE new_data->key IS DISTINCT FROM old_data->key
        AND key <> ALL(excluded_fields);
        
        -- Remove excluded fields
        FOREACH excluded_field IN ARRAY excluded_fields LOOP
            old_data := old_data - excluded_field;
            new_data := new_data - excluded_field;
        END LOOP;
        
        -- Only log if there are actual changes
        IF jsonb_typeof(changed_fields) != 'null' AND changed_fields != '{}' THEN
            INSERT INTO public.audit_logs (
                table_name, 
                record_id, 
                operation, 
                old_data,
                new_data,
                changed_fields,
                user_id,
                client_info
            )
            VALUES (
                TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
                NEW.id,
                TG_OP,
                old_data,
                new_data,
                changed_fields,
                current_user_id,
                client_info
            );
        END IF;
        
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        new_data := to_jsonb(NEW);
        
        -- Remove excluded fields
        FOREACH excluded_field IN ARRAY excluded_fields LOOP
            new_data := new_data - excluded_field;
        END LOOP;
        
        INSERT INTO public.audit_logs (
            table_name, 
            record_id, 
            operation, 
            new_data,
            user_id,
            client_info
        )
        VALUES (
            TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            new_data,
            current_user_id,
            client_info
        );
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Apply audit triggers to critical tables
-- 1. users table
DROP TRIGGER IF EXISTS audit_trigger_users ON public.users;
CREATE TRIGGER audit_trigger_users
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 2. posts table
DROP TRIGGER IF EXISTS audit_trigger_posts ON public.posts;
CREATE TRIGGER audit_trigger_posts
AFTER INSERT OR UPDATE OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 3. memories table
DROP TRIGGER IF EXISTS audit_trigger_memories ON public.memories;
CREATE TRIGGER audit_trigger_memories
AFTER INSERT OR UPDATE OR DELETE ON public.memories
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 4. events table
DROP TRIGGER IF EXISTS audit_trigger_events ON public.events;
CREATE TRIGGER audit_trigger_events
AFTER INSERT OR UPDATE OR DELETE ON public.events
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 5. user_roles table
DROP TRIGGER IF EXISTS audit_trigger_user_roles ON public.user_roles;
CREATE TRIGGER audit_trigger_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 6. event_participants table
DROP TRIGGER IF EXISTS audit_trigger_event_participants ON public.event_participants;
CREATE TRIGGER audit_trigger_event_participants
AFTER INSERT OR UPDATE OR DELETE ON public.event_participants
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 7. media_assets table
DROP TRIGGER IF EXISTS audit_trigger_media_assets ON public.media_assets;
CREATE TRIGGER audit_trigger_media_assets
AFTER INSERT OR UPDATE OR DELETE ON public.media_assets
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Run this to verify the implementation
SELECT 'Database Optimizations Successfully Applied' AS status,
       (SELECT count(*) FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.schemaname = 'public' AND c.relrowsecurity = true) AS tables_with_rls,
       (SELECT count(*) FROM pg_proc WHERE proname LIKE '%health_check%') AS health_check_functions,
       (SELECT count(*) FROM pg_trigger WHERE tgname LIKE 'audit_trigger_%') AS audit_triggers;