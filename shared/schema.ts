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
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
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
  allowPublicProfile: boolean("allow_public_profile").default(true),
  notifyFollowsWeb: boolean("notify_follows_web").default(true),
  notifyFollowsEmail: boolean("notify_follows_email").default(true),
  notifyCommentsWeb: boolean("notify_comments_web").default(true),
  notifyCommentsEmail: boolean("notify_comments_email").default(true),
  notifyFactUpdatesWeb: boolean("notify_fact_updates_web").default(true),
  notifyFactUpdatesEmail: boolean("notify_fact_updates_email").default(true),
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
  allowPublicProfile: z.boolean().optional(),
  notifyFollowsWeb: z.boolean().optional(),
  notifyFollowsEmail: z.boolean().optional(),
  notifyCommentsWeb: z.boolean().optional(),
  notifyCommentsEmail: z.boolean().optional(),
  notifyFactUpdatesWeb: z.boolean().optional(),
  notifyFactUpdatesEmail: z.boolean().optional(),
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
  submittedByUserId: varchar("submitted_by_user_id"),
  archived: boolean("archived").notNull().default(false),
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
  submittedByUserId: z.string().optional(),
});

export type InsertFact = z.infer<typeof insertFactSchema>;
export type Fact = typeof facts.$inferSelect;
export type FactWithCommentCount = Fact & { commentCount: number };

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
  learnedFrom: text("learned_from").array().default([]),
  // status: pending | saved | rejected | published
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  draftData: jsonb("draft_data"),
  publishedFactId: varchar("published_fact_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFactSubmissionSchema = z.object({
  mythHeader: z.string().min(10, "Myth header must be at least 10 characters").max(400, "Myth header must be 400 characters or less"),
  mythDetails: z.string().max(2000, "Myth details must be 2000 characters or less").optional().default(""),
  truthHeader: z.string().min(10, "Truth header must be at least 10 characters").max(400, "Truth header must be 400 characters or less"),
  truthDetails: z.string().max(2000, "Truth details must be 2000 characters or less").optional().default(""),
  sources: z.array(z.string().min(1)).min(1, "At least one source is required"),
  considerations: z.string().max(4000, "Considerations must be 4000 characters or less").optional().default(""),
  otherDetails: z.string().max(4000, "Other details must be 4000 characters or less").optional().default(""),
  learnedFrom: z.array(z.string()).optional().default([]),
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
  publicationName: text("publication_name"), // publication name for external articles
  originalPublishedAt: text("original_published_at"), // original publication date string for external articles
  publishedAt: timestamp("published_at"), // article's original publish date (nullable for older saved records)
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
  decadeChosen: varchar("decade_chosen"),
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

// Pages table — content pages that are not facts (e.g. Former Countries)
export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug").notNull().unique(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Page = typeof pages.$inferSelect;

// Comments table — user comments on facts OR pages
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  factId: varchar("fact_id").references(() => facts.id, { onDelete: "cascade" }),
  pageId: varchar("page_id").references(() => pages.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => userAccounts.id, { onDelete: "set null" }),
  parentId: varchar("parent_id"),
  body: text("body").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deletedByAdmin: boolean("deleted_by_admin").notNull().default(false),
  editedAt: timestamp("edited_at"),
  needsReview: boolean("needs_review").notNull().default(false),
  aiCategories: jsonb("ai_categories").$type<Record<string, number>>(),
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

// Comment reports — user reports on comments
export const commentReports = pgTable("comment_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  reporterId: varchar("reporter_id").references(() => userAccounts.id, { onDelete: "set null" }),
  reasons: text("reasons").array().notNull().default([]),
  detail: text("detail").default(""),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  commentReporterUnique: unique("comment_reports_comment_reporter").on(table.commentId, table.reporterId),
}));

export const insertCommentReportSchema = z.object({
  reasons: z.array(z.string()).min(1, "Select at least one reason"),
  detail: z.string().max(1000).optional().default(""),
});

export type InsertCommentReport = z.infer<typeof insertCommentReportSchema>;
export type CommentReport = typeof commentReports.$inferSelect;

// Saved comments — one row per user per comment
export const savedComments = pgTable("saved_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  commentId: varchar("comment_id").notNull().references(() => comments.id, { onDelete: "cascade" }),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
}, (table) => ({
  userCommentUnique: unique("saved_comments_user_comment").on(table.userId, table.commentId),
}));

