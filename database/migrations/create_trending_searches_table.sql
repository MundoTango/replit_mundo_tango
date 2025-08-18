-- Create trending_searches table for tracking popular search queries
CREATE TABLE IF NOT EXISTS trending_searches (
  id SERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  search_count INTEGER DEFAULT 1,
  category VARCHAR(50) DEFAULT 'all',
  last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_trending_searches_query ON trending_searches(query);
CREATE INDEX idx_trending_searches_count ON trending_searches(search_count DESC);
CREATE INDEX idx_trending_searches_category ON trending_searches(category);
CREATE INDEX idx_trending_searches_last_searched ON trending_searches(last_searched_at DESC);

-- Add unique constraint on query and category combination
CREATE UNIQUE INDEX idx_trending_searches_query_category ON trending_searches(LOWER(query), category);

-- Add function to update search count
CREATE OR REPLACE FUNCTION increment_search_count(p_query TEXT, p_category VARCHAR DEFAULT 'all')
RETURNS VOID AS $$
BEGIN
  INSERT INTO trending_searches (query, category, search_count, last_searched_at)
  VALUES (p_query, p_category, 1, CURRENT_TIMESTAMP)
  ON CONFLICT (LOWER(query), category)
  DO UPDATE SET 
    search_count = trending_searches.search_count + 1,
    last_searched_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;