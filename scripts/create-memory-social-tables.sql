-- Memory Comments Table
CREATE TABLE IF NOT EXISTS memory_comments (
  id SERIAL PRIMARY KEY,
  memory_id VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id INTEGER REFERENCES memory_comments(id) ON DELETE CASCADE,
  mentions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memory Reactions Table
CREATE TABLE IF NOT EXISTS memory_reactions (
  id SERIAL PRIMARY KEY,
  memory_id VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(memory_id, user_id)
);

-- Memory Reports Table
CREATE TABLE IF NOT EXISTS memory_reports (
  id SERIAL PRIMARY KEY,
  memory_id VARCHAR(255) NOT NULL,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_memory_comments_memory_id ON memory_comments(memory_id);
CREATE INDEX idx_memory_comments_user_id ON memory_comments(user_id);
CREATE INDEX idx_memory_reactions_memory_id ON memory_reactions(memory_id);
CREATE INDEX idx_memory_reactions_user_id ON memory_reactions(user_id);
CREATE INDEX idx_memory_reports_memory_id ON memory_reports(memory_id);
CREATE INDEX idx_memory_reports_status ON memory_reports(status);
CREATE INDEX idx_memory_reports_reporter_id ON memory_reports(reporter_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memory_comments_updated_at BEFORE UPDATE ON memory_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_reports_updated_at BEFORE UPDATE ON memory_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();