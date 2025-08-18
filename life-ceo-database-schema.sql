-- Life CEO Platform Database Schema
-- Supabase PostgreSQL with pgvector extension

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS consent_records CASCADE;
DROP TABLE IF EXISTS daily_reviews CASCADE;
DROP TABLE IF EXISTS delegations CASCADE;
DROP TABLE IF EXISTS memory_store CASCADE;
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS life_projects CASCADE;
DROP TABLE IF EXISTS agent_permissions CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Core Agent System Tables
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('orchestrator', 'project_manager', 'financial_manager', 'travel_manager', 'content_manager', 'legal_manager', 'security_manager', 'memory_manager', 'automation_manager', 'voice_manager')),
    parent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    prompt_template TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'failed', 'initializing')),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent permissions and scopes
CREATE TABLE agent_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    actions TEXT[] NOT NULL DEFAULT '{}',
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Life projects managed by the system
CREATE TABLE life_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('work', 'personal', 'health', 'financial', 'creative', 'social', 'administrative')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    owner_agent_id UUID REFERENCES agents(id),
    metadata JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comprehensive agent activity logs
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_name TEXT NOT NULL,
    input JSONB,
    output JSONB,
    error JSONB,
    duration_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    parent_log_id UUID REFERENCES agent_logs(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory storage with vector embeddings
CREATE TABLE memory_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    project_id UUID REFERENCES life_projects(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('conversation', 'decision', 'learning', 'preference', 'context', 'relationship', 'emotion')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    location TEXT,
    people TEXT[] DEFAULT '{}',
    emotion_state TEXT,
    importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    embedding VECTOR(1536),
    source TEXT NOT NULL CHECK (source IN ('chatgpt', 'notion', 'supabase', 'manual', 'voice', 'automated')),
    external_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 0
);

-- Task delegation between agents
CREATE TABLE delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    to_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    project_id UUID REFERENCES life_projects(id),
    task_type TEXT NOT NULL,
    task_description TEXT NOT NULL,
    task_params JSONB NOT NULL DEFAULT '{}',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'failed', 'cancelled')),
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Daily review system
CREATE TABLE daily_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_date DATE NOT NULL UNIQUE,
    user_location TEXT,
    user_timezone TEXT,
    user_mode TEXT CHECK (user_mode IN ('builder', 'social', 'vibe', 'recovery', 'focus')),
    priority_tasks JSONB NOT NULL DEFAULT '[]',
    completed_tasks JSONB DEFAULT '[]',
    agent_status JSONB NOT NULL DEFAULT '{}',
    wellness_check JSONB DEFAULT '{}',
    adjustments JSONB DEFAULT '{}',
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Consent and privacy records
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_type TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'automation', 'third_party', 'voice_recording', 'location_tracking', 'health_data')),
    granted BOOLEAN NOT NULL,
    scope JSONB NOT NULL DEFAULT '{}',
    purpose TEXT NOT NULL,
    data_categories TEXT[] DEFAULT '{}',
    third_parties TEXT[] DEFAULT '{}',
    retention_days INTEGER,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_parent ON agents(parent_id);
CREATE INDEX idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX idx_agent_logs_action ON agent_logs(action_type, action_name);
CREATE INDEX idx_memory_store_agent_id ON memory_store(agent_id);
CREATE INDEX idx_memory_store_project_id ON memory_store(project_id);
CREATE INDEX idx_memory_store_tags ON memory_store USING GIN(tags);
CREATE INDEX idx_memory_store_people ON memory_store USING GIN(people);
CREATE INDEX idx_memory_store_type ON memory_store(memory_type);
CREATE INDEX idx_memory_embedding ON memory_store USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_delegations_status ON delegations(status);
CREATE INDEX idx_delegations_from_agent ON delegations(from_agent_id);
CREATE INDEX idx_delegations_to_agent ON delegations(to_agent_id);
CREATE INDEX idx_daily_reviews_date ON daily_reviews(review_date DESC);
CREATE INDEX idx_life_projects_status ON life_projects(status);
CREATE INDEX idx_life_projects_owner ON life_projects(owner_agent_id);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Life CEO can access everything
CREATE POLICY "life_ceo_all_access" ON agents
    FOR ALL USING (true);

