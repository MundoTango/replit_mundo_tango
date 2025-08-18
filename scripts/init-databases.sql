-- Initialize multiple databases for Docker PostgreSQL
-- This script creates separate databases for n8n and Mundo Tango

-- Create n8n database
CREATE DATABASE n8n;
GRANT ALL PRIVILEGES ON DATABASE n8n TO postgres;

-- Create Mundo Tango database if not exists
CREATE DATABASE mundotango;
GRANT ALL PRIVILEGES ON DATABASE mundotango TO postgres;

-- Create sessions table for both databases (required for authentication)
\c mundotango;

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- Create n8n webhook logs table for tracking
CREATE TABLE IF NOT EXISTS n8n_webhook_logs (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255),
    webhook_path VARCHAR(255),
    method VARCHAR(10),
    headers JSONB,
    body JSONB,
    response_status INTEGER,
    response_body JSONB,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_workflow ON n8n_webhook_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON n8n_webhook_logs(created_at);

-- Create n8n integration status table
CREATE TABLE IF NOT EXISTS n8n_integration_status (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    sync_status VARCHAR(50),
    error_message TEXT,
    metadata JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO n8n_integration_status (service_name, is_active, sync_status) VALUES
    ('testsprite', true, 'pending'),
    ('stripe', true, 'pending'),
    ('hubspot', true, 'pending'),
    ('openai', true, 'pending'),
    ('supabase', true, 'pending')
ON CONFLICT (service_name) DO NOTHING;