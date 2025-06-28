-- Mundo Tango - Complete Supabase Database Migration
-- Converted from TrangoTech MySQL schema to Supabase PostgreSQL with RLS
-- Date: June 28, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CORE USER MANAGEMENT TABLES
-- =====================================================

-- User Groups (Define user types)
CREATE TABLE user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main Users Table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type VARCHAR(50) REFERENCES user_groups(type) DEFAULT 'USER',
    name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    mobile_no VARCHAR(20),
    bio TEXT,
    profile_image_url TEXT,
    background_image_url TEXT,
    facebook_url TEXT,
    
    -- Location data
    city VARCHAR(255),
    country VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT),
    
    -- Status flags
    status BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    is_profile_completed BOOLEAN DEFAULT false,
    is_guidelines_accepted BOOLEAN DEFAULT false,
    is_mobile_verified BOOLEAN DEFAULT false,
    is_activated BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    is_push_notification BOOLEAN DEFAULT true,
    is_privacy_enabled BOOLEAN DEFAULT true,
    
    -- Authentication data
    login_type VARCHAR(30) DEFAULT 'custom',
    platform_type VARCHAR(100),
    platform_id TEXT,
    form_status INTEGER DEFAULT 0,
    email_verified_at TIMESTAMPTZ,
    mobile_verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- User API Tokens
CREATE TABLE user_api_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User OTPs
CREATE TABLE user_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    otp_code VARCHAR(10) NOT NULL,
    otp_type VARCHAR(20) NOT NULL, -- email, mobile
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked Users
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- =====================================================
-- CONTENT MANAGEMENT TABLES
-- =====================================================

-- Activities (Hashtags and Activity Categories)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Feelings/Moods
CREATE TABLE feelings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    icon_url TEXT,
    color_code VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID, -- References groups table
    event_id UUID, -- References events table
    activity_id UUID REFERENCES activities(id),
    feeling_id UUID REFERENCES feelings(id),
    user_travel_id UUID, -- References user_travels table
    
    -- Sharing functionality
    shared_by UUID REFERENCES users(id),
    is_shared BOOLEAN DEFAULT false,
    original_post_id UUID REFERENCES posts(id),
    
    -- Content
    content TEXT,
    caption TEXT,
    
    -- Engagement metrics
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    
    -- Visibility and location
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    location_name TEXT,
    country VARCHAR(200),
    city VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Post Likes
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Post Comments
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id),
    content TEXT NOT NULL,
    total_likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Post Comment Likes
CREATE TABLE post_comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Post Shares
CREATE TABLE post_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_to VARCHAR(50), -- social platform
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Save Posts
CREATE TABLE saved_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Hide Posts
CREATE TABLE hidden_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Attachments (Media files)
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_type VARCHAR(50), -- post, event, user, etc.
    instance_id UUID,
    media_type VARCHAR(50), -- image, video, audio
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- SOCIAL FEATURES TABLES
-- =====================================================

-- Friends/Following System
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- Groups
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    background_url TEXT,
    privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'secret')),
    join_approval_required BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Group Members
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'banned')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Group Visitors (for tracking group visits)
CREATE TABLE group_visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    visit_count INTEGER DEFAULT 1,
    last_visited_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Pin Groups (User's pinned groups)
CREATE TABLE pinned_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, group_id)
);

-- =====================================================
-- EVENTS SYSTEM
-- =====================================================

-- Event Types
CREATE TABLE event_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    icon_url TEXT,
    color_code VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type_id UUID REFERENCES event_types(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Event timing
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    timezone VARCHAR(50),
    
    -- Location details
    location_name TEXT,
    address TEXT,
    city VARCHAR(255),
    country VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Event settings
    max_attendees INTEGER,
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    is_paid BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Engagement
    attendee_count INTEGER DEFAULT 0,
    interested_count INTEGER DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Event Participants
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('interested', 'going', 'maybe', 'not_going')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Event Activities (Related activities for events)
CREATE TABLE event_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, activity_id)
);

