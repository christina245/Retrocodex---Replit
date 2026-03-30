import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, integer, unique, primaryKey } from "drizzle-orm/pg-core";
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
  "Food",
  "Holidays",
  "Linguistics",
  "Music",
  "Physics",
  "Technology"
] as const;

export const DECADES = [
  "1900s", "1910s", "1920s", "1930s", "1940s",
  "1950s", "1960s", "1970s", "1980s", "1990s",
  "2000s", "2010s", "2020s"
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
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  imageCaption: z.string().optional(),
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

// Users table for admin authentication (legacy — kept for compatibility)
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

// Real user auth — credentials only, never returned by public API
export const userAccounts = pgTable("user_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Public profile data tied to a user account
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url").default(""),
  currentLocation: text("current_location").default(""),
  showCurrentLocation: boolean("show_current_location").default(false),
  placesLived: text("places_lived").array().default([]),
  showPlacesLived: boolean("show_places_lived").default(false),
  favoriteTags: text("favorite_tags").array().default([]),
  misinfoSource: text("misinfo_source").default(""),
  allowFollows: boolean("allow_follows").default(true),
  isAdmin: boolean("is_admin").default(false),
  submissionBanned: boolean("submission_banned").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  avatarUrl: z.string().optional(),
  currentLocation: z.string().optional(),
  showCurrentLocation: z.boolean().optional(),
  placesLived: z.array(z.string()).optional(),
  showPlacesLived: z.boolean().optional(),
  favoriteTags: z.array(z.string()).optional(),
  misinfoSource: z.string().optional(),
  bio: z.string().optional(),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().optional(),
  currentLocation: z.string().optional(),
  showCurrentLocation: z.boolean().optional(),
  placesLived: z.array(z.string()).optional(),
  showPlacesLived: z.boolean().optional(),
  favoriteTags: z.array(z.string()).optional(),
  misinfoSource: z.string().max(200).optional(),
  allowFollows: z.boolean().optional(),
});

export type UserAccount = typeof userAccounts.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;

// Facts table for storing all fact entries
export const facts = pgTable("facts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  coverPhoto: text("cover_photo"),
  categories: text("categories").array().notNull(),
  subcategories: text("subcategories").array().default([]),
  factFilters: text("fact_filters").array().default([]),
  searchTags: text("search_tags").array().default([]),
  featured: boolean("featured").default(false),
  betaOnly: boolean("beta_only").default(false),
  isTrending: boolean("is_trending").default(false),
  isDebated: boolean("is_debated").default(false),
  isPopular: boolean("is_popular").default(false),
  popularOrder: integer("popular_order"),
  mythHeader: varchar("myth_header", { length: 275 }).notNull(),
  mythDetails: text("myth_details"),
  truthHeader: varchar("truth_header", { length: 275 }).notNull(),
  truthDetails: text("truth_details"),
  sources: jsonb("sources").$type<Source[]>().default([]),
  timeline: jsonb("timeline").$type<TimelineEntry[]>().default([]),
  nuances: jsonb("nuances").$type<Nuance[]>().default([]),
  relatedMythIds: text("related_myth_ids").array().default([]),
  revisionYear: integer("revision_year"),
  taughtUntilYear: text("taught_until_year"),
  originDecade: text("origin_decade"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFactSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  coverPhoto: z.string().optional(),
  categories: z.array(z.enum(CATEGORIES)).min(1, "At least one category is required"),
  subcategories: z.array(z.enum(OTHER_SUBCATEGORIES)).default([]),
  factFilters: z.array(z.string()).default([]),
  searchTags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  betaOnly: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isDebated: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  popularOrder: z.number().optional(),
  mythHeader: z.string().min(1, "Myth header is required").max(275, "Myth header must be 275 characters or less"),
  mythDetails: z.string().optional(),
  truthHeader: z.string().min(1, "Truth header is required").max(275, "Truth header must be 275 characters or less"),
  truthDetails: z.string().optional(),
  sources: z.array(sourceSchema).default([]),
  timeline: z.array(timelineEntrySchema).default([]),
  nuances: z.array(nuanceSchema).default([]),
  relatedMythIds: z.array(z.string()).default([]),
  revisionYear: z.number().int().min(1800).max(2100).nullable().optional(),
  taughtUntilYear: z.string().nullable().optional(),
  originDecade: z.string().nullable().optional(),
});

