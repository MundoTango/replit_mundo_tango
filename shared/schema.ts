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
  unique,
  real,
  numeric
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
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
  suspended: boolean("suspended").default(false),
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
  occupation: varchar("occupation", { length: 255 }), // Adding missing occupation field
  termsAccepted: boolean("terms_accepted").default(false), // Adding missing terms accepted field
  // Stripe integration fields
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionStatus: varchar("subscription_status", { length: 50 }), // active, canceled, past_due, etc
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default('free'), // free, basic, enthusiast, professional, enterprise
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roles table for comprehensive role management
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  description: text("description").notNull(),
  isPlatformRole: boolean("is_platform_role").default(false),
  // Permission fields
  permissions: jsonb("permissions").default({}).notNull(),
  memoryAccessLevel: text("memory_access_level").default("basic"),
  emotionalTagAccess: boolean("emotional_tag_access").default(false),
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

// ESA Project Tracker - Projects table (Layer 1: Database Architecture)
export const projects = pgTable("projects", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // Platform, Section, Feature, Project, Task, Sub-task
  status: varchar("status", { length: 50 }).notNull(), // Completed, In Progress, Planned, Blocked
  layer: integer("layer"), // ESA Framework layer (1-56)
  phase: integer("phase"), // ESA Framework phase (1-21)
  completion: integer("completion").default(0),
  mobileCompletion: integer("mobile_completion").default(0),
  priority: varchar("priority", { length: 20 }), // Critical, High, Medium, Low
  team: jsonb("team").default([]), // Array of team member IDs or names
  parentId: varchar("parent_id", { length: 255 }), // Reference to parent project
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  metadata: jsonb("metadata").default({}), // Additional flexible data
  tags: text("tags").array(),
  blockers: text("blockers").array(),
  notes: text("notes"),
  gitCommits: jsonb("git_commits").default([]), // Auto-captured commits
  attachments: jsonb("attachments").default([]), // File attachments
  dependencies: varchar("dependencies", { length: 255 }).array(), // Other project IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_projects_status").on(table.status),
  index("idx_projects_parent_id").on(table.parentId),
  index("idx_projects_layer").on(table.layer),
  index("idx_projects_priority").on(table.priority),
  index("idx_projects_assigned_to").on(table.assignedTo),
  index("idx_projects_created_at").on(table.createdAt),
]);

// Project Activity Log for tracking changes
export const projectActivity = pgTable("project_activity", {
  id: serial("id").primaryKey(),
  projectId: varchar("project_id", { length: 255 }).references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // created, updated, completed, blocked, etc
  field: varchar("field", { length: 100 }), // Which field was changed
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  description: text("description"),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("idx_project_activity_project_id").on(table.projectId),
  index("idx_project_activity_user_id").on(table.userId),
  index("idx_project_activity_timestamp").on(table.timestamp),
]);

// Export TypeScript types for Projects (ESA Layer 1: Database Architecture)
export const insertProjectSchema = createInsertSchema(projects).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const insertProjectActivitySchema = createInsertSchema(projectActivity).omit({
  id: true,
  timestamp: true,
});
export type InsertProjectActivity = z.infer<typeof insertProjectActivitySchema>;
export type ProjectActivity = typeof projectActivity.$inferSelect;

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
  roleId: uuid("role_id").references(() => roles.id), // Added for compatibility
  isPrimary: boolean("is_primary").default(false), // Added for primary role tracking
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: integer("assigned_by").references(() => users.id),
}, (table) => [
  unique().on(table.userId, table.roleName),
  index("idx_user_roles_user_id").on(table.userId),
  index("idx_user_roles_role_name").on(table.roleName),
  index("idx_user_roles_role_id").on(table.roleId),
]);

