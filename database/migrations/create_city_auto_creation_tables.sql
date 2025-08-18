-- City Auto-Creation Schema Updates
-- This migration adds support for automatic city group creation

-- Table for normalizing city names (NYC -> New York City)
CREATE TABLE IF NOT EXISTS city_normalizations (
  id SERIAL PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255),
  country VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(original_name, country)
);

-- Table for tracking how city groups were created
CREATE TABLE IF NOT EXISTS city_group_creation_log (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('registration', 'recommendation', 'event', 'manual')),
  trigger_id INTEGER NOT NULL, -- ID of user/recommendation/event that triggered creation
  created_by INTEGER REFERENCES users(id),
  metadata JSONB DEFAULT '{}', -- Additional context
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_city_normalizations_lookup ON city_normalizations(LOWER(original_name), country);
CREATE INDEX IF NOT EXISTS idx_city_normalizations_normalized ON city_normalizations(normalized_name, country);
CREATE INDEX IF NOT EXISTS idx_groups_city_type ON groups(city, type) WHERE type = 'city';
CREATE INDEX IF NOT EXISTS idx_city_creation_log_group ON city_group_creation_log(group_id);
CREATE INDEX IF NOT EXISTS idx_city_creation_log_trigger ON city_group_creation_log(trigger_type, trigger_id);

-- Add some common city normalizations
INSERT INTO city_normalizations (original_name, normalized_name, city, state, country, latitude, longitude) VALUES
('NYC', 'New York City', 'New York City', 'New York', 'United States', 40.7128, -74.0060),
('NY', 'New York City', 'New York City', 'New York', 'United States', 40.7128, -74.0060),
('LA', 'Los Angeles', 'Los Angeles', 'California', 'United States', 34.0522, -118.2437),
('SF', 'San Francisco', 'San Francisco', 'California', 'United States', 37.7749, -122.4194),
('BsAs', 'Buenos Aires', 'Buenos Aires', NULL, 'Argentina', -34.6037, -58.3816),
('BA', 'Buenos Aires', 'Buenos Aires', NULL, 'Argentina', -34.6037, -58.3816),
('Bs As', 'Buenos Aires', 'Buenos Aires', NULL, 'Argentina', -34.6037, -58.3816),
('Bs.As.', 'Buenos Aires', 'Buenos Aires', NULL, 'Argentina', -34.6037, -58.3816)
ON CONFLICT (original_name, country) DO NOTHING;

-- Function to get or create city group
CREATE OR REPLACE FUNCTION get_or_create_city_group(
  p_city_name VARCHAR,
  p_country VARCHAR,
  p_state VARCHAR DEFAULT NULL,
  p_trigger_type VARCHAR DEFAULT 'manual',
  p_trigger_id INTEGER DEFAULT NULL,
  p_created_by INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_group_id INTEGER;
  v_normalized_city VARCHAR;
  v_slug VARCHAR;
  v_coordinates RECORD;
BEGIN
  -- Normalize city name
  SELECT city, latitude, longitude INTO v_normalized_city, v_coordinates.lat, v_coordinates.lng
  FROM city_normalizations
  WHERE LOWER(original_name) = LOWER(p_city_name) AND country = p_country
  LIMIT 1;
  
  -- If no normalization found, use the original name
  IF v_normalized_city IS NULL THEN
    v_normalized_city := p_city_name;
  END IF;
  
  -- Check if group already exists
  SELECT id INTO v_group_id
  FROM groups
  WHERE type = 'city' 
    AND city = v_normalized_city 
    AND country = p_country
  LIMIT 1;
  
  -- If group doesn't exist, create it
  IF v_group_id IS NULL THEN
    -- Generate slug
    v_slug := LOWER(REGEXP_REPLACE(v_normalized_city || '-' || p_country, '[^a-z0-9]+', '-', 'g'));
    v_slug := TRIM(BOTH '-' FROM v_slug);
    
    -- Create the group
    INSERT INTO groups (
      name, slug, type, city, state, country,
      description, emoji, is_private, created_at, updated_at
    ) VALUES (
      v_normalized_city || ', ' || p_country,
      v_slug,
      'city',
      v_normalized_city,
      p_state,
      p_country,
      'Welcome to the ' || v_normalized_city || ' tango community! Share events, find dance partners, and discover the best milongas in town.',
      '🏙️',
      false,
      NOW(),
      NOW()
    ) RETURNING id INTO v_group_id;
    
    -- Log the creation
    INSERT INTO city_group_creation_log (
      group_id, trigger_type, trigger_id, created_by, metadata
    ) VALUES (
      v_group_id, p_trigger_type, p_trigger_id, p_created_by,
      jsonb_build_object(
        'city', v_normalized_city,
        'country', p_country,
        'state', p_state,
        'coordinates', CASE 
          WHEN v_coordinates.lat IS NOT NULL 
          THEN jsonb_build_object('lat', v_coordinates.lat, 'lng', v_coordinates.lng)
          ELSE NULL
        END
      )
    );
  END IF;
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql;