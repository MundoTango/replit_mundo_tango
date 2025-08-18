-- =====================================================
-- Mundo Tango - Roles and User Roles Migration
-- Complete schema creation with RLS policies
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ROLES TABLE CREATION
-- =====================================================

-- Drop existing table if exists (for migration rollback support)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- Create roles table
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    is_platform_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_roles_platform ON public.roles(is_platform_role);

-- Add table comment
COMMENT ON TABLE public.roles IS 'Community and platform roles for Mundo Tango users';

-- =====================================================
-- 2. USER_ROLES JUNCTION TABLE CREATION
-- =====================================================

-- Create user_roles junction table
CREATE TABLE public.user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_name TEXT NOT NULL REFERENCES public.roles(name) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by INTEGER,
    UNIQUE(user_id, role_name)
);

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_name ON public.user_roles(role_name);
CREATE INDEX idx_user_roles_assigned_at ON public.user_roles(assigned_at);

-- Add table comment
COMMENT ON TABLE public.user_roles IS 'Junction table for user role assignments';

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR ROLES TABLE
-- =====================================================

-- Policy 1: Allow anonymous users to read community roles (for onboarding)
CREATE POLICY "anonymous_can_read_community_roles" ON public.roles
    FOR SELECT
    USING (is_platform_role = FALSE);

-- Policy 2: Allow authenticated users to read all roles
CREATE POLICY "authenticated_users_can_read_all_roles" ON public.roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 3: Only admin users can insert/update/delete roles
CREATE POLICY "admin_can_manage_roles" ON public.roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.name = ur.role_name
            WHERE ur.user_id = auth.uid()::INTEGER
            AND r.name IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- RLS POLICIES FOR USER_ROLES TABLE
-- =====================================================

-- Policy 1: Users can read their own role assignments
CREATE POLICY "users_can_read_own_roles" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid()::INTEGER);

-- Policy 2: Users can assign community roles to themselves during onboarding
CREATE POLICY "users_can_assign_community_roles_to_self" ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()::INTEGER
        AND EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.name = role_name
            AND r.is_platform_role = FALSE
        )
    );

-- Policy 3: Admin users can manage all role assignments
CREATE POLICY "admin_can_manage_all_user_roles" ON public.user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.name = ur.role_name
            WHERE ur.user_id = auth.uid()::INTEGER
            AND r.name IN ('admin', 'super_admin')
        )
    );

-- Policy 4: Users can remove their own community role assignments
CREATE POLICY "users_can_remove_own_community_roles" ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()::INTEGER
        AND EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.name = role_name
            AND r.is_platform_role = FALSE
        )
    );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(target_user_id INTEGER)
RETURNS TABLE(role_name TEXT, description TEXT, assigned_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT r.name, r.description, ur.assigned_at
    FROM public.user_roles ur
    JOIN public.roles r ON r.name = ur.role_name
    WHERE ur.user_id = target_user_id
    ORDER BY ur.assigned_at DESC;
END;
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(target_user_id INTEGER, role_name_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = target_user_id
        AND role_name = role_name_param
    );
END;
$$;

-- Function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_role_to_user(
    target_user_id INTEGER,
    role_name_param TEXT,
    assigned_by_param INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if role exists and is not a platform role (unless assigned by admin)
    IF NOT EXISTS (
        SELECT 1 FROM public.roles 
        WHERE name = role_name_param 
        AND (
            is_platform_role = FALSE 
            OR (assigned_by_param IS NOT NULL AND public.user_has_role(assigned_by_param, 'admin'))
        )
    ) THEN
        RETURN FALSE;
    END IF;

    -- Insert role assignment (ON CONFLICT DO NOTHING for idempotency)
    INSERT INTO public.user_roles (user_id, role_name, assigned_by)
    VALUES (target_user_id, role_name_param, assigned_by_param)
    ON CONFLICT (user_id, role_name) DO NOTHING;

    RETURN TRUE;
END;
$$;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant appropriate permissions
GRANT SELECT ON public.roles TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT USAGE ON SEQUENCE user_roles_id_seq TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_roles(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_role_to_user(INTEGER, TEXT, INTEGER) TO authenticated;

-- =====================================================
-- 6. MIGRATION VALIDATION
-- =====================================================

-- Verify tables were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'roles') = 1,
           'roles table was not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_roles') = 1,
           'user_roles table was not created';
    
    RAISE NOTICE 'Migration completed successfully - roles and user_roles tables created with RLS policies';
END $$;

-- =====================================================
-- ROLLBACK SCRIPT (for reference)
-- =====================================================

/*
-- To rollback this migration:

DROP FUNCTION IF EXISTS public.assign_role_to_user(INTEGER, TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.user_has_role(INTEGER, TEXT);
DROP FUNCTION IF EXISTS public.get_user_roles(INTEGER);
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

*/