// Code of Conduct Agreements table for legal compliance tracking
export const codeOfConductAgreements = pgTable("code_of_conduct_agreements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  guidelineType: varchar("guideline_type", { length: 50 }).notNull(),
  guidelineTitle: varchar("guideline_title", { length: 255 }).notNull(),
  guidelineDescription: text("guideline_description").notNull(),
  agreed: boolean("agreed").notNull().default(true),
  agreementVersion: varchar("agreement_version", { length: 10 }).notNull().default("1.0"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.guidelineType, table.agreementVersion),
  index("idx_coc_agreements_user_id").on(table.userId),
  index("idx_coc_agreements_created_at").on(table.createdAt),
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
  mediaEmbeds: jsonb("media_embeds").default([]), // ESA LIFE CEO 56x21 - Now storing all media URLs here
  mentions: text("mentions").array().default([]), // @mentions
  hashtags: text("hashtags").array().default([]),
  location: text("location"),
  coordinates: jsonb("coordinates"), // GPS coordinates from Google Maps
  placeId: text("place_id"), // Google Maps Place ID
  formattedAddress: text("formatted_address"), // Standardized address
  visibility: varchar("visibility", { length: 20 }).default("public"), // public, friends, private
  postType: varchar("post_type", { length: 50 }).default("memory"), // memory, story, announcement, event_update
  likes: integer("likes").default(0), // Adding missing likes field
  comments: integer("comments").default(0), // Adding missing comments field  
  shares: integer("shares").default(0), // Adding missing shares field
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
  index("idx_posts_post_type").on(table.postType),
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
  isFeatured: boolean("is_featured").default(false),
  // Event Pages features (Facebook Groups/Pages style)
  hasEventPage: boolean("has_event_page").default(false), // Whether this event has a dedicated page
  eventPageSlug: varchar("event_page_slug", { length: 255 }).unique(), // Unique slug for event page URL
  eventPageDescription: text("event_page_description"), // Extended description for event page
  eventPageRules: text("event_page_rules"), // Rules and guidelines for event page
  eventPageCoverImage: text("event_page_cover_image"), // Cover image for event page
  allowEventPagePosts: boolean("allow_event_page_posts").default(true), // Allow users to post on event page
  requirePostApproval: boolean("require_post_approval").default(false), // Require admin approval for posts
  eventVisualMarker: varchar("event_visual_marker", { length: 20 }).default("default"), // Visual marker/color for event type (milonga=red, practica=blue, workshop=green)
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

// Event Page Admins table for RBAC/ABAC controls and delegation
export const eventPageAdmins = pgTable("event_page_admins", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("moderator"), // owner, admin, moderator, content_manager
  permissions: jsonb("permissions").default({
    canManageEvent: false,
    canManageAdmins: false,
    canApproveContent: true,
    canDeleteContent: false,
    canManageRSVPs: false,
    canPostAnnouncements: true,
    canEditEventDetails: false,
    canInviteParticipants: true,
    canBanUsers: false
  }).notNull(),
  delegatedBy: integer("delegated_by").references(() => users.id), // Who delegated this role
  delegatedAt: timestamp("delegated_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration for temporary delegations
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Delegation notes or special instructions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId, table.role),
  index("idx_event_page_admins_event").on(table.eventId),
  index("idx_event_page_admins_user").on(table.userId),
  index("idx_event_page_admins_role").on(table.role),
  index("idx_event_page_admins_active").on(table.isActive),
]);

// Event Page Posts table for community content on event pages
export const eventPagePosts = pgTable("event_page_posts", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  postType: varchar("post_type", { length: 50 }).default("discussion"), // discussion, announcement, photo, question, poll
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array().default([]),
  isApproved: boolean("is_approved").default(true), // Auto-approved unless event requires approval
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isPinned: boolean("is_pinned").default(false),
  pinnedBy: integer("pinned_by").references(() => users.id),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  reportsCount: integer("reports_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_event_page_posts_event").on(table.eventId),
  index("idx_event_page_posts_user").on(table.userId),
  index("idx_event_page_posts_type").on(table.postType),
  index("idx_event_page_posts_approved").on(table.isApproved),
  index("idx_event_page_posts_created").on(table.createdAt),
]);

