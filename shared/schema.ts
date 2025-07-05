import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  varchar,
  jsonb,
  index,
  uuid,
  unique
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  mobileNo: varchar("mobile_no", { length: 20 }),
  profileImage: text("profile_image"),
  backgroundImage: text("background_image"),
  bio: text("bio"),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  facebookUrl: text("facebook_url"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  deviceType: varchar("device_type", { length: 20 }),
  deviceToken: text("device_token"),
  apiToken: text("api_token"),
  replitId: varchar("replit_id", { length: 255 }).unique(),
  // New onboarding fields for redesigned registration
  nickname: varchar("nickname", { length: 100 }),
  languages: text("languages").array(),
  tangoRoles: text("tango_roles").array(),
  leaderLevel: integer("leader_level").default(0),
  followerLevel: integer("follower_level").default(0),
  yearsOfDancing: integer("years_of_dancing").default(0),
  startedDancingYear: integer("started_dancing_year"),
  state: varchar("state", { length: 100 }),
  countryCode: varchar("country_code", { length: 10 }),
  stateCode: varchar("state_code", { length: 10 }),
  formStatus: integer("form_status").default(0),
  isOnboardingComplete: boolean("is_onboarding_complete").default(false),
  codeOfConductAccepted: boolean("code_of_conduct_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roles table for comprehensive role management
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  description: text("description").notNull(),
  isPlatformRole: boolean("is_platform_role").default(false),
  // Custom role fields
  isCustom: boolean("is_custom").default(false),
  customName: text("custom_name"),
  customDescription: text("custom_description"),
  isApproved: boolean("is_approved").default(false),
  submittedBy: integer("submitted_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Role Requests table for admin approval workflow
export const customRoleRequests = pgTable("custom_role_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleName: text("role_name").notNull(),
  roleDescription: text("role_description").notNull(),
  submittedBy: integer("submitted_by").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedBy: integer("rejected_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_custom_role_requests_status").on(table.status),
  index("idx_custom_role_requests_submitted_by").on(table.submittedBy),
  index("idx_custom_role_requests_created_at").on(table.createdAt),
]);

// User Profiles table for role-based authentication (enhanced)
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  role: varchar("role", { length: 50 }).default("guest"), // Legacy single role support
  roles: text("roles").array().default(['guest']), // Multi-role support
  primaryRole: text("primary_role").default("guest"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_profiles_user_id").on(table.userId),
  index("idx_user_profiles_role").on(table.role),
  index("idx_user_profiles_primary_role").on(table.primaryRole),
]);

// User Roles junction table for multi-role management
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleName: text("role_name").references(() => roles.name).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: integer("assigned_by").references(() => users.id),
}, (table) => [
  unique().on(table.userId, table.roleName),
  index("idx_user_roles_user_id").on(table.userId),
  index("idx_user_roles_role_name").on(table.roleName),
]);

// Enhanced Posts table with rich text and multimedia support
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id), // Optional event association
  content: text("content").notNull(),
  richContent: jsonb("rich_content"), // Rich text editor content
  plainText: text("plain_text"), // Extracted plain text for search
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  mediaEmbeds: jsonb("media_embeds").default([]), // Social media embeds
  mentions: text("mentions").array().default([]), // @mentions
  hashtags: text("hashtags").array().default([]),
  location: text("location"),
  coordinates: jsonb("coordinates"), // GPS coordinates from Google Maps
  placeId: text("place_id"), // Google Maps Place ID
  formattedAddress: text("formatted_address"), // Standardized address
  visibility: varchar("visibility", { length: 20 }).default("public"), // public, friends, private
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  isPublic: boolean("is_public").default(true),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_posts_user_created").on(table.userId, table.createdAt),
  index("idx_posts_visibility").on(table.visibility),
  index("idx_posts_hashtags").on(table.hashtags),
]);

