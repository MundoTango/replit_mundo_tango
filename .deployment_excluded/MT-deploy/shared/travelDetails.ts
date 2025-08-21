import { pgTable, serial, integer, varchar, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Travel status enum
export const travelStatusEnum = pgEnum("travel_status", ["planned", "ongoing", "completed", "cancelled"]);

// Travel details table for tracking user travel information
export const travelDetails = pgTable("travel_details", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventName: varchar("event_name", { length: 255 }),
  eventType: varchar("event_type", { length: 50 }),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: travelStatusEnum("status").default("planned"),
  notes: text("notes"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Schema for inserting travel details
export const insertTravelDetailSchema = createInsertSchema(travelDetails)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date())
  });

// Schema for updating travel details
export const updateTravelDetailSchema = insertTravelDetailSchema.partial();

// Types
export type TravelDetail = typeof travelDetails.$inferSelect;
export type InsertTravelDetail = z.infer<typeof insertTravelDetailSchema>;
export type UpdateTravelDetail = z.infer<typeof updateTravelDetailSchema>;