-- =====================================================
-- MESSAGING SYSTEM
-- =====================================================

-- Chat Rooms
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    room_type VARCHAR(20) DEFAULT 'direct' CHECK (room_type IN ('direct', 'group', 'event')),
    creator_id UUID REFERENCES users(id),
    image_url TEXT,
    description TEXT,
    max_participants INTEGER,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Chat Room Users
CREATE TABLE chat_room_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(chat_room_id, user_id)
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES chat_messages(id),
    
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'location')),
    content TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Chat Message Status (Read receipts)
CREATE TABLE chat_message_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_delivered BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    UNIQUE(message_id, user_id)
);

-- =====================================================
-- TANGO-SPECIFIC EXPERIENCE TABLES
-- =====================================================

-- Dance Experience
CREATE TABLE dance_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    leader_level INTEGER CHECK (leader_level >= 0 AND leader_level <= 10),
    follower_level INTEGER CHECK (follower_level >= 0 AND follower_level <= 10),
    years_dancing INTEGER,
    started_year INTEGER,
    favorite_styles TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teaching Experience
CREATE TABLE teaching_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    years_teaching INTEGER,
    specializations TEXT[],
    certifications TEXT[],
    teaching_locations TEXT[],
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DJ Experience
CREATE TABLE dj_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    years_djing INTEGER,
    music_styles TEXT[],
    equipment_owned TEXT[],
    notable_events TEXT[],
    soundcloud_url TEXT,
    spotify_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performer Experience
CREATE TABLE performer_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    performance_types TEXT[], -- stage, street, competition
    years_performing INTEGER,
    notable_performances TEXT[],
    awards TEXT[],
    video_links TEXT[],
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photographer Experience
CREATE TABLE photographer_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    photography_types TEXT[], -- events, portraits, dance
    years_experience INTEGER,
    equipment_used TEXT[],
    portfolio_url TEXT,
    instagram_url TEXT,
    pricing_info TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tour Operator Experience
CREATE TABLE tour_operator_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    years_operating INTEGER,
    destinations_covered TEXT[],
    tour_types TEXT[], -- dance tours, cultural, mixed
    languages_spoken TEXT[],
    website_url TEXT,
    license_info TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator Experience (Content creators, influencers)
CREATE TABLE creator_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_types TEXT[], -- video, blog, podcast, social
    platforms TEXT[], -- youtube, instagram, tiktok, blog
    follower_counts JSONB, -- {"instagram": 1000, "youtube": 500}
    collaboration_types TEXT[], -- sponsorship, teaching, events
    media_kit_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizer Experience
CREATE TABLE organizer_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_types_organized TEXT[], -- milongas, workshops, festivals
    years_organizing INTEGER,
    notable_events TEXT[],
    average_attendance INTEGER,
    organization_name VARCHAR(255),
    website_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Host Experience (Tango housing hosts)
CREATE TABLE host_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    accommodation_types TEXT[], -- private_room, shared_room, couch
    years_hosting INTEGER,
    max_guests INTEGER,
    languages_spoken TEXT[],
    house_rules TEXT[],
    amenities TEXT[],
    pricing_info TEXT,
    availability_calendar JSONB,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACTIVITY AND INTEREST TABLES
-- =====================================================

-- Tango Activities
CREATE TABLE tango_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- social, performance, learning
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Non-Tango Activities
CREATE TABLE non_tango_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Activities (Activities within groups)
CREATE TABLE group_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRAVEL AND LOCATION TABLES
-- =====================================================

-- User Travels
CREATE TABLE user_travels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    destination_city VARCHAR(255),
    destination_country VARCHAR(255),
    start_date DATE,
    end_date DATE,
    purpose TEXT, -- tango, vacation, business
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Languages
CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(5) UNIQUE NOT NULL, -- en, es, fr, etc.
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Languages (many-to-many)
CREATE TABLE user_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
    proficiency VARCHAR(20) DEFAULT 'conversational' CHECK (proficiency IN ('basic', 'conversational', 'fluent', 'native')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, language_id)
);