export type SavedComment = typeof savedComments.$inferSelect;

export type CommentWithUser = {
  id: string;
  factId: string | null;
  pageId: string | null;
  userId: string | null;
  parentId: string | null;
  body: string;
  upvotes: number;
  createdAt: Date;
  deletedByAdmin: boolean;
  editedAt: Date | null;
  username: string | null;
  avatarUrl: string;
  isAdmin: boolean;
  currentLocation: string;
  showCurrentLocation: boolean;
  placesLived: string[];
  showPlacesLived: boolean;
  allowPublicProfile: boolean;
  isUpvotedByMe: boolean;
  isSavedByMe: boolean;
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

// Fact follows — user follows an individual fact (for update notifications)
export const factFollows = pgTable("fact_follows", {
  userId: varchar("user_id").notNull().references(() => userAccounts.id, { onDelete: "cascade" }),
  factId: varchar("fact_id").notNull().references(() => facts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.factId] }),
}));

export type FactFollow = typeof factFollows.$inferSelect;

// Fact updates — records published by admins for specific fact fields
export const UPDATE_TYPES = ["mythHeader", "mythDetails", "truthHeader", "truthDetails", "timelineEntry", "nuanceEntry"] as const;
export type UpdateType = typeof UPDATE_TYPES[number];

export const factUpdates = pgTable("fact_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  factId: varchar("fact_id").notNull().references(() => facts.id, { onDelete: "cascade" }),
  publishBatchId: varchar("publish_batch_id").notNull(),
  updateType: text("update_type").notNull().$type<UpdateType>(),
  content: jsonb("content").notNull(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export type FactUpdate = typeof factUpdates.$inferSelect;

export type FactUpdateWithFact = FactUpdate & {
  factSlug: string;
  factMythHeader: string;
  factCoverPhoto: string | null;
};

// Unified notification types for the Activity bell tab
export type UnifiedNotification =
  | { type: 'submission_reviewing'; id: string; mythHeader: string; truthHeader: string; timestamp: string }
  | { type: 'submission_published'; id: string; mythHeader: string; publishedFactSlug: string | null; timestamp: string }
  | { type: 'submission_rejected'; id: string; mythHeader: string; adminNote: string | null; timestamp: string }
  | { type: 'comment'; commentId: string; body: string; factMythHeader: string; factSlug: string; factCoverPhoto: string | null; commenterUsername: string | null; commenterAvatarUrl: string | null; timestamp: string }
  | { type: 'reply'; replyId: string; replyBody: string; parentBody: string; factMythHeader: string; factSlug: string; factCoverPhoto: string | null; replierUsername: string | null; replierAvatarUrl: string | null; timestamp: string }
  | { type: 'fact_update'; publishBatchId: string; factMythHeader: string; factSlug: string; factCoverPhoto: string | null; timestamp: string; updates: Array<{ id: string; updateType: string; content: unknown }> }
  | { type: 'new_follower'; followerId: string; followerUsername: string | null; followerAvatarUrl: string | null; timestamp: string };

export type ActivityFeedResponse = {
  items: UnifiedNotification[];
  total: number;
  page: number;
  totalPages: number;
};

// Feed item type — union of comment, fact, and article activity
export type FeedItem = {
  type: "comment" | "fact" | "article";
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  createdAt: Date;
  // comment fields
  mythHeader?: string;
  truthHeader?: string;
  commentBody?: string;
  factId?: string;
  factSlug?: string;
  factTitle?: string;
  factCoverPhoto?: string | null;
  pageId?: string;
  pageSlug?: string;
  pageTitle?: string;
  // fact fields (For You feed)
  factCategories?: string[];
  factCoverPhoto2?: string | null;
  factFilters?: string[];
  factBetaOnly?: boolean;
  factRevisionYear?: number | null;
  factTaughtUntilYear?: string | null;
  // article fields (For You feed)
  articleUrl?: string;
  articleTitle?: string;
  publicationName?: string;
  articleSummary?: string;
  articleCoverImage?: string | null;
  // enriched count (only on type === "fact" items)
  commentCount?: number;
  // upvote fields — populated for comment feed items
  commentUpvotes?: number;
  commentIsUpvotedByMe?: boolean;
  // user location fields — populated by local feed only
  userCurrentLocation?: string;
  userShowCurrentLocation?: boolean;
  userPlacesLived?: string[];
  userShowPlacesLived?: boolean;
};
