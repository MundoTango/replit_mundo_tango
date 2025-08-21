import { pgTable, serial, text, timestamp, integer, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull(),
  status: text('status').notNull(), // active, canceled, past_due, etc.
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  paymentProvider: text('payment_provider').notNull(), // stripe, yoomoney, crypto
  providerSubscriptionId: text('provider_subscription_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Payment methods table
export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(), // stripe, yoomoney, crypto
  type: text('type').notNull(), // card, wallet, crypto
  lastFour: text('last_four'),
  brand: text('brand'), // visa, mastercard, etc.
  country: text('country'),
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  isDefault: boolean('is_default').default(false),
  providerPaymentMethodId: text('provider_payment_method_id'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull(), // succeeded, failed, pending
  type: text('type').notNull(), // charge, refund, subscription
  provider: text('provider').notNull(),
  providerTransactionId: text('provider_transaction_id').notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Import users from main schema
import { users } from './schema';

// Schemas
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;