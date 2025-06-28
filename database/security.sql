-- Mundo Tango Database Security Implementation
-- Row Level Security policies for PostgreSQL database

-- Enable RLS on critical user data tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_tokens ENABLE ROW LEVEL SECURITY;

-- Create security functions for user context
CREATE OR REPLACE FUNCTION get_current_user_id() 
RETURNS INTEGER AS $$
BEGIN
    -- This would be set by the application layer
    RETURN COALESCE(current_setting('app.current_user_id', true)::INTEGER, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Posts table security policies
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT
    USING (
        is_public = true OR 
        user_id = get_current_user_id() OR
        EXISTS (
            SELECT 1 FROM follows 
            WHERE follower_id = get_current_user_id() 
            AND following_id = posts.user_id
        )
    );

DROP POLICY IF EXISTS "posts_insert_policy" ON posts;
CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT
    WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "posts_update_policy" ON posts;
CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "posts_delete_policy" ON posts;
CREATE POLICY "posts_delete_policy" ON posts
    FOR DELETE
    USING (user_id = get_current_user_id());

-- Events table security policies
DROP POLICY IF EXISTS "events_select_policy" ON events;
CREATE POLICY "events_select_policy" ON events
    FOR SELECT
    USING (
        is_public = true OR 
        user_id = get_current_user_id() OR
        EXISTS (
            SELECT 1 FROM event_rsvps 
            WHERE event_id = events.id 
            AND user_id = get_current_user_id()
        )
    );

DROP POLICY IF EXISTS "events_insert_policy" ON events;
CREATE POLICY "events_insert_policy" ON events
    FOR INSERT
    WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "events_update_policy" ON events;
CREATE POLICY "events_update_policy" ON events
    FOR UPDATE
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "events_delete_policy" ON events;
CREATE POLICY "events_delete_policy" ON events
    FOR DELETE
    USING (user_id = get_current_user_id());

-- Chat messages security policies
DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;
CREATE POLICY "chat_messages_select_policy" ON chat_messages
    FOR SELECT
    USING (
        user_id = get_current_user_id() OR
        EXISTS (
            SELECT 1 FROM chat_room_users 
            WHERE room_slug = chat_messages.room_slug 
            AND user_id = get_current_user_id()
        )
    );

DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
CREATE POLICY "chat_messages_insert_policy" ON chat_messages
    FOR INSERT
    WITH CHECK (
        user_id = get_current_user_id() AND
        EXISTS (
            SELECT 1 FROM chat_room_users 
            WHERE room_slug = chat_messages.room_slug 
            AND user_id = get_current_user_id()
        )
    );

DROP POLICY IF EXISTS "chat_messages_delete_policy" ON chat_messages;
CREATE POLICY "chat_messages_delete_policy" ON chat_messages
    FOR DELETE
    USING (user_id = get_current_user_id());

-- Stories security policies
DROP POLICY IF EXISTS "stories_select_policy" ON stories;
CREATE POLICY "stories_select_policy" ON stories
    FOR SELECT
    USING (
        user_id = get_current_user_id() OR
        EXISTS (
            SELECT 1 FROM follows 
            WHERE follower_id = get_current_user_id() 
            AND following_id = stories.user_id
        )
    );

DROP POLICY IF EXISTS "stories_insert_policy" ON stories;
CREATE POLICY "stories_insert_policy" ON stories
    FOR INSERT
    WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "stories_delete_policy" ON stories;
CREATE POLICY "stories_delete_policy" ON stories
    FOR DELETE
    USING (user_id = get_current_user_id());

-- Follows security policies
DROP POLICY IF EXISTS "follows_select_policy" ON follows;
CREATE POLICY "follows_select_policy" ON follows
    FOR SELECT
    USING (
        follower_id = get_current_user_id() OR 
        following_id = get_current_user_id()
    );

DROP POLICY IF EXISTS "follows_insert_policy" ON follows;
CREATE POLICY "follows_insert_policy" ON follows
    FOR INSERT
    WITH CHECK (follower_id = get_current_user_id());

DROP POLICY IF EXISTS "follows_delete_policy" ON follows;
CREATE POLICY "follows_delete_policy" ON follows
    FOR DELETE
    USING (follower_id = get_current_user_id());

-- Blocked users security policies
DROP POLICY IF EXISTS "blocked_users_select_policy" ON blocked_users;
CREATE POLICY "blocked_users_select_policy" ON blocked_users
    FOR SELECT
    USING (user_id = get_current_user_id());

DROP POLICY IF EXISTS "blocked_users_insert_policy" ON blocked_users;
CREATE POLICY "blocked_users_insert_policy" ON blocked_users
    FOR INSERT
    WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "blocked_users_delete_policy" ON blocked_users;
CREATE POLICY "blocked_users_delete_policy" ON blocked_users
    FOR DELETE
    USING (user_id = get_current_user_id());

-- User API tokens security policies
DROP POLICY IF EXISTS "user_api_tokens_select_policy" ON user_api_tokens;
CREATE POLICY "user_api_tokens_select_policy" ON user_api_tokens
    FOR SELECT
    USING (user_id = get_current_user_id());

DROP POLICY IF EXISTS "user_api_tokens_insert_policy" ON user_api_tokens;
CREATE POLICY "user_api_tokens_insert_policy" ON user_api_tokens
    FOR INSERT
    WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "user_api_tokens_update_policy" ON user_api_tokens;
CREATE POLICY "user_api_tokens_update_policy" ON user_api_tokens
    FOR UPDATE
    USING (user_id = get_current_user_id())
    WITH CHECK (user_id = get_current_user_id());

DROP POLICY IF EXISTS "user_api_tokens_delete_policy" ON user_api_tokens;
CREATE POLICY "user_api_tokens_delete_policy" ON user_api_tokens
    FOR DELETE
    USING (user_id = get_current_user_id());

-- Additional security for experience tables
ALTER TABLE dance_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dj_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE performer_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_operator_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_experiences ENABLE ROW LEVEL SECURITY;

-- Experience tables security policies (all follow same pattern)
CREATE POLICY "dance_experiences_policy" ON dance_experiences
    FOR ALL USING (user_id = get_current_user_id());

CREATE POLICY "dj_experiences_policy" ON dj_experiences
    FOR ALL USING (user_id = get_current_user_id());

CREATE POLICY "teaching_experiences_policy" ON teaching_experiences
    FOR ALL USING (user_id = get_current_user_id());

CREATE POLICY "performer_experiences_policy" ON performer_experiences
    FOR ALL USING (user_id = get_current_user_id());

CREATE POLICY "photographer_experiences_policy" ON photographer_experiences
    FOR ALL USING (user_id = get_current_user_id());

CREATE POLICY "tour_operator_experiences_policy" ON tour_operator_experiences
    FOR ALL USING (user_id = get_current_user_id());

CREATE POLICY "creator_experiences_policy" ON creator_experiences
    FOR ALL USING (user_id = get_current_user_id());

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Grant necessary permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Security logging function
CREATE OR REPLACE FUNCTION log_security_event(
    event_type TEXT,
    table_name TEXT,
    user_id INTEGER,
    details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO activities (user_id, activity_type, activity_data, created_at)
    VALUES (user_id, 'security_' || event_type, 
            jsonb_build_object('table', table_name, 'details', details), 
            NOW());
EXCEPTION WHEN OTHERS THEN
    -- Log security events but don't fail operations
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;