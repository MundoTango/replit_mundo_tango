-- Performance Optimization: Database Indexes for Multi-tenant Platform
-- Phase 1: Critical Database Optimizations
-- This script adds performance-critical indexes to support high-volume multi-tenant operations

-- ==========================================
-- TENANT-RELATED INDEXES
-- ==========================================

-- Composite index for tenant users queries
CREATE INDEX IF NOT EXISTS idx_tenant_users_composite 
ON tenant_users(tenant_id, user_id, is_admin);

-- Index for active tenant lookups
CREATE INDEX IF NOT EXISTS idx_tenants_active 
ON tenants(slug) 
WHERE is_active = true;

-- Index for domain-based tenant lookups
CREATE INDEX IF NOT EXISTS idx_tenants_domain 
ON tenants(domain) 
WHERE domain IS NOT NULL;

-- ==========================================
-- USER AND PROFILE INDEXES
-- ==========================================

-- Index for user profile queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id 
ON user_profiles(user_id);

-- Index for user role queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON user_roles(user_id);

-- Index for user preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);

-- ==========================================
-- CONTENT INDEXES (Posts, Events, Memories)
-- ==========================================

-- Composite index for posts queries
CREATE INDEX IF NOT EXISTS idx_posts_tenant_created 
ON posts(tenant_id, created_at DESC);

-- Index for user posts
CREATE INDEX IF NOT EXISTS idx_posts_user_created 
ON posts(user_id, created_at DESC);

-- Index for events by tenant and date
CREATE INDEX IF NOT EXISTS idx_events_tenant_start 
ON events(tenant_id, start_date);

-- Index for upcoming events
CREATE INDEX IF NOT EXISTS idx_events_upcoming 
ON events(start_date) 
WHERE deleted_at IS NULL AND start_date >= CURRENT_DATE;

-- Index for memories by user and date
CREATE INDEX IF NOT EXISTS idx_memories_user_created 
ON memories(user_id, created_at DESC);

-- Index for public memories
CREATE INDEX IF NOT EXISTS idx_memories_public 
ON memories(visibility) 
WHERE visibility = 'public';

-- ==========================================
-- RELATIONSHIP INDEXES
-- ==========================================

-- Index for follows relationships
CREATE INDEX IF NOT EXISTS idx_follows_follower 
ON follows(follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_following 
ON follows(following_id);

-- Index for group memberships
CREATE INDEX IF NOT EXISTS idx_group_members_user 
ON group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_group_members_group 
ON group_members(group_id);

-- Index for event participants
CREATE INDEX IF NOT EXISTS idx_event_participants_event 
ON event_participants(event_id);

CREATE INDEX IF NOT EXISTS idx_event_participants_user 
ON event_participants(user_id);

-- ==========================================
-- NOTIFICATION AND ACTIVITY INDEXES
-- ==========================================

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, created_at DESC) 
WHERE is_read = false;

-- Index for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user 
ON activity_logs(user_id, created_at DESC);

-- Index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
ON audit_logs(table_name, record_id);

-- ==========================================
-- JSONB AND ARRAY COLUMN INDEXES (GIN)
-- ==========================================

-- GIN index for emotion tags on memories
CREATE INDEX IF NOT EXISTS idx_memories_emotion_tags_gin 
ON memories USING gin(emotion_tags);

-- GIN index for tags on posts
CREATE INDEX IF NOT EXISTS idx_posts_tags_gin 
ON posts USING gin(tags) 
WHERE tags IS NOT NULL;

-- GIN index for event tags
CREATE INDEX IF NOT EXISTS idx_events_tags_gin 
ON events USING gin(tags) 
WHERE tags IS NOT NULL;

-- GIN index for user interests
CREATE INDEX IF NOT EXISTS idx_user_profiles_interests_gin 
ON user_profiles USING gin(interests) 
WHERE interests IS NOT NULL;

-- ==========================================
-- SEARCH AND FILTERING INDEXES
-- ==========================================

-- Index for username searches
CREATE INDEX IF NOT EXISTS idx_users_username_lower 
ON users(LOWER(username));

-- Index for email searches
CREATE INDEX IF NOT EXISTS idx_users_email_lower 
ON users(LOWER(email));

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_events_location_city 
ON events(location_city) 
WHERE location_city IS NOT NULL;

-- Index for content visibility
CREATE INDEX IF NOT EXISTS idx_posts_visibility 
ON posts(visibility);

-- ==========================================
-- TIMESTAMP INDEXES FOR RANGE QUERIES
-- ==========================================

-- Index for created_at ranges on major tables
CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_created_at 
ON events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memories_created_at 
ON memories(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
ON notifications(created_at DESC);

-- ==========================================
-- PERFORMANCE STATISTICS INDEXES
-- ==========================================

-- Index for statistics queries
CREATE INDEX IF NOT EXISTS idx_posts_stats 
ON posts(tenant_id, created_at DESC) 
INCLUDE (total_likes, total_comments);

-- Index for user activity statistics
CREATE INDEX IF NOT EXISTS idx_user_activity_date 
ON activity_logs(user_id, created_at::date);

-- ==========================================
-- MULTI-TENANT SPECIFIC INDEXES
-- ==========================================

-- Index for tenant isolation on major tables
CREATE INDEX IF NOT EXISTS idx_groups_tenant 
ON groups(tenant_id);

CREATE INDEX IF NOT EXISTS idx_stories_tenant 
ON stories(tenant_id);

-- Index for cross-tenant content sharing
CREATE INDEX IF NOT EXISTS idx_content_sharing_composite 
ON content_sharing(content_type, content_id, source_tenant_id);

-- ==========================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ==========================================

-- Update table statistics for query planner optimization
ANALYZE users;
ANALYZE user_profiles;
ANALYZE posts;
ANALYZE events;
ANALYZE memories;
ANALYZE groups;
ANALYZE notifications;
ANALYZE tenant_users;
ANALYZE tenants;

-- ==========================================
-- VERIFY INDEX CREATION
-- ==========================================

-- Query to check all indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;