-- Create daily activities table for project tracking
CREATE TABLE IF NOT EXISTS daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id),
  project_id TEXT NOT NULL,
  project_title TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- created, updated, completed, reviewed, blocked
  description TEXT NOT NULL,
  changes JSONB[] DEFAULT '{}',
  team TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  completion_before INTEGER,
  completion_after INTEGER,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create indexes for daily activities
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_id ON daily_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_timestamp ON daily_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_activities_project_id ON daily_activities(project_id);

-- Create host reviews table
CREATE TABLE IF NOT EXISTS host_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id INTEGER NOT NULL REFERENCES host_homes(id),
  reviewer_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  host_response TEXT,
  host_response_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(home_id, reviewer_id)
);

-- Create indexes for host reviews
CREATE INDEX IF NOT EXISTS idx_host_reviews_home_id ON host_reviews(home_id);
CREATE INDEX IF NOT EXISTS idx_host_reviews_reviewer_id ON host_reviews(reviewer_id);

-- Add additional fields to host_homes if they don't exist
ALTER TABLE host_homes ADD COLUMN IF NOT EXISTS house_rules TEXT;
ALTER TABLE host_homes ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE host_homes ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE host_homes ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE host_homes ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id);
ALTER TABLE host_homes ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Add index for verification status
CREATE INDEX IF NOT EXISTS idx_host_homes_is_verified ON host_homes(is_verified);