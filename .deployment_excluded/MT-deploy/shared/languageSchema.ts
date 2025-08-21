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
  numeric
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Languages table - stores all supported languages
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }).unique().notNull(), // e.g., 'en', 'es', 'es-ar' for Spanish with lunfardo
  countryCode: varchar("country_code", { length: 10 }),
  direction: varchar("direction", { length: 10 }).default("ltr"), // ltr or rtl
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_languages_code").on(table.code),
  index("idx_languages_active").on(table.isActive),
]);

// User language preferences
export const userLanguagePreferences = pgTable("user_language_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  primaryLanguageId: integer("primary_language_id").references(() => languages.id).notNull(),
  secondaryLanguages: integer("secondary_languages").array(),
  interfaceLanguageId: integer("interface_language_id").references(() => languages.id).notNull(), // UI language
  contentLanguageIds: integer("content_language_ids").array(), // Languages for viewing content
  autoTranslate: boolean("auto_translate").default(true),
  showOriginalWithTranslation: boolean("show_original_with_translation").default(false),
  preferredTranslationService: varchar("preferred_translation_service", { length: 50 }).default("google"), // google, deepl, openai
  detectedFromIp: varchar("detected_from_ip", { length: 100 }), // Country detected from IP
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_user_language_pref").on(table.userId),
  index("idx_user_lang_pref_user").on(table.userId),
]);

// Translations table for static UI content
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(), // e.g., "common.save", "profile.editProfile"
  languageId: integer("language_id").references(() => languages.id).notNull(),
  value: text("value").notNull(),
  category: varchar("category", { length: 100 }), // common, profile, events, etc.
  isReviewed: boolean("is_reviewed").default(false),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_translation").on(table.key, table.languageId),
  index("idx_translations_key_lang").on(table.key, table.languageId),
  index("idx_translations_category").on(table.category),
]);

// Community translations for user-generated content
export const contentTranslations = pgTable("content_translations", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // post, event, comment, etc.
  contentId: text("content_id").notNull(), // ID of the content being translated
  originalLanguageId: integer("original_language_id").references(() => languages.id).notNull(),
  targetLanguageId: integer("target_language_id").references(() => languages.id).notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  translationType: varchar("translation_type", { length: 20 }).notNull(), // manual, auto, community
  translatedBy: integer("translated_by").references(() => users.id),
  translationService: varchar("translation_service", { length: 50 }), // google, deepl, openai, manual
  confidence: numeric("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  votes: integer("votes").default(0),
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_content_trans_content").on(table.contentType, table.contentId),
  index("idx_content_trans_languages").on(table.originalLanguageId, table.targetLanguageId),
  index("idx_content_trans_type").on(table.translationType),
]);

// Translation votes for community validation
export const translationVotes = pgTable("translation_votes", {
  id: serial("id").primaryKey(),
  translationId: integer("translation_id").references(() => contentTranslations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  voteType: varchar("vote_type", { length: 10 }).notNull(), // up, down
  reason: text("reason"), // optional feedback
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_translation_vote").on(table.translationId, table.userId),
  index("idx_trans_votes_translation").on(table.translationId),
  index("idx_trans_votes_user").on(table.userId),
]);

// Language usage analytics
export const languageAnalytics = pgTable("language_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  languageId: integer("language_id").references(() => languages.id).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // view, translate, switch, search
  contentType: varchar("content_type", { length: 50 }),
  contentId: text("content_id"),
  sourceLanguageId: integer("source_language_id").references(() => languages.id),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_lang_analytics_user").on(table.userId),
  index("idx_lang_analytics_language").on(table.languageId),
  index("idx_lang_analytics_action").on(table.action),
  index("idx_lang_analytics_date").on(table.createdAt),
]);

// Lunfardo dictionary for Spanish tango terms
export const lunfardoDictionary = pgTable("lunfardo_dictionary", {
  id: serial("id").primaryKey(),
  term: varchar("term", { length: 100 }).unique().notNull(),
  meaning: text("meaning").notNull(),
  example: text("example"),
  category: varchar("category", { length: 50 }), // milonga, dance, social, etc.
  region: varchar("region", { length: 100 }).default("Buenos Aires"),
  synonyms: text("synonyms").array(),
  relatedTerms: text("related_terms").array(),
  audioUrl: text("audio_url"), // pronunciation guide
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_lunfardo_term").on(table.term),
  index("idx_lunfardo_category").on(table.category),
]);

// Insert schemas
export const insertLanguageSchema = createInsertSchema(languages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLanguagePreferenceSchema = createInsertSchema(userLanguagePreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentTranslationSchema = createInsertSchema(contentTranslations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTranslationVoteSchema = createInsertSchema(translationVotes).omit({
  id: true,
  createdAt: true,
});

export const insertLanguageAnalyticsSchema = createInsertSchema(languageAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertLunfardoDictionarySchema = createInsertSchema(lunfardoDictionary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Language = typeof languages.$inferSelect;
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;

export type UserLanguagePreference = typeof userLanguagePreferences.$inferSelect;
export type InsertUserLanguagePreference = z.infer<typeof insertUserLanguagePreferenceSchema>;

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

export type ContentTranslation = typeof contentTranslations.$inferSelect;
export type InsertContentTranslation = z.infer<typeof insertContentTranslationSchema>;

export type TranslationVote = typeof translationVotes.$inferSelect;
export type InsertTranslationVote = z.infer<typeof insertTranslationVoteSchema>;

export type LanguageAnalytics = typeof languageAnalytics.$inferSelect;
export type InsertLanguageAnalytics = z.infer<typeof insertLanguageAnalyticsSchema>;

export type LunfardoDictionary = typeof lunfardoDictionary.$inferSelect;
export type InsertLunfardoDictionary = z.infer<typeof insertLunfardoDictionarySchema>;