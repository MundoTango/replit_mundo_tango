-- Life CEO RBAC/ABAC Database Schema
-- This schema implements Role-Based and Attribute-Based Access Control for the Life CEO system

-- Life CEO Roles table
CREATE TABLE IF NOT EXISTS life_ceo_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'platform', 'project', 'team'
  hierarchy_level INTEGER NOT NULL, -- 1 = super_admin, 2 = admin, etc.
  permissions JSONB DEFAULT '{}', -- Detailed permission matrix
  attributes JSONB DEFAULT '{}', -- ABAC attributes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Life CEO User Roles junction table
CREATE TABLE IF NOT EXISTS life_ceo_user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES life_ceo_roles(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- For time-based access
  attributes JSONB DEFAULT '{}', -- User-specific role attributes
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Life CEO Projects hierarchy table (similar to Mundo Tango)
CREATE TABLE IF NOT EXISTS life_ceo_projects (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES life_ceo_projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'platform', 'section', 'feature', 'project', 'task'
  description TEXT,
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'blocked'
  priority VARCHAR(20) DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  web_completion INTEGER DEFAULT 0, -- 0-100
  mobile_completion INTEGER DEFAULT 0, -- 0-100
  assigned_to INTEGER REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Life CEO Project Status history
CREATE TABLE IF NOT EXISTS life_ceo_project_status (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES life_ceo_projects(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  web_completion INTEGER DEFAULT 0,
  mobile_completion INTEGER DEFAULT 0,
  notes TEXT,
  updated_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Life CEO Role Permissions table
CREATE TABLE IF NOT EXISTS life_ceo_role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES life_ceo_roles(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL, -- 'projects', 'users', 'agents', etc.
  action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete'
  conditions JSONB DEFAULT '{}', -- ABAC conditions
  UNIQUE(role_id, resource, action)
);

-- Life CEO Audit Log
CREATE TABLE IF NOT EXISTS life_ceo_audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id INTEGER,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default Life CEO roles
INSERT INTO life_ceo_roles (name, display_name, type, hierarchy_level, permissions) VALUES
('life_ceo_super_admin', 'Life CEO Super Admin', 'platform', 1, '{"all": true}'),
('life_ceo_admin', 'Life CEO Admin', 'platform', 2, '{"manage_projects": true, "manage_users": true}'),
('life_ceo_project_admin', 'Project Admin', 'project', 3, '{"manage_own_projects": true}'),
('life_ceo_team_lead', 'Team Lead', 'team', 4, '{"manage_team_tasks": true}'),
('life_ceo_contributor', 'Contributor', 'team', 5, '{"update_own_tasks": true}'),
('life_ceo_viewer', 'Viewer', 'platform', 6, '{"read_only": true}')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_life_ceo_user_roles_user_id ON life_ceo_user_roles(user_id);
CREATE INDEX idx_life_ceo_user_roles_role_id ON life_ceo_user_roles(role_id);
CREATE INDEX idx_life_ceo_projects_parent_id ON life_ceo_projects(parent_id);
CREATE INDEX idx_life_ceo_projects_status ON life_ceo_projects(status);
CREATE INDEX idx_life_ceo_project_status_project_id ON life_ceo_project_status(project_id);
CREATE INDEX idx_life_ceo_audit_log_user_id ON life_ceo_audit_log(user_id);
CREATE INDEX idx_life_ceo_audit_log_created_at ON life_ceo_audit_log(created_at);

-- Grant Scott Boddye Life CEO Super Admin role
INSERT INTO life_ceo_user_roles (user_id, role_id, assigned_by)
SELECT 3, r.id, 3
FROM life_ceo_roles r
WHERE r.name = 'life_ceo_super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING;