-- Multi-Tenant Row Level Security Policies
-- ========================================
-- These policies ensure data isolation between tenants while allowing
-- cross-community access where appropriate

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS integer AS $$
BEGIN
    -- Check if user is authenticated via session
    IF current_setting('app.user_id', true) IS NOT NULL THEN
        RETURN current_setting('app.user_id', true)::integer;
    END IF;
    
    -- Return null if not authenticated
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = get_current_user_id() 
        AND is_super_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's tenant memberships
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()
RETURNS uuid[] AS $$
DECLARE
    tenant_ids uuid[];
BEGIN
    SELECT array_agg(tenant_id) INTO tenant_ids
    FROM public.tenant_users
    WHERE user_id = get_current_user_id();
    
    RETURN COALESCE(tenant_ids, '{}'::uuid[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is tenant admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin(check_tenant_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_users
        WHERE user_id = get_current_user_id()
        AND tenant_id = check_tenant_id
        AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TENANT POLICIES
-- ===============

-- Super admins can manage all tenants
CREATE POLICY tenants_super_admin_all ON public.tenants
    FOR ALL TO public
    USING (is_super_admin());

-- Regular users can view active tenants
CREATE POLICY tenants_view_active ON public.tenants
    FOR SELECT TO public
    USING (is_active = true);

-- TENANT USERS POLICIES
-- ====================

-- Users can view their own tenant memberships
CREATE POLICY tenant_users_own_view ON public.tenant_users
    FOR SELECT TO public
    USING (user_id = get_current_user_id());

-- Users can view members of their tenants
CREATE POLICY tenant_users_tenant_members_view ON public.tenant_users
    FOR SELECT TO public
    USING (tenant_id = ANY(get_user_tenant_ids()));

-- Tenant admins can manage users in their tenants
CREATE POLICY tenant_users_admin_manage ON public.tenant_users
    FOR ALL TO public
    USING (is_tenant_admin(tenant_id));

-- Super admins can manage all tenant users
CREATE POLICY tenant_users_super_admin_all ON public.tenant_users
    FOR ALL TO public
    USING (is_super_admin());

-- USER VIEW PREFERENCES POLICIES
-- =============================

-- Users can manage their own view preferences
CREATE POLICY user_view_preferences_own ON public.user_view_preferences
    FOR ALL TO public
    USING (user_id = get_current_user_id());

-- CONTENT SHARING POLICIES
-- =======================

-- Users can view approved content sharing in their tenants
CREATE POLICY content_sharing_view_approved ON public.content_sharing
    FOR SELECT TO public
    USING (
        is_approved = true 
        AND (
            source_tenant_id = ANY(get_user_tenant_ids())
            OR shared_tenant_id = ANY(get_user_tenant_ids())
        )
    );

-- Tenant admins can manage content sharing for their tenants
CREATE POLICY content_sharing_admin_manage ON public.content_sharing
    FOR ALL TO public
    USING (
        is_tenant_admin(source_tenant_id)
        OR is_tenant_admin(shared_tenant_id)
    );

-- Users can create content sharing requests from their tenants
CREATE POLICY content_sharing_create ON public.content_sharing
    FOR INSERT TO public
    WITH CHECK (
        shared_by = get_current_user_id()
        AND source_tenant_id = ANY(get_user_tenant_ids())
    );

-- COMMUNITY CONNECTIONS POLICIES
-- =============================

-- All users can view community connections
CREATE POLICY community_connections_view ON public.community_connections
    FOR SELECT TO public
    USING (true);

-- Super admins can manage community connections
CREATE POLICY community_connections_admin ON public.community_connections
    FOR ALL TO public
    USING (is_super_admin());

-- USER JOURNEYS POLICIES
-- =====================

-- Users can manage their own journeys
CREATE POLICY user_journeys_own ON public.user_journeys
    FOR ALL TO public
    USING (user_id = get_current_user_id());

-- Users can view public journeys
CREATE POLICY user_journeys_public_view ON public.user_journeys
    FOR SELECT TO public
    USING (is_public = true);

-- JOURNEY ACTIVITIES POLICIES
-- =========================

-- Users can manage activities in their own journeys
CREATE POLICY journey_activities_own ON public.journey_activities
    FOR ALL TO public
    USING (
        journey_id IN (
            SELECT id FROM public.user_journeys 
            WHERE user_id = get_current_user_id()
        )
    );

-- Users can view activities in public journeys
CREATE POLICY journey_activities_public_view ON public.journey_activities
    FOR SELECT TO public
    USING (
        journey_id IN (
            SELECT id FROM public.user_journeys 
            WHERE is_public = true
        )
    );

-- CONTENT POLICIES (Posts, Events, Groups, Memories)
-- =================================================

-- Users can view posts in their tenants
CREATE POLICY posts_tenant_view ON public.posts
    FOR SELECT TO public
    USING (
        tenant_id = ANY(get_user_tenant_ids())
        OR tenant_id IN (
            SELECT shared_tenant_id FROM public.content_sharing
            WHERE content_type = 'post'
            AND content_id = posts.id::uuid
            AND is_approved = true
        )
    );

-- Users can create posts in their tenants
CREATE POLICY posts_tenant_create ON public.posts
    FOR INSERT TO public
    WITH CHECK (
        user_id = get_current_user_id()
        AND tenant_id = ANY(get_user_tenant_ids())
    );

-- Users can update their own posts
CREATE POLICY posts_own_update ON public.posts
    FOR UPDATE TO public
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

-- Users can delete their own posts
CREATE POLICY posts_own_delete ON public.posts
    FOR DELETE TO public
    USING (user_id = get_current_user_id());

-- Similar policies for events
CREATE POLICY events_tenant_view ON public.events
    FOR SELECT TO public
    USING (
        tenant_id = ANY(get_user_tenant_ids())
        OR tenant_id IN (
            SELECT shared_tenant_id FROM public.content_sharing
            WHERE content_type = 'event'
            AND content_id = events.id::uuid
            AND is_approved = true
        )
    );

CREATE POLICY events_tenant_create ON public.events
    FOR INSERT TO public
    WITH CHECK (
        created_by = get_current_user_id()
        AND tenant_id = ANY(get_user_tenant_ids())
    );

CREATE POLICY events_own_update ON public.events
    FOR UPDATE TO public
    USING (created_by = get_current_user_id())
    WITH CHECK (created_by = get_current_user_id());

CREATE POLICY events_own_delete ON public.events
    FOR DELETE TO public
    USING (created_by = get_current_user_id());

-- Similar policies for groups
CREATE POLICY groups_tenant_view ON public.groups
    FOR SELECT TO public
    USING (
        tenant_id = ANY(get_user_tenant_ids())
        OR is_private = false
    );

CREATE POLICY groups_tenant_create ON public.groups
    FOR INSERT TO public
    WITH CHECK (
        created_by = get_current_user_id()
        AND tenant_id = ANY(get_user_tenant_ids())
    );

CREATE POLICY groups_own_update ON public.groups
    FOR UPDATE TO public
    USING (created_by = get_current_user_id())
    WITH CHECK (created_by = get_current_user_id());

CREATE POLICY groups_own_delete ON public.groups
    FOR DELETE TO public
    USING (created_by = get_current_user_id());

-- Similar policies for memories
CREATE POLICY memories_tenant_view ON public.memories
    FOR SELECT TO public
    USING (
        tenant_id = ANY(get_user_tenant_ids())
        OR visibility IN ('public', 'all')
        OR (visibility = 'connections' AND user_id IN (
            SELECT following_id FROM public.follows
            WHERE follower_id = get_current_user_id()
        ))
    );

CREATE POLICY memories_tenant_create ON public.memories
    FOR INSERT TO public
    WITH CHECK (
        user_id = get_current_user_id()
        AND tenant_id = ANY(get_user_tenant_ids())
    );

CREATE POLICY memories_own_update ON public.memories
    FOR UPDATE TO public
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

CREATE POLICY memories_own_delete ON public.memories
    FOR DELETE TO public
    USING (user_id = get_current_user_id());