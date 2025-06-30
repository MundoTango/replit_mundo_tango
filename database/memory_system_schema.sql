-- 8-Layer Memory-Based Consent System Database Schema
-- Layer 4: RBAC + ABAC Implementation

-- Enhanced roles table with RBAC metadata
ALTER TABLE roles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE roles ADD COLUMN IF NOT EXISTS memory_access_level INTEGER DEFAULT 1;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS emotional_tag_access JSONB DEFAULT '["public"]';

-- Memory system core tables
CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    rich_content JSONB,
    emotion_tags TEXT[] DEFAULT '{}',
    emotion_visibility TEXT DEFAULT 'public' CHECK (emotion_visibility IN ('public', 'friends', 'trusted', 'private')),
    trust_circle_level INTEGER DEFAULT 1,
    location JSONB,
    media_urls TEXT[] DEFAULT '{}',
    co_tagged_users INTEGER[] DEFAULT '{}',
    consent_required BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory consent management
CREATE TABLE IF NOT EXISTS memory_consent (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    grantor_id INTEGER NOT NULL REFERENCES users(id),
    consent_type TEXT NOT NULL CHECK (consent_type IN ('view', 'share', 'co_tag', 'emotional_access')),
    consent_granted BOOLEAN DEFAULT false,
    trust_level INTEGER DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE,
    granted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(memory_id, user_id, grantor_id, consent_type)
);

-- Trust circles for emotional access
CREATE TABLE IF NOT EXISTS trust_circles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id INTEGER NOT NULL REFERENCES users(id),
    trusted_user_id INTEGER NOT NULL REFERENCES users(id),
    circle_name TEXT NOT NULL,
    trust_level INTEGER DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 5),
    emotional_access_level TEXT DEFAULT 'basic' CHECK (emotional_access_level IN ('basic', 'intimate', 'vulnerable', 'sacred')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, trusted_user_id)
);

-- Enhanced custom role requests with memory permissions
ALTER TABLE custom_role_requests ADD COLUMN IF NOT EXISTS memory_permissions JSONB DEFAULT '{}';
ALTER TABLE custom_role_requests ADD COLUMN IF NOT EXISTS emotional_access_requested TEXT[] DEFAULT '{}';

-- Audit log for Layer 7
CREATE TABLE IF NOT EXISTS memory_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id INTEGER REFERENCES users(id),
    memory_id TEXT REFERENCES memories(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'create', 'edit', 'delete', 'share', 'consent_grant', 'consent_revoke', 'role_request', 'trust_change')),
    result TEXT NOT NULL CHECK (result IN ('allowed', 'blocked', 'pending')),
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies for Layer 4
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_audit_logs ENABLE ROW LEVEL SECURITY;

-- Memory access policy with ABAC logic
CREATE OR REPLACE POLICY "memory_access_policy" ON memories
    FOR ALL TO authenticated
    USING (
        -- Owner can always access
        user_id = auth.uid()::integer
        OR
        -- Public memories
        emotion_visibility = 'public'
        OR
        -- Friends with consent
        (emotion_visibility = 'friends' AND EXISTS (
            SELECT 1 FROM memory_consent mc 
            WHERE mc.memory_id = id 
            AND mc.user_id = auth.uid()::integer 
            AND mc.consent_granted = true 
            AND (mc.expires_at IS NULL OR mc.expires_at > NOW())
        ))
        OR
        -- Trusted circle members
        (emotion_visibility = 'trusted' AND EXISTS (
            SELECT 1 FROM trust_circles tc 
            WHERE tc.user_id = memories.user_id 
            AND tc.trusted_user_id = auth.uid()::integer 
            AND tc.trust_level >= memories.trust_circle_level
        ))
    );

-- Consent management policies
CREATE OR REPLACE POLICY "consent_management_policy" ON memory_consent
    FOR ALL TO authenticated
    USING (
        user_id = auth.uid()::integer 
        OR grantor_id = auth.uid()::integer
    );

-- Trust circles policy
CREATE OR REPLACE POLICY "trust_circles_policy" ON trust_circles
    FOR ALL TO authenticated
    USING (
        user_id = auth.uid()::integer 
        OR trusted_user_id = auth.uid()::integer
    );

-- Audit log policy (users can only see their own logs)
CREATE OR REPLACE POLICY "audit_log_policy" ON memory_audit_logs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid()::integer);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_memories_user_emotion ON memories(user_id, emotion_visibility);
CREATE INDEX IF NOT EXISTS idx_memories_trust_level ON memories(trust_circle_level);
CREATE INDEX IF NOT EXISTS idx_memory_consent_active ON memory_consent(memory_id, user_id) WHERE consent_granted = true;
CREATE INDEX IF NOT EXISTS idx_trust_circles_lookup ON trust_circles(user_id, trusted_user_id, trust_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON memory_audit_logs(user_id, action_type, created_at);

-- Function to get current user for RLS
CREATE OR REPLACE FUNCTION get_current_user_id() RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(current_setting('app.current_user_id', true)::integer, auth.uid()::integer);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update roles with memory permissions
UPDATE roles SET 
    permissions = jsonb_build_object(
        'can_create_memories', true,
        'can_view_public_memories', true,
        'can_request_consent', true,
        'can_manage_trust_circles', true
    ),
    memory_access_level = CASE 
        WHEN name IN ('super_admin', 'admin') THEN 5
        WHEN name IN ('moderator', 'curator') THEN 4
        WHEN name IN ('organizer', 'teacher', 'dj') THEN 3
        WHEN name IN ('performer', 'photographer') THEN 2
        ELSE 1
    END,
    emotional_tag_access = CASE 
        WHEN name IN ('super_admin', 'admin') THEN '["public", "friends", "trusted", "private"]'::jsonb
        WHEN name IN ('moderator', 'curator') THEN '["public", "friends", "trusted"]'::jsonb
        WHEN name IN ('organizer', 'teacher') THEN '["public", "friends"]'::jsonb
        ELSE '["public"]'::jsonb
    END
WHERE name IS NOT NULL;