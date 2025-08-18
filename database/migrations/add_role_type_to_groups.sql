-- Add role_type column to groups table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'groups' 
                   AND column_name = 'role_type') THEN
        ALTER TABLE groups ADD COLUMN role_type VARCHAR(50);
        
        -- Create index for role_type
        CREATE INDEX IF NOT EXISTS idx_groups_role_type ON groups(role_type);
    END IF;
END $$;