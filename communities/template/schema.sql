-- Community Template Database Schema
-- Each community gets its own independent database

CREATE SCHEMA IF NOT EXISTS community;

-- Users table (community-specific)
CREATE TABLE community.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255), -- Link to auth system
    username VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    email VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    location JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    joined_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts/Content
CREATE TABLE community.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES community.users(id),
    content TEXT NOT NULL,
    rich_content JSONB DEFAULT '{}',
    media_urls TEXT[],
    hashtags TEXT[],
    mentions JSONB DEFAULT '[]',
    location JSONB DEFAULT '{}',
    visibility VARCHAR(20) DEFAULT 'public',
    engagement_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments
CREATE TABLE community.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community.posts(id),
    user_id UUID NOT NULL REFERENCES community.users(id),
    parent_id UUID REFERENCES community.comments(id),
    content TEXT NOT NULL,
    mentions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reactions
CREATE TABLE community.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'post', 'comment', etc
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES community.users(id),
    reaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, user_id, reaction_type)
);

-- Events
CREATE TABLE community.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES community.users(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location JSONB DEFAULT '{}',
    event_type VARCHAR(50),
    max_attendees INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE community.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES community.events(id),
    user_id UUID NOT NULL REFERENCES community.users(id),
    status VARCHAR(20) NOT NULL, -- 'going', 'interested', 'maybe'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Groups
CREATE TABLE community.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    group_type VARCHAR(50),
    visibility VARCHAR(20) DEFAULT 'public',
    metadata JSONB DEFAULT '{}',
    member_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES community.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Group Members
CREATE TABLE community.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES community.groups(id),
    user_id UUID NOT NULL REFERENCES community.users(id),
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Follows
CREATE TABLE community.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES community.users(id),
    following_id UUID NOT NULL REFERENCES community.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Notifications
CREATE TABLE community.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES community.users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    message TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Media Assets
CREATE TABLE community.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES community.users(id),
    url TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio'
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Log
CREATE TABLE community.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES community.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_posts_user_created ON community.posts(user_id, created_at DESC);
CREATE INDEX idx_comments_post ON community.comments(post_id);
CREATE INDEX idx_reactions_entity ON community.reactions(entity_type, entity_id);
CREATE INDEX idx_events_time ON community.events(start_time, end_time);
CREATE INDEX idx_notifications_user_read ON community.notifications(user_id, read);
CREATE INDEX idx_activity_user_time ON community.activity_log(user_id, created_at DESC);