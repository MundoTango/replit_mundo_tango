-- Performance Optimization Indexes for Mundo Tango Platform
-- Created: June 30, 2025
-- Purpose: Critical query path optimization based on performance analysis

-- Events performance indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_location_date ON events(city, country, start_date);
CREATE INDEX IF NOT EXISTS idx_events_user_status ON events(user_id, status, start_date);
CREATE INDEX IF NOT EXISTS idx_events_public_date ON events(is_public, start_date) WHERE is_public = true;

-- Event RSVP optimization
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_event ON event_rsvps(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_status ON event_rsvps(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_status ON event_rsvps(user_id, status);

-- Media asset performance
CREATE INDEX IF NOT EXISTS idx_media_assets_user_folder ON media_assets(user_id, folder, created_at);
CREATE INDEX IF NOT EXISTS idx_media_assets_visibility ON media_assets(visibility, created_at);
CREATE INDEX IF NOT EXISTS idx_media_assets_content_type ON media_assets(content_type, user_id);

-- Media tagging optimization  
CREATE INDEX IF NOT EXISTS idx_media_tags_tag ON media_tags(tag);
CREATE INDEX IF NOT EXISTS idx_media_tags_media_tag ON media_tags(media_id, tag);
CREATE INDEX IF NOT EXISTS idx_media_tags_tag_count ON media_tags(tag, created_at);

-- Event participants and role assignment
CREATE INDEX IF NOT EXISTS idx_event_participants_user_role ON event_participants(user_id, role, status);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_status ON event_participants(event_id, status);
CREATE INDEX IF NOT EXISTS idx_event_participants_invited_by ON event_participants(invited_by, invited_at);

-- User role management
CREATE INDEX IF NOT EXISTS idx_user_roles_user_name ON user_roles(user_id, role_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_assigned ON user_roles(role_name, assigned_at);

-- Posts and social features
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_posts_public_created ON posts(is_public, created_at) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_post_likes_post_user ON post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON post_comments(post_id, created_at);

-- Memory media relationships
CREATE INDEX IF NOT EXISTS idx_memory_media_memory ON memory_media(memory_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_memory_media_media ON memory_media(media_id);

-- User followed cities
CREATE INDEX IF NOT EXISTS idx_user_followed_cities_user ON user_followed_cities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_followed_cities_location ON user_followed_cities(city, country);

-- Analytics and monitoring
CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_action ON security_logs(user_id, action, created_at);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_events_feed_optimization ON events(is_public, start_date, city, country) 
    WHERE is_public = true AND start_date > CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_media_tag_search ON media_tags(tag) 
    INCLUDE (media_id, created_at);

-- Statistics update for query planner optimization
ANALYZE events;
ANALYZE event_rsvps;
ANALYZE media_assets;
ANALYZE media_tags;
ANALYZE event_participants;
ANALYZE user_roles;