CREATE POLICY "life_ceo_logs_access" ON agent_logs
    FOR ALL USING (true);

CREATE POLICY "life_ceo_memory_access" ON memory_store
    FOR ALL USING (true);

-- Agents can only access their own data and delegations
CREATE POLICY "agents_own_logs" ON agent_logs
    FOR SELECT USING (agent_id IN (
        SELECT id FROM agents WHERE id = current_setting('app.current_agent_id')::UUID
    ));

CREATE POLICY "agents_own_memory" ON memory_store
    FOR ALL USING (agent_id = current_setting('app.current_agent_id')::UUID);

CREATE POLICY "agents_delegations" ON delegations
    FOR ALL USING (
        from_agent_id = current_setting('app.current_agent_id')::UUID OR
        to_agent_id = current_setting('app.current_agent_id')::UUID
    );

-- Create functions for common operations

-- Function to log agent activity
CREATE OR REPLACE FUNCTION log_agent_activity(
    p_agent_id UUID,
    p_action_type TEXT,
    p_action_name TEXT,
    p_input JSONB DEFAULT NULL,
    p_output JSONB DEFAULT NULL,
    p_error JSONB DEFAULT NULL,
    p_duration_ms INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO agent_logs (
        agent_id, action_type, action_name, input, output, error, duration_ms
    ) VALUES (
        p_agent_id, p_action_type, p_action_name, p_input, p_output, p_error, p_duration_ms
    ) RETURNING id INTO v_log_id;
    
    -- Update agent last active timestamp
    UPDATE agents SET last_active_at = NOW() WHERE id = p_agent_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create memory with embedding
CREATE OR REPLACE FUNCTION create_memory(
    p_agent_id UUID,
    p_memory_type TEXT,
    p_title TEXT,
    p_content JSONB,
    p_tags TEXT[] DEFAULT '{}',
    p_importance INTEGER DEFAULT 5
) RETURNS UUID AS $$
DECLARE
    v_memory_id UUID;
BEGIN
    INSERT INTO memory_store (
        agent_id, memory_type, title, content, tags, importance
    ) VALUES (
        p_agent_id, p_memory_type, p_title, p_content, p_tags, p_importance
    ) RETURNING id INTO v_memory_id;
    
    RETURN v_memory_id;
END;
$$ LANGUAGE plpgsql;

-- Function to delegate task
CREATE OR REPLACE FUNCTION delegate_task(
    p_from_agent_id UUID,
    p_to_agent_id UUID,
    p_task_type TEXT,
    p_task_description TEXT,
    p_task_params JSONB DEFAULT '{}',
    p_priority INTEGER DEFAULT 5
) RETURNS UUID AS $$
DECLARE
    v_delegation_id UUID;
BEGIN
    INSERT INTO delegations (
        from_agent_id, to_agent_id, task_type, task_description, task_params, priority
    ) VALUES (
        p_from_agent_id, p_to_agent_id, p_task_type, p_task_description, p_task_params, p_priority
    ) RETURNING id INTO v_delegation_id;
    
    -- Log the delegation
    PERFORM log_agent_activity(
        p_from_agent_id,
        'delegation',
        'task_delegated',
        jsonb_build_object(
            'to_agent_id', p_to_agent_id,
            'task_type', p_task_type,
            'delegation_id', v_delegation_id
        )
    );
    
    RETURN v_delegation_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_projects_updated_at BEFORE UPDATE ON life_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial seed data for Life CEO
INSERT INTO agents (name, type, prompt_template, config) VALUES
('life_ceo', 'orchestrator', 'You are Life CEO, the master AI agent managing Scott Boddye''s life...', 
 '{"daily_review_time": "10:00", "timezone": "auto", "memory_scan_depth": 30}'::jsonb);

-- Grant Life CEO all permissions
INSERT INTO agent_permissions (agent_id, resource, actions)
SELECT id, '*', ARRAY['*'] FROM agents WHERE name = 'life_ceo';