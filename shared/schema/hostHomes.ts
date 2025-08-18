import { pgTable, uuid, varchar, text, integer, numeric, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../schema';

// Main host homes table
export const hostHomes = pgTable('host_homes', {
  id: uuid('id').defaultRandom().primaryKey(),
  hostId: integer('host_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  propertyType: varchar('property_type', { length: 50 }).notNull(), // apartment, house, villa, etc.
  roomType: varchar('room_type', { length: 50 }).notNull(), // entire_place, private_room, shared_room
  
  // Location details
  address: varchar('address', { length: 500 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }),
  country: varchar('country', { length: 255 }).notNull(),
  zipCode: varchar('zip_code', { length: 20 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  
  // Capacity and rooms
  maxGuests: integer('max_guests').notNull(),
  bedrooms: integer('bedrooms').notNull(),
  beds: integer('beds').notNull(),
  bathrooms: numeric('bathrooms', { precision: 3, scale: 1 }).notNull(),
  
  // Pricing
  basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  cleaningFee: numeric('cleaning_fee', { precision: 10, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  
  // Status and verification
  status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, pending_review, active, paused, rejected
  isVerified: boolean('is_verified').default(false),
  isInstantBook: boolean('is_instant_book').default(false),
  
  // External listings
  airbnbUrl: varchar('airbnb_url', { length: 500 }),
  vrboUrl: varchar('vrbo_url', { length: 500 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  
  // SEO and search
  slug: varchar('slug', { length: 255 }).unique(),
  searchVector: text('search_vector'), // For full-text search
}, (table) => ({
  hostIdIdx: index('host_homes_host_id_idx').on(table.hostId),
  cityIdx: index('host_homes_city_idx').on(table.city),
  statusIdx: index('host_homes_status_idx').on(table.status),
  locationIdx: index('host_homes_location_idx').on(table.latitude, table.longitude),
}));

// Home amenities
export const homeAmenities = pgTable('home_amenities', {
  id: uuid('id').defaultRandom().primaryKey(),
  homeId: uuid('home_id').references(() => hostHomes.id, { onDelete: 'cascade' }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // basic, safety, kitchen, bathroom, etc.
  amenity: varchar('amenity', { length: 100 }).notNull(),
  iconName: varchar('icon_name', { length: 50 }), // For displaying icons
}, (table) => ({
  homeIdIdx: index('home_amenities_home_id_idx').on(table.homeId),
  categoryIdx: index('home_amenities_category_idx').on(table.category),
}));

// Home photos
export const homePhotos = pgTable('home_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  homeId: uuid('home_id').references(() => hostHomes.id, { onDelete: 'cascade' }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  caption: varchar('caption', { length: 255 }),
  roomType: varchar('room_type', { length: 50 }), // living_room, bedroom, kitchen, etc.
  displayOrder: integer('display_order').default(0),
  isCover: boolean('is_cover').default(false),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
}, (table) => ({
  homeIdIdx: index('home_photos_home_id_idx').on(table.homeId),
  coverIdx: index('home_photos_cover_idx').on(table.homeId, table.isCover),
}));

// Home availability calendar
export const homeAvailability = pgTable('home_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  homeId: uuid('home_id').references(() => hostHomes.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }), // Override price for specific dates
  minimumStay: integer('minimum_stay').default(1),
  notes: text('notes'),
}, (table) => ({
  homeIdDateIdx: index('home_availability_home_date_idx').on(table.homeId, table.date),
  dateIdx: index('home_availability_date_idx').on(table.date),
}));

// Home pricing rules
export const homePricingRules = pgTable('home_pricing_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  homeId: uuid('home_id').references(() => hostHomes.id, { onDelete: 'cascade' }).notNull(),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // weekly_discount, monthly_discount, seasonal, etc.
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }),
  fixedPrice: numeric('fixed_price', { precision: 10, scale: 2 }),
  minimumNights: integer('minimum_nights'),
  priority: integer('priority').default(0),
}, (table) => ({
  homeIdIdx: index('home_pricing_rules_home_id_idx').on(table.homeId),
  ruleTypeIdx: index('home_pricing_rules_type_idx').on(table.ruleType),
}));

// Home rules
export const homeRules = pgTable('home_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  homeId: uuid('home_id').references(() => hostHomes.id, { onDelete: 'cascade' }).notNull(),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // check_in, check_out, house_rules, etc.
  ruleText: text('rule_text').notNull(),
  isStrict: boolean('is_strict').default(false),
  displayOrder: integer('display_order').default(0),
}, (table) => ({
  homeIdIdx: index('home_rules_home_id_idx').on(table.homeId),
}));

// Home bookings (simplified for MVP)
export const homeBookings = pgTable('home_bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  homeId: uuid('home_id').references(() => hostHomes.id).notNull(),
  guestId: integer('guest_id').references(() => users.id).notNull(),
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out').notNull(),
  guests: integer('guests').notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, confirmed, cancelled
  bookingNotes: text('booking_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  homeIdIdx: index('home_bookings_home_id_idx').on(table.homeId),
  guestIdIdx: index('home_bookings_guest_id_idx').on(table.guestId),
  datesIdx: index('home_bookings_dates_idx').on(table.checkIn, table.checkOut),
}));

// Create Zod schemas
export const insertHostHomeSchema = createInsertSchema(hostHomes)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true,
    searchVector: true 
  })
  .extend({
    basePrice: z.string().or(z.number()),
    cleaningFee: z.string().or(z.number()).optional(),
    maxGuests: z.number().min(1).max(20),
    bedrooms: z.number().min(0).max(50),
    beds: z.number().min(1).max(50),
    bathrooms: z.string().or(z.number()),
  });

export const insertHomeAmenitySchema = createInsertSchema(homeAmenities)
  .omit({ id: true });

export const insertHomePhotoSchema = createInsertSchema(homePhotos)
  .omit({ id: true, uploadedAt: true });

export const insertHomeRuleSchema = createInsertSchema(homeRules)
  .omit({ id: true });

// Type exports
export type HostHome = typeof hostHomes.$inferSelect;
export type InsertHostHome = z.infer<typeof insertHostHomeSchema>;
export type HomeAmenity = typeof homeAmenities.$inferSelect;
export type HomePhoto = typeof homePhotos.$inferSelect;
export type HomeRule = typeof homeRules.$inferSelect;
export type HomeBooking = typeof homeBookings.$inferSelect;