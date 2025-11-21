import { 
  emailSubscriptions, 
  type EmailSubscription, 
  type InsertEmailSubscription 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Email subscriptions
  createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription>;
  getAllEmailSubscriptions(): Promise<EmailSubscription[]>;
  getEmailSubscriptionByEmail(email: string): Promise<EmailSubscription | undefined>;
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
}

export const storage = new DatabaseStorage();
