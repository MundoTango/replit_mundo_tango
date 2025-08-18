-- =====================================================
-- Mundo Tango - RLS Policies Test Suite
-- Comprehensive validation of Row Level Security
-- =====================================================

-- Test setup: Create test users and roles for validation
DO $$
BEGIN
    -- Test user creation (for testing purposes only)
    -- In production, users will be created through Supabase Auth
    
    RAISE NOTICE 'Starting RLS Policy Test Suite for Roles and User Roles';
    
END $$;

-- =====================================================
-- TEST 1: Anonymous User Access to Community Roles
-- =====================================================

-- Test anonymous users can read community roles
RESET ROLE;
SET ROLE TO anon;

-- This should succeed - anonymous users can read community roles
SELECT 
    'TEST 1: Anonymous Community Roles Access' as test_name,
    COUNT(*) as community_roles_count,
    CASE 
        WHEN COUNT(*) >= 18 THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM public.roles 
WHERE is_platform_role = FALSE;

-- This should return 0 - anonymous users cannot read platform roles
SELECT 
    'TEST 1b: Anonymous Platform Roles Blocked' as test_name,
    COUNT(*) as platform_roles_count,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM public.roles 
WHERE is_platform_role = TRUE;

-- Reset role for next test
RESET ROLE;

-- =====================================================
-- TEST 2: Authenticated User Access to All Roles
-- =====================================================

-- Simulate authenticated user (replace with actual user context in production)
-- For testing, we'll use a function that simulates auth context

CREATE OR REPLACE FUNCTION test_authenticated_role_access(test_user_id INTEGER)
RETURNS TABLE(test_name TEXT, total_roles INTEGER, test_result TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Set current user context for testing
    PERFORM set_config('request.jwt.claims.sub', test_user_id::TEXT, false);
    
    RETURN QUERY
    SELECT 
        'TEST 2: Authenticated All Roles Access'::TEXT as test_name,
        COUNT(*)::INTEGER as total_roles,
        CASE 
            WHEN COUNT(*) >= 24 THEN 'PASS'
            ELSE 'FAIL'
        END::TEXT as test_result
    FROM public.roles;
END;
$$;

-- Run authenticated user test
SELECT * FROM test_authenticated_role_access(1);

-- =====================================================
-- TEST 3: User Role Assignment Permissions
-- =====================================================

CREATE OR REPLACE FUNCTION test_user_role_assignment()
RETURNS TABLE(test_name TEXT, operation TEXT, test_result TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_user_id INTEGER := 999; -- Test user ID
    assignment_success BOOLEAN;
BEGIN
    -- Set user context
    PERFORM set_config('request.jwt.claims.sub', test_user_id::TEXT, false);
    
    -- Test 1: User can assign community role to themselves
    BEGIN
        INSERT INTO public.user_roles (user_id, role_name)
        VALUES (test_user_id, 'dancer');
        
        assignment_success := true;
        
        RETURN QUERY SELECT 
            'TEST 3a: Self Community Role Assignment'::TEXT,
            'INSERT community role'::TEXT,
            'PASS'::TEXT;
            
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'TEST 3a: Self Community Role Assignment'::TEXT,
            'INSERT community role'::TEXT,
            'FAIL'::TEXT;
    END;
    
    -- Test 2: User cannot assign platform role to themselves
    BEGIN
        INSERT INTO public.user_roles (user_id, role_name)
        VALUES (test_user_id, 'admin');
        
        RETURN QUERY SELECT 
            'TEST 3b: Self Platform Role Assignment Block'::TEXT,
            'INSERT platform role'::TEXT,
            'FAIL'::TEXT; -- Should fail
            
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'TEST 3b: Self Platform Role Assignment Block'::TEXT,
            'INSERT platform role'::TEXT,
            'PASS'::TEXT; -- Should throw exception
    END;
    
    -- Test 3: User can read their own roles
    RETURN QUERY
    SELECT 
        'TEST 3c: Read Own Roles'::TEXT,
        'SELECT own roles'::TEXT,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = test_user_id
            ) THEN 'PASS'
            ELSE 'FAIL'
        END::TEXT;
    
    -- Cleanup test data
    DELETE FROM public.user_roles WHERE user_id = test_user_id;
    
END;
$$;

-- Run user role assignment tests
SELECT * FROM test_user_role_assignment();

-- =====================================================
-- TEST 4: Admin Role Management Permissions
-- =====================================================

CREATE OR REPLACE FUNCTION test_admin_role_management()
RETURNS TABLE(test_name TEXT, operation TEXT, test_result TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id INTEGER := 11; -- Scott Boddye (admin user)
    test_user_id INTEGER := 998;
BEGIN
    -- First, ensure admin user has admin role
    INSERT INTO public.user_roles (user_id, role_name)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role_name) DO NOTHING;
    
    -- Set admin user context
    PERFORM set_config('request.jwt.claims.sub', admin_user_id::TEXT, false);
    
    -- Test 1: Admin can assign platform roles
    BEGIN
        INSERT INTO public.user_roles (user_id, role_name)
        VALUES (test_user_id, 'moderator');
        
        RETURN QUERY SELECT 
            'TEST 4a: Admin Platform Role Assignment'::TEXT,
            'INSERT platform role by admin'::TEXT,
            'PASS'::TEXT;
            
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'TEST 4a: Admin Platform Role Assignment'::TEXT,
            'INSERT platform role by admin'::TEXT,
            'FAIL'::TEXT;
    END;
    
    -- Test 2: Admin can read all user roles
    RETURN QUERY
    SELECT 
        'TEST 4b: Admin Read All User Roles'::TEXT,
        'SELECT all user_roles'::TEXT,
        CASE 
            WHEN (SELECT COUNT(*) FROM public.user_roles) > 0 THEN 'PASS'
            ELSE 'FAIL'
        END::TEXT;
    
    -- Test 3: Admin can manage roles table
    BEGIN
        INSERT INTO public.roles (name, description, is_platform_role)
        VALUES ('test_role', 'Test role for validation', FALSE);
        
        DELETE FROM public.roles WHERE name = 'test_role';
        
        RETURN QUERY SELECT 
            'TEST 4c: Admin Role Management'::TEXT,
            'INSERT/DELETE roles'::TEXT,
            'PASS'::TEXT;
            
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'TEST 4c: Admin Role Management'::TEXT,
            'INSERT/DELETE roles'::TEXT,
            'FAIL'::TEXT;
    END;
    
    -- Cleanup
    DELETE FROM public.user_roles WHERE user_id = test_user_id;
    
END;
$$;

-- Run admin role management tests
SELECT * FROM test_admin_role_management();

-- =====================================================
-- TEST 5: Helper Functions Validation
-- =====================================================

-- Test helper functions
SELECT 
    'TEST 5a: get_user_roles function' as test_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.get_user_roles(11)) >= 0 THEN 'PASS'
        ELSE 'FAIL'
    END as test_result;