// User followed cities table
export const userFollowedCities = pgTable("user_followed_cities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Settings table for comprehensive user preferences
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  
  // Notification settings
  notifications: jsonb("notifications").default({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    newFollowerAlerts: true,
    messageAlerts: true,
    groupInvites: true,
    weeklyDigest: false,
    marketingEmails: false,
    // TTFiles-inspired additions
    mentionAlerts: true,
    replyNotifications: true,
    systemUpdates: true,
    securityAlerts: true
  }).notNull(),
  
  // Privacy settings
  privacy: jsonb("privacy").default({
    profileVisibility: 'public',
    showLocation: true,
    showEmail: false,
    showPhone: false,
    allowMessagesFrom: 'friends',
    showActivityStatus: true,
    allowTagging: true,
    showInSearch: true,
    // TTFiles-inspired additions
    shareAnalytics: false,
    dataExportEnabled: true,
    thirdPartySharing: false
  }).notNull(),
  
  // Appearance settings
  appearance: jsonb("appearance").default({
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    fontSize: 'medium',
    reduceMotion: false,
    // TTFiles-inspired additions
    colorScheme: 'ocean',
    compactMode: false,
    showAnimations: true,
    customAccentColor: null
  }).notNull(),
  
  // Advanced settings (TTFiles-inspired)
  advanced: jsonb("advanced").default({
    developerMode: false,
    betaFeatures: false,
    performanceMode: 'balanced',
    cacheSize: 'medium',
    offlineMode: false,
    syncFrequency: 'realtime',
    exportFormat: 'json',
    apiAccess: false,
    webhooksEnabled: false
  }).notNull(),
  
  // Accessibility settings
  accessibility: jsonb("accessibility").default({
    screenReaderOptimized: false,
    highContrast: false,
    keyboardNavigation: true,
    focusIndicators: true,
    altTextMode: 'enhanced',
    audioDescriptions: false,
    captionsEnabled: true
  }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_settings_user_id").on(table.userId),
]);

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
// Event Admins table for delegation features
export const eventAdmins = pgTable("event_admins", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // owner, admin, moderator
  permissions: jsonb("permissions").default({}).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  unique().on(table.eventId, table.userId),
  index("idx_event_admins_event_id").on(table.eventId),
  index("idx_event_admins_user_id").on(table.userId),
]);

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

// n8n Integration tables
export const n8nWebhookLogs = pgTable('n8n_webhook_logs', {
  id: serial('id').primaryKey(),
  workflowId: varchar('workflow_id', { length: 255 }),
  webhookPath: varchar('webhook_path', { length: 255 }),
  method: varchar('method', { length: 10 }),
  headers: jsonb('headers'),
  body: jsonb('body'),
  responseStatus: integer('response_status'),
  responseBody: jsonb('response_body'),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const n8nIntegrationStatus = pgTable('n8n_integration_status', {
  id: serial('id').primaryKey(),
  serviceName: varchar('service_name', { length: 100 }).unique().notNull(),
  isActive: boolean('is_active').default(true),
  lastSync: timestamp('last_sync'),
  syncStatus: varchar('sync_status', { length: 50 }),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  updatedAt: timestamp('updated_at').defaultNow(),
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
  connectionDegree: integer("connection_degree").default(1), // 1st, 2nd, 3rd degree
  closenessScore: real("closeness_score").default(0), // 0-100 based on interactions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueFriendship: unique().on(table.userId, table.friendId),
}));

// Friend Requests table with detailed information
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'snoozed'
  // Dance information
  didWeDance: boolean("did_we_dance"),
  danceLocation: text("dance_location"), // Event or city name
  danceEventId: integer("dance_event_id").references(() => events.id),
  danceStory: text("dance_story"),
  // Media attachments
  mediaUrls: text("media_urls").array().default([]),
  // Private notes (not visible to other party)
  senderPrivateNote: text("sender_private_note"),
  receiverPrivateNote: text("receiver_private_note"),
  // Messages
  senderMessage: text("sender_message"),
  receiverMessage: text("receiver_message"),
  // Snooze functionality
  snoozedUntil: timestamp("snoozed_until"),
  snoozeReminderSent: boolean("snooze_reminder_sent").default(false),
  // Timestamps
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRequest: unique().on(table.senderId, table.receiverId),
  idxSender: index("idx_friend_requests_sender").on(table.senderId),
  idxReceiver: index("idx_friend_requests_receiver").on(table.receiverId),
  idxStatus: index("idx_friend_requests_status").on(table.status),
  idxSnoozed: index("idx_friend_requests_snoozed").on(table.snoozedUntil),
}));

