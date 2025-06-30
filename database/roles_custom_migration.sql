-- Custom Roles Schema Enhancement
-- Adds support for user-submitted custom roles with admin approval workflow

-- Step 1: Add custom role fields to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS custom_name TEXT;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS custom_description TEXT;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS submitted_by INTEGER REFERENCES users(id);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create custom_role_requests table for better organization
CREATE TABLE IF NOT EXISTS custom_role_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL,
    role_description TEXT NOT NULL,
    submitted_by INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejected_by INTEGER REFERENCES users(id),
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_is_custom ON roles(is_custom);
CREATE INDEX IF NOT EXISTS idx_roles_is_approved ON roles(is_approved);
CREATE INDEX IF NOT EXISTS idx_roles_submitted_by ON roles(submitted_by);
CREATE INDEX IF NOT EXISTS idx_custom_role_requests_status ON custom_role_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_role_requests_submitted_by ON custom_role_requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_custom_role_requests_created_at ON custom_role_requests(created_at);

-- Step 4: Add "other" role option to existing roles
INSERT INTO roles (name, description, is_platform_role, is_custom) 
VALUES ('other', 'Custom role defined by user', false, true)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Enhanced RLS policies for custom roles

-- Allow users to view all approved roles plus their own pending custom roles
CREATE POLICY "users_can_view_approved_and_own_custom_roles" ON roles
    FOR SELECT
    TO authenticated
    USING (
        NOT is_custom OR 
        is_approved = true OR 
        submitted_by = auth.uid()::integer
    );

-- Allow users to submit custom role requests
CREATE POLICY "users_can_submit_custom_role_requests" ON custom_role_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (submitted_by = auth.uid()::integer);

-- Allow users to view their own custom role requests
CREATE POLICY "users_can_view_own_custom_role_requests" ON custom_role_requests
    FOR SELECT
    TO authenticated
    USING (submitted_by = auth.uid()::integer);

-- Allow admins to view all custom role requests
CREATE POLICY "admins_can_view_all_custom_role_requests" ON custom_role_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_name = r.name 
            WHERE ur.user_id = auth.uid()::integer 
            AND r.name IN ('admin', 'super_admin')
        )
    );

-- Allow admins to update custom role requests (approve/reject)
CREATE POLICY "admins_can_update_custom_role_requests" ON custom_role_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_name = r.name 
            WHERE ur.user_id = auth.uid()::integer 
            AND r.name IN ('admin', 'super_admin')
        )
    );

-- Step 6: Enable RLS on custom_role_requests
ALTER TABLE custom_role_requests ENABLE ROW LEVEL SECURITY;

-- Step 7: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_role_requests_updated_at 
    BEFORE UPDATE ON custom_role_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Create trigger to automatically create approved role when request is approved
CREATE OR REPLACE FUNCTION create_approved_custom_role()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to approved, create the role
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO roles (
            name, 
            description, 
            is_platform_role, 
            is_custom, 
            is_approved, 
            submitted_by, 
            approved_by, 
            approved_at,
            submitted_at
        ) VALUES (
            LOWER(REPLACE(NEW.role_name, ' ', '_')), -- Convert to snake_case
            NEW.role_description,
            false,
            true,
            true,
            NEW.submitted_by,
            NEW.approved_by,
            NEW.approved_at,
            NEW.created_at
        ) ON CONFLICT (name) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_create_approved_custom_role
    AFTER UPDATE ON custom_role_requests
    FOR EACH ROW EXECUTE FUNCTION create_approved_custom_role();

-- Step 9: Add constraints and validations
ALTER TABLE custom_role_requests 
ADD CONSTRAINT check_role_name_length CHECK (char_length(role_name) >= 2 AND char_length(role_name) <= 50);

ALTER TABLE custom_role_requests 
ADD CONSTRAINT check_role_description_length CHECK (char_length(role_description) >= 10 AND char_length(role_description) <= 500);

-- Step 10: Create helper function to get user's custom role requests
CREATE OR REPLACE FUNCTION get_user_custom_role_requests(user_id INTEGER)
RETURNS TABLE (
    id UUID,
    role_name TEXT,
    role_description TEXT,
    status TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        crr.id,
        crr.role_name,
        crr.role_description,
        crr.status,
        crr.admin_notes,
        crr.created_at,
        crr.updated_at
    FROM custom_role_requests crr
    WHERE crr.submitted_by = user_id
    ORDER BY crr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create helper function for admin to get pending requests
CREATE OR REPLACE FUNCTION get_pending_custom_role_requests()
RETURNS TABLE (
    id UUID,
    role_name TEXT,
    role_description TEXT,
    submitted_by INTEGER,
    submitter_name TEXT,
    submitter_email TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        crr.id,
        crr.role_name,
        crr.role_description,
        crr.submitted_by,
        u.name as submitter_name,
        u.email as submitter_email,
        crr.created_at
    FROM custom_role_requests crr
    JOIN users u ON crr.submitted_by = u.id
    WHERE crr.status = 'pending'
    ORDER BY crr.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Migration complete
-- This schema supports:
-- 1. User submission of custom roles through custom_role_requests table
-- 2. Admin approval workflow with status tracking
-- 3. Automatic role creation upon approval
-- 4. RLS policies ensuring proper access control
-- 5. Performance indexes for efficient queries
-- 6. Data validation and constraints
-- 7. Helper functions for common operations