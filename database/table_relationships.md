# Table Relationships and Foreign Keys

This document details all foreign key relationships in the Mundo Tango Supabase database.

## Core User Management Relationships

### users table
- `auth_user_id` → `auth.users(id)` (Supabase Auth integration)
- `user_type` → `user_groups(type)` (User role definition)

### user_api_tokens table
- `user_id` → `users(id)` (Token ownership)

### user_otps table
- `user_id` → `users(id)` (OTP ownership)

### blocked_users table
- `user_id` → `users(id)` (User who blocked)
- `blocked_user_id` → `users(id)` (User who was blocked)

### user_languages table
- `user_id` → `users(id)` (User reference)
- `language_id` → `languages(id)` (Language reference)

### user_travels table
- `user_id` → `users(id)` (Traveler reference)

### settings table
- `user_id` → `users(id)` (Settings owner)

## Content & Social Relationships

### posts table
- `user_id` → `users(id)` (Post author)
- `group_id` → `groups(id)` (Group post)
- `event_id` → `events(id)` (Event post)
- `activity_id` → `activities(id)` (Tagged activity)
- `feeling_id` → `feelings(id)` (Mood indicator)
- `user_travel_id` → `user_travels(id)` (Travel post)
- `shared_by` → `users(id)` (User who shared)
- `original_post_id` → `posts(id)` (Original shared post)

### post_likes table
- `post_id` → `posts(id)` (Liked post)
- `user_id` → `users(id)` (User who liked)

### post_comments table
- `post_id` → `posts(id)` (Commented post)
- `user_id` → `users(id)` (Comment author)
- `parent_comment_id` → `post_comments(id)` (Reply to comment)

### post_comment_likes table
- `comment_id` → `post_comments(id)` (Liked comment)
- `user_id` → `users(id)` (User who liked)

### post_shares table
- `post_id` → `posts(id)` (Shared post)
- `user_id` → `users(id)` (User who shared)

### saved_posts table
- `post_id` → `posts(id)` (Saved post)
- `user_id` → `users(id)` (User who saved)

### hidden_posts table
- `post_id` → `posts(id)` (Hidden post)
- `user_id` → `users(id)` (User who hid)

### activities table
- `parent_id` → `activities(id)` (Hierarchical categories)

### friends table
- `requester_id` → `users(id)` (Friend request sender)
- `addressee_id` → `users(id)` (Friend request recipient)

### notifications table
- `recipient_id` → `users(id)` (Notification recipient)
- `sender_id` → `users(id)` (Notification sender)

## Groups & Communities Relationships

### groups table
- `creator_id` → `users(id)` (Group creator)

### group_members table
- `group_id` → `groups(id)` (Group reference)
- `user_id` → `users(id)` (Member reference)

### group_visitors table
- `group_id` → `groups(id)` (Visited group)
- `user_id` → `users(id)` (Visitor reference)

### pinned_groups table
- `user_id` → `users(id)` (User who pinned)
- `group_id` → `groups(id)` (Pinned group)

### group_activities table
- `group_id` → `groups(id)` (Group reference)
- `activity_id` → `activities(id)` (Activity reference)

## Events System Relationships

### events table
- `organizer_id` → `users(id)` (Event organizer)
- `event_type_id` → `event_types(id)` (Event category)

### event_participants table
- `event_id` → `events(id)` (Event reference)
- `user_id` → `users(id)` (Participant reference)

### event_activities table
- `event_id` → `events(id)` (Event reference)
- `activity_id` → `activities(id)` (Activity tag)

## Messaging System Relationships

### chat_rooms table
- `creator_id` → `users(id)` (Room creator)

### chat_room_users table
- `chat_room_id` → `chat_rooms(id)` (Room reference)
- `user_id` → `users(id)` (User reference)

### chat_messages table
- `chat_room_id` → `chat_rooms(id)` (Room reference)
- `sender_id` → `users(id)` (Message sender)
- `reply_to_id` → `chat_messages(id)` (Replied message)

### chat_message_statuses table
- `message_id` → `chat_messages(id)` (Message reference)
- `user_id` → `users(id)` (Status owner)

## Tango Experience Relationships

All experience tables follow the same pattern:
- `user_id` → `users(id)` (Experience owner)

### Tables:
- `dance_experiences`
- `teaching_experiences`
- `dj_experiences`
- `performer_experiences`
- `photographer_experiences`
- `tour_operator_experiences`
- `creator_experiences`
- `organizer_experiences`
- `host_experiences`

## System & Admin Relationships

### reports table
- `reporter_id` → `users(id)` (User who reported)
- `reported_user_id` → `users(id)` (Reported user)
- `report_type_id` → `report_types(id)` (Report category)
- `resolved_by` → `users(id)` (Admin who resolved)

### help_supports table
- `user_id` → `users(id)` (Support requester)
- `responded_by` → `users(id)` (Support agent)

### lookups table
- `parent_id` → `lookups(id)` (Hierarchical lookup data)

### invites table
- `inviter_id` → `users(id)` (User who invited)
- `accepted_by` → `users(id)` (User who accepted)

## Cascade Behavior

### ON DELETE CASCADE
Most user-related tables use CASCADE to maintain referential integrity:
- When a user is deleted, their posts, comments, likes, etc. are also deleted
- When a post is deleted, its comments and likes are also deleted
- When a group is deleted, its members and activities are also deleted

### ON DELETE SET NULL
Some relationships preserve data with NULL references:
- When a shared post's original is deleted, the share remains with NULL original_post_id
- When a replied-to message is deleted, replies remain with NULL reply_to_id

## Indexes for Performance

Key indexes are created for:
- All foreign key columns
- Frequently queried combinations (user_id + created_at)
- Geographic data (PostGIS indexes)
- Full-text search columns
- Status and visibility filters

## Unique Constraints

Critical unique constraints prevent duplicate data:
- `(user_id, blocked_user_id)` in blocked_users
- `(post_id, user_id)` in post_likes
- `(requester_id, addressee_id)` in friends
- `(event_id, user_id)` in event_participants
- `(chat_room_id, user_id)` in chat_room_users