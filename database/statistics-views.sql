-- Create optimized views for Live Global Statistics
-- Using 23L Framework Layer 5: Data Architecture

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as new_users_24h,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7d,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
    COUNT(CASE WHEN last_login > NOW() - INTERVAL '24 hours' THEN 1 END) as active_users_24h,
    COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users_7d,
    COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as active_users_30d
FROM users;

-- Role distribution view
CREATE OR REPLACE VIEW role_distribution AS
SELECT 
    ur.role_name,
    COUNT(DISTINCT ur.user_id) as user_count
FROM user_roles ur
GROUP BY ur.role_name;

-- Content statistics view
CREATE OR REPLACE VIEW content_statistics AS
SELECT 
    (SELECT COUNT(*) FROM posts) as total_posts,
    (SELECT COUNT(*) FROM memories) as total_memories,
    (SELECT COUNT(*) FROM stories WHERE expires_at > NOW()) as active_stories,
    (SELECT COUNT(*) FROM post_comments) as total_comments,
    (SELECT COUNT(*) FROM post_likes) as total_likes,
    (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '24 hours') as new_posts_24h,
    (SELECT COUNT(*) FROM memories WHERE created_at > NOW() - INTERVAL '24 hours') as new_memories_24h;

-- Event statistics view
CREATE OR REPLACE VIEW event_statistics AS
SELECT 
    COUNT(*) as total_events,
    COUNT(CASE WHEN start_date > NOW() THEN 1 END) as upcoming_events,
    COUNT(CASE WHEN start_date BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 1 END) as events_next_7d,
    COUNT(CASE WHEN start_date BETWEEN NOW() AND NOW() + INTERVAL '30 days' THEN 1 END) as events_next_30d,
    (SELECT COUNT(*) FROM event_rsvps WHERE rsvp_status = 'going') as total_rsvps_going,
    (SELECT COUNT(*) FROM event_rsvps WHERE rsvp_status = 'interested') as total_rsvps_interested
FROM events;

-- Geographic distribution view
CREATE OR REPLACE VIEW geographic_statistics AS
SELECT 
    up.city,
    up.state,
    up.country,
    COUNT(DISTINCT up.user_id) as user_count,
    COUNT(DISTINCT e.id) as event_count,
    COUNT(DISTINCT g.id) as group_count
FROM user_profiles up
LEFT JOIN events e ON e.city = up.city AND e.country = up.country
LEFT JOIN groups g ON g.city = up.city
WHERE up.city IS NOT NULL
GROUP BY up.city, up.state, up.country
ORDER BY user_count DESC;

-- Group statistics view
CREATE OR REPLACE VIEW group_statistics AS
SELECT 
    COUNT(DISTINCT g.id) as total_groups,
    COUNT(DISTINCT gm.user_id) as total_group_members,
    AVG(member_count) as avg_members_per_group
FROM groups g
LEFT JOIN (
    SELECT group_id, COUNT(*) as member_count 
    FROM group_members 
    GROUP BY group_id
) gm_counts ON g.id = gm_counts.group_id
LEFT JOIN group_members gm ON g.id = gm.group_id;

-- Platform engagement view
CREATE OR REPLACE VIEW engagement_statistics AS
WITH daily_active AS (
    SELECT DATE(created_at) as activity_date, COUNT(DISTINCT user_id) as dau
    FROM activities
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
),
weekly_active AS (
    SELECT DATE_TRUNC('week', created_at) as week_start, COUNT(DISTINCT user_id) as wau
    FROM activities
    WHERE created_at > NOW() - INTERVAL '12 weeks'
    GROUP BY DATE_TRUNC('week', created_at)
),
monthly_active AS (
    SELECT DATE_TRUNC('month', created_at) as month_start, COUNT(DISTINCT user_id) as mau
    FROM activities
    WHERE created_at > NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT 
    (SELECT AVG(dau) FROM daily_active) as avg_dau,
    (SELECT AVG(wau) FROM weekly_active) as avg_wau,
    (SELECT AVG(mau) FROM monthly_active) as avg_mau,
    (SELECT MAX(dau) FROM daily_active) as peak_dau,
    (SELECT MAX(wau) FROM weekly_active) as peak_wau,
    (SELECT MAX(mau) FROM monthly_active) as peak_mau;

-- Top content view
CREATE OR REPLACE VIEW top_content AS
WITH top_posts AS (
    SELECT 
        p.id,
        p.user_id,
        p.content,
        COUNT(DISTINCT pl.user_id) as like_count,
        COUNT(DISTINCT pc.id) as comment_count,
        (COUNT(DISTINCT pl.user_id) + COUNT(DISTINCT pc.id) * 2) as engagement_score
    FROM posts p
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN post_comments pc ON p.id = pc.post_id
    WHERE p.created_at > NOW() - INTERVAL '7 days'
    GROUP BY p.id, p.user_id, p.content
    ORDER BY engagement_score DESC
    LIMIT 10
)
SELECT * FROM top_posts;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city_country ON user_profiles(city, country);

-- Create a function to get real-time stats
CREATE OR REPLACE FUNCTION get_platform_statistics()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'users', (SELECT row_to_json(user_statistics) FROM user_statistics),
        'roles', (SELECT json_agg(row_to_json(role_distribution)) FROM role_distribution),
        'content', (SELECT row_to_json(content_statistics) FROM content_statistics),
        'events', (SELECT row_to_json(event_statistics) FROM event_statistics),
        'groups', (SELECT row_to_json(group_statistics) FROM group_statistics),
        'engagement', (SELECT row_to_json(engagement_statistics) FROM engagement_statistics),
        'topCities', (SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM geographic_statistics LIMIT 10) t),
        'timestamp', NOW()
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;