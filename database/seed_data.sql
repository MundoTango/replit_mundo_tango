-- =====================================================
-- MUNDO TANGO - COMPREHENSIVE SEED DATA
-- =====================================================
-- 
-- This file contains realistic seed data for testing the Supabase migration
-- Includes users, posts, events, communities, and relationships
-- 
-- IMPORTANT: Run AFTER the main migration (supabase_migration.sql)
-- This creates test data with proper UUID relationships
-- 
-- Date: June 28, 2025
-- =====================================================

-- Insert test languages
INSERT INTO languages (id, name, code, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'English', 'en', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Spanish', 'es', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'French', 'fr', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Italian', 'it', true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Portuguese', 'pt', true),
  ('550e8400-e29b-41d4-a716-446655440006', 'German', 'de', true);

-- Insert user groups/roles
INSERT INTO user_groups (id, type, description, permissions) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'admin', 'Platform administrators', '{"manage_users": true, "moderate_content": true, "manage_events": true}'),
  ('550e8400-e29b-41d4-a716-446655440011', 'instructor', 'Tango instructors and teachers', '{"create_events": true, "teach_classes": true}'),
  ('550e8400-e29b-41d4-a716-446655440012', 'dj', 'Tango DJs and music curators', '{"create_events": true, "manage_music": true}'),
  ('550e8400-e29b-41d4-a716-446655440013', 'organizer', 'Event and milonga organizers', '{"create_events": true, "manage_venues": true}'),
  ('550e8400-e29b-41d4-a716-446655440014', 'user', 'Regular community members', '{"create_posts": true, "join_events": true}');

-- Insert feelings/moods
INSERT INTO feelings (id, name, emoji, color_hex) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 'Passionate', '🔥', '#FF4444'),
  ('550e8400-e29b-41d4-a716-446655440021', 'Melancholy', '😌', '#4A90E2'),
  ('550e8400-e29b-41d4-a716-446655440022', 'Energetic', '⚡', '#F5A623'),
  ('550e8400-e29b-41d4-a716-446655440023', 'Romantic', '💕', '#FF69B4'),
  ('550e8400-e29b-41d4-a716-446655440024', 'Contemplative', '🤔', '#9013FE'),
  ('550e8400-e29b-41d4-a716-446655440025', 'Joyful', '😊', '#4CAF50');

