import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Category and subcategory constants
export const CATEGORIES = [
  "History",
  "Life Sciences", 
  "Health & Fitness",
  "Social Sciences",
  "Gender & Sexuality",
  "Everyday Life",
  "Other"
] as const;

export const OTHER_SUBCATEGORIES = [
  "Animals",
  "Astronomy",
  "Beauty",
  "Earth Science",
  "Finance",
  "Food",
  "Linguistics",
  "Music",
  "Physics",
  "Uncategorized"
] as const;

// Type definitions for JSON fields
export const sourceSchema = z.object({
  id: z.string(),
  citation: z.string().min(1, "Citation is required"),
  link: z.string().url("Must be a valid URL"),
  logoUrl: z.string().optional(),
});

export const timelineEntrySchema = z.object({
  id: z.string(),
  year: z.string().min(1, "Year is required"),
  header: z.string().min(1, "Header is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  order: z.number(),
});

export const nuanceSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Type is required"),
  body: z.string().min(1, "Body is required"),
});

export type Source = z.infer<typeof sourceSchema>;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;
export type Nuance = z.infer<typeof nuanceSchema>;

// Email subscriptions table for capturing user emails
export const emailSubscriptions = pgTable("email_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  source: text("source").notNull(), // 'signup-banner' or 'save-modal'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).pick({
  email: true,
  source: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  source: z.enum(['signup-banner', 'save-modal']),
});

export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;

// Users table for admin authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Facts table for storing all fact entries
export const facts = pgTable("facts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  categories: text("categories").array().notNull(),
  subcategory: text("subcategory"),
  tags: text("tags").array().default([]),
  featured: boolean("featured").default(false),
  mythHeader: varchar("myth_header", { length: 275 }).notNull(),
  mythDetails: text("myth_details").notNull(),
  truthHeader: varchar("truth_header", { length: 275 }).notNull(),
  truthDetails: text("truth_details").notNull(),
  sources: jsonb("sources").$type<Source[]>().default([]),
  timeline: jsonb("timeline").$type<TimelineEntry[]>().default([]),
  nuances: jsonb("nuances").$type<Nuance[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFactSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  categories: z.array(z.enum(CATEGORIES)).min(1, "At least one category is required"),
  subcategory: z.enum(OTHER_SUBCATEGORIES).optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  mythHeader: z.string().min(1, "Myth header is required").max(275, "Myth header must be 275 characters or less"),
  mythDetails: z.string().min(1, "Myth details are required"),
  truthHeader: z.string().min(1, "Truth header is required").max(275, "Truth header must be 275 characters or less"),
  truthDetails: z.string().min(1, "Truth details are required"),
  sources: z.array(sourceSchema).default([]),
  timeline: z.array(timelineEntrySchema).default([]),
  nuances: z.array(nuanceSchema).default([]),
});

export type InsertFact = z.infer<typeof insertFactSchema>;
export type Fact = typeof facts.$inferSelect;
