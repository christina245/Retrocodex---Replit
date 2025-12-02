import { 
  emailSubscriptions, 
  facts,
  type EmailSubscription, 
  type InsertEmailSubscription,
  type Fact,
  type InsertFact
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
  updateFact(id: string, fact: Partial<InsertFact>): Promise<Fact | undefined>;
  deleteFact(id: string): Promise<boolean>;
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
}

export const storage = new DatabaseStorage();
