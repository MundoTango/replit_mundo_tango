-- Fix authentication by creating a proper migration for existing users
-- This migration will assign a temporary replit_id to existing users for testing

-- Update existing users to have a temporary replit_id for testing
-- We'll use a prefix pattern like 'temp_' + user id
UPDATE users 
SET replit_id = 'temp_' || id::text 
WHERE replit_id IS NULL;

-- Create an index on replit_id for performance
CREATE INDEX IF NOT EXISTS idx_users_replit_id ON users(replit_id);

-- Verify the migration
SELECT id, name, username, email, replit_id, is_onboarding_complete 
FROM users 
ORDER BY id;