-- Enhanced RLS Policies for Post Creation Workflow
-- Implements comprehensive security for comments, reactions, notifications, and media

-- Enable RLS on all enhanced post tables
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;

-- Set up RLS context function for user identification
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('app.current_user_id', true), '')::INTEGER,
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POST COMMENTS RLS POLICIES
-- Users can create comments, read comments on public/friend posts, edit own comments
CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can read comments on accessible posts" ON post_comments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_comments.post_id 
      AND (
        p.visibility = 'public' 
        OR p.user_id = get_current_user_id()
        OR (p.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM friends f 
          WHERE (f.user_id = p.user_id AND f.friend_id = get_current_user_id() AND f.status = 'accepted')
          OR (f.friend_id = p.user_id AND f.user_id = get_current_user_id() AND f.status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can update own comments" ON post_comments
  FOR UPDATE TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can delete own comments" ON post_comments
  FOR DELETE TO authenticated
  USING (user_id = get_current_user_id());

-- REACTIONS RLS POLICIES
-- Users can create/read/update/delete own reactions, read all reaction counts
CREATE POLICY "Users can manage own reactions" ON reactions
  FOR ALL TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can read all reactions for accessible content" ON reactions
  FOR SELECT TO authenticated
  USING (
    (post_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = reactions.post_id 
      AND (
        p.visibility = 'public' 
        OR p.user_id = get_current_user_id()
        OR (p.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM friends f 
          WHERE (f.user_id = p.user_id AND f.friend_id = get_current_user_id() AND f.status = 'accepted')
          OR (f.friend_id = p.user_id AND f.user_id = get_current_user_id() AND f.status = 'accepted')
        ))
      )
    ))
    OR 
    (comment_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM post_comments pc
      JOIN posts p ON p.id = pc.post_id
      WHERE pc.id = reactions.comment_id 
      AND (
        p.visibility = 'public' 
        OR p.user_id = get_current_user_id()
        OR (p.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM friends f 
          WHERE (f.user_id = p.user_id AND f.friend_id = get_current_user_id() AND f.status = 'accepted')
          OR (f.friend_id = p.user_id AND f.user_id = get_current_user_id() AND f.status = 'accepted')
        ))
      )
    ))
  );

-- NOTIFICATIONS RLS POLICIES
-- Users can only access their own notifications
CREATE POLICY "Users can access own notifications" ON notifications
  FOR ALL TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

-- POST REPORTS RLS POLICIES
-- Users can create reports, moderators can manage all reports
CREATE POLICY "Users can create reports" ON post_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = get_current_user_id());

CREATE POLICY "Users can read own reports" ON post_reports
  FOR SELECT TO authenticated
  USING (reporter_id = get_current_user_id());

CREATE POLICY "Moderators can manage all reports" ON post_reports
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = get_current_user_id()
      AND (up.role IN ('admin', 'moderator', 'super_admin') 
           OR up.roles && ARRAY['admin', 'moderator', 'super_admin'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = get_current_user_id()
      AND (up.role IN ('admin', 'moderator', 'super_admin')
           OR up.roles && ARRAY['admin', 'moderator', 'super_admin'])
    )
  );

-- MEDIA TAGS RLS POLICIES
-- Users can tag their own media, read tags on accessible media
CREATE POLICY "Users can manage tags on own media" ON media_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM media_assets ma
      WHERE ma.id = media_tags.media_id
      AND ma.user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM media_assets ma
      WHERE ma.id = media_tags.media_id
      AND ma.user_id = get_current_user_id()
    )
  );

CREATE POLICY "Users can read tags on accessible media" ON media_tags
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM media_assets ma
      WHERE ma.id = media_tags.media_id
      AND (
        ma.visibility = 'public'
        OR ma.user_id = get_current_user_id()
        OR (ma.visibility = 'mutual' AND EXISTS (
          SELECT 1 FROM friends f 
          WHERE (f.user_id = ma.user_id AND f.friend_id = get_current_user_id() AND f.status = 'accepted')
          OR (f.friend_id = ma.user_id AND f.user_id = get_current_user_id() AND f.status = 'accepted')
        ))
      )
    )
  );

-- MEMORY MEDIA RLS POLICIES
-- Users can manage media on their own posts, read media on accessible posts
CREATE POLICY "Users can manage memory media on own posts" ON memory_media
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = memory_media.memory_id
      AND p.user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = memory_media.memory_id
      AND p.user_id = get_current_user_id()
    )
  );

CREATE POLICY "Users can read memory media on accessible posts" ON memory_media
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = memory_media.memory_id
      AND (
        p.visibility = 'public'
        OR p.user_id = get_current_user_id()
        OR (p.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM friends f 
          WHERE (f.user_id = p.user_id AND f.friend_id = get_current_user_id() AND f.status = 'accepted')
          OR (f.friend_id = p.user_id AND f.user_id = get_current_user_id() AND f.status = 'accepted')
        ))
      )
    )
  );

-- ENHANCED MEDIA ASSETS RLS POLICIES
-- Update existing media_assets policies for visibility-based access
DROP POLICY IF EXISTS "Users can manage own media" ON media_assets;
DROP POLICY IF EXISTS "Users can read accessible media" ON media_assets;

CREATE POLICY "Users can manage own media" ON media_assets
  FOR ALL TO authenticated
  USING (user_id = get_current_user_id())
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Users can read accessible media" ON media_assets
  FOR SELECT TO authenticated
  USING (
    visibility = 'public'
    OR user_id = get_current_user_id()
    OR (visibility = 'mutual' AND EXISTS (
      SELECT 1 FROM friends f 
      WHERE (f.user_id = media_assets.user_id AND f.friend_id = get_current_user_id() AND f.status = 'accepted')
      OR (f.friend_id = media_assets.user_id AND f.user_id = get_current_user_id() AND f.status = 'accepted')
    ))
  );

-- Create security context setting function for API middleware
CREATE OR REPLACE FUNCTION set_current_user_id(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION set_current_user_id(INTEGER) TO authenticated;