// Activities/Categories table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"),
  name: varchar("name", { length: 255 }).notNull(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attachments table
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  instanceType: varchar("instance_type", { length: 50 }),
  instanceId: integer("instance_id"),
  mediaType: varchar("media_type", { length: 50 }),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  eventType: varchar("event_type", { length: 50 }).default("milonga"), // practica, milonga, marathon, encuentro, festival, competition, workshop, clase, social
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  date: text("date"), // Legacy date field for backward compatibility
  location: text("location"),
  venue: varchar("venue", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  latitude: text("latitude"),
  longitude: text("longitude"),
  price: text("price"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  ticketUrl: text("ticket_url"),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  isPublic: boolean("is_public").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  ageRestriction: integer("age_restriction"),
  dressCode: varchar("dress_code", { length: 100 }),
  musicStyle: varchar("music_style", { length: 100 }),
  level: varchar("level", { length: 50 }), // beginner, intermediate, advanced, all_levels
  specialGuests: text("special_guests"),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  websiteUrl: text("website_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  cancellationPolicy: text("cancellation_policy"),
  refundPolicy: text("refund_policy"),
  accessibilityInfo: text("accessibility_info"),
  parkingInfo: text("parking_info"),
  tags: text("tags").array(),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern", { length: 50 }), // weekly, monthly, none
  seriesId: integer("series_id"), // For recurring events
  status: varchar("status", { length: 20 }).default("active"), // active, cancelled, postponed, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs table
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // going, interested, maybe, not_going
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId),
  index("idx_event_rsvps_event_id").on(table.eventId),
  index("idx_event_rsvps_user_id").on(table.userId),
]);

// Event Invitations table
export const eventInvitations = pgTable("event_invitations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  inviterId: integer("inviter_id").references(() => users.id).notNull(),
  inviteeId: integer("invitee_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, declined
  message: text("message"),
  sentAt: timestamp("sent_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// User followed cities table
export const userFollowedCities = pgTable("user_followed_cities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event series table for recurring events
export const eventSeries = pgTable("event_series", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pattern: varchar("pattern", { length: 50 }).notNull(), // weekly, monthly, custom
  venue: varchar("venue", { length: 255 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Participants table for role tagging system
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // DJ, teacher, musician, performer, organizer, etc.
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, declined
  invitedBy: integer("invited_by").references(() => users.id).notNull(),
  invitedAt: timestamp("invited_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId, table.role),
  index("idx_event_participants_user_id").on(table.userId),
  index("idx_event_participants_event_id").on(table.eventId),
  index("idx_event_participants_status").on(table.status),
]);

// Chat rooms table
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // single, group
  status: varchar("status", { length: 30 }),
  memberLimit: integer("member_limit").default(1024),
  canMemberEditGroup: boolean("can_member_edit_group").default(true),
  canMemberSendMessage: boolean("can_member_send_message").default(true),
  canMemberAddMember: boolean("can_member_add_member").default(true),
  lastMessageTimestamp: timestamp("last_message_timestamp"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  chatRoomSlug: varchar("chat_room_slug", { length: 100 }).references(() => chatRooms.slug).notNull(),
  userSlug: varchar("user_slug", { length: 100 }).notNull(),
  messageType: varchar("message_type", { length: 30 }).notNull(),
  message: text("message"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileThumb: text("file_thumb"),
  isForwarded: boolean("is_forwarded").default(false),
  isReply: boolean("is_reply").default(false),
  replyMessageSlug: varchar("reply_message_slug", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat room users table
export const chatRoomUsers = pgTable("chat_room_users", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  chatRoomSlug: varchar("chat_room_slug", { length: 100 }).references(() => chatRooms.slug).notNull(),
  userSlug: varchar("user_slug", { length: 100 }).notNull(),
  isOwner: boolean("is_owner").default(false),
  isSubAdmin: boolean("is_sub_admin").default(false),
  status: varchar("status", { length: 30 }).notNull(),
  unreadMessageCount: integer("unread_message_count").default(0),
  isLeaved: boolean("is_leaved").default(false),
  isKicked: boolean("is_kicked").default(false),
  isBlocked: boolean("is_blocked").default(false),
  isVisible: boolean("is_visible").default(true),
  lastMessageTimestamp: timestamp("last_message_timestamp"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Follows table
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post likes table
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments table
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  parentId: integer("parent_id"),
  mentions: text("mentions").array().default([]),
  gifUrl: text("gif_url"),
  imageUrl: text("image_url"),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dance experiences table
export const danceExperiences = pgTable("dance_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  socialDancingCities: text("social_dancing_cities").array(),
  recentWorkshopCities: text("recent_workshop_cities").array(),
  favouriteDancingCities: text("favourite_dancing_cities").array(),
  annualEventCount: integer("annual_event_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Creator experiences table
export const creatorExperiences = pgTable("creator_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  shoesUrl: text("shoes_url"),
  clothingUrl: text("clothing_url"),
  jewelry: text("jewelry"),
  vendorActivities: text("vendor_activities"),
  vendorUrl: text("vendor_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stories table
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull(), // image, video
  caption: text("caption"),
  viewsCount: integer("views_count").default(0),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Story views table
export const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Additional specialized experience tables from original database
export const djExperiences = pgTable("dj_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  performedEvents: integer("performed_events").default(0),
  cities: text("cities"),
  favouriteOrchestra: varchar("favourite_orchestra", { length: 255 }),
  favouriteSinger: varchar("favourite_singer", { length: 255 }),
  milongaSize: varchar("milonga_size", { length: 255 }),
  useExternalEquipments: boolean("use_external_equipments").default(false),
  djSoftwares: text("dj_softwares"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teachingExperiences = pgTable("teaching_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  partnerFacebookUrl: varchar("partner_facebook_url", { length: 255 }),
  cities: text("cities"),
  onlinePlatforms: text("online_platforms"),
  aboutTangoFuture: text("about_tango_future"),
  teachingReason: text("teaching_reason"),
  preferredSize: integer("preferred_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const performerExperiences = pgTable("performer_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  partnerProfileLink: text("partner_profile_link"),
  recentPerformanceUrl: varchar("recent_performance_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const photographerExperiences = pgTable("photographer_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 20 }).default("photographer"), // photographer, videographer, both
  facebookProfileUrl: varchar("facebook_profile_url", { length: 255 }),
  videosTakenCount: integer("videos_taken_count"),
  cities: text("cities"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tourOperatorExperiences = pgTable("tour_operator_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  cities: text("cities"),
  websiteUrl: varchar("website_url", { length: 255 }),
  theme: text("theme"),
  vendorActivities: varchar("vendor_activities", { length: 255 }),
  vendorUrl: varchar("vendor_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Blocked users table
export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  blockedUserId: integer("blocked_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User API tokens for session management  
export const userApiTokens = pgTable("user_api_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  apiToken: text("api_token").notNull(),
  deviceType: varchar("device_type", { length: 100 }),
  deviceToken: text("device_token"),
  type: varchar("type", { length: 20 }).default("ACCESS"), // ACCESS, RESET, INVITE
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Media assets table for Supabase Storage metadata
export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  originalFilename: text("original_filename").notNull(),
  path: text("path").notNull(),
  url: text("url").notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),
  contentType: text("content_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  size: integer("size").notNull(),
  folder: text("folder").notNull().default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Media tags table for tagging system
export const mediaTags = pgTable("media_tags", {
  id: serial("id").primaryKey(),
  mediaId: text("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  uniqueTag: unique().on(table.mediaId, table.tag),
}));

// Media usage tracking for relating media to specific content
export const mediaUsage = pgTable("media_usage", {
  id: serial("id").primaryKey(),
  mediaId: text("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  usedIn: text("used_in").notNull(), // 'memory', 'event', 'profile', 'experience'
  refId: integer("ref_id").notNull(), // Reference to the specific record ID
  context: text("context"), // Additional context like 'event_promo', 'profile_background'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUsage: unique().on(table.mediaId, table.usedIn, table.refId),
}));

// Friends table for mutual visibility logic
export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendId: integer("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'blocked'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueFriendship: unique().on(table.userId, table.friendId),
}));

// Memory media junction table for reusing media across memories
export const memoryMedia = pgTable("memory_media", {
  id: serial("id").primaryKey(),
  memoryId: integer("memory_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  mediaId: text("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
  taggedBy: integer("tagged_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueMemoryMedia: unique().on(table.memoryId, table.mediaId),
}));

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  events: many(events),
  eventRsvps: many(eventRsvps),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  postLikes: many(postLikes),
  postComments: many(postComments),
  danceExperience: many(danceExperiences),
  creatorExperience: many(creatorExperiences),
  stories: many(stories),
  storyViews: many(storyViews),
  mediaAssets: many(mediaAssets),
  friendships: many(friends, { relationName: "user_friendships" }),
  friendOf: many(friends, { relationName: "friend_of" }),
  groupMemberships: many(groupMembers),
  createdGroups: many(groups),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  user: one(users, { fields: [mediaAssets.userId], references: [users.id] }),
  tags: many(mediaTags),
  usage: many(mediaUsage),
}));

export const mediaTagsRelations = relations(mediaTags, ({ one }) => ({
  media: one(mediaAssets, { fields: [mediaTags.mediaId], references: [mediaAssets.id] }),
}));

export const mediaUsageRelations = relations(mediaUsage, ({ one }) => ({
  media: one(mediaAssets, { fields: [mediaUsage.mediaId], references: [mediaAssets.id] }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, { fields: [friends.userId], references: [users.id] }),
  friend: one(users, { fields: [friends.friendId], references: [users.id] }),
}));

export const memoryMediaRelations = relations(memoryMedia, ({ one }) => ({
  memory: one(posts, { fields: [memoryMedia.memoryId], references: [posts.id] }),
  media: one(mediaAssets, { fields: [memoryMedia.mediaId], references: [mediaAssets.id] }),
  tagger: one(users, { fields: [memoryMedia.taggedBy], references: [users.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  likes: many(postLikes),
  comments: many(postComments),
  attachments: many(attachments),
  memoryMedia: many(memoryMedia),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] }),
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, { fields: [eventRsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
});



export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentAttendees: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMediaTagSchema = createInsertSchema(mediaTags).omit({
  id: true,
  createdAt: true,
});

export const insertMediaUsageSchema = createInsertSchema(mediaUsage).omit({
  id: true,
  createdAt: true,
});

export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMemoryMediaSchema = createInsertSchema(memoryMedia).omit({
  id: true,
  createdAt: true,
});

// Enhanced comment schema for rich commenting system
export const insertCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Post and Comment Reactions table for enhanced engagement
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => posts.id),
  commentId: integer("comment_id").references(() => postComments.id),
  type: varchar("type", { length: 20 }).notNull(), // like, dislike, love, laugh, angry, sad
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_reactions_user").on(table.userId),
  index("idx_reactions_post").on(table.postId),
  index("idx_reactions_comment").on(table.commentId),
  unique().on(table.userId, table.postId, table.type),
  unique().on(table.userId, table.commentId, table.type),
]);

// Post Reports table for moderation system
export const postReports = pgTable("post_reports", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id),
  commentId: integer("comment_id").references(() => postComments.id),
  reporterId: integer("reporter_id").references(() => users.id).notNull(),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, reviewed, resolved, dismissed
  moderatorId: integer("moderator_id").references(() => users.id),
  moderatorNotes: text("moderator_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_reports_post").on(table.postId),
  index("idx_reports_comment").on(table.commentId),
  index("idx_reports_status").on(table.status),
  index("idx_reports_created").on(table.createdAt),
]);

// Notifications table for real-time updates
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // comment, like, mention, follow, event_invite
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data").default({}), // Additional data for the notification
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"), // URL to navigate when clicked
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notifications_user").on(table.userId),
  index("idx_notifications_unread").on(table.userId, table.isRead),
  index("idx_notifications_type").on(table.type),
  index("idx_notifications_created").on(table.createdAt),
]);

// Groups table for city-based and community groups
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  type: varchar("type", { length: 50 }).notNull().default("city"), // city, community, interest, etc.
  emoji: varchar("emoji", { length: 10 }).default("🏙️"),
  imageUrl: text("image_url"),
  coverImage: text("coverImage"), // Cover photo for group detail pages
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  memberCount: integer("member_count").default(0),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_groups_type").on(table.type),
  index("idx_groups_city").on(table.city),
  index("idx_groups_slug").on(table.slug),
  index("idx_groups_created_at").on(table.createdAt),
]);

// Group Members table for user-group relationships
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 50 }).default("member"), // member, admin, moderator
  joinedAt: timestamp("joined_at").defaultNow(),
  invitedBy: integer("invited_by").references(() => users.id),
  status: varchar("status", { length: 20 }).default("active"), // active, pending, banned
}, (table) => [
  unique().on(table.groupId, table.userId),
  index("idx_group_members_user").on(table.userId),
  index("idx_group_members_group").on(table.groupId),
  index("idx_group_members_role").on(table.role),
  index("idx_group_members_status").on(table.status),
]);

// Chat History table for tracking all conversations
export const chatHistory = pgTable("chat_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  userId: integer("user_id").references(() => users.id),
  userMessage: text("user_message"),
  assistantMessage: text("assistant_message"),
  messageType: varchar("message_type", { length: 50 }).default("conversation"), // conversation, system, error
  context: jsonb("context"), // Additional context like file attachments, tool calls
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  projectState: jsonb("project_state"), // Snapshot of project state at time of message
  toolsUsed: text("tools_used").array(), // Track which tools were used
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_chat_history_session").on(table.sessionId),
  index("idx_chat_history_user").on(table.userId),
  index("idx_chat_history_timestamp").on(table.timestamp),
  index("idx_chat_history_type").on(table.messageType),
]);

// Reaction schema for post and comment reactions  
export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
});

// Report schema for content moderation
export const insertReportSchema = createInsertSchema(postReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notification schema for real-time alerts
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  assignedAt: true,
});

export const insertCustomRoleRequestSchema = createInsertSchema(customRoleRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Group schemas
export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberCount: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

// Chat History schema
export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

// Group relations
export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, { fields: [groups.createdBy], references: [users.id] }),
  members: many(groupMembers),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
  inviter: one(users, { fields: [groupMembers.invitedBy], references: [users.id] }),
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type UserWithRoles = User & {
  roles?: string[];
};
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;

// Replit Auth specific types
export type ReplitUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
};
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type PostReport = typeof postReports.$inferSelect;
export type InsertPostReport = z.infer<typeof insertReportSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Follow = typeof follows.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type StoryView = typeof storyViews.$inferSelect;
export type DanceExperience = typeof danceExperiences.$inferSelect;
export type CreatorExperience = typeof creatorExperiences.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaTag = typeof mediaTags.$inferSelect;
export type InsertMediaTag = z.infer<typeof insertMediaTagSchema>;
export type MediaUsage = typeof mediaUsage.$inferSelect;
export type InsertMediaUsage = z.infer<typeof insertMediaUsageSchema>;
export type Friend = typeof friends.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type MemoryMedia = typeof memoryMedia.$inferSelect;
export type InsertMemoryMedia = z.infer<typeof insertMemoryMediaSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

// Event Participants schemas and types for role tagging system
export const insertEventParticipantSchema = createInsertSchema(eventParticipants, {
  role: z.string().min(1, "Role is required"),
  status: z.enum(["pending", "accepted", "declined"]).default("pending"),
});

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;

// Additional event-related types
export type EventInvitation = typeof eventInvitations.$inferSelect;
export type InsertEventInvitation = typeof eventInvitations.$inferInsert;
export type UserFollowedCity = typeof userFollowedCities.$inferSelect;
export type InsertUserFollowedCity = typeof userFollowedCities.$inferInsert;
export type EventSeries = typeof eventSeries.$inferSelect;
export type InsertEventSeries = typeof eventSeries.$inferInsert;

// Custom role types
export type CustomRoleRequest = typeof customRoleRequests.$inferSelect;
export type InsertCustomRoleRequest = z.infer<typeof insertCustomRoleRequestSchema>;
export type UpdateCustomRoleRequest = z.infer<typeof updateCustomRoleRequestSchema>;

// 11L Project Tracker System - Master tracking for all Mundo Tango features
export const projectTrackerItems = pgTable("project_tracker_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // Feature, Prompt, Automation, Agent, UI, Schema
  layer: varchar("layer", { length: 100 }).notNull(), // Layer 1-11 with name
  createdOn: timestamp("created_on").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  reviewStatus: varchar("review_status", { length: 50 }).notNull().default("Pending"), // Pending, Needs Review, Approved, Deprecated
  reviewedBy: text("reviewed_by"),
  version: varchar("version", { length: 20 }).notNull().default("v1.0.0"),
  mvpScope: boolean("mvp_scope").notNull().default(false),
  mvpStatus: varchar("mvp_status", { length: 50 }).notNull().default("In Progress"), // In Progress, Ready, Signed Off, Deferred
  mvpSignedOffBy: text("mvp_signed_off_by"),
  summary: text("summary").notNull(),
  metadata: jsonb("metadata"), // Additional technical details, dependencies, etc.
  codeLocation: text("code_location"), // File paths where this is implemented
  apiEndpoints: text("api_endpoints").array(), // Related API endpoints
  dependencies: text("dependencies").array(), // What this depends on
  relatedItems: text("related_items").array(), // UUIDs of related tracker items
  tags: text("tags").array(), // Searchable tags
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, critical
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  completionPercentage: integer("completion_percentage").default(0),
  blockers: text("blockers").array(), // Current blocking issues
  notes: text("notes"), // Implementation notes
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
}, (table) => [
  index("idx_tracker_layer").on(table.layer),
  index("idx_tracker_type").on(table.type),
  index("idx_tracker_review_status").on(table.reviewStatus),
  index("idx_tracker_mvp_scope").on(table.mvpScope),
  index("idx_tracker_mvp_status").on(table.mvpStatus),
  index("idx_tracker_priority").on(table.priority),
  index("idx_tracker_completion").on(table.completionPercentage),
  index("idx_tracker_created_on").on(table.createdOn),
  index("idx_tracker_last_updated").on(table.lastUpdated),
]);

// Project Tracker Change Log for version control
export const projectTrackerChangelog = pgTable("project_tracker_changelog", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").references(() => projectTrackerItems.id).notNull(),
  changeType: varchar("change_type", { length: 50 }).notNull(), // created, updated, deleted, reviewed, mvp_status_change
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  changedBy: integer("changed_by").references(() => users.id),
  changeReason: text("change_reason"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("idx_changelog_item").on(table.itemId),
  index("idx_changelog_type").on(table.changeType),
  index("idx_changelog_timestamp").on(table.timestamp),
]);

// Live Agent Actions for real-time tracking
export const liveAgentActions = pgTable("live_agent_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentName: varchar("agent_name", { length: 100 }).notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(), // feature_detection, classification, tracking, analysis
  targetType: varchar("target_type", { length: 50 }).notNull(), // component, api, schema, automation
  targetPath: text("target_path"), // File path or identifier
  detectedChanges: jsonb("detected_changes"),
  autoClassification: jsonb("auto_classification"), // AI-determined layer, type, etc.
  confidence: integer("confidence"), // 0-100 confidence in classification
  requiresReview: boolean("requires_review").default(true),
  trackerItemId: uuid("tracker_item_id").references(() => projectTrackerItems.id),
  sessionId: varchar("session_id", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_actions_agent").on(table.agentName),
  index("idx_agent_actions_type").on(table.actionType),
  index("idx_agent_actions_session").on(table.sessionId),
  index("idx_agent_actions_timestamp").on(table.timestamp),
]);

// Project Tracker Schemas
export const insertProjectTrackerItemSchema = createInsertSchema(projectTrackerItems).omit({
  id: true,
  createdOn: true,
  lastUpdated: true,
});

export const insertProjectTrackerChangelogSchema = createInsertSchema(projectTrackerChangelog).omit({
  id: true,
  timestamp: true,
});

export const insertLiveAgentActionSchema = createInsertSchema(liveAgentActions).omit({
  id: true,
  timestamp: true,
});

// Life CEO Chat System Tables
export const lifeCeoAgentConfigurations = pgTable("life_ceo_agent_configurations", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: varchar("agent_id", { length: 100 }).notNull().unique(),
  configurationData: jsonb("configuration_data").notNull().default({}),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_agent_config_id").on(table.agentId),
  index("idx_agent_config_updated").on(table.lastUpdated),
]);

export const lifeCeoChatMessages = pgTable("life_ceo_chat_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_chat_user_agent").on(table.userId, table.agentId),
  index("idx_chat_timestamp").on(table.timestamp),
  index("idx_chat_agent").on(table.agentId),
]);

export const lifeCeoConversations = pgTable("life_ceo_conversations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastMessage: timestamp("last_message").defaultNow().notNull(),
}, (table) => [
  index("idx_conv_user").on(table.userId),
  index("idx_conv_agent").on(table.agentId),
  index("idx_conv_last_message").on(table.lastMessage),
]);