// Friendship Activities table to track all interactions
export const friendshipActivities = pgTable("friendship_activities", {
  id: serial("id").primaryKey(),
  friendshipId: integer("friendship_id").notNull().references(() => friends.id, { onDelete: "cascade" }),
  activityType: text("activity_type").notNull(), // 'post_tag', 'comment', 'like', 'event_together', 'message'
  activityData: jsonb("activity_data").default({}), // Store relevant data for each activity type
  points: integer("points").default(1), // Weight for closeness calculation
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  idxFriendship: index("idx_friendship_activities_friendship").on(table.friendshipId),
  idxType: index("idx_friendship_activities_type").on(table.activityType),
  idxCreatedAt: index("idx_friendship_activities_created").on(table.createdAt),
}));

// Friendship Media table for photos/videos shared in friend requests
export const friendshipMedia = pgTable("friendship_media", {
  id: serial("id").primaryKey(),
  friendRequestId: integer("friend_request_id").references(() => friendRequests.id, { onDelete: "cascade" }),
  friendshipId: integer("friendship_id").references(() => friends.id, { onDelete: "cascade" }),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // 'photo', 'video'
  caption: text("caption"),
  phase: text("phase").notNull().default("request"), // 'request', 'acceptance', 'friendship'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  idxRequest: index("idx_friendship_media_request").on(table.friendRequestId),
  idxFriendship: index("idx_friendship_media_friendship").on(table.friendshipId),
}));

// Memories table
export const memories = pgTable("memories", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  richContent: jsonb("rich_content"),
  emotionTags: text("emotion_tags").array(),
  emotionVisibility: text("emotion_visibility").default('everyone'),
  trustCircleLevel: integer("trust_circle_level"),
  location: jsonb("location"),
  mediaUrls: text("media_urls").array(),
  coTaggedUsers: integer("co_tagged_users").array(),
  consentRequired: boolean("consent_required").default(false),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  consentStatus: text("consent_status").default('not_required'),
  approvedConsents: jsonb("approved_consents"),
  deniedConsents: jsonb("denied_consents"),
  pendingConsents: jsonb("pending_consents"),
  tenantId: uuid("tenant_id"),
});

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

export const insertFriendRequestSchema = createInsertSchema(friendRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
});

export const insertFriendshipActivitySchema = createInsertSchema(friendshipActivities).omit({
  id: true,
  createdAt: true,
});

export const insertFriendshipMediaSchema = createInsertSchema(friendshipMedia).omit({
  id: true,
  createdAt: true,
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
  type: varchar("type", { length: 50 }).notNull().default("city"), // city, community, interest, role, etc.
  roleType: varchar("role_type", { length: 50 }), // teacher, organizer, dj, performer, etc.
  emoji: varchar("emoji", { length: 10 }).default("🏙️"),
  imageUrl: text("image_url"),
  coverImage: text("coverImage"), // Cover photo for group detail pages
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  visibility: varchar("visibility", { length: 20 }).default("public"), // Adding missing visibility field
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  memberCount: integer("member_count").default(0),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_groups_type").on(table.type),
  index("idx_groups_role_type").on(table.roleType),
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

// Host Homes table for accommodation listings
export const hostHomes = pgTable("host_homes", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull(),
  lat: real("lat"),
  lng: real("lng"),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`),
  amenities: text("amenities").array().default(sql`ARRAY[]::text[]`),
  maxGuests: integer("max_guests").default(1),
  pricePerNight: integer("price_per_night"), // in cents
  availability: jsonb("availability").default({}), // dates available
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_host_homes_host").on(table.hostId),
  index("idx_host_homes_city").on(table.city),
  index("idx_host_homes_active").on(table.isActive),
  index("idx_host_homes_location").on(table.lat, table.lng),
]);

// Recommendations table for user posts with recommendations
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => posts.id),
  groupId: integer("group_id").references(() => groups.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // restaurant, venue, school, event, etc.
  address: text("address"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull(),
  lat: real("lat"),
  lng: real("lng"),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`),
  rating: integer("rating"), // 1-5 stars
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_recommendations_user").on(table.userId),
  index("idx_recommendations_post").on(table.postId),
  index("idx_recommendations_group").on(table.groupId),
  index("idx_recommendations_city").on(table.city),
  index("idx_recommendations_type").on(table.type),
  index("idx_recommendations_location").on(table.lat, table.lng),
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

export const updateCustomRoleRequestSchema = createInsertSchema(customRoleRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedBy: true,
}).partial();

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

// Host Homes schema
export const insertHostHomeSchema = createInsertSchema(hostHomes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Guest Bookings table
export const guestBookings = pgTable("guest_bookings", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").references(() => users.id).notNull(),
  hostHomeId: integer("host_home_id").references(() => hostHomes.id).notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  guestCount: integer("guest_count").notNull().default(1),
  purpose: text("purpose").notNull(),
  message: text("message").notNull(),
  hasReadRules: boolean("has_read_rules").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, cancelled, completed
  hostResponse: text("host_response"),
  totalPrice: integer("total_price"), // in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
}, (table) => [
  index("idx_guest_bookings_guest").on(table.guestId),
  index("idx_guest_bookings_home").on(table.hostHomeId),
  index("idx_guest_bookings_status").on(table.status),
  index("idx_guest_bookings_dates").on(table.checkInDate, table.checkOutDate),
]);

// Guest Bookings schema
export const insertGuestBookingSchema = createInsertSchema(guestBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  hostResponse: true,
  totalPrice: true,
  respondedAt: true,
});

