# Mundo Tango Database Migration

This directory contains the complete database migration from TrangoTech MySQL to Supabase PostgreSQL.

## Files

- `supabase_migration.sql` - Complete migration script for Supabase
- `table_relationships.md` - Documentation of all table relationships
- `migration_notes.md` - Important changes and improvements made

## Migration Overview

**Total Tables:** 55 tables converted from MySQL to PostgreSQL  
**Primary Keys:** All converted to UUID format  
**Authentication:** Integrated with Supabase Auth  
**Security:** Full Row-Level Security (RLS) implementation  

## Key Improvements

### 1. Modern PostgreSQL Features
- UUID primary keys throughout
- JSONB columns for flexible data storage
- PostGIS for geographic data
- Comprehensive indexes for performance

### 2. Supabase Integration
- Native auth.users integration
- RLS policies for data security
- Real-time subscriptions ready
- Edge function compatibility

### 3. Data Security
- Friend-based content visibility
- User blocking enforcement
- Admin moderation tools
- Privacy controls

## Table Categories

### Core User Management (8 tables)
- `users` - Extended user profiles
- `user_groups` - Role definitions
- `user_api_tokens` - API authentication
- `user_otps` - OTP verification
- `blocked_users` - User blocking
- `user_languages` - Language preferences
- `user_travels` - Travel planning
- `settings` - User preferences

### Content & Social (12 tables)
- `posts` - Social media posts
- `post_likes` - Like engagement
- `post_comments` - Comment system
- `post_comment_likes` - Comment likes
- `post_shares` - Share tracking
- `saved_posts` - Bookmarked content
- `hidden_posts` - Hidden content
- `attachments` - Media files
- `activities` - Hashtags/categories
- `feelings` - Mood indicators
- `friends` - Social connections
- `notifications` - Real-time alerts

### Groups & Communities (4 tables)
- `groups` - Community groups
- `group_members` - Membership management
- `group_visitors` - Visit tracking
- `pinned_groups` - User preferences

### Events System (4 tables)
- `events` - Event management
- `event_types` - Event categories
- `event_participants` - RSVP system
- `event_activities` - Event tags

### Messaging System (4 tables)
- `chat_rooms` - Chat environments
- `chat_room_users` - Room membership
- `chat_messages` - Message content
- `chat_message_statuses` - Read receipts

### Tango Experience (9 tables)
- `dance_experiences` - Dance levels
- `teaching_experiences` - Teaching credentials
- `dj_experiences` - DJ profiles
- `performer_experiences` - Performance history
- `photographer_experiences` - Photography services
- `tour_operator_experiences` - Travel services
- `creator_experiences` - Content creators
- `organizer_experiences` - Event organizers
- `host_experiences` - Accommodation hosts

### Activities & Interests (3 tables)
- `tango_activities` - Tango-specific activities
- `non_tango_activities` - General interests
- `group_activities` - Group-related activities

### System & Admin (11 tables)
- `reports` - Content moderation
- `report_types` - Report categories
- `faqs` - Help documentation
- `pages` - Static content
- `help_supports` - Support tickets
- `lookups` - Reference data
- `learning_sources` - Educational resources
- `invites` - User invitations
- `languages` - Language definitions

## Deployment Instructions

1. Open Supabase SQL Editor
2. Run `supabase_migration.sql` in full
3. Verify all tables created successfully
4. Test RLS policies with sample data
5. Update application connection strings

## Next Steps

After successful migration:
1. Generate seed data for testing
2. Update application API endpoints
3. Test authentication flow
4. Verify real-time subscriptions
5. Deploy to production

## Support

For migration questions or issues, refer to the original TrangoTech schema in `attached_assets/mundotango_db_*.sql`.