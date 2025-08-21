import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { hostHomes } from "./hostHomes";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
]);

export const guestBookings = pgTable("guest_bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: integer("guest_id")
    .notNull()
    .references(() => users.id),
  hostHomeId: uuid("host_home_id")
    .notNull()
    .references(() => hostHomes.id),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  guestCount: integer("guest_count").notNull().default(1),
  purpose: text("purpose").notNull(),
  message: text("message").notNull(),
  hasReadRules: boolean("has_read_rules").notNull().default(false),
  status: bookingStatusEnum("status").notNull().default("pending"),
  hostResponse: text("host_response"),
  totalPrice: integer("total_price"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

export const guestBookingsRelations = relations(guestBookings, ({ one }) => ({
  guest: one(users, {
    fields: [guestBookings.guestId],
    references: [users.id],
    relationName: "guestBookings",
  }),
  hostHome: one(hostHomes, {
    fields: [guestBookings.hostHomeId],
    references: [hostHomes.id],
    relationName: "homeBookings",
  }),
}));

// Schemas
export const insertGuestBookingSchema = createInsertSchema(guestBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  hostResponse: true,
  totalPrice: true,
  respondedAt: true,
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "cancelled"]),
  hostResponse: z.string().optional(),
});

// Types
export type InsertGuestBooking = z.infer<typeof insertGuestBookingSchema>;
export type UpdateBookingStatus = z.infer<typeof updateBookingStatusSchema>;
export type GuestBooking = typeof guestBookings.$inferSelect;