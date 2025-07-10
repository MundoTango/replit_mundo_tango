-- Multi-Tenant Platform Architecture Migration
-- ============================================
-- This migration adds multi-tenant support to Mundo Tango platform
-- enabling users to join multiple communities simultaneously

-- TENANTS TABLE: Core table for managing different communities
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    logo_url text,
    primary_color text DEFAULT '#FF1744',
    secondary_color text DEFAULT '#3F51B5',
    domain text UNIQUE,
    is_active boolean DEFAULT true,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- TENANT_USERS: Junction table for user membership across communities
CREATE TABLE IF NOT EXISTS public.tenant_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    is_admin boolean DEFAULT false,
    display_in_feed boolean DEFAULT true,
    notification_preferences jsonb DEFAULT '{"email": true, "push": true}'::jsonb,
    expertise_level text DEFAULT 'beginner',
    interests text[] DEFAULT '{}'::text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- USER_VIEW_PREFERENCES: Stores how users want to view content across communities
CREATE TABLE IF NOT EXISTS public.user_view_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    view_mode text NOT NULL DEFAULT 'single_community', -- 'single_community', 'all_communities', 'custom'
    selected_tenant_id uuid REFERENCES public.tenants(id),
    selected_tenant_ids uuid[] DEFAULT '{}'::uuid[],
    custom_filters jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- CONTENT_SHARING: Manages cross-community content sharing
CREATE TABLE IF NOT EXISTS public.content_sharing (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type text NOT NULL, -- 'post', 'event', 'group', 'memory'
    content_id uuid NOT NULL,
    source_tenant_id uuid NOT NULL REFERENCES public.tenants(id),
    shared_tenant_id uuid NOT NULL REFERENCES public.tenants(id),
    shared_by integer REFERENCES public.users(id),
    is_approved boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(content_type, content_id, shared_tenant_id)
);

-- COMMUNITY_CONNECTIONS: Defines relationships between communities
CREATE TABLE IF NOT EXISTS public.community_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id_1 uuid NOT NULL REFERENCES public.tenants(id),
    tenant_id_2 uuid NOT NULL REFERENCES public.tenants(id),
    relationship_type text NOT NULL, -- 'related', 'partner', 'parent_child'
    is_bidirectional boolean DEFAULT true,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id_1, tenant_id_2),
    CHECK (tenant_id_1 != tenant_id_2)
);

-- USER_JOURNEYS: Tracks cross-community activities and plans
CREATE TABLE IF NOT EXISTS public.user_journeys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id integer NOT NULL REFERENCES public.users(id),
    title text NOT NULL,
    description text,
    start_date date,
    end_date date,
    locations jsonb[] DEFAULT '{}'::jsonb[],
    tenant_ids uuid[] DEFAULT '{}'::uuid[],
    journey_type text DEFAULT 'travel', -- 'travel', 'learning', 'experience'
    status text DEFAULT 'planning', -- 'planning', 'active', 'completed'
    is_public boolean DEFAULT false,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- JOURNEY_ACTIVITIES: Tracks activities within a journey
CREATE TABLE IF NOT EXISTS public.journey_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id uuid NOT NULL REFERENCES public.user_journeys(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES public.tenants(id),
    activity_type text NOT NULL, -- 'event', 'class', 'practice', 'sightseeing'
    title text NOT NULL,
    description text,
    location jsonb,
    start_datetime timestamptz,
    end_datetime timestamptz,
    external_url text,
    content_reference_id uuid, -- Optional reference to content in the platform
    content_reference_type text, -- 'event', 'post', etc.
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Modify users table to include tenant-specific fields
ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS primary_tenant_id uuid REFERENCES public.tenants(id);

-- Add tenant_id to all content tables
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_primary_tenant_id ON public.users(primary_tenant_id);
CREATE INDEX IF NOT EXISTS idx_posts_tenant_id ON public.posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON public.events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_groups_tenant_id ON public.groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memories_tenant_id ON public.memories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_user_id ON public.user_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_tenant_ids ON public.user_journeys USING gin(tenant_ids);
CREATE INDEX IF NOT EXISTS idx_journey_activities_journey_id ON public.journey_activities(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_activities_tenant_id ON public.journey_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_sharing_content_id ON public.content_sharing(content_id);
CREATE INDEX IF NOT EXISTS idx_content_sharing_source_tenant_id ON public.content_sharing(source_tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_sharing_shared_tenant_id ON public.content_sharing(shared_tenant_id);

-- Enable Row Level Security on all multi-tenant tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_view_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_activities ENABLE ROW LEVEL SECURITY;

-- Insert default tenant for Mundo Tango
INSERT INTO public.tenants (slug, name, description, logo_url, primary_color, secondary_color, domain, is_active)
VALUES (
    'mundo-tango',
    'Mundo Tango',
    'The global tango community platform',
    '/assets/mundo-tango-logo.png',
    '#FF1744',
    '#3F51B5',
    'mundotango.life',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Migrate existing users to the default tenant
INSERT INTO public.tenant_users (tenant_id, user_id, role, is_admin)
SELECT 
    (SELECT id FROM public.tenants WHERE slug = 'mundo-tango'),
    u.id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role_name = 'super_admin') THEN 'admin'
        WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role_name = 'admin') THEN 'moderator'
        ELSE 'member'
    END,
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role_name IN ('super_admin', 'admin'))
FROM public.users u
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Update existing content with default tenant
UPDATE public.posts SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'mundo-tango') WHERE tenant_id IS NULL;
UPDATE public.events SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'mundo-tango') WHERE tenant_id IS NULL;
UPDATE public.groups SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'mundo-tango') WHERE tenant_id IS NULL;
UPDATE public.memories SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'mundo-tango') WHERE tenant_id IS NULL;

-- Set primary tenant for existing users
UPDATE public.users SET primary_tenant_id = (SELECT id FROM public.tenants WHERE slug = 'mundo-tango') WHERE primary_tenant_id IS NULL;