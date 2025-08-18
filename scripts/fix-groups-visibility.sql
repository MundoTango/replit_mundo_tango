-- Fix groups table by adding missing visibility column
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public';

-- Create index for visibility column
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON groups(visibility);