export type InsertFact = z.infer<typeof insertFactSchema>;
export type Fact = typeof facts.$inferSelect;

// Blog post author types
export const AUTHOR_TYPES = ["Staff", "Guest"] as const;

// Blog post tag options
export const BLOG_TAGS = [
  "Fact Collection",
  "Questioning the Facts",
  "Seasonal", 
  "Regional Lessons",
  "Personal Stories",
  "Website Announcements",
  "Other"
] as const;

// Blog posts table for articles
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  coverImage: text("cover_image"),
  coverImageCaption: text("cover_image_caption"),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  content: jsonb("content"), // Tiptap JSON content
  contentHtml: text("content_html"), // Pre-rendered HTML for display
  authorName: text("author_name").notNull().default("Retrocodex Admin"),
  authorType: text("author_type").notNull().default("Staff"), // 'Staff' or 'Guest'
  authorLink: text("author_link"), // LinkedIn URL for guests
  authorPhoto: text("author_photo"), // Profile photo URL
  heroFeatured: boolean("hero_featured").default(false),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  relatedManualIds: text("related_manual_ids").array().default([]), // Optional manual related articles
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  summary: z.string().min(1, "Summary is required"),
  coverImage: z.string().optional(),
  coverImageCaption: z.string().optional(),
  category: z.enum(CATEGORIES),
  tags: z.array(z.enum(BLOG_TAGS)).default([]),
  content: z.any().optional(), // Tiptap JSON
  contentHtml: z.string().optional(),
  authorName: z.string().default("Retrocodex Admin"),
  authorType: z.enum(AUTHOR_TYPES).default("Staff"),
  authorLink: z.string().url().optional().or(z.literal("")),
  authorPhoto: z.string().optional(),
  heroFeatured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.date().optional(),
  relatedManualIds: z.array(z.string()).default([]),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Fact submissions table — user-submitted entries awaiting admin review
export const factSubmissions = pgTable("fact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  mythHeader: text("myth_header").notNull(),
  mythDetails: text("myth_details").default(""),
  truthHeader: text("truth_header").notNull(),
  truthDetails: text("truth_details").default(""),
  sources: text("sources").array().default([]),
  considerations: text("considerations").default(""),
  otherDetails: text("other_details").default(""),
  // status: pending | saved | rejected | published
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  draftData: jsonb("draft_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFactSubmissionSchema = z.object({
  mythHeader: z.string().min(10, "Myth header must be at least 10 characters").max(400, "Myth header must be 400 characters or less"),
  mythDetails: z.string().max(2000, "Myth details must be 2000 characters or less").optional().default(""),
  truthHeader: z.string().min(10, "Truth header must be at least 10 characters").max(400, "Truth header must be 400 characters or less"),
  truthDetails: z.string().max(2000, "Truth details must be 2000 characters or less").optional().default(""),
  sources: z.array(z.string().min(1)).min(1, "At least one source is required"),
  considerations: z.string().max(4000, "Considerations must be 4000 characters or less").optional().default(""),
  otherDetails: z.string().max(4000, "Other details must be 4000 characters or less").optional().default(""),
});

export type InsertFactSubmission = z.infer<typeof insertFactSubmissionSchema>;
export type FactSubmission = typeof factSubmissions.$inferSelect;

// External articles table — curated third-party articles (NYT, Vox, Substack, etc.)
export const externalArticles = pgTable("external_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  externalUrl: text("external_url").notNull(),
  publicationName: text("publication_name").notNull(),
  authorName: text("author_name").default(""),
  summary: text("summary"),
  publishedAt: text("published_at"), // date string e.g. "2024-01-15"
  coverImage: text("cover_image"),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  isPaywalled: boolean("is_paywalled").default(false),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertExternalArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  externalUrl: z.string().url("Must be a valid URL"),
  publicationName: z.string().min(1, "Publication name is required"),
  authorName: z.string().optional().default(""),
  summary: z.string().optional(),
  publishedAt: z.string().optional(),
  coverImage: z.string().optional(),
  category: z.enum(CATEGORIES),
  tags: z.array(z.enum(BLOG_TAGS)).default([]),
  isPaywalled: z.boolean().default(false),
  published: z.boolean().default(false),
});

