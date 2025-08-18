-- Audit Logging System for Supabase Database
-- Priority: HIGH - Compliance Requirement
-- Date: January 8, 2025

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data jsonb,
    new_data jsonb,
    changed_fields text[], -- Array of fields that changed
    changed_by uuid, -- User who made the change
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text,
    session_id text,
    request_id text, -- For tracking related changes
    metadata jsonb -- Additional context
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON public.audit_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON public.audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON public.audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON public.audit_logs(request_id) WHERE request_id IS NOT NULL;

-- Create GIN index for searching within JSONB data
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_data ON public.audit_logs USING GIN (old_data);
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_data ON public.audit_logs USING GIN (new_data);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('super_admin', 'admin')
        )
    );

-- Create the main audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    audit_row public.audit_logs;
    include_old boolean;
    include_new boolean;
    excluded_cols text[] = ARRAY['updated_at']; -- Columns to exclude from audit
    changed_fields text[];
    changed_by_id uuid;
    request_headers jsonb;
    old_jsonb jsonb;
    new_jsonb jsonb;
    field text;
BEGIN
    -- Determine which data to include based on operation
    IF (TG_OP = 'UPDATE') THEN
        include_old := TRUE;
        include_new := TRUE;
    ELSIF (TG_OP = 'DELETE') THEN
        include_old := TRUE;
        include_new := FALSE;
    ELSIF (TG_OP = 'INSERT') THEN
        include_old := FALSE;
        include_new := TRUE;
    END IF;

    -- Get the user ID from the current session
    BEGIN
        changed_by_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        changed_by_id := NULL;
    END;

    -- Get request headers if available
    BEGIN
        request_headers := current_setting('request.headers', true)::jsonb;
    EXCEPTION WHEN OTHERS THEN
        request_headers := '{}'::jsonb;
    END;

    -- Convert records to JSONB
    IF include_old THEN
        old_jsonb := to_jsonb(OLD) - excluded_cols;
    END IF;
    
    IF include_new THEN
        new_jsonb := to_jsonb(NEW) - excluded_cols;
    END IF;

    -- Calculate changed fields for UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        changed_fields := ARRAY[]::text[];
        FOR field IN SELECT jsonb_object_keys(old_jsonb) UNION SELECT jsonb_object_keys(new_jsonb)
        LOOP
            IF old_jsonb->field IS DISTINCT FROM new_jsonb->field THEN
                changed_fields := array_append(changed_fields, field);
            END IF;
        END LOOP;
    END IF;

    -- Create audit record
    audit_row = ROW(
        gen_random_uuid(),                    -- id
        TG_TABLE_NAME::text,                  -- table_name
        CASE 
            WHEN TG_OP = 'INSERT' THEN (NEW).id
            ELSE (OLD).id
        END,                                  -- record_id
        TG_OP,                               -- operation
        CASE WHEN include_old THEN old_jsonb ELSE NULL END,  -- old_data
        CASE WHEN include_new THEN new_jsonb ELSE NULL END,  -- new_data
        changed_fields,                       -- changed_fields
        changed_by_id,                       -- changed_by
        now(),                               -- changed_at
        request_headers->>'x-forwarded-for',  -- ip_address
        request_headers->>'user-agent',       -- user_agent
        request_headers->>'x-session-id',     -- session_id
        request_headers->>'x-request-id',     -- request_id
        jsonb_build_object(                   -- metadata
            'schema', TG_TABLE_SCHEMA,
            'client_info', request_headers->>'x-client-info',
            'function', TG_NAME
        )
    );

    INSERT INTO public.audit_logs VALUES (audit_row.*);
    
    -- Return appropriate value
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create a function to apply audit logging to a table
CREATE OR REPLACE FUNCTION public.enable_audit_logging(p_table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Drop existing trigger if it exists
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%s_trigger ON public.%I', p_table_name, p_table_name);
    
    -- Create new trigger
    EXECUTE format('
        CREATE TRIGGER audit_%s_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func()
    ', p_table_name, p_table_name);
    
    RAISE NOTICE 'Audit logging enabled for table: %', p_table_name;
END;
$$;

-- Create a function to disable audit logging for a table
CREATE OR REPLACE FUNCTION public.disable_audit_logging(p_table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%s_trigger ON public.%I', p_table_name, p_table_name);
    RAISE NOTICE 'Audit logging disabled for table: %', p_table_name;
END;
$$;

-- Apply audit logging to critical tables
SELECT public.enable_audit_logging('users');
SELECT public.enable_audit_logging('posts');
SELECT public.enable_audit_logging('memories');
SELECT public.enable_audit_logging('events');
SELECT public.enable_audit_logging('user_roles');
SELECT public.enable_audit_logging('post_comments');
SELECT public.enable_audit_logging('post_likes');
SELECT public.enable_audit_logging('friends');
SELECT public.enable_audit_logging('event_participants');
SELECT public.enable_audit_logging('media_assets');

-- Create a function to query audit logs with filters
CREATE OR REPLACE FUNCTION public.query_audit_logs(
    p_table_name text DEFAULT NULL,
    p_record_id uuid DEFAULT NULL,
    p_user_id uuid DEFAULT NULL,
    p_operation text DEFAULT NULL,
    p_start_date timestamp with time zone DEFAULT NULL,
    p_end_date timestamp with time zone DEFAULT NULL,
    p_limit integer DEFAULT 100,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    table_name text,
    record_id uuid,
    operation text,
    old_data jsonb,
    new_data jsonb,
    changed_fields text[],
    changed_by uuid,
    changed_by_username text,
    changed_at timestamp with time zone,
    ip_address text,
    metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.table_name,
        al.record_id,
        al.operation,
        al.old_data,
        al.new_data,
        al.changed_fields,
        al.changed_by,
        u.username as changed_by_username,
        al.changed_at,
        al.ip_address,
        al.metadata
    FROM public.audit_logs al
    LEFT JOIN public.users u ON u.auth_user_id = al.changed_by
    WHERE (p_table_name IS NULL OR al.table_name = p_table_name)
    AND (p_record_id IS NULL OR al.record_id = p_record_id)
    AND (p_user_id IS NULL OR al.changed_by = p_user_id)
    AND (p_operation IS NULL OR al.operation = p_operation)
    AND (p_start_date IS NULL OR al.changed_at >= p_start_date)
    AND (p_end_date IS NULL OR al.changed_at <= p_end_date)
    ORDER BY al.changed_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Create a function to get audit trail for a specific record
CREATE OR REPLACE FUNCTION public.get_record_audit_trail(
    p_table_name text,
    p_record_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH audit_trail AS (
        SELECT 
            al.id,
            al.operation,
            al.changed_fields,
            al.changed_by,
            u.username as changed_by_username,
            al.changed_at,
            al.old_data,
            al.new_data,
            al.ip_address
        FROM public.audit_logs al
        LEFT JOIN public.users u ON u.auth_user_id = al.changed_by
        WHERE al.table_name = p_table_name
        AND al.record_id = p_record_id
        ORDER BY al.changed_at DESC
    )
    SELECT jsonb_build_object(
        'table_name', p_table_name,
        'record_id', p_record_id,
        'history_count', count(*),
        'first_change', min(changed_at),
        'last_change', max(changed_at),
        'changes', jsonb_agg(
            jsonb_build_object(
                'id', id,
                'operation', operation,
                'changed_fields', changed_fields,
                'changed_by', changed_by_username,
                'changed_at', changed_at,
                'ip_address', ip_address,
                'old_values', old_data,
                'new_values', new_data
            )
        )
    ) INTO result
    FROM audit_trail;
    
    RETURN result;
END;
$$;

-- Create a function to analyze audit patterns
CREATE OR REPLACE FUNCTION public.analyze_audit_patterns(
    p_days integer DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result jsonb;
BEGIN
    WITH audit_stats AS (
        SELECT 
            table_name,
            operation,
            count(*) as operation_count,
            count(DISTINCT changed_by) as unique_users,
            count(DISTINCT DATE(changed_at)) as active_days
        FROM public.audit_logs
        WHERE changed_at >= now() - (p_days || ' days')::interval
        GROUP BY table_name, operation
    ),
    user_activity AS (
        SELECT 
            changed_by,
            count(*) as total_changes,
            jsonb_object_agg(
                operation, 
                count
            ) as operations
        FROM (
            SELECT changed_by, operation, count(*) as count
            FROM public.audit_logs
            WHERE changed_at >= now() - (p_days || ' days')::interval
            AND changed_by IS NOT NULL
            GROUP BY changed_by, operation
        ) t
        GROUP BY changed_by
        ORDER BY total_changes DESC
        LIMIT 10
    ),
    hourly_pattern AS (
        SELECT 
            extract(hour from changed_at) as hour,
            count(*) as changes
        FROM public.audit_logs
        WHERE changed_at >= now() - (p_days || ' days')::interval
        GROUP BY extract(hour from changed_at)
        ORDER BY hour
    )
    SELECT jsonb_build_object(
        'period_days', p_days,
        'total_changes', (SELECT count(*) FROM public.audit_logs WHERE changed_at >= now() - (p_days || ' days')::interval),
        'table_activity', (
            SELECT jsonb_object_agg(
                table_name,
                jsonb_build_object(
                    'total', sum(operation_count),
                    'operations', jsonb_object_agg(operation, operation_count),
                    'unique_users', max(unique_users),
                    'active_days', max(active_days)
                )
            )
            FROM audit_stats
            GROUP BY table_name
        ),
        'top_users', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'user_id', ua.changed_by,
                    'username', u.username,
                    'total_changes', ua.total_changes,
                    'operations', ua.operations
                )
            )
            FROM user_activity ua
            LEFT JOIN public.users u ON u.auth_user_id = ua.changed_by
        ),
        'hourly_distribution', (
            SELECT jsonb_object_agg(
                hour::text,
                changes
            )
            FROM hourly_pattern
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permissions to admin users
GRANT EXECUTE ON FUNCTION public.query_audit_logs(text, uuid, uuid, text, timestamp with time zone, timestamp with time zone, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_record_audit_trail(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_audit_patterns(integer) TO authenticated;

-- Create a maintenance function to clean old audit logs
CREATE OR REPLACE FUNCTION public.cleanup_audit_logs(
    p_retention_days integer DEFAULT 90
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.audit_logs
    WHERE changed_at < now() - (p_retention_days || ' days')::interval;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'deleted_records', deleted_count,
        'retention_days', p_retention_days,
        'oldest_remaining', (SELECT min(changed_at) FROM public.audit_logs),
        'total_remaining', (SELECT count(*) FROM public.audit_logs)
    );
END;
$$;

COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for tracking all data changes across the system';
COMMENT ON FUNCTION public.audit_trigger_func() IS 'Generic trigger function for audit logging that captures before/after state and metadata';
COMMENT ON FUNCTION public.query_audit_logs IS 'Query audit logs with flexible filtering options';
COMMENT ON FUNCTION public.get_record_audit_trail IS 'Get complete audit history for a specific record';
COMMENT ON FUNCTION public.analyze_audit_patterns IS 'Analyze audit log patterns for security and usage insights';