// Recommendations schema
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type FriendRequest = typeof friendRequests.$inferSelect;
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type FriendshipActivity = typeof friendshipActivities.$inferSelect;
export type InsertFriendshipActivity = z.infer<typeof insertFriendshipActivitySchema>;
export type FriendshipMedia = typeof friendshipMedia.$inferSelect;
export type InsertFriendshipMedia = z.infer<typeof insertFriendshipMediaSchema>;
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

// Event Page system types
export type EventPageAdmin = typeof eventPageAdmins.$inferSelect;
export type InsertEventPageAdmin = typeof eventPageAdmins.$inferInsert;
export type EventPagePost = typeof eventPagePosts.$inferSelect;
export type InsertEventPagePost = typeof eventPagePosts.$inferInsert;

// Event Page insert schemas
export const insertEventPageAdminSchema = createInsertSchema(eventPageAdmins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  delegatedAt: true,
});

export const insertEventPagePostSchema = createInsertSchema(eventPagePosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likesCount: true,
  commentsCount: true,
  reportsCount: true,
});

// Custom role types
export type CustomRoleRequest = typeof customRoleRequests.$inferSelect;
export type InsertCustomRoleRequest = z.infer<typeof insertCustomRoleRequestSchema>;
export type UpdateCustomRoleRequest = z.infer<typeof updateCustomRoleRequestSchema>;

// Code of Conduct Agreement types
export const insertCodeOfConductAgreementSchema = createInsertSchema(codeOfConductAgreements).omit({
  id: true,
  createdAt: true,
});

export type CodeOfConductAgreement = typeof codeOfConductAgreements.$inferSelect;
export type InsertCodeOfConductAgreement = z.infer<typeof insertCodeOfConductAgreementSchema>;

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

// Life CEO Agent Memory Storage
export const life_ceo_agent_memories = pgTable("life_ceo_agent_memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentType: varchar("agent_type", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  content: jsonb("content").notNull(),
  importance: real("importance").default(0.5),
  tags: text("tags").array().default([]),
  embedding: jsonb("embedding"), // Store as JSONB for now, can be migrated to vector later
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => [
  index("idx_agent_memory_user_agent").on(table.userId, table.agentType),
  index("idx_agent_memory_importance").on(table.importance),
  index("idx_agent_memory_created").on(table.createdAt),
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

// Multi-Tenant Platform Tables
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  logo_url: text("logo_url"),
  primary_color: text("primary_color").default('#FF1744'),
  secondary_color: text("secondary_color").default('#3F51B5'),
  domain: text("domain").unique(),
  is_active: boolean("is_active").default(true),
  settings: jsonb("settings").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_tenants_slug").on(table.slug),
  index("idx_tenants_is_active").on(table.is_active),
]);

