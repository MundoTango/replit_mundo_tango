-- Supabase Backend Deployment Checklist
-- Execute these scripts in order to implement enhanced post functionality

-- Step 1: Apply schema enhancements for Google Maps integration
DO $$
BEGIN
  -- Add missing columns to posts table for enhanced location support
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'coordinates') THEN
    ALTER TABLE posts ADD COLUMN coordinates jsonb;
    CREATE INDEX idx_posts_coordinates_gin ON posts USING GIN(coordinates);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'place_id') THEN
    ALTER TABLE posts ADD COLUMN place_id text;
    CREATE INDEX idx_posts_place_id ON posts(place_id) WHERE place_id IS NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'formatted_address') THEN
    ALTER TABLE posts ADD COLUMN formatted_address text;
    CREATE INDEX idx_posts_formatted_address ON posts(formatted_address) WHERE formatted_address IS NOT NULL;
  END IF;

  RAISE NOTICE 'Schema enhancements applied successfully';
END $$;

-- Step 2: Enable RLS on enhanced post tables
DO $$
BEGIN
  -- Enable RLS on tables if not already enabled
  ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;

  RAISE NOTICE 'RLS enabled on all enhanced post tables';
END $$;

-- Step 3: Create user context functions for RLS
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('app.current_user_id', true), '')::INTEGER,
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_current_user_id(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION set_current_user_id(INTEGER) TO authenticated;

-- Step 4: Apply critical performance indexes
-- Location-based optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_location_gin ON posts USING GIN(location gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_coordinates_spatial ON events(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Enhanced post features
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_mentions_gin ON posts USING GIN(mentions);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_hashtags_created ON posts USING GIN(hashtags) WHERE array_length(hashtags, 1) > 0;

-- Real-time features
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_unread_created ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_post_user_type ON reactions(post_id, user_id, type);

-- Media optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_memory_media_compound ON memory_media(memory_id, media_id, tagged_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_tags_tag_trgm ON media_tags USING GIN(tag gin_trgm_ops);

-- Step 5: Create monitoring and audit tables
CREATE TABLE IF NOT EXISTS query_performance_log (
  id SERIAL PRIMARY KEY,
  operation TEXT NOT NULL,
  table_name TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  user_id INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_query_performance_log_created ON query_performance_log(created_at DESC);
CREATE INDEX idx_query_performance_log_duration ON query_performance_log(duration_ms DESC);

CREATE TABLE IF NOT EXISTS security_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id INTEGER,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_security_events_type_created ON security_events(event_type, created_at DESC);
CREATE INDEX idx_security_events_ip ON security_events(ip_address, created_at DESC);

-- Step 6: Validate deployment
DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  rls_count INTEGER;
BEGIN
  -- Count enhanced post tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_name IN ('post_comments', 'reactions', 'notifications', 'post_reports', 'media_tags', 'memory_media');

  -- Count performance indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE indexname LIKE 'idx_%' 
  AND (indexname LIKE '%posts%' OR indexname LIKE '%media%' OR indexname LIKE '%notifications%');

  -- Count RLS policies
  SELECT COUNT(*) INTO rls_count
  FROM pg_policies 
  WHERE tablename IN ('post_comments', 'reactions', 'notifications', 'post_reports');

  RAISE NOTICE 'Deployment validation:';
  RAISE NOTICE '- Enhanced tables: % of 6 expected', table_count;
  RAISE NOTICE '- Performance indexes: % created', index_count;
  RAISE NOTICE '- RLS policies: % active', rls_count;

  IF table_count = 6 AND index_count >= 10 THEN
    RAISE NOTICE '✅ Supabase backend deployment SUCCESSFUL';
  ELSE
    RAISE WARNING '⚠️ Deployment incomplete - please review missing components';
  END IF;
END $$;