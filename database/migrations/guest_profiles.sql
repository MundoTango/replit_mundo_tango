-- Guest profile preferences table
CREATE TABLE IF NOT EXISTS guest_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accommodation_preferences JSONB DEFAULT '{}',
  dietary_restrictions TEXT[],
  languages_spoken TEXT[],
  travel_interests TEXT[],
  emergency_contact JSONB DEFAULT '{}',
  special_needs TEXT,
  preferred_neighborhoods TEXT[],
  budget_range JSONB DEFAULT '{}',
  stay_duration_preference VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;

-- Only the user can see their own guest profile
CREATE POLICY "Users can view own guest profile" ON guest_profiles
  FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can update own guest profile" ON guest_profiles
  FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own guest profile" ON guest_profiles
  FOR INSERT WITH CHECK (user_id = get_current_user_id());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_guest_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guest_profiles_updated_at
BEFORE UPDATE ON guest_profiles
FOR EACH ROW
EXECUTE FUNCTION update_guest_profiles_updated_at();

-- Create index on user_id for fast lookups
CREATE INDEX idx_guest_profiles_user_id ON guest_profiles(user_id);