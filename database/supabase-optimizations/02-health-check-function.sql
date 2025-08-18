-- Comprehensive Health Check Function for Supabase Database
-- Priority: HIGH - Operational Visibility
-- Date: January 8, 2025

-- Create a comprehensive health check function
CREATE OR REPLACE FUNCTION public.check_database_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    health_status jsonb;
    db_size numeric;
    connection_count integer;
    active_connections integer;
    table_count integer;
    index_count integer;
    slow_queries jsonb;
    cache_hit_ratio numeric;
    index_hit_ratio numeric;
    bloat_info jsonb;
    replication_lag interval;
    last_vacuum jsonb;
    last_analyze jsonb;
    rls_status jsonb;
    failed_jobs jsonb;
    disk_usage jsonb;
BEGIN
    -- Get database size
    SELECT pg_database_size(current_database()) / 1024.0 / 1024.0 INTO db_size;
    
    -- Get connection statistics
    SELECT count(*), 
           count(*) FILTER (WHERE state = 'active')
    INTO connection_count, active_connections
    FROM pg_stat_activity
    WHERE datname = current_database();
    
    -- Get table and index counts
    SELECT count(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    SELECT count(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';
    
    -- Get cache hit ratio
    SELECT 
        CASE 
            WHEN sum(heap_blks_hit + heap_blks_read) = 0 THEN 0
            ELSE round(100.0 * sum(heap_blks_hit) / sum(heap_blks_hit + heap_blks_read), 2)
        END
    INTO cache_hit_ratio
    FROM pg_statio_user_tables;
    
    -- Get index hit ratio
    SELECT 
        CASE
            WHEN sum(idx_scan + seq_scan) = 0 THEN 0
            ELSE round(100.0 * sum(idx_scan) / sum(idx_scan + seq_scan), 2)
        END
    INTO index_hit_ratio
    FROM pg_stat_user_tables;
    
    -- Get slow queries (queries taking more than 1 second)
    WITH slow_queries_cte AS (
        SELECT 
            query,
            calls,
            mean_exec_time,
            max_exec_time,
            total_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 1000 -- milliseconds
        ORDER BY mean_exec_time DESC
        LIMIT 5
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'query', left(query, 100),
            'calls', calls,
            'mean_time_ms', round(mean_exec_time::numeric, 2),
            'max_time_ms', round(max_exec_time::numeric, 2),
            'total_time_ms', round(total_exec_time::numeric, 2)
        )
    ) INTO slow_queries
    FROM slow_queries_cte;
    
    -- Get table bloat information
    WITH bloat_data AS (
        SELECT 
            schemaname || '.' || tablename AS table_name,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
            n_dead_tup AS dead_tuples,
            n_live_tup AS live_tuples,
            CASE WHEN n_live_tup > 0 
                THEN round((n_dead_tup::float / n_live_tup::float) * 100, 2)
                ELSE 0
            END AS dead_tuple_percent
        FROM pg_stat_user_tables
        WHERE n_dead_tup > 1000
        ORDER BY n_dead_tup DESC
        LIMIT 5
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'table', table_name,
            'size', total_size,
            'dead_tuples', dead_tuples,
            'dead_percent', dead_tuple_percent
        )
    ) INTO bloat_info
    FROM bloat_data;
    
    -- Get last vacuum and analyze times
    WITH vacuum_stats AS (
        SELECT 
            schemaname || '.' || tablename AS table_name,
            last_vacuum,
            last_autovacuum,
            last_analyze,
            last_autoanalyze
        FROM pg_stat_user_tables
        ORDER BY GREATEST(
            COALESCE(last_vacuum, '1900-01-01'::timestamp),
            COALESCE(last_autovacuum, '1900-01-01'::timestamp)
        ) ASC
        LIMIT 5
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'table', table_name,
            'last_vacuum', COALESCE(last_vacuum::text, last_autovacuum::text, 'never'),
            'last_analyze', COALESCE(last_analyze::text, last_autoanalyze::text, 'never')
        )
    ) INTO last_vacuum
    FROM vacuum_stats;
    
    -- Check RLS status on critical tables
    WITH rls_check AS (
        SELECT 
            tablename,
            CASE 
                WHEN rowsecurity::text = 'true' THEN 'enabled'
                ELSE 'disabled'
            END AS rls_status,
            (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) AS policy_count
        FROM pg_tables t
        WHERE schemaname = 'public'
        AND tablename IN ('users', 'posts', 'memories', 'events', 'post_comments', 
                         'post_likes', 'notifications', 'friends', 'media_assets')
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'table', tablename,
            'rls_enabled', rls_status = 'enabled',
            'policy_count', policy_count
        )
    ) INTO rls_status
    FROM rls_check;
    
    -- Get disk usage by table
    WITH disk_usage_data AS (
        SELECT 
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
            pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'table', tablename,
            'size', total_size
        )
    ) INTO disk_usage
    FROM disk_usage_data;
    
    -- Build health status report
    health_status := jsonb_build_object(
        'status', CASE 
            WHEN cache_hit_ratio < 90 OR index_hit_ratio < 90 THEN 'warning'
            WHEN active_connections > 80 THEN 'warning'
            WHEN db_size > 10000 THEN 'warning' -- 10GB
            ELSE 'healthy'
        END,
        'timestamp', now(),
        'database', jsonb_build_object(
            'name', current_database(),
            'size_mb', round(db_size, 2),
            'table_count', table_count,
            'index_count', index_count
        ),
        'connections', jsonb_build_object(
            'total', connection_count,
            'active', active_connections,
            'idle', connection_count - active_connections,
            'max_connections', current_setting('max_connections')::int
        ),
        'performance', jsonb_build_object(
            'cache_hit_ratio', cache_hit_ratio,
            'index_hit_ratio', index_hit_ratio,
            'slow_queries', COALESCE(slow_queries, '[]'::jsonb)
        ),
        'maintenance', jsonb_build_object(
            'tables_with_bloat', COALESCE(bloat_info, '[]'::jsonb),
            'tables_needing_vacuum', COALESCE(last_vacuum, '[]'::jsonb)
        ),
        'security', jsonb_build_object(
            'rls_status', COALESCE(rls_status, '[]'::jsonb)
        ),
        'storage', jsonb_build_object(
            'top_tables_by_size', COALESCE(disk_usage, '[]'::jsonb)
        ),
        'recommendations', jsonb_build_array(
            CASE WHEN cache_hit_ratio < 90 
                THEN 'Cache hit ratio is low. Consider increasing shared_buffers.'
            END,
            CASE WHEN index_hit_ratio < 90 
                THEN 'Index hit ratio is low. Review query patterns and add appropriate indexes.'
            END,
            CASE WHEN active_connections > 50 
                THEN 'High number of active connections. Consider connection pooling.'
            END,
            CASE WHEN bloat_info IS NOT NULL 
                THEN 'Some tables have significant bloat. Run VACUUM to reclaim space.'
            END
        ) - NULL -- Remove null values from array
    );
    
    RETURN health_status;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'error', SQLERRM,
        'detail', SQLSTATE,
        'timestamp', now()
    );
