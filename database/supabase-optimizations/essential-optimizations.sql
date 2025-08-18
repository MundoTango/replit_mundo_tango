-- ESSENTIAL DATABASE OPTIMIZATIONS ONLY
-- This script applies only the missing optimizations

-- =============================================
-- PART 1: MISSING RLS POLICIES
-- =============================================

-- Create missing RLS policies for tables that need them

-- post_comments policies (using follows with correct column names)
CREATE POLICY IF NOT EXISTS "Users can view comments on posts they can see 2" 
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
        AND f.following_id = p.user_id
      ))
    )
  )
);

-- post_likes policies (using follows with correct column names)
CREATE POLICY IF NOT EXISTS "Users can view likes on posts they can see 2" 
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
        AND f.following_id = p.user_id
      ))
    )
  )
);

-- stories policies (using follows with correct column names)
CREATE POLICY IF NOT EXISTS "Users can view stories from followed users 2" 
ON stories FOR SELECT USING (
  user_id = get_current_user_id() 
  OR EXISTS (
    SELECT 1 FROM follows f 
    WHERE f.follower_id = get_current_user_id() 
    AND f.following_id = stories.user_id
  )
);

-- story_views policies
CREATE POLICY IF NOT EXISTS "Users can create story views 2" 
ON story_views FOR INSERT WITH CHECK (
  user_id = get_current_user_id()
);

-- notifications policies
CREATE POLICY IF NOT EXISTS "Users can view their own notifications 2" 
ON notifications FOR SELECT USING (
  user_id = get_current_user_id()
);

CREATE POLICY IF NOT EXISTS "Users can update their own notifications 2" 
ON notifications FOR UPDATE USING (
  user_id = get_current_user_id()
) WITH CHECK (
  user_id = get_current_user_id()
);

-- event_participants policies
CREATE POLICY IF NOT EXISTS "Users can view event participants 2" 
ON event_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_participants.event_id 
    AND e.is_public = true
  )
  OR user_id = get_current_user_id()
);

-- user_roles policies
CREATE POLICY IF NOT EXISTS "Admins can manage user roles 2" 
ON user_roles USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = get_current_user_id() 
    AND ur.role_name IN ('admin', 'super_admin')
  )
);

-- media_tags policies
CREATE POLICY IF NOT EXISTS "Users can view media tags 2" 
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
        AND f.following_id = m.user_id
      ))
    )
  )
);

CREATE POLICY IF NOT EXISTS "Users can tag their own media 2" 
ON media_tags FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM media_assets m 
    WHERE m.id = media_tags.media_id::text 
    AND m.user_id = get_current_user_id()
  )
);

CREATE POLICY IF NOT EXISTS "Users can delete tags from their own media 2" 
ON media_tags FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM media_assets m 
    WHERE m.id = media_tags.media_id::text 
    AND m.user_id = get_current_user_id()
  )
);

-- memory_media policies
CREATE POLICY IF NOT EXISTS "Users can view memory media they have access to 2" 
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
        AND f.following_id = m.user_id
      ))
    )
  )
);

CREATE POLICY IF NOT EXISTS "Users can add media to their own memories 2" 
ON memory_media FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories m 
    WHERE m.id = memory_media.memory_id 
    AND m.user_id = get_current_user_id()
  )
);

CREATE POLICY IF NOT EXISTS "Users can delete media from their own memories 2" 
ON memory_media FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM memories m 
    WHERE m.id = memory_media.memory_id 
    AND m.user_id = get_current_user_id()
  )
);

-- =============================================
-- PART 2: HEALTH CHECK FUNCTION UPDATES
-- =============================================

-- Create missing health check function (only the one that doesn't exist)
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
    
    -- Log the check if health_check_logs table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'health_check_logs') THEN
        INSERT INTO public.health_check_logs (check_type, status, details)
        VALUES ('check_table_health', health_status, jsonb_build_object('table_name', table_name, 'result', result));
    END IF;
    
    RETURN result;
END;
$$;

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Run this to verify the implementation
SELECT 'Essential Database Optimizations Applied' AS status,
       (SELECT count(*) FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.schemaname = 'public' AND c.relrowsecurity = true) AS tables_with_rls,
       (SELECT count(*) FROM pg_proc WHERE proname LIKE '%health_check%') AS health_check_functions,
       (SELECT count(*) FROM pg_trigger WHERE tgname LIKE 'audit_trigger_%') AS audit_triggers;