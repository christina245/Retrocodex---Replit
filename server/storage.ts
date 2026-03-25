import { 
  emailSubscriptions, 
  facts,
  blogPosts,
  externalArticles,
  newsletterSubscriptions,
  type EmailSubscription, 
  type InsertEmailSubscription,
  type Fact,
  type InsertFact,
  type BlogPost,
  type InsertBlogPost,
  type ExternalArticle,
  type InsertExternalArticle,
  type NewsletterSubscription,
  type InsertNewsletterSubscription
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, arrayContains, inArray } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