// Life CEO Chat System Schemas
export const insertLifeCeoAgentConfigSchema = createInsertSchema(lifeCeoAgentConfigurations).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertLifeCeoChatMessageSchema = createInsertSchema(lifeCeoChatMessages).omit({
  createdAt: true,
});

export const insertLifeCeoConversationSchema = createInsertSchema(lifeCeoConversations).omit({
  createdAt: true,
  lastMessage: true,
});

// Project Tracker Types
export type ProjectTrackerItem = typeof projectTrackerItems.$inferSelect;
export type InsertProjectTrackerItem = z.infer<typeof insertProjectTrackerItemSchema>;
export type ProjectTrackerChangelog = typeof projectTrackerChangelog.$inferSelect;
export type InsertProjectTrackerChangelog = z.infer<typeof insertProjectTrackerChangelogSchema>;
export type LiveAgentAction = typeof liveAgentActions.$inferSelect;
export type InsertLiveAgentAction = z.infer<typeof insertLiveAgentActionSchema>;

// Life CEO Chat System Types
export type LifeCeoAgentConfiguration = typeof lifeCeoAgentConfigurations.$inferSelect;
export type InsertLifeCeoAgentConfiguration = z.infer<typeof insertLifeCeoAgentConfigSchema>;
export type LifeCeoChatMessage = typeof lifeCeoChatMessages.$inferSelect;
export type InsertLifeCeoChatMessage = z.infer<typeof insertLifeCeoChatMessageSchema>;
export type LifeCeoConversation = typeof lifeCeoConversations.$inferSelect;
export type InsertLifeCeoConversation = z.infer<typeof insertLifeCeoConversationSchema>;
