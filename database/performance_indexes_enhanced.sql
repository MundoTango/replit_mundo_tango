-- Performance Optimization Indexes for Enhanced Post Features
-- Targets location-based queries, media search, and real-time features

-- Location-based query optimization (HIGH PRIORITY)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_location_gin 
ON posts USING GIN(location gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_coordinates_gin 
ON posts USING GIN(coordinates);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_coordinates_spatial 
ON events(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_place_id 
ON posts(place_id) 
WHERE place_id IS NOT NULL;

-- Enhanced post features indexing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_mentions_gin 
ON posts USING GIN(mentions);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_rich_content_gin 
ON posts USING GIN(rich_content);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_media_embeds_gin 
ON posts USING GIN(media_embeds);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_formatted_address 
ON posts(formatted_address) 
WHERE formatted_address IS NOT NULL;

-- Memory media optimization for tag filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memory_media_compound 
ON memory_media(memory_id, media_id, tagged_by);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memory_media_sort_order 
ON memory_media(memory_id, sort_order);

-- Real-time features optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_unread_created 
ON notifications(user_id, is_read, created_at DESC) 
WHERE is_read = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_type_created 
ON reactions(type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_post_user_type 
ON reactions(post_id, user_id, type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_comment_user_type 
ON reactions(comment_id, user_id, type);

-- Search optimization with full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_plain_text_search 
ON posts USING GIN(to_tsvector('english', COALESCE(plain_text, content)));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_comments_content_search 
ON post_comments USING GIN(to_tsvector('english', content));

-- Media and tagging optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_tags_tag_trgm 
ON media_tags USING GIN(tag gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_assets_folder_user 
ON media_assets(folder, user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_assets_content_type 
ON media_assets(content_type, visibility, created_at DESC);

-- Social features optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_status_compound 
ON friends(user_id, friend_id, status) 
WHERE status = 'accepted';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_mutual_lookup 
ON friends(friend_id, user_id, status) 
WHERE status = 'accepted';

-- Event and location optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_location_city_country 
ON events(city, country, start_date DESC) 
WHERE city IS NOT NULL AND country IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_venue_location 
ON events(venue, location) 
WHERE venue IS NOT NULL;

-- Comment threading optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_comments_parent_tree 
ON post_comments(post_id, parent_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_comments_mentions_gin 
ON post_comments USING GIN(mentions);

-- Visibility and privacy optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_visibility_user_created 
ON posts(visibility, user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_assets_visibility_user 
ON media_assets(visibility, user_id, created_at DESC);

-- Hashtag and content discovery optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_hashtags_created 
ON posts USING GIN(hashtags) 
WHERE array_length(hashtags, 1) > 0;

-- User engagement optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_engagement_metrics 
ON posts(likes_count DESC, comments_count DESC, shares_count DESC, created_at DESC);

-- Activity and audit optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_reports_status_created 
ON post_reports(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_reports_moderator_status 
ON post_reports(moderator_id, status, created_at DESC) 
WHERE moderator_id IS NOT NULL;

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_feed_optimization 
ON posts(user_id, visibility, created_at DESC) 
WHERE is_public = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_discovery_optimization 
ON events(event_type, city, start_date DESC) 
WHERE is_public = true AND status = 'active';

-- Media usage tracking optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_usage_ref_context 
ON media_usage(used_in, ref_id, context);

-- Notification delivery optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type_user_created 
ON notifications(type, user_id, created_at DESC);

-- Analytics and performance monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_hour 
ON posts(date_trunc('hour', created_at));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_attendance_metrics 
ON events(current_attendees, max_attendees, created_at DESC) 
WHERE max_attendees IS NOT NULL;

-- Add comments to document index purposes
COMMENT ON INDEX idx_posts_location_gin IS 'Optimizes location-based post searches using trigram similarity';
COMMENT ON INDEX idx_posts_coordinates_gin IS 'Optimizes GPS coordinate-based queries for Google Maps integration';
COMMENT ON INDEX idx_events_coordinates_spatial IS 'Spatial index for proximity-based event discovery';
COMMENT ON INDEX idx_posts_mentions_gin IS 'Optimizes @mention searches and filtering';
COMMENT ON INDEX idx_memory_media_compound IS 'Optimizes media reuse workflow and tag filtering';
COMMENT ON INDEX idx_notifications_unread_created IS 'Optimizes real-time notification delivery';
COMMENT ON INDEX idx_posts_plain_text_search IS 'Full-text search optimization for post content';
COMMENT ON INDEX idx_media_tags_tag_trgm IS 'Fuzzy search optimization for media tags';