END;
$$;

-- Create a simplified health check for quick monitoring
CREATE OR REPLACE FUNCTION public.quick_health_check()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT jsonb_build_object(
        'healthy', (
            -- Check if database is responsive
            EXISTS (SELECT 1) 
            -- Check if critical tables are accessible
            AND EXISTS (SELECT 1 FROM public.users LIMIT 1)
            AND EXISTS (SELECT 1 FROM public.posts LIMIT 1)
            -- Check connection count is reasonable
            AND (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) < 100
        ),
        'database_size_mb', round(pg_database_size(current_database()) / 1024.0 / 1024.0, 2),
        'connection_count', (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()),
        'timestamp', now()
    );
$$;

-- Create a function to check specific table health
CREATE OR REPLACE FUNCTION public.check_table_health(p_table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result jsonb;
    row_count bigint;
    table_size text;
    index_list jsonb;
    has_primary_key boolean;
    has_rls boolean;
    policy_count integer;
    stats_age interval;
    dead_tuples bigint;
    live_tuples bigint;
BEGIN
    -- Validate table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = p_table_name
    ) THEN
        RETURN jsonb_build_object(
            'error', 'Table not found',
            'table_name', p_table_name
        );
    END IF;
    
    -- Get row count
    EXECUTE format('SELECT count(*) FROM public.%I', p_table_name) INTO row_count;
    
    -- Get table size
    SELECT pg_size_pretty(pg_total_relation_size('public.' || p_table_name)) INTO table_size;
    
    -- Get indexes
    SELECT jsonb_agg(
        jsonb_build_object(
            'name', indexname,
            'definition', indexdef,
            'size', pg_size_pretty(pg_relation_size(('public.' || indexname)::regclass))
        )
    ) INTO index_list
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = p_table_name;
    
    -- Check for primary key
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = p_table_name
        AND constraint_type = 'PRIMARY KEY'
    ) INTO has_primary_key;
    
    -- Check RLS status
    SELECT rowsecurity::text = 'true'
    INTO has_rls
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = p_table_name;
    
    -- Count RLS policies
    SELECT count(*)
    INTO policy_count
    FROM pg_policies
    WHERE tablename = p_table_name;
    
    -- Get statistics age and tuple counts
    SELECT 
        now() - last_analyze,
        n_dead_tup,
        n_live_tup
    INTO stats_age, dead_tuples, live_tuples
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    AND tablename = p_table_name;
    
    -- Build result
    result := jsonb_build_object(
        'table_name', p_table_name,
        'row_count', row_count,
        'size', table_size,
        'has_primary_key', has_primary_key,
        'indexes', COALESCE(index_list, '[]'::jsonb),
        'index_count', COALESCE(jsonb_array_length(index_list), 0),
        'security', jsonb_build_object(
            'rls_enabled', has_rls,
            'policy_count', policy_count
        ),
        'maintenance', jsonb_build_object(
            'stats_age_hours', COALESCE(extract(epoch from stats_age) / 3600, 0),
            'dead_tuples', dead_tuples,
            'live_tuples', live_tuples,
            'bloat_percent', CASE 
                WHEN live_tuples > 0 THEN round((dead_tuples::float / live_tuples::float) * 100, 2)
                ELSE 0
            END
        ),
        'health_score', CASE
            WHEN NOT has_primary_key THEN 'poor'
            WHEN has_rls AND policy_count = 0 THEN 'poor'
            WHEN dead_tuples > live_tuples * 0.2 THEN 'fair'
            WHEN COALESCE(extract(epoch from stats_age) / 3600, 0) > 168 THEN 'fair' -- 7 days
            ELSE 'good'
        END
    );
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE,
        'table_name', p_table_name
    );