export const tenantUsers = pgTable("tenant_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenant_id: uuid("tenant_id").references(() => tenants.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default('member'),
  is_admin: boolean("is_admin").default(false),
  display_in_feed: boolean("display_in_feed").default(true),
  notification_preferences: jsonb("notification_preferences").default({email: true, push: true}).notNull(),
  expertise_level: text("expertise_level").default('beginner'),
  interests: text("interests").array().default([]),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.tenant_id, table.user_id),
  index("idx_tenant_users_tenant_id").on(table.tenant_id),
  index("idx_tenant_users_user_id").on(table.user_id),
]);

export const userViewPreferences = pgTable("user_view_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  view_mode: text("view_mode").notNull().default('single_community'),
  selected_tenant_id: uuid("selected_tenant_id").references(() => tenants.id),
  selected_tenant_ids: uuid("selected_tenant_ids").array().default([]),
  custom_filters: jsonb("custom_filters").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.user_id),
  index("idx_user_view_preferences_user_id").on(table.user_id),
]);

export const contentSharing = pgTable("content_sharing", {
  id: uuid("id").primaryKey().defaultRandom(),
  content_type: text("content_type").notNull(),
  content_id: uuid("content_id").notNull(),
  source_tenant_id: uuid("source_tenant_id").references(() => tenants.id).notNull(),
  shared_tenant_id: uuid("shared_tenant_id").references(() => tenants.id).notNull(),
  shared_by: integer("shared_by").references(() => users.id),
  is_approved: boolean("is_approved").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.content_type, table.content_id, table.shared_tenant_id),
  index("idx_content_sharing_content_id").on(table.content_id),
  index("idx_content_sharing_source_tenant_id").on(table.source_tenant_id),
  index("idx_content_sharing_shared_tenant_id").on(table.shared_tenant_id),
]);

export const communityConnections = pgTable("community_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenant_id_1: uuid("tenant_id_1").references(() => tenants.id).notNull(),
  tenant_id_2: uuid("tenant_id_2").references(() => tenants.id).notNull(),
  relationship_type: text("relationship_type").notNull(),
  is_bidirectional: boolean("is_bidirectional").default(true),
  settings: jsonb("settings").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.tenant_id_1, table.tenant_id_2),
]);

export const userJourneys = pgTable("user_journeys", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  locations: jsonb("locations").array().default([]),
  tenant_ids: uuid("tenant_ids").array().default([]),
  journey_type: text("journey_type").default('travel'),
  status: text("status").default('planning'),
  is_public: boolean("is_public").default(false),
  settings: jsonb("settings").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_journeys_user_id").on(table.user_id),
  // Note: GIN index for tenant_ids array would be added via migration
]);

export const journeyActivities = pgTable("journey_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  journey_id: uuid("journey_id").references(() => userJourneys.id).notNull(),
  tenant_id: uuid("tenant_id").references(() => tenants.id),
  activity_type: text("activity_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: jsonb("location"),
  start_datetime: timestamp("start_datetime"),
  end_datetime: timestamp("end_datetime"),
  external_url: text("external_url"),
  content_reference_id: uuid("content_reference_id"),
  content_reference_type: text("content_reference_type"),
  settings: jsonb("settings").default({}).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_journey_activities_journey_id").on(table.journey_id),
  index("idx_journey_activities_tenant_id").on(table.tenant_id),
]);

// Multi-Tenant Schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTenantUserSchema = createInsertSchema(tenantUsers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserViewPreferencesSchema = createInsertSchema(userViewPreferences).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertContentSharingSchema = createInsertSchema(contentSharing).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCommunityConnectionSchema = createInsertSchema(communityConnections).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertUserJourneySchema = createInsertSchema(userJourneys).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertJourneyActivitySchema = createInsertSchema(journeyActivities).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Multi-Tenant Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;
export type UserViewPreferences = typeof userViewPreferences.$inferSelect;
export type InsertUserViewPreferences = z.infer<typeof insertUserViewPreferencesSchema>;
export type ContentSharing = typeof contentSharing.$inferSelect;
export type InsertContentSharing = z.infer<typeof insertContentSharingSchema>;
export type CommunityConnection = typeof communityConnections.$inferSelect;
export type InsertCommunityConnection = z.infer<typeof insertCommunityConnectionSchema>;
export type UserJourney = typeof userJourneys.$inferSelect;
export type InsertUserJourney = z.infer<typeof insertUserJourneySchema>;
export type JourneyActivity = typeof journeyActivities.$inferSelect;
export type InsertJourneyActivity = z.infer<typeof insertJourneyActivitySchema>;