-- =====================================================
-- SYSTEM AND ADMIN TABLES
-- =====================================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- like, comment, friend_request, event_invite
    title VARCHAR(255),
    message TEXT,
    related_id UUID, -- ID of related object (post, event, etc.)
    related_type VARCHAR(50), -- post, event, user, etc.
    image_url TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    is_pushed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Reports
CREATE TABLE report_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id),
    report_type_id UUID REFERENCES report_types(id),
    reported_content_type VARCHAR(50), -- post, comment, message, user
    reported_content_id UUID,
    reason TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- FAQs
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages (Static content)
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Help and Support
CREATE TABLE help_supports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    email VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    admin_response TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lookup Data (for dropdowns and references)
CREATE TABLE lookups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL, -- country, city, tango_style, etc.
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES lookups(id),
    extra_data JSONB,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Sources (for onboarding)
CREATE TABLE learning_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- online, in_person, books, videos
    url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invites
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invite_type VARCHAR(50) NOT NULL, -- app, event, group
    related_id UUID, -- event_id or group_id
    token VARCHAR(255) UNIQUE NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_status ON users(status, is_activated, is_blocked);

-- Post indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility_status ON posts(visibility, status);
CREATE INDEX idx_posts_event_id ON posts(event_id);
CREATE INDEX idx_posts_group_id ON posts(group_id);

-- Engagement indexes
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);

-- Friend indexes
CREATE INDEX idx_friends_requester ON friends(requester_id);
CREATE INDEX idx_friends_addressee ON friends(addressee_id);
CREATE INDEX idx_friends_status ON friends(status);

-- Event indexes
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_location ON events(city, country);
CREATE INDEX idx_events_status ON events(status, is_public);

-- Chat indexes
CREATE INDEX idx_chat_messages_room_id ON chat_messages(chat_room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_room_users_user_id ON chat_room_users(user_id);

-- Notification indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (status = true AND is_activated = true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Post policies
CREATE POLICY "Users can view public posts" ON posts
    FOR SELECT USING (
        visibility = 'public' AND status = 'active' AND deleted_at IS NULL
    );

CREATE POLICY "Users can view friends posts" ON posts
    FOR SELECT USING (
        visibility = 'friends' AND status = 'active' AND deleted_at IS NULL
        AND (
            user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
            OR EXISTS (
                SELECT 1 FROM friends f
                WHERE f.status = 'accepted'
                AND ((f.requester_id = posts.user_id AND f.addressee_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
                     OR (f.addressee_id = posts.user_id AND f.requester_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())))
            )
        )
    );

CREATE POLICY "Users can view own posts" ON posts
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Post engagement policies
CREATE POLICY "Users can like posts they can see" ON post_likes
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = post_likes.post_id)
        AND user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can unlike their own likes" ON post_likes
    FOR DELETE USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Comment policies
CREATE POLICY "Users can comment on visible posts" ON post_comments
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = post_comments.post_id)
        AND user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can view comments on visible posts" ON post_comments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = post_comments.post_id)
        AND deleted_at IS NULL
    );

