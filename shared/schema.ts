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

// User Profiles table for role-based authentication
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  role: varchar("role", { length: 50 }).default("guest"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_profiles_user_id").on(table.userId),
  index("idx_user_profiles_role").on(table.role),
]);

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  hashtags: text("hashtags").array(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_posts_user_created").on(table.userId, table.createdAt),
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
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  price: text("price"),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  isPublic: boolean("is_public").default(true),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs table
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // going, interested, not_going
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  likes: many(postLikes),
  comments: many(postComments),
  attachments: many(attachments),
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

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
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
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