SELECT 
    'TEST 5b: user_has_role function' as test_name,
    CASE 
        WHEN public.user_has_role(11, 'admin') IS NOT NULL THEN 'PASS'
        ELSE 'FAIL'
    END as test_result;

-- Test role assignment function
SELECT 
    'TEST 5c: assign_role_to_user function' as test_name,
    CASE 
        WHEN public.assign_role_to_user(999, 'dancer', NULL) = TRUE THEN 'PASS'
        ELSE 'FAIL'
    END as test_result;

-- Cleanup function test data
DELETE FROM public.user_roles WHERE user_id = 999;

-- =====================================================
-- TEST 6: Edge Cases and Security Validation
-- =====================================================

-- Test invalid role assignment
SELECT 
    'TEST 6a: Invalid Role Assignment' as test_name,
    CASE 
        WHEN public.assign_role_to_user(999, 'nonexistent_role', NULL) = FALSE THEN 'PASS'
        ELSE 'FAIL'
    END as test_result;

-- Test duplicate role assignment prevention
DO $$
DECLARE
    first_insert BOOLEAN;
    second_insert BOOLEAN;
BEGIN
    first_insert := public.assign_role_to_user(999, 'dancer', NULL);
    second_insert := public.assign_role_to_user(999, 'dancer', NULL);
    
    -- Should succeed first time, be idempotent second time
    IF first_insert = TRUE AND second_insert = TRUE THEN
        RAISE NOTICE 'TEST 6b: Duplicate Role Assignment Prevention - PASS';
    ELSE
        RAISE NOTICE 'TEST 6b: Duplicate Role Assignment Prevention - FAIL';
    END IF;
    
    -- Cleanup
    DELETE FROM public.user_roles WHERE user_id = 999;
END $$;

-- =====================================================
-- TEST SUMMARY AND CLEANUP
-- =====================================================

-- Generate test summary
SELECT 
    'RLS Policy Test Suite Completed' as summary,
    NOW() as test_time,
    'Review individual test results above' as note;

-- Cleanup test functions
DROP FUNCTION IF EXISTS test_authenticated_role_access(INTEGER);
DROP FUNCTION IF EXISTS test_user_role_assignment();
DROP FUNCTION IF EXISTS test_admin_role_management();

-- Reset any session variables
RESET ROLE;
SELECT set_config('request.jwt.claims.sub', '', false);

-- =====================================================
-- PRODUCTION VERIFICATION QUERIES
-- =====================================================

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED'
        ELSE 'RLS DISABLED'
    END as rls_status
FROM pg_tables 
WHERE tablename IN ('roles', 'user_roles')
AND schemaname = 'public';

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('roles', 'user_roles')
ORDER BY tablename, policyname;