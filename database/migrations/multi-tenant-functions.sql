-- Multi-Tenant Helper Functions
-- =============================
-- These functions provide core functionality for the multi-tenant system

-- Function to get the current user's tenants
CREATE OR REPLACE FUNCTION public.get_user_tenants()
RETURNS TABLE(tenant_id uuid, tenant_name text, tenant_slug text, is_admin boolean) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.name, t.slug, tu.is_admin
    FROM public.tenants t
    JOIN public.tenant_users tu ON t.id = tu.tenant_id
    WHERE tu.user_id = get_current_user_id()
    AND t.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the current tenant based on request headers (simulated for PostgreSQL)
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid AS $$
DECLARE
    tenant_slug text;
    tenant_id uuid;
    user_id integer;
BEGIN
    -- Try to get tenant from session
    tenant_slug := current_setting('app.tenant_slug', true);
    
    IF tenant_slug IS NOT NULL THEN
        SELECT id INTO tenant_id
        FROM public.tenants
        WHERE slug = tenant_slug
        AND is_active = true;
        
        IF tenant_id IS NOT NULL THEN
            RETURN tenant_id;
        END IF;
    END IF;
    
    -- If no tenant in session, use user's primary tenant
    user_id := get_current_user_id();
    IF user_id IS NOT NULL THEN
        SELECT primary_tenant_id INTO tenant_id
        FROM public.users
        WHERE id = user_id;
    END IF;
    
    -- If still no tenant, use the default Mundo Tango tenant
    IF tenant_id IS NULL THEN
        SELECT id INTO tenant_id
        FROM public.tenants
        WHERE slug = 'mundo-tango'
        LIMIT 1;
    END IF;
    
    RETURN tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically set tenant_id on insert
CREATE OR REPLACE FUNCTION public.set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id := get_current_tenant_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get content across multiple communities
CREATE OR REPLACE FUNCTION public.get_cross_community_content(
    content_type text,
    tenant_ids uuid[] DEFAULT NULL,
    limit_count integer DEFAULT 20,
    offset_count integer DEFAULT 0
)
RETURNS SETOF jsonb AS $$
DECLARE
    user_tenants uuid[];
    query_tenants uuid[];