export type InsertExternalArticle = z.infer<typeof insertExternalArticleSchema>;
export type ExternalArticle = typeof externalArticles.$inferSelect;

// Newsletter subscriptions table (separate from account signups)
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  source: text("source").notNull().default("blog-sidebar"), // 'blog-sidebar', 'footer', etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).pick({
  email: true,
  name: true,
  source: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  source: z.string().default("blog-sidebar"),
});

export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

// Saved articles — user bookmarked articles (internal blog posts or external curated articles)
export const savedArticles = pgTable("saved_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  articleKey: text("article_key").notNull(), // slug for internal, externalUrl for external
  articleType: text("article_type").notNull(), // "internal" | "external"
  title: text("title").notNull(),
  summary: text("summary").default(""),
  coverImage: text("cover_image").default(""),
  category: text("category").notNull(),
  slug: text("slug").default(""), // slug for internal articles
  externalUrl: text("external_url").default(""), // url for external articles
  savedAt: timestamp("saved_at").notNull().defaultNow(),
}, (table) => ({
  userArticleUnique: unique("saved_articles_user_article").on(table.userId, table.articleKey),
}));

export const insertSavedArticleSchema = createInsertSchema(savedArticles).omit({ id: true, savedAt: true });
export type InsertSavedArticle = z.infer<typeof insertSavedArticleSchema>;
export type SavedArticle = typeof savedArticles.$inferSelect;

// Saved facts — one row per user per fact
export const savedFacts = pgTable("saved_facts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  factId: varchar("fact_id").notNull().references(() => facts.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
}, (table) => ({
  userFactUnique: unique("saved_facts_user_fact").on(table.userId, table.factId),
}));

export const insertSavedFactSchema = createInsertSchema(savedFacts).omit({ id: true, savedAt: true });
export type InsertSavedFact = z.infer<typeof insertSavedFactSchema>;
export type SavedFact = typeof savedFacts.$inferSelect;

// Poll votes — one per user per fact, upserted on re-vote
export const pollVotes = pgTable("poll_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  factId: varchar("fact_id").notNull().references(() => facts.id, { onDelete: "cascade" }),
  optionChosen: varchar("option_chosen").notNull(),
  locationChosen: varchar("location_chosen"),
  votedAt: timestamp("voted_at").notNull().defaultNow(),
}, (table) => ({
  userFactUnique: unique("poll_votes_user_fact").on(table.userId, table.factId),
}));

export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({ id: true, votedAt: true });

export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
export type PollVote = typeof pollVotes.$inferSelect;

export type PollVoteWithFact = PollVote & {
  factTitle: string;
  factSlug: string;
  factCoverPhoto: string | null;
};

// Comments table — user comments on facts
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  factId: varchar("fact_id").notNull().references(() => facts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id"),
  body: text("body").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Comment upvotes — tracks which users upvoted which comments
export const commentUpvotes = pgTable("comment_upvotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  commentUserUnique: unique("comment_upvotes_comment_user").on(table.commentId, table.userId),
}));

export const insertCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(10000, "Comment is too long"),
  parentId: z.string().optional(),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type CommentWithUser = {
  id: string;
  factId: string;
  userId: string;
  parentId: string | null;
  body: string;
  upvotes: number;
  createdAt: Date;
  username: string;
  avatarUrl: string;
  isAdmin: boolean;
  currentLocation: string;
  showCurrentLocation: boolean;
  placesLived: string[];
  showPlacesLived: boolean;
  isUpvotedByMe: boolean;
};

// Follows table — user-to-user follow relationships
export const follows = pgTable("follows", {
  followerId: varchar("follower_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  followeeId: varchar("followee_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.followerId, table.followeeId] }),
}));

export type Follow = typeof follows.$inferSelect;

// Feed item type — union of submission and comment activity
export type FeedItem = {
  type: "submission" | "comment";
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  createdAt: Date;
  mythHeader?: string;
  truthHeader?: string;
  submissionStatus?: string;
  commentBody?: string;
  factId?: string;
  factSlug?: string;
  factTitle?: string;
  factCoverPhoto?: string | null;
};
