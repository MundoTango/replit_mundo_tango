-- Enhanced Backend Migration Script for Mundo Tango
-- Supporting rich text, mentions, media embeds, and Google Maps integration
-- Date: June 30, 2025

-- Begin transaction for atomic migration
BEGIN;

-- Add event_id column to posts table for event association
ALTER TABLE posts ADD COLUMN IF NOT EXISTS event_id INTEGER REFERENCES events(id);

-- Add date column to events table for backward compatibility
ALTER TABLE events ADD COLUMN IF NOT EXISTS date TEXT;

-- Update posts table with enhanced features for rich content
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rich_content JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS plain_text TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_embeds JSONB DEFAULT '[]';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS place_id TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS formatted_address TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Enhanced comments table with mentions and rich features
CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES post_comments(id),
    mentions TEXT[] DEFAULT '{}',
    gif_url TEXT,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Post reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS post_reactions (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL, -- heart, fire, wow, celebrate, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- Enhanced notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- comment, mention, reaction, friend_request, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Post reports table for content moderation
CREATE TABLE IF NOT EXISTS post_reports (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_posts_event_id ON posts(event_id);
CREATE INDEX IF NOT EXISTS idx_posts_mentions ON posts USING GIN(mentions);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_posts_coordinates ON posts USING GIN(coordinates);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_created ON posts(visibility, created_at);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_mentions ON post_comments USING GIN(mentions);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type_created ON notifications(type, created_at);

CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);

-- Update existing posts to have default values for new columns
UPDATE posts SET 
    mentions = '{}' WHERE mentions IS NULL,
    hashtags = '{}' WHERE hashtags IS NULL,
    media_embeds = '[]' WHERE media_embeds IS NULL,
    visibility = 'public' WHERE visibility IS NULL,
    is_edited = false WHERE is_edited IS NULL;

-- Update events table to populate date field from start_date
UPDATE events SET date = start_date::text WHERE date IS NULL AND start_date IS NOT NULL;

-- Row-Level Security policies for enhanced tables
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- RLS policy for post comments (users can see public posts' comments and their own)
CREATE POLICY comments_select_policy ON post_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_comments.post_id 
            AND (posts.visibility = 'public' OR posts.user_id = current_setting('app.current_user_id')::integer)
        )
        OR user_id = current_setting('app.current_user_id')::integer
    );

-- RLS policy for post reactions (similar to comments)
CREATE POLICY reactions_select_policy ON post_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_reactions.post_id 
            AND (posts.visibility = 'public' OR posts.user_id = current_setting('app.current_user_id')::integer)
        )
    );

-- RLS policy for notifications (users can only see their own)
CREATE POLICY notifications_select_policy ON notifications
    FOR SELECT USING (user_id = current_setting('app.current_user_id')::integer);

-- RLS policy for post reports (reporters and moderators can see)
CREATE POLICY reports_select_policy ON post_reports
    FOR SELECT USING (
        reporter_id = current_setting('app.current_user_id')::integer
        OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = current_setting('app.current_user_id')::integer 
            AND (role = 'admin' OR role = 'moderator')
        )
    );

-- Insert policies for enhanced tables
CREATE POLICY comments_insert_policy ON post_comments
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::integer);

CREATE POLICY reactions_insert_policy ON post_reactions
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id')::integer);

CREATE POLICY reports_insert_policy ON post_reports
    FOR INSERT WITH CHECK (reporter_id = current_setting('app.current_user_id')::integer);

-- Update policies for enhanced tables
CREATE POLICY comments_update_policy ON post_comments
    FOR UPDATE USING (user_id = current_setting('app.current_user_id')::integer);

CREATE POLICY reactions_update_policy ON post_reactions
    FOR UPDATE USING (user_id = current_setting('app.current_user_id')::integer);

-- Delete policies for enhanced tables
CREATE POLICY comments_delete_policy ON post_comments
    FOR DELETE USING (
        user_id = current_setting('app.current_user_id')::integer
        OR EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_comments.post_id 
            AND posts.user_id = current_setting('app.current_user_id')::integer
        )
    );

CREATE POLICY reactions_delete_policy ON post_reactions
    FOR DELETE USING (user_id = current_setting('app.current_user_id')::integer);

-- Function to extract mentions from content
CREATE OR REPLACE FUNCTION extract_mentions(content TEXT)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT regexp_replace(match, '^@', '')
        FROM unnest(regexp_split_to_array(content, '\s+')) AS match
        WHERE match ~ '^@[a-zA-Z0-9_]+$'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to extract hashtags from content
CREATE OR REPLACE FUNCTION extract_hashtags(content TEXT)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT regexp_replace(match, '^#', '')
        FROM unnest(regexp_split_to_array(content, '\s+')) AS match
        WHERE match ~ '^#[a-zA-Z0-9_]+$'
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically extract mentions and hashtags from post content
CREATE OR REPLACE FUNCTION update_post_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract mentions and hashtags from content
    NEW.mentions = extract_mentions(NEW.content);
    NEW.hashtags = extract_hashtags(NEW.content);
    
    -- Extract plain text from rich content if available
    IF NEW.rich_content IS NOT NULL THEN
        NEW.plain_text = regexp_replace(
            NEW.rich_content->>'text', 
            '<[^>]*>', 
            '', 
            'g'
        );
    ELSE
        NEW.plain_text = NEW.content;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_metadata_trigger
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_metadata();

-- Create full-text search index for posts
CREATE INDEX IF NOT EXISTS idx_posts_fulltext ON posts 
USING gin(to_tsvector('english', coalesce(plain_text, content)));

-- Add location-based search capabilities
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column for location-based queries
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location_point GEOMETRY(POINT, 4326);

-- Function to update location point from coordinates
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.coordinates IS NOT NULL THEN
        NEW.location_point = ST_SetSRID(
            ST_MakePoint(
                (NEW.coordinates->>'lng')::float,
                (NEW.coordinates->>'lat')::float
            ),
            4326
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_location_trigger
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_location_point();

-- Spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_posts_location_point ON posts USING GIST(location_point);

-- Commit the transaction
COMMIT;

-- Performance analysis and optimization recommendations
-- 1. Use EXPLAIN ANALYZE for query performance testing
-- 2. Consider partitioning posts table by date for large datasets
-- 3. Implement connection pooling for better database performance
-- 4. Use materialized views for complex aggregation queries
-- 5. Regular VACUUM and ANALYZE operations for optimal performance