END;
$$;

-- Grant execute permissions to authenticated users for health checks
GRANT EXECUTE ON FUNCTION public.check_database_health() TO authenticated;
GRANT EXECUTE ON FUNCTION public.quick_health_check() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_table_health(text) TO authenticated;

-- Create a scheduled job to log health metrics (requires pg_cron extension)
-- This is commented out as pg_cron needs to be enabled in Supabase dashboard first
/*
SELECT cron.schedule(
    'health-check-hourly',
    '0 * * * *', -- Every hour
    $$
    INSERT INTO public.health_check_logs (check_time, health_data)
    SELECT now(), public.check_database_health();
    $$
);
*/

-- Create table for storing health check history
CREATE TABLE IF NOT EXISTS public.health_check_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    check_time timestamp with time zone DEFAULT now() NOT NULL,
    health_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Create index for efficient querying of health logs
CREATE INDEX IF NOT EXISTS idx_health_check_logs_check_time 
ON public.health_check_logs(check_time DESC);

-- Add RLS to health check logs
ALTER TABLE public.health_check_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view health check logs
CREATE POLICY "Admins can view health check logs" ON public.health_check_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('super_admin', 'admin')
        )
    );

COMMENT ON FUNCTION public.check_database_health() IS 'Comprehensive database health check including performance metrics, maintenance status, and security configuration';
COMMENT ON FUNCTION public.quick_health_check() IS 'Lightweight health check for uptime monitoring';
COMMENT ON FUNCTION public.check_table_health(text) IS 'Detailed health analysis for a specific table';