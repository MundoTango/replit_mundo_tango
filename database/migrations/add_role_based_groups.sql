-- Migration: Convert city-based groups to role-based groups
-- Date: 2025-07-09

-- First, let's add a role_type column to the groups table
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS role_type VARCHAR(50);

-- Update existing city groups to have type 'city' for backward compatibility
UPDATE groups 
SET type = 'city' 
WHERE type IS NULL OR type = '';

-- Create role-based groups based on common tango roles
INSERT INTO groups (name, description, type, role_type, visibility, avatar_url, banner_url, location, created_by, created_at, updated_at)
VALUES 
  ('Milonga Organizers Network', 'Connect with fellow milonga organizers, share best practices, and collaborate on events', 'role', 'organizer', 'public', 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg', 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Tango Teachers Guild', 'A community for tango teachers to exchange teaching methods, resources, and support each other', 'role', 'teacher', 'public', 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', 'https://images.pexels.com/photos/3775603/pexels-photo-3775603.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Professional Dancers Circle', 'For professional tango dancers to network, find partners, and discuss performance opportunities', 'role', 'performer', 'public', 'https://images.pexels.com/photos/1671384/pexels-photo-1671384.jpeg', 'https://images.pexels.com/photos/358010/pexels-photo-358010.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Tango DJs Collective', 'Share playlists, discuss music selection techniques, and coordinate DJ schedules', 'role', 'dj', 'public', 'https://images.pexels.com/photos/1649693/pexels-photo-1649693.jpeg', 'https://images.pexels.com/photos/3379933/pexels-photo-3379933.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Tango Musicians Forum', 'Connect with tango musicians, share compositions, and organize live music events', 'role', 'musician', 'public', 'https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Tango Photographers Hub', 'Share photography tips, organize photo shoots, and showcase tango photography', 'role', 'photographer', 'public', 'https://images.pexels.com/photos/1983046/pexels-photo-1983046.jpeg', 'https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Tango Bloggers & Writers', 'For those who write about tango - share articles, get feedback, and collaborate on content', 'role', 'content_creator', 'public', 'https://images.pexels.com/photos/796602/pexels-photo-796602.jpeg', 'https://images.pexels.com/photos/1766604/pexels-photo-1766604.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Tango Fashion Designers', 'Showcase tango fashion, discuss trends, and connect with dancers needing custom designs', 'role', 'fashion_designer', 'public', 'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Tango Shoe Makers', 'Connect shoe makers with dancers, discuss craftsmanship, and showcase new designs', 'role', 'shoe_maker', 'public', 'https://images.pexels.com/photos/3812433/pexels-photo-3812433.jpeg', 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg', 'Global', 7, NOW(), NOW()),
  
  ('Tango Tour Operators', 'Network for those organizing tango tours, festivals, and travel experiences', 'role', 'tour_operator', 'public', 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg', 'https://images.pexels.com/photos/2265876/pexels-photo-2265876.jpeg', 'Global', 7, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create index for role_type for faster queries
CREATE INDEX IF NOT EXISTS idx_groups_role_type ON groups(role_type);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);

-- Auto-join function based on user roles
-- This will be called when users register or update their roles
CREATE OR REPLACE FUNCTION auto_join_role_groups(user_id INTEGER)
RETURNS void AS $$
DECLARE
    user_role RECORD;
    role_group RECORD;
BEGIN
    -- Get all roles for the user
    FOR user_role IN 
        SELECT r.name as role_name 
        FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = $1
    LOOP
        -- Find matching role-based groups
        FOR role_group IN 
            SELECT id 
            FROM groups 
            WHERE type = 'role' 
            AND role_type = user_role.role_name
        LOOP
            -- Join the group if not already a member
            INSERT INTO group_members (group_id, user_id, joined_at)
            VALUES (role_group.id, $1, NOW())
            ON CONFLICT (group_id, user_id) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;