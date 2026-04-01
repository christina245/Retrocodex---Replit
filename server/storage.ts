import { 
  emailSubscriptions, 
  facts,
  blogPosts,
  externalArticles,
  newsletterSubscriptions,
  savedArticles,
  savedFacts,
  pollVotes,
  comments,
  commentUpvotes,
  savedComments,
  userProfiles,
  follows,
  factSubmissions,
  factFollows,
  factUpdates,
  type EmailSubscription, 
  type InsertEmailSubscription,
  type Fact,
  type InsertFact,
  type BlogPost,
  type InsertBlogPost,
  type ExternalArticle,
  type InsertExternalArticle,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type SavedArticle,
  type InsertSavedArticle,
  type SavedFact,
  type InsertSavedFact,
  type PollVote,
  type InsertPollVote,
  type PollVoteWithFact,
  type Comment,
  type InsertComment,
  type CommentWithUser,
  type FeedItem,
  type UpdateType,
  type FactUpdateWithFact,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, arrayContains, inArray, sql, notInArray, ne, or } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // Email subscriptions
  createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription>;
  getAllEmailSubscriptions(): Promise<EmailSubscription[]>;
  getEmailSubscriptionByEmail(email: string): Promise<EmailSubscription | undefined>;
  
  // Facts
  createFact(fact: InsertFact): Promise<Fact>;
  getAllFacts(): Promise<Fact[]>;
  getFactBySlug(slug: string): Promise<Fact | undefined>;
  getFactById(id: string): Promise<Fact | undefined>;
  getFactsByIds(ids: string[]): Promise<Fact[]>;
  updateFact(id: string, fact: Partial<InsertFact>): Promise<Fact | undefined>;
  deleteFact(id: string): Promise<boolean>;
  
  // Blog posts
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getFeaturedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;

  // External articles
  createExternalArticle(article: InsertExternalArticle): Promise<ExternalArticle>;
  getAllExternalArticles(): Promise<ExternalArticle[]>;
  getPublishedExternalArticles(): Promise<ExternalArticle[]>;
  getExternalArticleById(id: string): Promise<ExternalArticle | undefined>;
  updateExternalArticle(id: string, article: Partial<InsertExternalArticle>): Promise<ExternalArticle | undefined>;
  deleteExternalArticle(id: string): Promise<boolean>;
  
  // Newsletter subscriptions
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined>;

  // Saved articles
  saveArticle(data: InsertSavedArticle): Promise<SavedArticle>;
  unsaveArticle(userId: string, articleKey: string): Promise<boolean>;
  getSavedArticlesByUser(userId: string): Promise<SavedArticle[]>;

  // Saved facts
  saveFact(userId: string, factId: string): Promise<SavedFact>;
  unsaveFact(userId: string, factId: string): Promise<boolean>;
  getSavedFactsByUser(userId: string): Promise<Fact[]>;
  isFactSavedByUser(userId: string, factId: string): Promise<boolean>;

  // Poll votes
  upsertPollVote(data: InsertPollVote): Promise<PollVote>;
  getPollVotesByUser(userId: string): Promise<PollVoteWithFact[]>;
  getPollVoteForFact(userId: string, factId: string): Promise<PollVote | null>;

  // Comments
  getCommentsByUserId(userId: string): Promise<{ id: string; body: string; createdAt: Date; upvotes: number; isUpvotedByMe: boolean; factTitle: string; factSlug: string; factCoverPhoto: string | null }[]>;
  getCommentsByFactId(factId: string, viewerId?: string): Promise<CommentWithUser[]>;
  createComment(userId: string, data: InsertComment & { factId: string }): Promise<CommentWithUser>;
  updateComment(id: string, userId: string, body: string): Promise<boolean>;
  deleteComment(id: string, userId: string, isAdmin: boolean): Promise<boolean>;
  toggleCommentUpvote(commentId: string, userId: string): Promise<{ upvotes: number; isUpvoted: boolean }>;
  saveComment(userId: string, commentId: string): Promise<void>;
  unsaveComment(userId: string, commentId: string): Promise<boolean>;
  getCommentCountsByFactIds(factIds: string[]): Promise<Record<string, number>>;
  getSavedCommentsByUser(userId: string): Promise<{
    commentId: string;
    body: string;
    upvotes: number;
    createdAt: Date;
    savedAt: Date;
    factTitle: string;
    factSlug: string;
    factCoverPhoto: string | null;
    authorUsername: string | null;
    authorAvatarUrl: string | null;
  }[]>;

  // Follows
  followUser(followerId: string, followeeId: string): Promise<void>;
  unfollowUser(followerId: string, followeeId: string): Promise<boolean>;
  isFollowing(followerId: string, followeeId: string): Promise<boolean>;
  getFollowerCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;

  // Feed
  getFollowingIds(userId: string): Promise<string[]>;
  getFollowingFeed(userId: string, limit?: number): Promise<FeedItem[]>;
  getForYouFeed(userId?: string, limit?: number): Promise<FeedItem[]>;

  // Fact follows
  followFact(userId: string, factId: string): Promise<void>;
  unfollowFact(userId: string, factId: string): Promise<boolean>;
  getFactFollowStatus(userId: string, factId: string): Promise<boolean>;

  // Fact updates
  createFactUpdateBatch(factId: string, updates: { updateType: UpdateType; content: unknown }[]): Promise<void>;
  getFactUpdatesFeed(userId: string): Promise<FactUpdateWithFact[]>;
}