-- Friend policies
CREATE POLICY "Users can manage own friendships" ON friends
    FOR ALL USING (
        requester_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        OR addressee_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

-- Event policies
CREATE POLICY "Users can view public events" ON events
    FOR SELECT USING (is_public = true AND status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (organizer_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own events" ON events
    FOR UPDATE USING (organizer_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Chat policies
CREATE POLICY "Users can view rooms they belong to" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_room_users cru
            WHERE cru.chat_room_id = chat_rooms.id
            AND cru.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can view messages in their rooms" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_room_users cru
            WHERE cru.chat_room_id = chat_messages.chat_room_id
            AND cru.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

-- Notification policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (recipient_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (recipient_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET total_likes = total_likes + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts SET total_likes = total_likes - 1 WHERE id = OLD.post_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET total_comments = total_comments + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts SET total_comments = total_comments - 1 WHERE id = OLD.post_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_shares' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET total_shares = total_shares + 1 WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts SET total_shares = total_shares - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE 'plpgsql';

-- Apply engagement triggers
CREATE TRIGGER post_likes_stats_trigger
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_stats();

CREATE TRIGGER post_comments_stats_trigger
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_stats();

CREATE TRIGGER post_shares_stats_trigger
    AFTER INSERT OR DELETE ON post_shares
    FOR EACH ROW EXECUTE FUNCTION update_post_stats();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default user groups
INSERT INTO user_groups (type, name, description) VALUES
('ADMIN', 'Administrator', 'System administrators with full access'),
('USER', 'Regular User', 'Standard platform users'),
('MODERATOR', 'Moderator', 'Community moderators with enhanced permissions'),
('ORGANIZER', 'Event Organizer', 'Verified event organizers'),
('TEACHER', 'Tango Teacher', 'Certified tango instructors'),
('DJ', 'Tango DJ', 'Professional tango DJs'),
('PHOTOGRAPHER', 'Photographer', 'Professional photographers'),
('HOST', 'Housing Host', 'Accommodation providers for travelers');

-- Insert default event types
INSERT INTO event_types (name, icon_url, color_code) VALUES
('Milonga', '/icons/milonga.svg', '#FF6B6B'),
('Workshop', '/icons/workshop.svg', '#4ECDC4'),
('Festival', '/icons/festival.svg', '#45B7D1'),
('Class', '/icons/class.svg', '#96CEB4'),
('Competition', '/icons/competition.svg', '#FFEAA7'),
('Concert', '/icons/concert.svg', '#DDA0DD'),
('Exhibition', '/icons/exhibition.svg', '#98D8C8');

-- Insert common activities
INSERT INTO activities (name, icon_url) VALUES
('Tango', '/icons/tango.svg'),
('Dance', '/icons/dance.svg'),
('Music', '/icons/music.svg'),
('Photography', '/icons/camera.svg'),
('Travel', '/icons/travel.svg'),
('Food', '/icons/food.svg'),
('Culture', '/icons/culture.svg');

-- Insert common feelings
INSERT INTO feelings (name, icon_url, color_code) VALUES
('Happy', '/icons/happy.svg', '#FFD93D'),
('Excited', '/icons/excited.svg', '#FF6B6B'),
('Grateful', '/icons/grateful.svg', '#4ECDC4'),
('Inspired', '/icons/inspired.svg', '#45B7D1'),
('Peaceful', '/icons/peaceful.svg', '#96CEB4'),
('Passionate', '/icons/passionate.svg', '#FF4757'),
('Nostalgic', '/icons/nostalgic.svg', '#A55EEA');

-- Insert popular languages
INSERT INTO languages (code, name, native_name) VALUES
('en', 'English', 'English'),
('es', 'Spanish', 'Español'),
('pt', 'Portuguese', 'Português'),
('fr', 'French', 'Français'),
('it', 'Italian', 'Italiano'),
('de', 'German', 'Deutsch'),
('ru', 'Russian', 'Русский'),
('zh', 'Chinese', '中文'),
('ja', 'Japanese', '日本語'),
('ko', 'Korean', '한국어');

-- Insert report types
INSERT INTO report_types (name, description, severity) VALUES
('Spam', 'Unwanted or repetitive content', 'medium'),
('Harassment', 'Bullying or threatening behavior', 'high'),
('Inappropriate Content', 'Content that violates community guidelines', 'medium'),
('Fake Profile', 'Suspected fake or impersonation account', 'high'),
('Scam', 'Fraudulent or deceptive activity', 'critical'),
('Copyright Violation', 'Unauthorized use of copyrighted material', 'medium'),
('Violence', 'Content depicting or promoting violence', 'critical'),
('Hate Speech', 'Content promoting hatred or discrimination', 'critical');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Migration completed successfully
SELECT 'Mundo Tango Supabase migration completed successfully!' as status;