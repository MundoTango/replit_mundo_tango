-- n8n Database Initialization Script
-- 53x21s Framework: Layer 51 (n8n Automation) + Layer 52 (Container Orchestration)

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions to n8n user
GRANT ALL PRIVILEGES ON DATABASE n8n_workflows TO n8n_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO n8n_user;

-- Create sequences and tables will be handled by n8n automatically
-- This script just ensures proper permissions and extensions