BEGIN
    -- Get user's tenant memberships
    user_tenants := get_user_tenant_ids();
    
    -- If tenant_ids is provided, use those (must be a subset of user's tenants)
    IF tenant_ids IS NOT NULL THEN
        SELECT array_agg(t) INTO query_tenants
        FROM unnest(tenant_ids) t
        WHERE t = ANY(user_tenants);
    ELSE
        -- Otherwise use all user's tenants
        query_tenants := user_tenants;
    END IF;
    
    -- Return empty if no valid tenants
    IF query_tenants IS NULL OR array_length(query_tenants, 1) = 0 THEN
        RETURN;
    END IF;
    
    -- Query based on content type
    CASE content_type
        WHEN 'posts' THEN
            RETURN QUERY
            SELECT jsonb_build_object(
                'id', p.id,
                'content_type', 'post',
                'tenant_id', p.tenant_id,
                'tenant_name', t.name,
                'user_id', p.user_id,
                'content', p.content,
                'created_at', p.created_at,
                'likes', (SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id),
                'comments', (SELECT COUNT(*) FROM public.post_comments WHERE post_id = p.id)
            )
            FROM public.posts p
            JOIN public.tenants t ON p.tenant_id = t.id
            WHERE p.tenant_id = ANY(query_tenants)
            AND p.deleted_at IS NULL
            ORDER BY p.created_at DESC
            LIMIT limit_count
            OFFSET offset_count;
            
        WHEN 'events' THEN
            RETURN QUERY
            SELECT jsonb_build_object(
                'id', e.id,
                'content_type', 'event',
                'tenant_id', e.tenant_id,
                'tenant_name', t.name,
                'title', e.title,
                'description', e.description,
                'start_date', e.start_date,
                'location_name', e.location_name,
                'image_url', e.image_url
            )
            FROM public.events e
            JOIN public.tenants t ON e.tenant_id = t.id
            WHERE e.tenant_id = ANY(query_tenants)
            AND e.deleted_at IS NULL
            AND e.start_date >= CURRENT_DATE
            ORDER BY e.start_date ASC
            LIMIT limit_count
            OFFSET offset_count;
            
        WHEN 'memories' THEN
            RETURN QUERY
            SELECT jsonb_build_object(
                'id', m.id,
                'content_type', 'memory',
                'tenant_id', m.tenant_id,
                'tenant_name', t.name,
                'user_id', m.user_id,
                'content', m.content,
                'emotion_tags', m.emotion_tags,
                'location', m.location,
                'created_at', m.created_at
            )
            FROM public.memories m
            JOIN public.tenants t ON m.tenant_id = t.id
            WHERE m.tenant_id = ANY(query_tenants)
            AND (m.visibility IN ('public', 'all') OR m.user_id = get_current_user_id())
            ORDER BY m.created_at DESC
            LIMIT limit_count
            OFFSET offset_count;
            
        ELSE
            RAISE EXCEPTION 'Unsupported content type: %', content_type;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get journey recommendations
CREATE OR REPLACE FUNCTION public.get_journey_recommendations(
    journey_id uuid,
    limit_count integer DEFAULT 10
)
RETURNS TABLE(
    tenant_id uuid,
    tenant_name text,
    activity_type text,
    title text,
    description text,
    start_date timestamptz,
    location jsonb,
    relevance_score numeric
) AS $$
BEGIN
    -- This is a placeholder for what would be a more complex recommendation algorithm
    RETURN QUERY
    WITH journey AS (
        SELECT 
            j.tenant_ids,
            j.start_date,
            j.end_date,
            j.locations
        FROM 
            public.user_journeys j
        WHERE 
            j.id = journey_id
            AND j.user_id = get_current_user_id()
    ),
    journey_locations AS (
        SELECT 
            (loc->>'country')::text AS country,
            (loc->>'city')::text AS city
        FROM 
            journey j,
            unnest(j.locations) loc
    )
    SELECT 
        e.tenant_id,
        t.name AS tenant_name,
        'event'::text AS activity_type,
        e.title,
        e.description,
        e.start_date,
        jsonb_build_object(
            'country', e.country,
            'city', e.city,
            'latitude', e.latitude,
            'longitude', e.longitude
        ) AS location,
        -- Simple relevance scoring based on location match and date proximity
        CASE 
            WHEN e.country = ANY(SELECT country FROM journey_locations) AND 
                 e.city = ANY(SELECT city FROM journey_locations) THEN 1.0
            WHEN e.country = ANY(SELECT country FROM journey_locations) THEN 0.7
            ELSE 0.3
        END AS relevance_score
    FROM 
        public.events e
        JOIN public.tenants t ON e.tenant_id = t.id,
        journey j
    WHERE 
        e.tenant_id = ANY(SELECT unnest(j.tenant_ids))
        AND e.start_date BETWEEN j.start_date AND j.end_date
        AND e.deleted_at IS NULL
    ORDER BY 
        relevance_score DESC,
        e.start_date ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if content can be shared between tenants
CREATE OR REPLACE FUNCTION public.can_share_content(
    source_tenant_id uuid,
    target_tenant_id uuid,
    user_id integer
) RETURNS boolean AS $$
BEGIN
    -- User must be member of source tenant
    IF NOT EXISTS (
        SELECT 1 FROM public.tenant_users 
        WHERE tenant_id = source_tenant_id 
        AND user_id = user_id
    ) THEN
        RETURN false;
    END IF;
    
    -- Check if communities are connected
    IF EXISTS (
        SELECT 1 FROM public.community_connections
        WHERE (tenant_id_1 = source_tenant_id AND tenant_id_2 = target_tenant_id)
        OR (is_bidirectional = true AND tenant_id_1 = target_tenant_id AND tenant_id_2 = source_tenant_id)
    ) THEN
        RETURN true;
    END IF;
    
    -- Check if user is admin in source tenant
    IF EXISTS (
        SELECT 1 FROM public.tenant_users
        WHERE tenant_id = source_tenant_id
        AND user_id = user_id
        AND is_admin = true
    ) THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic tenant_id assignment
CREATE TRIGGER set_tenant_id_on_posts
    BEFORE INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_tenant_id();

CREATE TRIGGER set_tenant_id_on_events
    BEFORE INSERT ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.set_tenant_id();

CREATE TRIGGER set_tenant_id_on_groups
    BEFORE INSERT ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION public.set_tenant_id();

CREATE TRIGGER set_tenant_id_on_memories
    BEFORE INSERT ON public.memories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_tenant_id();

-- Create view for user's community memberships
CREATE OR REPLACE VIEW public.user_communities AS
SELECT 
    tu.user_id,
    t.id AS tenant_id,
    t.name AS tenant_name,
    t.slug AS tenant_slug,
    t.logo_url,
    t.primary_color,
    t.secondary_color,
    tu.role,
    tu.is_admin,
    tu.expertise_level,
    tu.interests,
    tu.display_in_feed,
    (
        SELECT count(*) 
        FROM public.tenant_users 
        WHERE tenant_id = t.id
    ) AS member_count,
    (
        SELECT count(*) 
        FROM public.posts 
        WHERE tenant_id = t.id 
        AND created_at > (now() - interval '30 days')
    ) AS recent_activity_count
FROM 
    public.tenant_users tu
    JOIN public.tenants t ON tu.tenant_id = t.id
WHERE 
    t.is_active = true;