export class DatabaseStorage implements IStorage {
  async createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    const [result] = await db
      .insert(emailSubscriptions)
      .values(subscription)
      .returning();
    return result;
  }

  async getAllEmailSubscriptions(): Promise<EmailSubscription[]> {
    return await db
      .select()
      .from(emailSubscriptions)
      .orderBy(desc(emailSubscriptions.createdAt));
  }

  async getEmailSubscriptionByEmail(email: string): Promise<EmailSubscription | undefined> {
    const [result] = await db
      .select()
      .from(emailSubscriptions)
      .where(eq(emailSubscriptions.email, email));
    return result || undefined;
  }

  // Facts methods
  async createFact(fact: InsertFact): Promise<Fact> {
    const [result] = await db
      .insert(facts)
      .values(fact)
      .returning();
    return result;
  }

  async getAllFacts(): Promise<Fact[]> {
    return await db
      .select()
      .from(facts)
      .orderBy(desc(facts.createdAt));
  }

  async getFactBySlug(slug: string): Promise<Fact | undefined> {
    const [result] = await db
      .select()
      .from(facts)
      .where(eq(facts.slug, slug));
    return result || undefined;
  }

  async getFactById(id: string): Promise<Fact | undefined> {
    const [result] = await db
      .select()
      .from(facts)
      .where(eq(facts.id, id));
    return result || undefined;
  }

  async getFactsByIds(ids: string[]): Promise<Fact[]> {
    if (ids.length === 0) return [];
    const rows = await db.select().from(facts).where(inArray(facts.id, ids));
    const map = new Map(rows.map(f => [f.id, f]));
    return ids.map(id => map.get(id)).filter((f): f is Fact => f !== undefined);
  }

  async updateFact(id: string, fact: Partial<InsertFact>): Promise<Fact | undefined> {
    const [result] = await db
      .update(facts)
      .set(fact)
      .where(eq(facts.id, id))
      .returning();
    return result || undefined;
  }

  async deleteFact(id: string): Promise<boolean> {
    const result = await db
      .delete(facts)
      .where(eq(facts.id, id))
      .returning();
    return result.length > 0;
  }

  // Blog post methods
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [result] = await db
      .insert(blogPosts)
      .values({
        ...post,
        publishedAt: post.published ? new Date() : null,
      })
      .returning();
    return result;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.published, true), eq(blogPosts.heroFeatured, true)))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [result] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return result || undefined;
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const [result] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return result || undefined;
  }

  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const updateData: any = { ...post, updatedAt: new Date() };
    
    if (post.published) {
      const existing = await this.getBlogPostById(id);
      if (existing && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    
    const [result] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();
    return result || undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    return result.length > 0;
  }

  // External article methods
  async createExternalArticle(article: InsertExternalArticle): Promise<ExternalArticle> {
    const [result] = await db
      .insert(externalArticles)
      .values(article)
      .returning();
    return result;
  }

  async getAllExternalArticles(): Promise<ExternalArticle[]> {
    return await db
      .select()
      .from(externalArticles)
      .orderBy(desc(externalArticles.createdAt));
  }

  async getPublishedExternalArticles(): Promise<ExternalArticle[]> {
    return await db
      .select()
      .from(externalArticles)
      .where(eq(externalArticles.published, true))
      .orderBy(desc(externalArticles.createdAt));
  }

  async getExternalArticleById(id: string): Promise<ExternalArticle | undefined> {
    const [result] = await db
      .select()
      .from(externalArticles)
      .where(eq(externalArticles.id, id));
    return result || undefined;
  }

  async updateExternalArticle(id: string, article: Partial<InsertExternalArticle>): Promise<ExternalArticle | undefined> {
    const [result] = await db
      .update(externalArticles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(externalArticles.id, id))
      .returning();
    return result || undefined;
  }

  async deleteExternalArticle(id: string): Promise<boolean> {
    const result = await db
      .delete(externalArticles)
      .where(eq(externalArticles.id, id))
      .returning();
    return result.length > 0;
  }

  // Newsletter subscription methods
  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [result] = await db
      .insert(newsletterSubscriptions)
      .values(subscription)
      .returning();
    return result;
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db
      .select()
      .from(newsletterSubscriptions)
      .orderBy(desc(newsletterSubscriptions.createdAt));
  }

  async getNewsletterSubscriptionByEmail(email: string): Promise<NewsletterSubscription | undefined> {
    const [result] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return result || undefined;
  }

  // Saved article methods
  async saveArticle(data: InsertSavedArticle): Promise<SavedArticle> {
    const [result] = await db
      .insert(savedArticles)
      .values(data)
      .onConflictDoUpdate({
        target: [savedArticles.userId, savedArticles.articleKey],
        set: {
          savedAt: new Date(),
          title: data.title,
          summary: data.summary,
          coverImage: data.coverImage,
          category: data.category,
          slug: data.slug,
          externalUrl: data.externalUrl,
        },
      })
      .returning();
    return result;
  }

  async unsaveArticle(userId: string, articleKey: string): Promise<boolean> {
    const result = await db
      .delete(savedArticles)
      .where(and(eq(savedArticles.articleKey, articleKey), eq(savedArticles.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getSavedArticlesByUser(userId: string): Promise<SavedArticle[]> {
    return await db
      .select()
      .from(savedArticles)
      .where(eq(savedArticles.userId, userId))
      .orderBy(desc(savedArticles.savedAt));
  }

  // Saved fact methods
  async saveFact(userId: string, factId: string): Promise<SavedFact> {
    const [result] = await db
      .insert(savedFacts)
      .values({ userId, factId })
      .onConflictDoUpdate({
        target: [savedFacts.userId, savedFacts.factId],
        set: { savedAt: new Date() },
      })
      .returning();
    return result;
  }

  async unsaveFact(userId: string, factId: string): Promise<boolean> {
    const result = await db
      .delete(savedFacts)
      .where(and(eq(savedFacts.userId, userId), eq(savedFacts.factId, factId)))
      .returning();
    return result.length > 0;
  }

  async getSavedFactsByUser(userId: string): Promise<Fact[]> {
    const rows = await db
      .select({ fact: facts })
      .from(savedFacts)
      .innerJoin(facts, eq(savedFacts.factId, facts.id))
      .where(eq(savedFacts.userId, userId))
      .orderBy(desc(savedFacts.savedAt));
    return rows.map((r) => r.fact);
  }

  async isFactSavedByUser(userId: string, factId: string): Promise<boolean> {
    const rows = await db
      .select({ id: savedFacts.id })
      .from(savedFacts)
      .where(and(eq(savedFacts.userId, userId), eq(savedFacts.factId, factId)))
      .limit(1);
    return rows.length > 0;
  }

  async upsertPollVote(data: InsertPollVote): Promise<PollVote> {
    const [result] = await db
      .insert(pollVotes)
      .values(data)
      .onConflictDoUpdate({
        target: [pollVotes.userId, pollVotes.factId],
        set: {
          optionChosen: data.optionChosen,
          locationChosen: data.locationChosen || null,
          decadeChosen: data.decadeChosen || null,
          votedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getPollVotesByUser(userId: string): Promise<PollVoteWithFact[]> {
    const rows = await db
      .select({
        id: pollVotes.id,
        userId: pollVotes.userId,
        factId: pollVotes.factId,
        optionChosen: pollVotes.optionChosen,
        locationChosen: pollVotes.locationChosen,
        decadeChosen: pollVotes.decadeChosen,
        votedAt: pollVotes.votedAt,
        factTitle: facts.title,
        factSlug: facts.slug,
        factCoverPhoto: facts.coverPhoto,
      })
      .from(pollVotes)
      .leftJoin(facts, eq(pollVotes.factId, facts.id))
      .where(eq(pollVotes.userId, userId))
      .orderBy(desc(pollVotes.votedAt));
    return rows.map(r => ({
      ...r,
      factTitle: r.factTitle || "",
      factSlug: r.factSlug || "",
      factCoverPhoto: r.factCoverPhoto || null,
    }));
  }

  async getPollVoteForFact(userId: string, factId: string): Promise<PollVote | null> {
    const [result] = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.userId, userId), eq(pollVotes.factId, factId)));
    return result || null;
  }

  async getCommentsByUserId(userId: string): Promise<{ id: string; body: string; createdAt: Date; upvotes: number; isUpvotedByMe: boolean; factTitle: string; factSlug: string; factCoverPhoto: string | null }[]> {
    const rows = await db
      .select({
        id: comments.id,
        body: comments.body,
        createdAt: comments.createdAt,
        upvotes: comments.upvotes,
        factTitle: facts.mythHeader,
        factSlug: facts.slug,
        factCoverPhoto: facts.coverPhoto,
      })
      .from(comments)
      .innerJoin(facts, eq(comments.factId, facts.id))
      .where(and(eq(comments.userId, userId), eq(comments.deletedByAdmin, false)))
      .orderBy(desc(comments.createdAt));

    const myUpvotes = await db
      .select({ commentId: commentUpvotes.commentId })
      .from(commentUpvotes)
      .where(eq(commentUpvotes.userId, userId));
    const upvotedSet = new Set(myUpvotes.map(u => u.commentId));

    return rows.map(row => ({ ...row, isUpvotedByMe: upvotedSet.has(row.id) }));
  }

  async getCommentsByFactId(factId: string, viewerId?: string): Promise<CommentWithUser[]> {
    const rows = await db
      .select({
        id: comments.id,
        factId: comments.factId,
        userId: comments.userId,
        parentId: comments.parentId,
        body: comments.body,
        upvotes: comments.upvotes,
        createdAt: comments.createdAt,
        deletedByAdmin: comments.deletedByAdmin,
        editedAt: comments.editedAt,
        username: userProfiles.username,
        avatarUrl: userProfiles.avatarUrl,
        isAdmin: userProfiles.isAdmin,
        currentLocation: userProfiles.currentLocation,
        showCurrentLocation: userProfiles.showCurrentLocation,
        placesLived: userProfiles.placesLived,
        showPlacesLived: userProfiles.showPlacesLived,
        allowPublicProfile: userProfiles.allowPublicProfile,
      })
      .from(comments)
      .leftJoin(userProfiles, eq(comments.userId, userProfiles.id))
      .where(eq(comments.factId, factId))
      .orderBy(comments.createdAt);

    const upvotedSet = new Set<string>();
    const savedSet = new Set<string>();
    if (viewerId) {
      const [votes, saved] = await Promise.all([
        db.select({ commentId: commentUpvotes.commentId })
          .from(commentUpvotes)
          .where(eq(commentUpvotes.userId, viewerId)),
        db.select({ commentId: savedComments.commentId })
          .from(savedComments)
          .where(eq(savedComments.userId, viewerId)),
      ]);
      votes.forEach(v => upvotedSet.add(v.commentId));
      saved.forEach(s => savedSet.add(s.commentId));
    }

    return rows.map(r => ({
      ...r,
      userId: r.userId ?? null,
      username: r.username ?? null,
      deletedByAdmin: r.deletedByAdmin ?? false,
      editedAt: r.editedAt ?? null,
      avatarUrl: r.avatarUrl ?? "",
      isAdmin: r.isAdmin ?? false,
      showCurrentLocation: r.showCurrentLocation ?? false,
      currentLocation: r.showCurrentLocation ? (r.currentLocation ?? "") : "",
      showPlacesLived: r.showPlacesLived ?? false,
      placesLived: r.showPlacesLived ? (r.placesLived ?? []) : [],
      allowPublicProfile: r.allowPublicProfile ?? true,
      isUpvotedByMe: upvotedSet.has(r.id),
      isSavedByMe: savedSet.has(r.id),
    }));
  }

  async createComment(userId: string, data: InsertComment & { factId: string }): Promise<CommentWithUser> {
    if (data.parentId) {
      const [parent] = await db
        .select({ id: comments.id, factId: comments.factId })
        .from(comments)
        .where(eq(comments.id, data.parentId))
        .limit(1);
      if (!parent || parent.factId !== data.factId) {
        throw new Error("Invalid parentId: parent comment does not exist or belongs to a different fact");
      }
    }

    const [comment] = await db
      .insert(comments)
      .values({ factId: data.factId, userId, parentId: data.parentId ?? null, body: data.body })
      .returning();

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, userId))
      .limit(1);

    const showCurrentLocation = profile.showCurrentLocation ?? false;
    const showPlacesLived = profile.showPlacesLived ?? false;
    return {
      ...comment,
      deletedByAdmin: false,
      editedAt: null,
      username: profile.username,
      avatarUrl: profile.avatarUrl ?? "",
      isAdmin: profile.isAdmin ?? false,
      showCurrentLocation,
      currentLocation: showCurrentLocation ? (profile.currentLocation ?? "") : "",
      showPlacesLived,
      placesLived: showPlacesLived ? (profile.placesLived ?? []) : [],
      allowPublicProfile: profile.allowPublicProfile ?? true,
      isUpvotedByMe: false,
      isSavedByMe: false,
    };
  }

  async updateComment(id: string, userId: string, body: string): Promise<boolean> {
    const [comment] = await db
      .select({ userId: comments.userId })
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (!comment || comment.userId !== userId) return false;

    const result = await db
      .update(comments)
      .set({ body, editedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteComment(id: string, userId: string, isAdmin: boolean): Promise<boolean> {
    const [comment] = await db
      .select({ userId: comments.userId })
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (!comment) return false;
    if (!isAdmin && comment.userId !== userId) return false;

    // Admin deleting someone else's comment → soft-delete (keep row, mark as removed)
    if (isAdmin && comment.userId !== userId) {
      const result = await db
        .update(comments)
        .set({ deletedByAdmin: true })
        .where(eq(comments.id, id))
        .returning();
      return result.length > 0;
    }

    // Own comment → hard delete
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async toggleCommentUpvote(commentId: string, userId: string): Promise<{ upvotes: number; isUpvoted: boolean }> {
    const [existing] = await db
      .select()
      .from(commentUpvotes)
      .where(and(eq(commentUpvotes.commentId, commentId), eq(commentUpvotes.userId, userId)))
      .limit(1);

    if (existing) {
      await db.delete(commentUpvotes)
        .where(and(eq(commentUpvotes.commentId, commentId), eq(commentUpvotes.userId, userId)));
      const [updated] = await db
        .update(comments)
        .set({ upvotes: sql`GREATEST(${comments.upvotes} - 1, 0)` })
        .where(eq(comments.id, commentId))
        .returning({ upvotes: comments.upvotes });
      return { upvotes: updated?.upvotes ?? 0, isUpvoted: false };
    } else {
      await db.insert(commentUpvotes).values({ commentId, userId });
      const [updated] = await db
        .update(comments)
        .set({ upvotes: sql`${comments.upvotes} + 1` })
        .where(eq(comments.id, commentId))
        .returning({ upvotes: comments.upvotes });
      return { upvotes: updated?.upvotes ?? 1, isUpvoted: true };
    }
  }

  async saveComment(userId: string, commentId: string): Promise<void> {
    await db
      .insert(savedComments)
      .values({ userId, commentId })
      .onConflictDoNothing();
  }

  async unsaveComment(userId: string, commentId: string): Promise<boolean> {
    const result = await db
      .delete(savedComments)
      .where(and(eq(savedComments.userId, userId), eq(savedComments.commentId, commentId)))
      .returning();
    return result.length > 0;
  }

  async getCommentCountsByFactIds(factIds: string[]): Promise<Record<string, number>> {
    if (factIds.length === 0) return {};
    const rows = await db
      .select({
        factId: comments.factId,
        count: sql<number>`count(*)::int`,
      })
      .from(comments)
      .where(and(inArray(comments.factId, factIds), eq(comments.deletedByAdmin, false)))
      .groupBy(comments.factId);
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.factId] = row.count;
    }
    return result;
  }

  async getSavedCommentsByUser(userId: string): Promise<{
    commentId: string;
    body: string;
    upvotes: number;
    createdAt: Date;
    savedAt: Date;
    factTitle: string;
    factSlug: string;
    factCoverPhoto: string | null;
    authorUsername: string | null;
    authorAvatarUrl: string | null;
  }[]> {
    const rows = await db
      .select({
        commentId: comments.id,
        body: comments.body,
        upvotes: comments.upvotes,
        createdAt: comments.createdAt,
        savedAt: savedComments.savedAt,
        factTitle: facts.mythHeader,
        factSlug: facts.slug,
        factCoverPhoto: facts.coverPhoto,
        authorUsername: userProfiles.username,
        authorAvatarUrl: userProfiles.avatarUrl,
        deletedByAdmin: comments.deletedByAdmin,
      })
      .from(savedComments)
      .innerJoin(comments, eq(comments.id, savedComments.commentId))
      .innerJoin(facts, eq(facts.id, comments.factId))
      .leftJoin(userProfiles, eq(userProfiles.id, comments.userId))
      .where(and(eq(savedComments.userId, userId), eq(comments.deletedByAdmin, false)))
      .orderBy(desc(savedComments.savedAt));

    return rows.map(r => ({
      commentId: r.commentId,
      body: r.body,
      upvotes: r.upvotes,
      createdAt: r.createdAt,
      savedAt: r.savedAt,
      factTitle: r.factTitle,
      factSlug: r.factSlug,
      factCoverPhoto: r.factCoverPhoto ?? null,
      authorUsername: r.authorUsername ?? null,
      authorAvatarUrl: r.authorAvatarUrl ?? null,
    }));
  }

  // ─── Follows ────────────────────────────────────────────────────────────────

  async followUser(followerId: string, followeeId: string): Promise<void> {
    await db
      .insert(follows)
      .values({ followerId, followeeId })
      .onConflictDoNothing();
  }

  async unfollowUser(followerId: string, followeeId: string): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)))
      .returning();
    return result.length > 0;
  }

  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    const [row] = await db
      .select({ followerId: follows.followerId })
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)))
      .limit(1);
    return !!row;
  }

  async getFollowerCount(userId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followeeId, userId));
    return row?.count ?? 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return row?.count ?? 0;
  }

  // ─── Feed ───────────────────────────────────────────────────────────────────

  async getFollowingIds(userId: string): Promise<string[]> {
    const rows = await db
      .select({ followeeId: follows.followeeId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return rows.map((r) => r.followeeId);
  }

  async getFollowingFeed(userId: string, limit = 50): Promise<FeedItem[]> {
    const followingIds = await this.getFollowingIds(userId);
    if (followingIds.length === 0) return [];

    // Published facts credited to followed users (via submittedByUserId)
    const submittedFacts = await db
      .select({
        id: facts.id,
        userId: facts.submittedByUserId,
        username: userProfiles.username,
        avatarUrl: userProfiles.avatarUrl,
        createdAt: facts.createdAt,
        slug: facts.slug,
        mythHeader: facts.mythHeader,
        truthHeader: facts.truthHeader,
        coverPhoto: facts.coverPhoto,
        categories: facts.categories,
        factFilters: facts.factFilters,
        betaOnly: facts.betaOnly,
        revisionYear: facts.revisionYear,
        taughtUntilYear: facts.taughtUntilYear,
      })
      .from(facts)
      .innerJoin(userProfiles, eq(facts.submittedByUserId, userProfiles.id))
      .where(inArray(facts.submittedByUserId, followingIds))
      .orderBy(desc(facts.createdAt))
      .limit(limit);

    const commentRows = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        username: userProfiles.username,
        avatarUrl: userProfiles.avatarUrl,
        body: comments.body,
        createdAt: comments.createdAt,
        factId: facts.id,
        factSlug: facts.slug,
        factTitle: facts.mythHeader,
        factCoverPhoto: facts.coverPhoto,
      })
      .from(comments)
      .leftJoin(userProfiles, eq(comments.userId, userProfiles.id))
      .leftJoin(facts, eq(comments.factId, facts.id))
      .where(inArray(comments.userId, followingIds))
      .orderBy(desc(comments.createdAt))
      .limit(limit);

    const factItems: FeedItem[] = submittedFacts.map((f) => ({
      type: "fact" as const,
      id: f.id,
      userId: f.userId ?? "",
      username: f.username ?? "",
      avatarUrl: f.avatarUrl ?? "",
      createdAt: f.createdAt,
      factSlug: f.slug,
      mythHeader: f.mythHeader,
      truthHeader: f.truthHeader,
      factCoverPhoto2: f.coverPhoto ?? null,
      factCategories: f.categories,
      factFilters: f.factFilters ?? [],
      factBetaOnly: f.betaOnly ?? false,
      factRevisionYear: f.revisionYear ?? null,
      factTaughtUntilYear: f.taughtUntilYear ?? null,
    }));

    const commentItems: FeedItem[] = commentRows.map((c) => ({
      type: "comment" as const,
      id: c.id,
      userId: c.userId,
      username: c.username ?? "",
      avatarUrl: c.avatarUrl ?? "",
      createdAt: c.createdAt,
      commentBody: c.body,
      factId: c.factId ?? undefined,
      factSlug: c.factSlug ?? undefined,
      factTitle: c.factTitle ?? undefined,
      factCoverPhoto: c.factCoverPhoto ?? undefined,
    }));

    return [...factItems, ...commentItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getForYouFeed(userId?: string, limit = 50): Promise<FeedItem[]> {
    // Get user's favorite tags
    let favoriteTags: string[] = [];
    if (userId) {
      const [profile] = await db
        .select({ favoriteTags: userProfiles.favoriteTags })
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);
      favoriteTags = profile?.favoriteTags ?? [];
    }

    // No favorite tags → return empty (UI shows "Add topics" prompt)
    if (favoriteTags.length === 0) return [];

    // Build a safe PostgreSQL array parameter using ARRAY[...] constructor
    const tagLiterals = favoriteTags.map((t) => sql`${t}`);
    const tagsArray = sql`ARRAY[${sql.join(tagLiterals, sql`, `)}]::text[]`;

    // Query published facts whose searchTags overlap with favoriteTags
    const factRows = await db
      .select({
        id: facts.id,
        slug: facts.slug,
        mythHeader: facts.mythHeader,
        truthHeader: facts.truthHeader,
        coverPhoto: facts.coverPhoto,
        categories: facts.categories,
        factFilters: facts.factFilters,
        betaOnly: facts.betaOnly,
        revisionYear: facts.revisionYear,
        taughtUntilYear: facts.taughtUntilYear,
        createdAt: facts.createdAt,
      })
      .from(facts)
      .where(sql`${facts.searchTags} && ${tagsArray}`)
      .orderBy(desc(facts.createdAt))
      .limit(limit);

    // Query published external articles whose tags or category overlaps with favoriteTags
    const articleRows = await db
      .select({
        id: externalArticles.id,
        title: externalArticles.title,
        externalUrl: externalArticles.externalUrl,
        publicationName: externalArticles.publicationName,
        summary: externalArticles.summary,
        coverImage: externalArticles.coverImage,
        category: externalArticles.category,
        createdAt: externalArticles.createdAt,
      })
      .from(externalArticles)
      .where(
        and(
          eq(externalArticles.published, true),
          or(
            sql`${externalArticles.tags} && ${tagsArray}`,
            sql`${externalArticles.category} = ANY(${tagsArray})`
          )
        )
      )
      .orderBy(desc(externalArticles.createdAt))
      .limit(limit);

    const factItems: FeedItem[] = factRows.map((f) => ({
      type: "fact" as const,
      id: f.id,
      userId: "",
      username: "",
      avatarUrl: "",
      createdAt: f.createdAt,
      factSlug: f.slug,
      mythHeader: f.mythHeader,
      truthHeader: f.truthHeader,
      factCoverPhoto2: f.coverPhoto ?? null,
      factCategories: f.categories,
      factFilters: f.factFilters ?? [],
      factBetaOnly: f.betaOnly ?? false,
      factRevisionYear: f.revisionYear ?? null,
      factTaughtUntilYear: f.taughtUntilYear ?? null,
    }));

    const articleItems: FeedItem[] = articleRows.map((a) => ({
      type: "article" as const,
      id: a.id,
      userId: "",
      username: "",
      avatarUrl: "",
      createdAt: a.createdAt,
      articleUrl: a.externalUrl,
      articleTitle: a.title,
      publicationName: a.publicationName,
      articleSummary: a.summary ?? undefined,
      articleCoverImage: a.coverImage ?? null,
    }));

    return [...factItems, ...articleItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // ─── Fact Follows ────────────────────────────────────────────────────────────

  async followFact(userId: string, factId: string): Promise<void> {
    await db
      .insert(factFollows)
      .values({ userId, factId })
      .onConflictDoNothing();
  }

  async unfollowFact(userId: string, factId: string): Promise<boolean> {
    const result = await db
      .delete(factFollows)
      .where(and(eq(factFollows.userId, userId), eq(factFollows.factId, factId)))
      .returning();
    return result.length > 0;
  }

  async getFactFollowStatus(userId: string, factId: string): Promise<boolean> {
    const [row] = await db
      .select({ userId: factFollows.userId })
      .from(factFollows)
      .where(and(eq(factFollows.userId, userId), eq(factFollows.factId, factId)))
      .limit(1);
    return !!row;
  }

  // ─── Fact Updates ─────────────────────────────────────────────────────────────

  async createFactUpdateBatch(factId: string, updates: { updateType: UpdateType; content: unknown }[]): Promise<void> {
    if (updates.length === 0) return;
    const publishBatchId = crypto.randomUUID();
    const now = new Date();
    await db.insert(factUpdates).values(
      updates.map((u) => ({
        factId,
        publishBatchId,
        updateType: u.updateType,
        content: JSON.parse(JSON.stringify(u.content)),
        publishedAt: now,
      }))
    );
  }

  async getFactUpdatesFeed(userId: string): Promise<FactUpdateWithFact[]> {
    // Get all fact IDs the user follows
    const followedRows = await db
      .select({ factId: factFollows.factId })
      .from(factFollows)
      .where(eq(factFollows.userId, userId));

    if (followedRows.length === 0) return [];
    const followedFactIds = followedRows.map((r) => r.factId);

    const rows = await db
      .select({
        id: factUpdates.id,
        factId: factUpdates.factId,
        publishBatchId: factUpdates.publishBatchId,
        updateType: factUpdates.updateType,
        content: factUpdates.content,
        publishedAt: factUpdates.publishedAt,
        factSlug: facts.slug,
        factMythHeader: facts.mythHeader,
        factCoverPhoto: facts.coverPhoto,
      })
      .from(factUpdates)
      .innerJoin(facts, eq(factUpdates.factId, facts.id))
      .where(inArray(factUpdates.factId, followedFactIds))
      .orderBy(desc(factUpdates.publishedAt));

    return rows.map((r) => ({
      ...r,
      updateType: r.updateType as UpdateType,
      factSlug: r.factSlug,
      factMythHeader: r.factMythHeader,
      factCoverPhoto: r.factCoverPhoto ?? null,
    }));
  }
}

export const storage = new DatabaseStorage();
