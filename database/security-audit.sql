-- Database Security Audit Script
-- Using 23L Framework Layer 9: Security & Authentication

-- 1. Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    relrowsecurity::text as rls_enabled,
    CASE 
        WHEN relrowsecurity THEN '✅ Protected'
        ELSE '❌ Vulnerable'
    END as security_status
FROM pg_catalog.pg_stat_user_tables t
JOIN pg_catalog.pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY security_status DESC, tablename;

-- 2. List all existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Identify tables with sensitive data that need RLS
WITH sensitive_tables AS (
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'user_profiles', 'posts', 'memories', 'events',
        'host_homes', 'recommendations', 'chat_messages', 'chat_rooms',
        'follows', 'post_likes', 'post_comments', 'notifications',
        'life_ceo_agent_memories', 'user_roles', 'group_members',
        'event_participants', 'event_rsvps', 'friend_requests',
        'direct_messages', 'audit_logs', 'compliance_audit_logs'
    )
)
SELECT 
    st.tablename,
    CASE 
        WHEN c.relrowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Missing - SECURITY RISK'
    END as rls_status,
    pg_size_pretty(pg_total_relation_size(quote_ident(st.tablename)::regclass)) as table_size,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = st.tablename) as policy_count
FROM sensitive_tables st
JOIN pg_catalog.pg_class c ON c.relname = st.tablename
ORDER BY rls_status DESC, st.tablename;

-- 4. Check for missing indexes on foreign keys (security performance)
WITH foreign_keys AS (
    SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
)
SELECT 
    fk.table_name,
    fk.column_name,
    fk.foreign_table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = fk.table_name 
            AND indexdef LIKE '%' || fk.column_name || '%'
        ) THEN '✅ Indexed'
        ELSE '❌ Missing Index - Performance Risk'
    END as index_status
FROM foreign_keys fk
ORDER BY index_status DESC, fk.table_name;

-- 5. Audit user permissions and roles
SELECT 
    r.rolname as role_name,
    r.rolsuper as is_superuser,
    r.rolcreaterole as can_create_role,
    r.rolcreatedb as can_create_db,
    r.rolcanlogin as can_login,
    r.rolreplication as can_replicate,
    r.rolconnlimit as connection_limit,
    COUNT(m.member) as member_count
FROM pg_roles r
LEFT JOIN pg_auth_members m ON r.oid = m.roleid
WHERE r.rolname NOT LIKE 'pg_%'
GROUP BY r.rolname, r.rolsuper, r.rolcreaterole, r.rolcreatedb, 
         r.rolcanlogin, r.rolreplication, r.rolconnlimit
ORDER BY r.rolsuper DESC, r.rolname;

-- 6. Check for potential SQL injection vulnerabilities
SELECT 
    p.proname as function_name,
    p.prosrc as function_source,
    CASE 
        WHEN p.prosrc LIKE '%EXECUTE%' THEN '⚠️  Dynamic SQL - Review for injection'
        WHEN p.prosrc LIKE '%format(%' THEN '⚠️  String formatting - Review carefully'
        ELSE '✅ Static SQL'
    END as injection_risk
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosrc IS NOT NULL
ORDER BY injection_risk DESC;

-- 7. Audit logging status
SELECT 
    name,
    setting,
    CASE 
        WHEN name = 'log_statement' AND setting != 'none' THEN '✅ Enabled'
        WHEN name = 'log_connections' AND setting = 'on' THEN '✅ Enabled'
        WHEN name = 'log_disconnections' AND setting = 'on' THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as audit_status
FROM pg_settings
WHERE name IN ('log_statement', 'log_connections', 'log_disconnections', 
               'log_duration', 'log_min_duration_statement');

-- 8. Check for unencrypted sensitive columns
SELECT 
    c.table_name,
    c.column_name,
    c.data_type,
    CASE 
        WHEN c.column_name LIKE '%password%' THEN '🔴 Critical - Should be hashed'
        WHEN c.column_name LIKE '%token%' THEN '🟡 High - Consider encryption'
        WHEN c.column_name LIKE '%key%' THEN '🟡 High - Consider encryption'
        WHEN c.column_name LIKE '%secret%' THEN '🟡 High - Consider encryption'
        WHEN c.column_name LIKE '%email%' THEN '🟠 Medium - PII data'
        WHEN c.column_name LIKE '%phone%' THEN '🟠 Medium - PII data'
        WHEN c.column_name LIKE '%address%' THEN '🟠 Medium - PII data'
        ELSE '🟢 Low'
    END as sensitivity_level
FROM information_schema.columns c
WHERE c.table_schema = 'public'
AND (
    c.column_name LIKE '%password%' OR
    c.column_name LIKE '%token%' OR
    c.column_name LIKE '%key%' OR
    c.column_name LIKE '%secret%' OR
    c.column_name LIKE '%email%' OR
    c.column_name LIKE '%phone%' OR
    c.column_name LIKE '%address%'
)
ORDER BY 
    CASE 
        WHEN c.column_name LIKE '%password%' THEN 1
        WHEN c.column_name LIKE '%token%' THEN 2
        WHEN c.column_name LIKE '%key%' THEN 3
        WHEN c.column_name LIKE '%secret%' THEN 4
        ELSE 5
    END,
    c.table_name;

-- Summary Report
SELECT 
    'Database Security Audit Summary' as report,
    CURRENT_TIMESTAMP as audit_date,
    current_database() as database_name,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
    (SELECT COUNT(*) FROM pg_class c JOIN pg_tables t ON c.relname = t.tablename 
     WHERE t.schemaname = 'public' AND c.relrowsecurity) as tables_with_rls,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
    (SELECT COUNT(DISTINCT grantee) FROM information_schema.role_table_grants 
     WHERE table_schema = 'public') as users_with_access;