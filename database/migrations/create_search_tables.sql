-- Search & Discovery System Tables
-- Following 30L Framework Layer 5: Data Architecture

-- Main search index table
CREATE TABLE IF NOT EXISTS search_index (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'post', 'event', 'group', 'memory'
  entity_id INTEGER NOT NULL,
  searchable_text TEXT NOT NULL,
  search_vector tsvector,
  metadata JSONB DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'public',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_search_vector ON search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_entity_type ON search_index(entity_type);
CREATE INDEX IF NOT EXISTS idx_visibility ON search_index(visibility);
CREATE INDEX IF NOT EXISTS idx_created_at ON search_index(created_at DESC);

-- Search history for personalization and analytics
CREATE TABLE IF NOT EXISTS search_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  clicked_results JSONB DEFAULT '[]',
  search_context JSONB DEFAULT '{}',
  search_filters JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

-- Trending searches cache
CREATE TABLE IF NOT EXISTS trending_searches (
  id SERIAL PRIMARY KEY,
  query TEXT UNIQUE NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP DEFAULT NOW(),
  category VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trending_count ON trending_searches(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_trending_last ON trending_searches(last_searched DESC);

-- Search suggestions for autocomplete
CREATE TABLE IF NOT EXISTS search_suggestions (
  id SERIAL PRIMARY KEY,
  suggestion TEXT UNIQUE NOT NULL,
  suggestion_type VARCHAR(50), -- 'user', 'event', 'location', 'tag'
  usage_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_text ON search_suggestions(suggestion);
CREATE INDEX IF NOT EXISTS idx_suggestions_count ON search_suggestions(usage_count DESC);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.searchable_text);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER update_search_vector_trigger
  BEFORE INSERT OR UPDATE ON search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- Function to track search query
CREATE OR REPLACE FUNCTION track_search_query(
  p_query TEXT,
  p_category VARCHAR(50) DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO trending_searches (query, search_count, category, last_searched)
  VALUES (LOWER(TRIM(p_query)), 1, p_category, NOW())
  ON CONFLICT (query) DO UPDATE
  SET 
    search_count = trending_searches.search_count + 1,
    last_searched = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get trending searches
CREATE OR REPLACE FUNCTION get_trending_searches(
  p_limit INTEGER DEFAULT 10,
  p_category VARCHAR(50) DEFAULT NULL
) RETURNS TABLE (
  query TEXT,
  search_count INTEGER,
  category VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.query,
    ts.search_count,
    ts.category
  FROM trending_searches ts
  WHERE 
    (p_category IS NULL OR ts.category = p_category) AND
    ts.last_searched > NOW() - INTERVAL '7 days'
  ORDER BY ts.search_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Search index is public read, admin write
CREATE POLICY search_index_read ON search_index
  FOR SELECT USING (
    visibility = 'public' OR
    visibility = 'authenticated' AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY search_index_admin_all ON search_index
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_admin')
    )
  );

-- Search history is private to user
CREATE POLICY search_history_owner ON search_history
  FOR ALL USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT ON search_index TO authenticated;
GRANT SELECT ON trending_searches TO authenticated;
GRANT SELECT ON search_suggestions TO authenticated;
GRANT ALL ON search_history TO authenticated;