// Daily activities tracking for project management
export const dailyActivities = pgTable("daily_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  project_id: text("project_id").notNull(),
  project_title: text("project_title").notNull(),
  activity_type: text("activity_type").notNull(), // created, updated, completed, reviewed, blocked
  description: text("description").notNull(),
  changes: jsonb("changes").array().default([]), // Array of change descriptions
  team: text("team").array().default([]),
  tags: text("tags").array().default([]),
  completion_before: integer("completion_before"),
  completion_after: integer("completion_after"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}).notNull(),
}, (table) => [
  index("idx_daily_activities_user_id").on(table.user_id),
  index("idx_daily_activities_timestamp").on(table.timestamp),
  index("idx_daily_activities_project_id").on(table.project_id),
]);

// Host reviews for marketplace
export const hostReviews = pgTable("host_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  home_id: integer("home_id").references(() => hostHomes.id).notNull(),
  reviewer_id: integer("reviewer_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review_text: text("review_text"),
  cleanliness_rating: integer("cleanliness_rating"),
  communication_rating: integer("communication_rating"),
  location_rating: integer("location_rating"),
  value_rating: integer("value_rating"),
  host_response: text("host_response"),
  host_response_at: timestamp("host_response_at"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_host_reviews_home_id").on(table.home_id),
  index("idx_host_reviews_reviewer_id").on(table.reviewer_id),
  unique().on(table.home_id, table.reviewer_id),
]);

// Guest profiles for personalized preferences
export const guestProfiles = pgTable("guest_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accommodationPreferences: jsonb("accommodation_preferences").default({}),
  dietaryRestrictions: text("dietary_restrictions").array().default([]),
  languagesSpoken: text("languages_spoken").array().default([]),
  travelInterests: text("travel_interests").array().default([]),
  emergencyContact: jsonb("emergency_contact").default({}),
  specialNeeds: text("special_needs"),
  preferredNeighborhoods: text("preferred_neighborhoods").array().default([]),
  budgetRange: jsonb("budget_range").default({}),
  stayDurationPreference: varchar("stay_duration_preference", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  onboardingCompleted: boolean("onboarding_completed").default(false),
}, (table) => [
  index("idx_guest_profiles_user_id").on(table.userId),
  unique().on(table.userId),
]);

// Insert schemas
export const insertDailyActivitySchema = createInsertSchema(dailyActivities).omit({
  id: true,
  timestamp: true,
});

export const insertHostReviewSchema = createInsertSchema(hostReviews).omit({
  id: true,
  created_at: true,
});

export const insertGuestProfileSchema = createInsertSchema(guestProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type DailyActivity = typeof dailyActivities.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type HostHome = typeof hostHomes.$inferSelect;
export type InsertHostHome = z.infer<typeof insertHostHomeSchema>;
export type GuestBooking = typeof guestBookings.$inferSelect;
export type InsertGuestBooking = z.infer<typeof insertGuestBookingSchema>;
export type HostReview = typeof hostReviews.$inferSelect;
export type InsertHostReview = z.infer<typeof insertHostReviewSchema>;
export type GuestProfile = typeof guestProfiles.$inferSelect;
export type InsertGuestProfile = z.infer<typeof insertGuestProfileSchema>;

// User Settings schema
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

// Performance metrics table for intelligent monitoring
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),
  metricType: text("metric_type").notNull(), // api_response, cache_hit, db_query, etc.
  endpoint: text("endpoint"),
  responseTime: numeric("response_time", { precision: 10, scale: 2 }),
  cacheHitRate: numeric("cache_hit_rate", { precision: 5, scale: 2 }),
  memoryUsage: numeric("memory_usage", { precision: 10, scale: 2 }),
  activeConnections: integer("active_connections"),
  errorCount: integer("error_count").default(0),
  metadata: jsonb("metadata"), // Additional metric-specific data
  anomalyDetected: boolean("anomaly_detected").default(false),
  autoFixed: boolean("auto_fixed").default(false),
  severity: text("severity"), // low, medium, high, critical
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow()
}, (table) => [
  index("idx_performance_metrics_timestamp").on(table.timestamp),
  index("idx_performance_metrics_type").on(table.metricType),
  index("idx_performance_metrics_anomaly").on(table.anomalyDetected)
]);

