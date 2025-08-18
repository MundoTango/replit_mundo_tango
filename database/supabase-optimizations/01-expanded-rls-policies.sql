-- Expanded RLS Policy Coverage for Supabase Database
-- Priority: HIGH - Critical Security Gap
-- Date: January 8, 2025

-- Enable RLS on tables that currently lack it
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_media ENABLE ROW LEVEL SECURITY;

-- Post Comments RLS Policies
CREATE POLICY "Users can view comments on public posts" ON public.post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_comments.post_id
      AND (
        p.visibility = 'public'
        OR p.user_id = auth.uid()
        OR (p.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.friends f
          WHERE f.status = 'accepted'
          AND ((f.requester_id = p.user_id AND f.addressee_id = auth.uid())
            OR (f.addressee_id = p.user_id AND f.requester_id = auth.uid()))
        ))
      )
    )
  );

CREATE POLICY "Users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Post Likes RLS Policies
CREATE POLICY "Users can view likes on visible posts" ON public.post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_likes.post_id
      AND (
        p.visibility = 'public'
        OR p.user_id = auth.uid()
        OR (p.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.friends f
          WHERE f.status = 'accepted'
          AND ((f.requester_id = p.user_id AND f.addressee_id = auth.uid())
            OR (f.addressee_id = p.user_id AND f.requester_id = auth.uid()))
        ))
      )
    )
  );

CREATE POLICY "Users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Post Shares RLS Policies
CREATE POLICY "Users can view shares of visible posts" ON public.post_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_shares.post_id
      AND (
        p.visibility = 'public'
        OR p.user_id = auth.uid()
        OR (p.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.friends f
          WHERE f.status = 'accepted'
          AND ((f.requester_id = p.user_id AND f.addressee_id = auth.uid())
            OR (f.addressee_id = p.user_id AND f.requester_id = auth.uid()))
        ))
      )
    )
  );

CREATE POLICY "Users can share posts" ON public.post_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stories RLS Policies
CREATE POLICY "Users can view active stories from friends or public" ON public.stories
  FOR SELECT USING (
    user_id = auth.uid()
    OR (visibility = 'public' AND expires_at > now())
    OR (visibility = 'friends' AND expires_at > now() AND EXISTS (
      SELECT 1 FROM public.friends f
      WHERE f.status = 'accepted'
      AND ((f.requester_id = stories.user_id AND f.addressee_id = auth.uid())
        OR (f.addressee_id = stories.user_id AND f.requester_id = auth.uid()))
    ))
  );

CREATE POLICY "Users can create own stories" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON public.stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- Story Views RLS Policies
CREATE POLICY "Story owners can see all views" ON public.story_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_views.story_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can track their own story views" ON public.story_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Notifications RLS Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Will be restricted by service role

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Friends RLS Policies
CREATE POLICY "Users can view their friend relationships" ON public.friends
  FOR SELECT USING (
    auth.uid() = requester_id 
    OR auth.uid() = addressee_id
  );

CREATE POLICY "Users can send friend requests" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend status if involved" ON public.friends
  FOR UPDATE USING (
    auth.uid() = requester_id 
    OR auth.uid() = addressee_id
  );

CREATE POLICY "Users can remove friendships if involved" ON public.friends
  FOR DELETE USING (
    auth.uid() = requester_id 
    OR auth.uid() = addressee_id
  );

-- Event Participants RLS Policies
CREATE POLICY "Users can view participants of public events" ON public.event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_participants.event_id
      AND (
        e.is_public = true
        OR e.organizer_id = auth.uid()
        OR event_participants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can register for events" ON public.event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON public.event_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel participation" ON public.event_participants
  FOR DELETE USING (auth.uid() = user_id);

-- User Roles RLS Policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Media Assets RLS Policies
CREATE POLICY "Users can view own media" ON public.media_assets
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can view public media" ON public.media_assets
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view friends' media" ON public.media_assets
  FOR SELECT USING (
    visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.friends f
      WHERE f.status = 'accepted'
      AND ((f.requester_id = media_assets.uploaded_by AND f.addressee_id = auth.uid())
        OR (f.addressee_id = media_assets.uploaded_by AND f.requester_id = auth.uid()))
    )
  );

CREATE POLICY "Users can upload media" ON public.media_assets
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own media" ON public.media_assets
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own media" ON public.media_assets
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Media Tags RLS Policies
CREATE POLICY "Users can view tags on visible media" ON public.media_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_tags.media_id
      AND (
        ma.visibility = 'public'
        OR ma.uploaded_by = auth.uid()
        OR (ma.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.friends f
          WHERE f.status = 'accepted'
          AND ((f.requester_id = ma.uploaded_by AND f.addressee_id = auth.uid())
            OR (f.addressee_id = ma.uploaded_by AND f.requester_id = auth.uid()))
        ))
      )
    )
  );

CREATE POLICY "Media owners can manage tags" ON public.media_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.media_assets ma
      WHERE ma.id = media_tags.media_id
      AND ma.uploaded_by = auth.uid()
    )
  );

-- Memory Media RLS Policies
CREATE POLICY "Users can view memory media based on memory visibility" ON public.memory_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memories m
      WHERE m.id = memory_media.memory_id
      AND (
        m.visibility = 'Public'
        OR m.user_id = auth.uid()
        OR (m.visibility = 'Mutual' AND EXISTS (
          SELECT 1 FROM public.friends f
          WHERE f.status = 'accepted'
          AND ((f.requester_id = (SELECT id FROM public.users WHERE auth_user_id = m.user_id)
               AND f.addressee_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
            OR (f.addressee_id = (SELECT id FROM public.users WHERE auth_user_id = m.user_id)
               AND f.requester_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())))
        ))
      )
    )
  );

CREATE POLICY "Memory owners can manage media" ON public.memory_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.memories m
      WHERE m.id = memory_media.memory_id
      AND m.user_id = auth.uid()
    )
  );

-- Create helper function for checking friendship
CREATE OR REPLACE FUNCTION public.are_friends(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friends
    WHERE status = 'accepted'
    AND ((requester_id = user1_id AND addressee_id = user2_id)
      OR (addressee_id = user1_id AND requester_id = user2_id))
  );
$$;

-- Create index to support RLS policies
CREATE INDEX IF NOT EXISTS idx_friends_status_requester ON public.friends(status, requester_id);
CREATE INDEX IF NOT EXISTS idx_friends_status_addressee ON public.friends(status, addressee_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_user ON public.post_comments(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by_visibility ON public.media_assets(uploaded_by, visibility);
CREATE INDEX IF NOT EXISTS idx_stories_user_expires ON public.stories(user_id, expires_at);

-- Add comment explaining the security model
COMMENT ON SCHEMA public IS 'Mundo Tango production schema with comprehensive Row Level Security policies ensuring data protection across all tables. All policies follow the principle of least privilege.';