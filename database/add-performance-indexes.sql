-- Performance optimization indexes for Mundo Tango database
-- Created using 23L Framework Layer 5-8 optimizations

-- Posts table performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Memories table performance indexes
CREATE INDEX IF NOT EXISTS idx_memories_user_created ON memories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- Events table performance indexes
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_city_start ON events(city, start_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Groups table performance indexes
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_city ON groups(city);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON groups(slug);

-- Group members table performance indexes
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_composite ON group_members(group_id, user_id);

-- Notifications table performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Friends table performance indexes
CREATE INDEX IF NOT EXISTS idx_friends_user1 ON friends(user_id1);
CREATE INDEX IF NOT EXISTS idx_friends_user2 ON friends(user_id2);

-- Event participants table performance indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);

-- Post likes table performance indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);

-- Post comments table performance indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);

-- Analyze tables for query optimization
ANALYZE posts;
ANALYZE memories;
ANALYZE events;
ANALYZE groups;
ANALYZE group_members;
ANALYZE notifications;
ANALYZE friends;
ANALYZE event_participants;
ANALYZE post_likes;
ANALYZE post_comments;