export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  timestamp: true,
  createdAt: true
});
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricsSchema>;

// Export from hostHomes module
export { homeAmenities, homePhotos } from './schema/hostHomes';

// Export from travelDetails module
export { travelDetails } from './travelDetails';

// Subscriptions table (matching existing database)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  planId: varchar("plan_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  paymentProvider: varchar("payment_provider", { length: 50 }).notNull(),
  providerSubscriptionId: varchar("provider_subscription_id", { length: 255 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment methods table (matching existing database)
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  provider: varchar("provider", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  lastFour: varchar("last_four", { length: 4 }),
  brand: varchar("brand", { length: 50 }),
  country: varchar("country", { length: 2 }),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false),
  providerPaymentMethodId: varchar("provider_payment_method_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments/transactions table for payment history
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).unique(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).notNull().default('usd'),
  status: varchar("status", { length: 50 }).notNull(), // succeeded, pending, failed, etc
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_payments_user_id").on(table.userId),
  index("idx_payments_subscription_id").on(table.subscriptionId),
  index("idx_payments_stripe_payment_intent_id").on(table.stripePaymentIntentId),
]);

// Subscription features table for feature gating
export const subscriptionFeatures = pgTable("subscription_features", {
  id: serial("id").primaryKey(),
  featureName: varchar("feature_name", { length: 255 }).unique().notNull(),
  description: text("description"),
  tiers: text("tiers").array().notNull(), // Array of tiers that have access to this feature
  limitValue: integer("limit_value"), // NULL for unlimited, number for limited features
  limitUnit: varchar("limit_unit", { length: 50 }), // 'count', 'mb', 'minutes', etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Webhook events table for Stripe webhook tracking
export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  stripeEventId: varchar("stripe_event_id", { length: 255 }).unique().notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_webhook_events_stripe_event_id").on(table.stripeEventId),
  index("idx_webhook_events_processed").on(table.processed),
]);

// Insert schemas for payment tables
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionFeatureSchema = createInsertSchema(subscriptionFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  createdAt: true,
});

// Types for payment tables
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SubscriptionFeature = typeof subscriptionFeatures.$inferSelect;
export type InsertSubscriptionFeature = z.infer<typeof insertSubscriptionFeatureSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;

// Export language-related tables and types from languageSchema
export {
  languages,
  userLanguagePreferences,
  translations,
  contentTranslations,
  translationVotes,
  languageAnalytics,
  lunfardoDictionary,
  type Language,
  type InsertLanguage,
  type UserLanguagePreference,
  type InsertUserLanguagePreference,
  type Translation,
  type InsertTranslation,
  type ContentTranslation,
  type InsertContentTranslation,
  type TranslationVote,
  type InsertTranslationVote,
  type LanguageAnalytics,
  type InsertLanguageAnalytics,
  type LunfardoDictionary,
  type InsertLunfardoDictionary
} from './languageSchema';

// TestSprite test results table
export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  testId: text("test_id").notNull().unique(),
  eventType: text("event_type"),
  status: text("status").notNull(), // passed, failed, running
  testSuite: text("test_suite"),
  passed: integer("passed").default(0),
  failed: integer("failed").default(0),
  skipped: integer("skipped").default(0),
  duration: text("duration"),
  errorDetails: jsonb("error_details"),
  testTimestamp: timestamp("test_timestamp"),
  receivedAt: timestamp("received_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = typeof testResults.$inferInsert;
