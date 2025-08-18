-- Enhanced Report System Tables (TrangoTech-Style)
-- Based on original TrangoTech report system

-- Report Types Table (Categories)
CREATE TABLE IF NOT EXISTS report_types (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES report_types(id),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Insert default report types from TrangoTech
INSERT INTO report_types (name) VALUES 
  ('Harassment'),
  ('Inappropriate'),
  ('Irrelevant'),
  ('Spam'),
  ('Violence'),
  ('False Information'),
  ('Hate Speech'),
  ('Nudity'),
  ('Copyright Violation'),
  ('Other');

-- Enhanced Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type_id INTEGER NOT NULL REFERENCES report_types(id) ON DELETE CASCADE,
  instance_type VARCHAR(50) NOT NULL CHECK (instance_type IN ('user', 'post', 'event', 'group', 'memory', 'comment')),
  instance_id VARCHAR(255) NOT NULL, -- Can be numeric or string ID
  description TEXT,
  status VARCHAR(20) DEFAULT 'unresolved' CHECK (status IN ('resolved', 'unresolved', 'investigating', 'dismissed')),
  resolved_by INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_report_type_id ON reports(report_type_id);
CREATE INDEX idx_reports_instance ON reports(instance_type, instance_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_timestamp
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_reports_updated_at();

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY reports_select_own ON reports
  FOR SELECT
  USING (user_id = get_current_user_id());

-- Users can create reports
CREATE POLICY reports_insert ON reports
  FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

-- Admins can view all reports
CREATE POLICY reports_admin_select ON reports
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.name IN ('admin', 'super_admin', 'moderator')
  ));

-- Admins can update reports
CREATE POLICY reports_admin_update ON reports
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.name IN ('admin', 'super_admin', 'moderator')
  ));

-- Report types are public read
ALTER TABLE report_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY report_types_select ON report_types
  FOR SELECT
  USING (true);

-- Only admins can manage report types
CREATE POLICY report_types_admin_all ON report_types
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_current_user_id()
    AND r.name IN ('admin', 'super_admin')
  ));

-- View for admin dashboard
CREATE OR REPLACE VIEW report_statistics AS
SELECT 
  rt.name as report_type,
  r.instance_type,
  r.status,
  COUNT(*) as count,
  DATE_TRUNC('day', r.created_at) as report_date
FROM reports r
JOIN report_types rt ON r.report_type_id = rt.id
WHERE r.deleted_at IS NULL
GROUP BY rt.name, r.instance_type, r.status, DATE_TRUNC('day', r.created_at);

-- Grant permissions
GRANT SELECT ON report_statistics TO authenticated;