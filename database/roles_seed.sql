-- =====================================================
-- Mundo Tango - Roles Seed Data
-- Complete role definitions with enhanced descriptions
-- =====================================================

-- Clear existing role data for clean seeding
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.roles CASCADE;

-- =====================================================
-- COMMUNITY ROLES (18 roles)
-- =====================================================

INSERT INTO public.roles (name, description, is_platform_role) VALUES
-- Core Dance Roles
('dancer', 'Social tango dancer', FALSE),
('teacher', 'Teaches classes or privates', FALSE),
('performer', 'Stage/showcase tango performer', FALSE),

-- Event & Organization Roles  
('organizer', 'Organizes milongas, festivals, etc.', FALSE),
('dj', 'Plays music at tango events', FALSE),

-- Hospitality & Travel Roles (Enhanced)
('host', 'Offers a home to travelers', FALSE),
('guide', 'Willing to show visitors around', FALSE),
('tango_traveler', 'Travels to tango communities', FALSE),

-- Creative & Media Roles
('photographer', 'Captures tango moments visually', FALSE),
('content_creator', 'Creates tango media content', FALSE),
('choreographer', 'Designs choreographed pieces', FALSE),
('musician', 'Performs live tango music', FALSE),

-- Business & Service Roles
('vendor', 'Sells tango shoes or accessories', FALSE),
('tour_operator', 'Organizes tango-themed tours', FALSE),
('tango_hotel', 'Venue offering tango lodging/events', FALSE),
('tango_school', 'Tango instruction center or academy', FALSE),

-- Learning & Wellness Roles
('learning_source', 'Resource for learning tango', FALSE),
('wellness_provider', 'Provides tango wellness services', FALSE);

-- =====================================================
-- PLATFORM ROLES (6 roles)
-- =====================================================

INSERT INTO public.roles (name, description, is_platform_role) VALUES
('super_admin', 'Complete platform administration access', TRUE),
('admin', 'Administrative access and user management', TRUE),
('moderator', 'Content moderation and community guidelines enforcement', TRUE),
('curator', 'Content curation and featured content management', TRUE),
('guest', 'Default role for new users', TRUE),
('bot', 'Automated system accounts', TRUE);

-- =====================================================
-- VALIDATION & VERIFICATION
-- =====================================================

-- Verify community roles count (should be 18)
DO $$
DECLARE
    community_role_count INTEGER;
    platform_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO community_role_count FROM public.roles WHERE is_platform_role = FALSE;
    SELECT COUNT(*) INTO platform_role_count FROM public.roles WHERE is_platform_role = TRUE;
    
    ASSERT community_role_count = 18, 
           FORMAT('Expected 18 community roles, found %s', community_role_count);
    ASSERT platform_role_count = 6, 
           FORMAT('Expected 6 platform roles, found %s', platform_role_count);
    
    RAISE NOTICE 'Seed data validation successful:';
    RAISE NOTICE '  - Community roles: %', community_role_count;
    RAISE NOTICE '  - Platform roles: %', platform_role_count;
    RAISE NOTICE '  - Total roles: %', community_role_count + platform_role_count;
END $$;

-- =====================================================
-- SAMPLE ROLE ASSIGNMENTS (for testing)
-- =====================================================

-- Note: Actual user role assignments will be handled through the application
-- This section can be used for testing purposes with real user IDs

/*
-- Example assignments (uncomment and adjust user IDs as needed):

-- Assign multiple roles to Scott Boddye (user_id: 11)
INSERT INTO public.user_roles (user_id, role_name, assigned_at) VALUES
(11, 'super_admin', NOW()),
(11, 'admin', NOW()),
(11, 'dancer', NOW()),
(11, 'teacher', NOW()),
(11, 'organizer', NOW())
ON CONFLICT (user_id, role_name) DO NOTHING;

-- Assign basic roles to other test users
INSERT INTO public.user_roles (user_id, role_name, assigned_at) VALUES
(1, 'dancer', NOW()),
(2, 'teacher', NOW()),
(3, 'organizer', NOW()),
(4, 'dj', NOW()),
(5, 'performer', NOW())
ON CONFLICT (user_id, role_name) DO NOTHING;
*/

-- =====================================================
-- ROLE STATISTICS AND INFORMATION
-- =====================================================

-- Query to show all roles with their categories
SELECT 
    CASE 
        WHEN is_platform_role THEN 'Platform Role'
        ELSE 'Community Role'
    END AS role_category,
    name,
    description,
    created_at
FROM public.roles 
ORDER BY is_platform_role, name;

-- Display summary statistics
SELECT 
    'Total Roles' as metric,
    COUNT(*) as count
FROM public.roles
UNION ALL
SELECT 
    'Community Roles' as metric,
    COUNT(*) as count
FROM public.roles 
WHERE is_platform_role = FALSE
UNION ALL
SELECT 
    'Platform Roles' as metric,
    COUNT(*) as count
FROM public.roles 
WHERE is_platform_role = TRUE;