-- Insert tango activities
INSERT INTO activities (id, name, description, category, parent_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440030', 'Social Dancing', 'Traditional social tango dancing', 'dance', NULL),
  ('550e8400-e29b-41d4-a716-446655440031', 'Milonga', 'Social tango events and gatherings', 'event', NULL),
  ('550e8400-e29b-41d4-a716-446655440032', 'Classes', 'Tango lessons and workshops', 'education', NULL),
  ('550e8400-e29b-41d4-a716-446655440033', 'Performances', 'Tango shows and exhibitions', 'performance', NULL),
  ('550e8400-e29b-41d4-a716-446655440034', 'Festivals', 'Tango festivals and competitions', 'event', NULL),
  ('550e8400-e29b-41d4-a716-446655440035', 'Music', 'Tango music and orchestras', 'culture', NULL);

-- Insert sample users with diverse backgrounds
INSERT INTO users (
  id, auth_user_id, name, username, email, first_name, last_name, 
  bio, country, city, state, country_code, state_code,
  languages, tango_roles, leader_level, follower_level, 
  years_of_dancing, started_dancing_year, user_type,
  is_verified, is_active, form_status, is_onboarding_complete, 
  code_of_conduct_accepted, location_point
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440100',
    '550e8400-e29b-41d4-a716-446655440100', -- This would be from auth.users in real Supabase
    'Elena Rodriguez',
    'elena_tango',
    'elena@example.com',
    'Elena',
    'Rodriguez',
    'Professional tango instructor from Buenos Aires. Teaching authentic Argentine tango for over 15 years.',
    'Argentina',
    'Buenos Aires',
    'Ciudad Autónoma de Buenos Aires',
    'AR',
    'C',
    '["spanish", "english"]',
    '["instructor", "performer"]',
    9,
    8,
    20,
    2003,
    '550e8400-e29b-41d4-a716-446655440011',
    true,
    true,
    2,
    true,
    true,
    ST_SetSRID(ST_MakePoint(-58.3816, -34.6037), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440101',
    'Marco Rossi',
    'marco_dj',
    'marco@example.com',
    'Marco',
    'Rossi',
    'Tango DJ specializing in Golden Age orchestras. Creator of intimate musical journeys.',
    'Italy',
    'Milan',
    'Lombardy',
    'IT',
    'LM',
    '["italian", "english", "spanish"]',
    '["dj", "dancer"]',
    7,
    6,
    12,
    2011,
    '550e8400-e29b-41d4-a716-446655440012',
    true,
    true,
    2,
    true,
    true,
    ST_SetSRID(ST_MakePoint(9.1900, 45.4642), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440102',
    'Amélie Laurent',
    'amelie_paris',
    'amelie@example.com',
    'Amélie',
    'Laurent',
    'Passionate tango dancer from Paris. Love traveling to milongas around the world.',
    'France',
    'Paris',
    'Île-de-France',
    'FR',
    'IDF',
    '["french", "english"]',
    '["dancer", "traveler"]',
    6,
    7,
    8,
    2015,
    '550e8400-e29b-41d4-a716-446655440014',
    false,
    true,
    2,
    true,
    true,
    ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440103',
    '550e8400-e29b-41d4-a716-446655440103',
    'Carlos Mendoza',
    'carlos_org',
    'carlos@example.com',
    'Carlos',
    'Mendoza',
    'Milonga organizer in Barcelona. Creating spaces for the tango community to flourish.',
    'Spain',
    'Barcelona',
    'Catalonia',
    'ES',
    'CT',
    '["spanish", "catalan", "english"]',
    '["organizer", "dancer"]',
    8,
    5,
    18,
    2005,
    '550e8400-e29b-41d4-a716-446655440013',
    true,
    true,
    2,
    true,
    true,
    ST_SetSRID(ST_MakePoint(2.1734, 41.3851), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440104',
    'Sofia Chen',
    'sofia_newbie',
    'sofia@example.com',
    'Sofia',
    'Chen',
    'New to tango but absolutely in love with this beautiful dance. Learning every day!',
    'Canada',
    'Toronto',
    'Ontario',
    'CA',
    'ON',
    '["english", "mandarin"]',
    '["dancer"]',
    2,
    3,
    1,
    2024,
    '550e8400-e29b-41d4-a716-446655440014',
    false,
    true,
    2,
    true,
    true,
    ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)
  );

-- Insert user language preferences
INSERT INTO user_languages (user_id, language_id, proficiency_level) VALUES
  ('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440002', 'native'),
  ('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'fluent'),
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440004', 'native'),
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'fluent'),
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', 'intermediate'),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440003', 'native'),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'fluent');

-- Insert dance experiences
INSERT INTO dance_experiences (
  id, user_id, style, level, years_experience, started_year,
  favorite_orchestras, preferred_venues, achievements
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440200',
    '550e8400-e29b-41d4-a716-446655440100',
    'Argentine Tango',
    'professional',
    20,
    2003,
    '["Di Sarli", "Troilo", "D''Arienzo", "Pugliese"]',
    '["Salon Canning", "La Viruta", "Confitería Ideal"]',
    '["World Tango Championship finalist", "Certified instructor"]'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440101',
    'Argentine Tango',
    'advanced',
    12,
    2011,
    '["Di Sarli", "Canaro", "Fresedo"]',
    '["Tangofabrik", "Circolo Tango"]',
    '["Regional competition winner"]'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440202',
    '550e8400-e29b-41d4-a716-446655440102',
    'Argentine Tango',
    'intermediate',
    8,
    2015,
    '["Troilo", "Di Sarli"]',
    '["Le Tango", "Studio Harmonic"]',
    '["Workshop participant"]'
  );

-- Insert teaching experiences
INSERT INTO teaching_experiences (
  id, user_id, teaching_level, years_teaching, started_teaching_year,
  specializations, certifications, teaching_philosophy
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440210',
    '550e8400-e29b-41d4-a716-446655440100',
    'professional',
    15,
    2008,
    '["Technique", "Musicality", "Connection"]',
    '["ATIDA Certified", "Buenos Aires Conservatory"]',
    'Focus on authentic connection and musical interpretation'
  );

-- Insert DJ experiences
INSERT INTO dj_experiences (
  id, user_id, dj_name, years_experience, started_year,
  music_style, favorite_orchestras, equipment_owned,
  notable_events
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440220',
    '550e8400-e29b-41d4-a716-446655440101',
    'DJ Marco',
    8,
    2015,
    'Golden Age Traditional',
    '["Di Sarli", "Troilo", "D''Arienzo", "Canaro"]',
    '["Pioneer CDJ", "Allen & Heath mixer", "Vinyl collection"]',
    '["Tango Festival Milano", "European Tango Championship"]'
  );

-- Insert organizer experiences
INSERT INTO organizer_experiences (
  id, user_id, organization_name, years_organizing, started_year,
  event_types, venues_managed, notable_achievements
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440230',
    '550e8400-e29b-41d4-a716-446655440103',
    'Barcelona Tango Collective',
    10,
    2013,
    '["Milongas", "Workshops", "Festivals"]',
    '["Palau de la Música", "Centre Civic", "Studio spaces"]',
    '["Barcelona Tango Week", "500+ events organized"]'
  );

-- Insert event types
INSERT INTO event_types (id, name, description, icon) VALUES
  ('550e8400-e29b-41d4-a716-446655440300', 'Milonga', 'Traditional social tango dance event', '💃'),
  ('550e8400-e29b-41d4-a716-446655440301', 'Class', 'Tango lesson or workshop', '🎓'),
  ('550e8400-e29b-41d4-a716-446655440302', 'Practica', 'Practice session for dancers', '🎯'),
  ('550e8400-e29b-41d4-a716-446655440303', 'Festival', 'Multi-day tango event', '🎉'),
  ('550e8400-e29b-41d4-a716-446655440304', 'Performance', 'Tango show or exhibition', '🎭');

-- Insert events
INSERT INTO events (
  id, title, description, organizer_id, event_type_id,
  start_date, end_date, location, address, city, country,
  max_attendees, price, currency, is_free,
  registration_required, is_public, status,
  location_point
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440400',
    'Weekly Milonga at Salon Canning',
    'Traditional milonga every Friday night with live orchestra. Dress code: elegant.',
    '550e8400-e29b-41d4-a716-446655440103',
    '550e8400-e29b-41d4-a716-446655440300',
    '2025-07-04 21:00:00+00',
    '2025-07-05 02:00:00+00',
    'Salon Canning',
    'Scalabrini Ortiz 1331',
    'Buenos Aires',
    'Argentina',
    150,
    25.00,
    'USD',
    false,
    false,
    true,
    'published',
    ST_SetSRID(ST_MakePoint(-58.4173, -34.5875), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440401',
    'Beginner Tango Workshop',
    'Learn the fundamentals of Argentine tango in a welcoming environment.',
    '550e8400-e29b-41d4-a716-446655440100',
    '550e8400-e29b-41d4-a716-446655440301',
    '2025-07-06 14:00:00+00',
    '2025-07-06 16:00:00+00',
    'Tango Studio Paris',
    '123 Rue de la Danse',
    'Paris',
    'France',
    20,
    35.00,
    'EUR',
    false,
    true,
    true,
    'published',
    ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440402',
    'Milan Tango Festival 2025',
    'Three days of workshops, milongas, and performances with international maestros.',
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440303',
    '2025-08-15 18:00:00+00',
    '2025-08-17 23:00:00+00',
    'Teatro alla Scala',
    'Via Filodrammatici 2',
    'Milan',
    'Italy',
    500,
    150.00,
    'EUR',
    false,
    true,
    true,
    'published',
    ST_SetSRID(ST_MakePoint(9.1900, 45.4642), 4326)
  );

-- Insert event participants (RSVPs)
INSERT INTO event_participants (event_id, user_id, status, payment_status) VALUES
  ('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440100', 'confirmed', 'paid'),
  ('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440101', 'confirmed', 'paid'),
  ('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440102', 'pending', 'unpaid'),
  ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440104', 'confirmed', 'paid'),
  ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440100', 'confirmed', 'paid'),
  ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440102', 'waitlist', 'unpaid');

-- Insert groups/communities
INSERT INTO groups (
  id, name, description, creator_id, privacy_level,
  member_count, is_active, group_type,
  location_based, city, country, location_point
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440500',
    'Buenos Aires Tango Masters',
    'Elite community for advanced dancers and professionals in Buenos Aires',
    '550e8400-e29b-41d4-a716-446655440100',
    'private',
    45,
    true,
    'professional',
    true,
    'Buenos Aires',
    'Argentina',
    ST_SetSRID(ST_MakePoint(-58.3816, -34.6037), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440501',
    'European Tango Network',
    'Connecting tango communities across Europe',
    '550e8400-e29b-41d4-a716-446655440101',
    'public',
    312,
    true,
    'community',
    false,
    NULL,
    NULL,
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440502',
    'Tango Beginners Welcome',
    'Supportive community for new tango dancers worldwide',
    '550e8400-e29b-41d4-a716-446655440104',
    'public',
    1247,
    true,
    'beginner',
    false,
    NULL,
    NULL,
    NULL
  );

-- Insert group memberships
INSERT INTO group_members (group_id, user_id, role, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440100', 'admin', 'active'),
  ('550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440103', 'moderator', 'active'),
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440101', 'admin', 'active'),
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440102', 'member', 'active'),
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440103', 'member', 'active'),
  ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440104', 'admin', 'active'),
  ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440102', 'member', 'active');

-- Insert friend relationships
INSERT INTO friends (requester_id, addressee_id, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440103', 'accepted'),
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440102', 'accepted'),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440104', 'accepted'),
  ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440101', 'accepted'),
  ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440100', 'pending');

-- Insert posts
INSERT INTO posts (
  id, user_id, content, visibility, feeling_id,
  activity_id, location, city, country,
  likes_count, comments_count, shares_count,
  hashtags, is_public, location_point
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440600',
    '550e8400-e29b-41d4-a716-446655440100',
    'Beautiful evening at Salon Canning tonight! The energy on the dance floor was absolutely magical. There''s nothing quite like dancing to a live orchestra. 💃✨',
    'public',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440031',
    'Salon Canning',
    'Buenos Aires',
    'Argentina',
    23,
    5,
    2,
    '["milonga", "salonCanning", "liveOrchestra", "tango"]',
    true,
    ST_SetSRID(ST_MakePoint(-58.4173, -34.5875), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440601',
    '550e8400-e29b-41d4-a716-446655440101',
    'Preparing the music for this weekend''s milonga. Spending time with Di Sarli''s recordings never gets old. Each listen reveals new layers of emotion and musicality.',
    'public',
    '550e8400-e29b-41d4-a716-446655440024',
    '550e8400-e29b-41d4-a716-446655440035',
    'Home Studio',
    'Milan',
    'Italy',
    18,
    3,
    1,
    '["djLife", "diSarli", "tangoMusic", "preparation"]',
    true,
    ST_SetSRID(ST_MakePoint(9.1900, 45.4642), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440602',
    '550e8400-e29b-41d4-a716-446655440102',
    'Six months ago I couldn''t even walk to the music. Tonight I danced for three hours straight! Thank you to this amazing community for all the encouragement and patience. 🙏',
    'public',
    '550e8400-e29b-41d4-a716-446655440025',
    '550e8400-e29b-41d4-a716-446655440030',
    'Le Tango Paris',
    'Paris',
    'France',
    31,
    8,
    4,
    '["progress", "gratitude", "tangoJourney", "community"]',
    true,
    ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)
  ),
  (
    '550e8400-e29b-41d4-a716-446655440603',
    '550e8400-e29b-41d4-a716-446655440104',
    'First time at a real milonga tonight! I was so nervous but everyone was incredibly welcoming. Already planning my next visit. This community is special. ❤️',
    'friends',
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440031',
    'Tango Libre Toronto',
    'Toronto',
    'Canada',
    12,
    4,
    0,
    '["firstMilonga", "nervous", "welcoming", "community"]',
    false,
    ST_SetSRID(ST_MakePoint(-79.3832, 43.6532), 4326)
  );

-- Insert post likes
INSERT INTO post_likes (post_id, user_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440101'),
  ('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440102'),
  ('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440103'),
  ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440100'),
  ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440102'),
  ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440100'),
  ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440101'),
  ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440104'),
  ('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440102');

-- Insert post comments
INSERT INTO post_comments (
  id, post_id, user_id, content, likes_count
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440700',
    '550e8400-e29b-41d4-a716-446655440600',
    '550e8400-e29b-41d4-a716-446655440101',
    'I was there too! The orchestra was incredible tonight.',
    3
  ),
  (
    '550e8400-e29b-41d4-a716-446655440701',
    '550e8400-e29b-41d4-a716-446655440600',
    '550e8400-e29b-41d4-a716-446655440102',
    'Wish I could have been there! Next time for sure.',
    1
  ),
  (
    '550e8400-e29b-41d4-a716-446655440702',
    '550e8400-e29b-41d4-a716-446655440602',
    '550e8400-e29b-41d4-a716-446655440100',
    'Your progress has been amazing to watch! Keep dancing!',
    2
  ),
  (
    '550e8400-e29b-41d4-a716-446655440703',
    '550e8400-e29b-41d4-a716-446655440603',
    '550e8400-e29b-41d4-a716-446655440102',
    'The first milonga is always special! Welcome to the community.',
    1
  );

-- Insert chat rooms
INSERT INTO chat_rooms (
  id, name, description, creator_id, room_type,
  is_private, max_members, member_count
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440800',
    'Buenos Aires Events',
    'Discuss upcoming milongas and events in BA',
    '550e8400-e29b-41d4-a716-446655440100',
    'topic',
    false,
    100,
    15
  ),
  (
    '550e8400-e29b-41d4-a716-446655440801',
    'Elena & Marco',
    'Private conversation',
    '550e8400-e29b-41d4-a716-446655440100',
    'direct',
    true,
    2,
    2
  ),
  (
    '550e8400-e29b-41d4-a716-446655440802',
    'Beginner Tips',
    'Share advice for new tango dancers',
    '550e8400-e29b-41d4-a716-446655440104',
    'topic',
    false,
    50,
    28
  );

-- Insert chat room users
INSERT INTO chat_room_users (chat_room_id, user_id, role, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440800', '550e8400-e29b-41d4-a716-446655440100', 'admin', 'active'),
  ('550e8400-e29b-41d4-a716-446655440800', '550e8400-e29b-41d4-a716-446655440103', 'member', 'active'),
  ('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440100', 'member', 'active'),
  ('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440101', 'member', 'active'),
  ('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440104', 'admin', 'active'),
  ('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440102', 'member', 'active');

-- Insert chat messages
INSERT INTO chat_messages (
  id, chat_room_id, sender_id, content, message_type
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440900',
    '550e8400-e29b-41d4-a716-446655440800',
    '550e8400-e29b-41d4-a716-446655440100',
    'Don''t forget about the special milonga this Friday at Salon Canning!',
    'text'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440901',
    '550e8400-e29b-41d4-a716-446655440800',
    '550e8400-e29b-41d4-a716-446655440103',
    'Thanks for the reminder! I''ll be there organizing the welcome table.',
    'text'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440902',
    '550e8400-e29b-41d4-a716-446655440801',
    '550e8400-e29b-41d4-a716-446655440101',
    'Elena, I have that Di Sarli recording you asked about. I can bring it to the next milonga.',
    'text'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440903',
    '550e8400-e29b-41d4-a716-446655440802',
    '550e8400-e29b-41d4-a716-446655440104',
    'What''s the best advice for following the line of dance at your first milonga?',
    'text'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440904',
    '550e8400-e29b-41d4-a716-446655440802',
    '550e8400-e29b-41d4-a716-446655440102',
    'Stay aware of the couples around you and try to maintain consistent spacing. Don''t rush!',
    'text'
  );

-- Insert notifications
INSERT INTO notifications (
  id, recipient_id, sender_id, type, title, message,
  is_read, action_url
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440950',
    '550e8400-e29b-41d4-a716-446655440100',
    '550e8400-e29b-41d4-a716-446655440101',
    'comment',
    'New comment on your post',
    'Marco commented on your post about Salon Canning',
    false,
    '/posts/550e8400-e29b-41d4-a716-446655440600'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440951',
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440100',
    'friend_request',
    'Friend request',
    'Elena Rodriguez sent you a friend request',
    false,
    '/friends/requests'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440952',
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440100',
    'event_invitation',
    'Event invitation',
    'You''re invited to the Beginner Tango Workshop',
    true,
    '/events/550e8400-e29b-41d4-a716-446655440401'
  );

-- Update engagement counts for posts (these would be maintained by triggers in real scenario)
UPDATE posts SET 
  likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id),
  comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id)
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440600',
  '550e8400-e29b-41d4-a716-446655440601',
  '550e8400-e29b-41d4-a716-446655440602',
  '550e8400-e29b-41d4-a716-446655440603'
);

-- Update member counts for groups (these would be maintained by triggers in real scenario)
UPDATE groups SET 
  member_count = (SELECT COUNT(*) FROM group_members WHERE group_id = groups.id AND status = 'active')
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440500',
  '550e8400-e29b-41d4-a716-446655440501',
  '550e8400-e29b-41d4-a716-446655440502'
);

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================
-- 
-- This seed data creates a realistic tango community with:
-- - 5 diverse users representing different roles and experience levels
-- - Authentic tango experiences and credentials
-- - 3 upcoming events across different cities
-- - Active community groups and memberships
-- - Social connections and friendships
-- - Engaging posts with likes and comments
-- - Real-time chat conversations
-- - Notification system examples
-- 
-- All data uses proper UUID relationships and follows
-- the Supabase schema structure with RLS policies.
-- =====================================================