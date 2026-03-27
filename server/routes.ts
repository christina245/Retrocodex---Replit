import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmailSubscriptionSchema, insertFactSchema, insertBlogPostSchema, insertNewsletterSubscriptionSchema, userAccounts, userProfiles, registerSchema, updateProfileSchema, OTHER_SUBCATEGORIES, factSubmissions, insertFactSubmissionSchema, insertExternalArticleSchema, externalArticles } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { eq, gte, count, and, sql, desc } from "drizzle-orm";
import { db } from "./db";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { sendMail, buildSubmissionConfirmationEmail } from "./mailer";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Configure multer for memory storage (for Object Storage uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === "image/svg+xml";
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// Simple password middleware for admin routes
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Rate limiting for failed login attempts
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

interface FailedAttempt {
  count: number;
  firstAttempt: number;
}

const failedLoginAttempts = new Map<string, FailedAttempt>();

function getClientIP(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const record = failedLoginAttempts.get(ip);
  if (!record) return false;
  
  const now = Date.now();
  // Reset if window has passed
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    failedLoginAttempts.delete(ip);
    return false;
  }
  
  return record.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedLoginAttempts.get(ip);
  
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    failedLoginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}

function clearFailedAttempts(ip: string): void {
  failedLoginAttempts.delete(ip);
}

function requireAuth(req: any, res: any, next: any) {
  const clientIP = getClientIP(req);
  
  // Check if IP is rate limited
  if (isRateLimited(clientIP)) {
    return res.status(429).json({ 
      message: "Too many failed login attempts. Please try again later." 
    });
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // Count missing/invalid auth headers as failed attempts to prevent brute-force
    recordFailedAttempt(clientIP);
    const record = failedLoginAttempts.get(clientIP);
    const remainingAttempts = MAX_FAILED_ATTEMPTS - (record?.count || 0);
    
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ 
      message: remainingAttempts > 0 
        ? `Authentication required. ${remainingAttempts} attempts remaining.`
        : "Too many failed login attempts. Please try again later."
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (password === ADMIN_PASSWORD) {
    clearFailedAttempts(clientIP);
    next();
  } else {
    recordFailedAttempt(clientIP);
    const record = failedLoginAttempts.get(clientIP);
    const remainingAttempts = MAX_FAILED_ATTEMPTS - (record?.count || 0);
    
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ 
      message: remainingAttempts > 0 
        ? `Invalid credentials. ${remainingAttempts} attempts remaining.`
        : "Too many failed login attempts. Please try again later."
    });
  }
}

// Per-IP rate limiting for user auth endpoints
const authAttempts = new Map<string, { count: number; firstAttempt: number }>();
const AUTH_MAX_ATTEMPTS = 10;
const AUTH_WINDOW_MS = 15 * 60 * 1000;

function isAuthRateLimited(ip: string): boolean {
  const record = authAttempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.firstAttempt > AUTH_WINDOW_MS) {
    authAttempts.delete(ip);
    return false;
  }
  return record.count >= AUTH_MAX_ATTEMPTS;
}

function recordAuthAttempt(ip: string): void {
  const record = authAttempts.get(ip);
  if (!record || Date.now() - record.firstAttempt > AUTH_WINDOW_MS) {
    authAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    record.count++;
  }
}

function clearAuthAttempts(ip: string): void {
  authAttempts.delete(ip);
}

// Per-IP rate limiting for submission endpoint (20 per hour)
const submissionIpAttempts = new Map<string, { count: number; firstAttempt: number }>();
const SUBMISSION_IP_MAX = 20;
const SUBMISSION_IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isSubmissionIpRateLimited(ip: string): boolean {
  const record = submissionIpAttempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.firstAttempt > SUBMISSION_IP_WINDOW_MS) {
    submissionIpAttempts.delete(ip);
    return false;
  }
  return record.count >= SUBMISSION_IP_MAX;
}

function recordSubmissionIpAttempt(ip: string): void {
  const record = submissionIpAttempts.get(ip);
  if (!record || Date.now() - record.firstAttempt > SUBMISSION_IP_WINDOW_MS) {
    submissionIpAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    record.count++;
  }
}

function requireUser(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/auth/register — create new user account + profile
  app.post("/api/auth/register", async (req, res) => {
    const ip = getClientIP(req);
    if (isAuthRateLimited(ip)) {
      return res.status(429).json({ message: "Too many attempts. Please try again later." });
    }
    try {
      const data = registerSchema.parse(req.body);

      const existingAccount = await db.select({ id: userAccounts.id })
        .from(userAccounts)
        .where(eq(userAccounts.email, data.email.toLowerCase()))
        .limit(1);
      if (existingAccount.length > 0) {
        recordAuthAttempt(ip);
        return res.status(409).json({ message: "An account with this email already exists." });
      }

      const existingProfile = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.username, data.username))
        .limit(1);
      if (existingProfile.length > 0) {
        return res.status(409).json({ message: "This username is already taken." });
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      const [account] = await db.insert(userAccounts)
        .values({ email: data.email.toLowerCase(), passwordHash })
        .returning({ id: userAccounts.id });

      const [profile] = await db.insert(userProfiles)
        .values({
          id: account.id,
          username: data.username,
          avatarUrl: data.avatarUrl || "",
          currentLocation: data.currentLocation || "",
          showCurrentLocation: data.showCurrentLocation ?? false,
          placesLived: data.placesLived || [],
          showPlacesLived: data.showPlacesLived ?? false,
          favoriteTags: data.favoriteTags || [],
          misinfoSource: data.misinfoSource || "",
          bio: data.bio || "",
        })
        .returning();

      req.session.userId = account.id;
      clearAuthAttempts(ip);
      return res.status(201).json({
        id: profile.id,
        username: profile.username,
        email: data.email.toLowerCase(),
        bio: profile.bio,
        profilePhoto: profile.avatarUrl,
        currentLocation: profile.currentLocation,
        showCurrentLocation: profile.showCurrentLocation,
        placesLived: profile.placesLived,
        showPlacesLived: profile.showPlacesLived,
        favoriteTags: profile.favoriteTags,
        misinfoSource: profile.misinfoSource,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req, res) => {
    const ip = getClientIP(req);
    if (isAuthRateLimited(ip)) {
      return res.status(429).json({ message: "Too many failed attempts. Please try again in 15 minutes." });
    }
    try {
      const { identifier, password } = z.object({
        identifier: z.string().min(1),
        password: z.string().min(1),
      }).parse(req.body);

      let account: typeof userAccounts.$inferSelect | undefined;

      if (identifier.includes("@")) {
        const [row] = await db.select()
          .from(userAccounts)
          .where(eq(userAccounts.email, identifier.toLowerCase()))
          .limit(1);
        account = row;
      } else {
        const [row] = await db
          .select({ account: userAccounts })
          .from(userProfiles)
          .innerJoin(userAccounts, eq(userAccounts.id, userProfiles.id))
          .where(eq(userProfiles.username, identifier))
          .limit(1);
        account = row?.account;
      }

      if (!account) {
        recordAuthAttempt(ip);
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const passwordMatch = await bcrypt.compare(password, account.passwordHash);
      if (!passwordMatch) {
        recordAuthAttempt(ip);
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const [profile] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.id, account.id))
        .limit(1);

      req.session.userId = account.id;
      clearAuthAttempts(ip);
      return res.json({
        id: profile.id,
        username: profile.username,
        email: account.email,
        bio: profile.bio,
        profilePhoto: profile.avatarUrl,
        currentLocation: profile.currentLocation,
        showCurrentLocation: profile.showCurrentLocation,
        placesLived: profile.placesLived,
        showPlacesLived: profile.showPlacesLived,
        favoriteTags: profile.favoriteTags,
        misinfoSource: profile.misinfoSource,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Email and password are required." });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  // GET /api/me — returns current session user or 401
  app.get("/api/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const [account] = await db.select({ email: userAccounts.email })
        .from(userAccounts)
        .where(eq(userAccounts.id, req.session.userId))
        .limit(1);
      const [profile] = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.id, req.session.userId))
        .limit(1);

      if (!account || !profile) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Not authenticated" });
      }

      return res.json({
        id: profile.id,
        username: profile.username,
        email: account.email,
        bio: profile.bio,
        profilePhoto: profile.avatarUrl,
        currentLocation: profile.currentLocation,
        showCurrentLocation: profile.showCurrentLocation,
        placesLived: profile.placesLived,
        showPlacesLived: profile.showPlacesLived,
        favoriteTags: profile.favoriteTags,
        misinfoSource: profile.misinfoSource,
        isAdmin: profile.isAdmin ?? false,
      });
    } catch (error) {
      console.error("GET /api/me error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // PUT /api/me — update current user's profile
  app.put("/api/me", requireUser, async (req, res) => {
    try {
      const data = updateProfileSchema.parse(req.body);

      if (data.username) {
        const [existing] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.username, data.username))
          .limit(1);
        if (existing && existing.id !== req.session.userId) {
          return res.status(409).json({ message: "This username is already taken." });
        }
      }

      const [updated] = await db.update(userProfiles)
        .set({
          ...(data.username !== undefined && { username: data.username }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
          ...(data.currentLocation !== undefined && { currentLocation: data.currentLocation }),
          ...(data.showCurrentLocation !== undefined && { showCurrentLocation: data.showCurrentLocation }),
          ...(data.placesLived !== undefined && { placesLived: data.placesLived }),
          ...(data.showPlacesLived !== undefined && { showPlacesLived: data.showPlacesLived }),
          ...(data.favoriteTags !== undefined && { favoriteTags: data.favoriteTags }),
          ...(data.misinfoSource !== undefined && { misinfoSource: data.misinfoSource }),
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.id, req.session.userId!))
        .returning();

      const [account] = await db.select({ email: userAccounts.email })
        .from(userAccounts)
        .where(eq(userAccounts.id, req.session.userId!))
        .limit(1);

      return res.json({
        id: updated.id,
        username: updated.username,
        email: account.email,
        bio: updated.bio,
        profilePhoto: updated.avatarUrl,
        currentLocation: updated.currentLocation,
        showCurrentLocation: updated.showCurrentLocation,
        placesLived: updated.placesLived,
        showPlacesLived: updated.showPlacesLived,
        favoriteTags: updated.favoriteTags,
        misinfoSource: updated.misinfoSource,
        isAdmin: updated.isAdmin ?? false,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("PUT /api/me error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // GET /api/users/:username — public profile lookup (used for badges + profile pages)
  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const [profile] = await db.select({
        id: userProfiles.id,
        username: userProfiles.username,
        bio: userProfiles.bio,
        avatarUrl: userProfiles.avatarUrl,
        currentLocation: userProfiles.currentLocation,
        showCurrentLocation: userProfiles.showCurrentLocation,
        placesLived: userProfiles.placesLived,
        showPlacesLived: userProfiles.showPlacesLived,
        favoriteTags: userProfiles.favoriteTags,
        misinfoSource: userProfiles.misinfoSource,
        isAdmin: userProfiles.isAdmin,
        createdAt: userProfiles.createdAt,
      })
        .from(userProfiles)
        .where(eq(userProfiles.username, username))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(profile);
    } catch (error) {
      console.error("GET /api/users/:username error:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // POST /api/admin/grant-admin — grant admin status to a user by username
  app.post("/api/admin/grant-admin", requireAuth, async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) return res.status(400).json({ message: "Username is required" });

      const [profile] = await db
        .update(userProfiles)
        .set({ isAdmin: true, updatedAt: new Date() })
        .where(eq(userProfiles.username, username))
        .returning({ username: userProfiles.username, isAdmin: userProfiles.isAdmin });

      if (!profile) return res.status(404).json({ message: "User not found" });
      return res.json({ message: `${username} is now an admin`, profile });
    } catch (error) {
      console.error("POST /api/admin/grant-admin error:", error);
      res.status(500).json({ message: "Failed to grant admin" });
    }
  });

  // POST /api/admin/revoke-admin — revoke admin status from a user by username
  app.post("/api/admin/revoke-admin", requireAuth, async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) return res.status(400).json({ message: "Username is required" });

      const [profile] = await db
        .update(userProfiles)
        .set({ isAdmin: false, updatedAt: new Date() })
        .where(eq(userProfiles.username, username))
        .returning({ username: userProfiles.username, isAdmin: userProfiles.isAdmin });

      if (!profile) return res.status(404).json({ message: "User not found" });
      return res.json({ message: `${username} is no longer an admin`, profile });
    } catch (error) {
      console.error("POST /api/admin/revoke-admin error:", error);
      res.status(500).json({ message: "Failed to revoke admin" });
    }
  });

  // GET /api/admin/admins — list all admin users
  app.get("/api/admin/admins", requireAuth, async (req, res) => {
    try {
      const admins = await db
        .select({ username: userProfiles.username, createdAt: userProfiles.createdAt })
        .from(userProfiles)
        .where(eq(userProfiles.isAdmin, true));
      return res.json(admins);
    } catch (error) {
      console.error("GET /api/admin/admins error:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // POST /api/emails - Create email subscription
  app.post("/api/emails", async (req, res) => {
    try {
      const validatedData = insertEmailSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getEmailSubscriptionByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ 
          message: "This email is already subscribed!" 
        });
      }

      const subscription = await storage.createEmailSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid email address" 
        });
      }
      console.error("Error creating email subscription:", error);
      res.status(500).json({ message: "Failed to save email" });
    }
  });

  // GET /api/emails - Get all email subscriptions (password protected)
  app.get("/api/emails", requireAuth, async (req, res) => {
    try {
      const subscriptions = await storage.getAllEmailSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching email subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  // POST /api/uploads - Upload a file to Object Storage (password protected)
  app.post("/api/uploads", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.uploadBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      res.json({ url: objectPath });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve files from Object Storage
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Keep legacy /uploads route for backwards compatibility with existing data
  app.use("/uploads", (await import("express")).static(path.join(process.cwd(), "uploads")));

  // POST /api/facts - Create a new fact (password protected)
  app.post("/api/facts", requireAuth, async (req, res) => {
    try {
      const validatedData = insertFactSchema.parse(req.body);
      
      // Check if slug already exists
      const existing = await storage.getFactBySlug(validatedData.slug);
      if (existing) {
        return res.status(400).json({ 
          message: "A fact with this slug already exists!" 
        });
      }

      const fact = await storage.createFact(validatedData);
      res.status(201).json(fact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid data",
          errors: error.errors
        });
      }
      console.error("Error creating fact:", error);
      res.status(500).json({ message: "Failed to create fact" });
    }
  });

  // GET /api/facts - Get all facts (public)
  app.get("/api/facts", async (req, res) => {
    try {
      const facts = await storage.getAllFacts();
      res.json(facts);
    } catch (error) {
      console.error("Error fetching facts:", error);
      res.status(500).json({ message: "Failed to fetch facts" });
    }
  });

  // GET /api/facts/popular - Get popular facts ordered by popularOrder (public)
  app.get("/api/facts/popular", async (req, res) => {
    try {
      const allFacts = await storage.getAllFacts();
      const popularFacts = allFacts
        .filter(fact => fact.isPopular === true)
        .sort((a, b) => {
          // Sort by popularOrder if both have it, otherwise by createdAt
          if (a.popularOrder != null && b.popularOrder != null) {
            return a.popularOrder - b.popularOrder;
          }
          if (a.popularOrder != null) return -1;
          if (b.popularOrder != null) return 1;
          // Fallback to createdAt (newest first)
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      res.json(popularFacts);
    } catch (error) {
      console.error("Error fetching popular facts:", error);
      res.status(500).json({ message: "Failed to fetch popular facts" });
    }
  });

  app.get("/api/facts/by-tags", async (req, res) => {
    try {
      const tagsParam = req.query.tags as string || "";
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);
      const tags = tagsParam.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
      if (tags.length === 0) {
        return res.json({ facts: [], total: 0, page, totalPages: 0 });
      }
      const allFacts = await storage.getAllFacts();
      const matching = allFacts
        .filter(fact =>
          fact.searchTags && fact.searchTags.some(t => tags.includes(t.toLowerCase()))
        )
        .sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      const total = matching.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const facts = matching.slice(start, start + limit);
      res.json({ facts, total, page, totalPages });
    } catch (error) {
      console.error("Error fetching facts by tags:", error);
      res.status(500).json({ message: "Failed to fetch facts by tags" });
    }
  });

  // GET /api/facts/by-tag/:tag - Get facts by searchTags (public)
  app.get("/api/facts/by-tag/:tag", async (req, res) => {
    try {
      const tagSlug = req.params.tag;
      const tagName = tagSlug.replace(/-/g, ' ');
      const allFacts = await storage.getAllFacts();
      const matchingFacts = allFacts.filter(fact => 
        fact.searchTags && fact.searchTags.some(t => 
          t.toLowerCase() === tagName.toLowerCase() || 
          t.toLowerCase().replace(/\s+/g, '-') === tagSlug.toLowerCase()
        )
      );
      res.json(matchingFacts);
    } catch (error) {
      console.error("Error fetching facts by tag:", error);
      res.status(500).json({ message: "Failed to fetch facts by tag" });
    }
  });

  // GET /api/search - Search facts and subcategories (public)
  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string || "").toLowerCase().trim();
      
      if (!query) {
        return res.json({ facts: [], matchingSubcategories: [], tagOnlyFacts: [] });
      }

      const allFacts = await storage.getAllFacts();
      
      // Check for matching subcategories
      const matchingSubcategories = [...OTHER_SUBCATEGORIES].filter(sub => 
        sub.toLowerCase().includes(query)
      );

      // Search facts by text content (title, mythHeader, truthHeader)
      const textMatchFacts: any[] = [];
      const tagOnlyFacts: any[] = [];

      for (const fact of allFacts) {
        const titleMatch = fact.title?.toLowerCase().includes(query);
        const mythHeaderMatch = fact.mythHeader?.toLowerCase().includes(query);
        const truthHeaderMatch = fact.truthHeader?.toLowerCase().includes(query);
        
        const hasTextMatch = titleMatch || mythHeaderMatch || truthHeaderMatch;
        
        // Check tag matches
        const hasTagMatch = fact.searchTags?.some(tag => 
          tag.toLowerCase().includes(query)
        );

        if (hasTextMatch) {
          textMatchFacts.push({ ...fact, matchType: 'text' });
        } else if (hasTagMatch) {
          tagOnlyFacts.push({ ...fact, matchType: 'tag' });
        }
      }

      res.json({ 
        facts: textMatchFacts, 
        matchingSubcategories,
        tagOnlyFacts 
      });
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  app.get("/api/facts/tags-by-category", async (req, res) => {
    try {
      const allFacts = await storage.getAllFacts();
      const result: Record<string, Record<string, string[]>> = {};

      for (const fact of allFacts) {
        const categories = fact.categories || [];
        const subcategories = fact.subcategories || [];
        const tags = fact.searchTags || [];
        if (tags.length === 0) continue;

        for (const cat of categories) {
          if (!result[cat]) result[cat] = { _all: [] };
          for (const tag of tags) {
            if (!result[cat]._all.includes(tag)) result[cat]._all.push(tag);
          }
          for (const sub of subcategories) {
            if (!result[cat][sub]) result[cat][sub] = [];
            for (const tag of tags) {
              if (!result[cat][sub].includes(tag)) result[cat][sub].push(tag);
            }
          }
        }
      }

      for (const cat of Object.keys(result)) {
        for (const key of Object.keys(result[cat])) {
          result[cat][key].sort();
        }
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching tags by category:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  // GET /api/facts/by-ids - Get facts by their IDs (public)
  app.get("/api/facts/by-ids", async (req, res) => {
    try {
      const idsParam = req.query.ids as string;
      if (!idsParam) {
        return res.json([]);
      }
      const ids = idsParam.split(',').filter(id => id.trim());
      if (ids.length === 0) {
        return res.json([]);
      }
      const matchingFacts = await storage.getFactsByIds(ids);
      res.json(matchingFacts);
    } catch (error) {
      console.error("Error fetching facts by IDs:", error);
      res.status(500).json({ message: "Failed to fetch facts" });
    }
  });

  // GET /api/facts/:slug - Get a fact by slug (public)
  app.get("/api/facts/:slug", async (req, res) => {
    try {
      const fact = await storage.getFactBySlug(req.params.slug);
      if (!fact) {
        return res.status(404).json({ message: "Fact not found" });
      }
      res.json(fact);
    } catch (error) {
      console.error("Error fetching fact:", error);
      res.status(500).json({ message: "Failed to fetch fact" });
    }
  });

  // PUT /api/facts/:id - Update a fact (password protected)
  app.put("/api/facts/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertFactSchema.partial().parse(req.body);
      const fact = await storage.updateFact(req.params.id, validatedData);
      if (!fact) {
        return res.status(404).json({ message: "Fact not found" });
      }
      res.json(fact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid data",
          errors: error.errors
        });
      }
      console.error("Error updating fact:", error);
      res.status(500).json({ message: "Failed to update fact" });
    }
  });

  // DELETE /api/facts/:id - Delete a fact (password protected)
  app.delete("/api/facts/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteFact(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Fact not found" });
      }
      res.json({ message: "Fact deleted successfully" });
    } catch (error) {
      console.error("Error deleting fact:", error);
      res.status(500).json({ message: "Failed to delete fact" });
    }
  });

  // ==================== BLOG POSTS ====================

  // POST /api/blog-posts - Create a new blog post (password protected)
  app.post("/api/blog-posts", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      
      // Check if slug already exists
      const existing = await storage.getBlogPostBySlug(validatedData.slug);
      if (existing) {
        return res.status(400).json({ 
          message: "A blog post with this slug already exists!" 
        });
      }

      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid data",
          errors: error.errors
        });
      }
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // GET /api/blog-posts - Get all blog posts (password protected for admin)
  app.get("/api/blog-posts", requireAuth, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // GET /api/blog-posts/published - Get published blog posts (public)
  app.get("/api/blog-posts/published", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // GET /api/blog-posts/featured - Get featured blog posts for hero (public)
  app.get("/api/blog-posts/featured", async (req, res) => {
    try {
      const posts = await storage.getFeaturedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching featured blog posts:", error);
      res.status(500).json({ message: "Failed to fetch featured posts" });
    }
  });

  // GET /api/blog-posts/:slug - Get a blog post by slug (public, but only published)
  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      // Only return published posts publicly (unless admin)
      const authHeader = req.headers.authorization;
      if (!post.published && (!authHeader || !authHeader.startsWith('Basic '))) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // PUT /api/blog-posts/:id - Update a blog post (password protected)
  app.put("/api/blog-posts/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      
      // Check if changing slug to one that already exists
      if (validatedData.slug) {
        const existing = await storage.getBlogPostBySlug(validatedData.slug);
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ 
            message: "A blog post with this slug already exists!" 
          });
        }
      }

      const post = await storage.updateBlogPost(req.params.id, validatedData);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid data",
          errors: error.errors
        });
      }
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  // DELETE /api/blog-posts/:id - Delete a blog post (password protected)
  app.delete("/api/blog-posts/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteBlogPost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // ==================== EXTERNAL ARTICLES ====================

  // POST /api/parse-url — admin: fetch OG metadata from a URL
  app.post("/api/parse-url", requireAuth, async (req, res) => {
    try {
      const { url } = z.object({ url: z.string().url() }).parse(req.body);
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Retrocodex/1.0; +https://theretrocodex.com)",
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        return res.status(400).json({ message: "Failed to fetch URL" });
      }
      const html = await response.text();
      const getMeta = (name: string): string => {
        const patterns = [
          new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i"),
          new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
        ];
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match?.[1]) return match[1].trim();
        }
        return "";
      };
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = getMeta("og:title") || (titleMatch?.[1]?.trim() ?? "");
      const image = getMeta("og:image");
      const publication = getMeta("og:site_name");
      const author = getMeta("article:author") || getMeta("og:author") || getMeta("author");
      return res.json({ title, image, publication, author });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "A valid URL is required" });
      }
      console.error("POST /api/parse-url error:", error);
      res.status(500).json({ message: "Failed to parse URL metadata" });
    }
  });

  // GET /api/external-articles/published — public: list published external articles
  app.get("/api/external-articles/published", async (req, res) => {
    try {
      const articles = await storage.getPublishedExternalArticles();
      res.json(articles);
    } catch (error) {
      console.error("GET /api/external-articles/published error:", error);
      res.status(500).json({ message: "Failed to fetch published external articles" });
    }
  });

  // POST /api/external-articles — admin: create external article
  app.post("/api/external-articles", requireAuth, async (req, res) => {
    try {
      const data = insertExternalArticleSchema.parse(req.body);
      const article = await storage.createExternalArticle(data);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid data", errors: error.errors });
      }
      console.error("POST /api/external-articles error:", error);
      res.status(500).json({ message: "Failed to create external article" });
    }
  });

  // GET /api/external-articles — admin: list all
  app.get("/api/external-articles", requireAuth, async (req, res) => {
    try {
      const articles = await storage.getAllExternalArticles();
      res.json(articles);
    } catch (error) {
      console.error("GET /api/external-articles error:", error);
      res.status(500).json({ message: "Failed to fetch external articles" });
    }
  });

  // PUT /api/external-articles/:id — admin: update
  app.put("/api/external-articles/:id", requireAuth, async (req, res) => {
    try {
      const data = insertExternalArticleSchema.partial().parse(req.body);
      const article = await storage.updateExternalArticle(req.params.id, data);
      if (!article) return res.status(404).json({ message: "External article not found" });
      res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid data" });
      }
      console.error("PUT /api/external-articles/:id error:", error);
      res.status(500).json({ message: "Failed to update external article" });
    }
  });

  // DELETE /api/external-articles/:id — admin: delete
  app.delete("/api/external-articles/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteExternalArticle(req.params.id);
      if (!deleted) return res.status(404).json({ message: "External article not found" });
      res.json({ message: "External article deleted successfully" });
    } catch (error) {
      console.error("DELETE /api/external-articles/:id error:", error);
      res.status(500).json({ message: "Failed to delete external article" });
    }
  });

  // GET /api/articles — public: unified list of published blog posts + external articles
  app.get("/api/articles", async (req, res) => {
    try {
      const [blogPostsData, externalData] = await Promise.all([
        storage.getPublishedBlogPosts(),
        storage.getPublishedExternalArticles(),
      ]);

      const normalized = [
        ...blogPostsData.map(p => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          summary: p.summary,
          coverImage: p.coverImage || "",
          category: p.category,
          tags: p.tags || [],
          createdAt: p.createdAt ? p.createdAt.toISOString() : null,
          publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
          originalPublishedAt: null as string | null,
          isExternal: false,
          externalUrl: null as string | null,
          publicationName: null as string | null,
          isPaywalled: false,
        })),
        ...externalData.map(a => ({
          id: a.id,
          slug: a.id,
          title: a.title,
          summary: a.summary || "",
          coverImage: a.coverImage || "",
          category: a.category,
          tags: a.tags || [],
          createdAt: a.createdAt ? a.createdAt.toISOString() : null,
          publishedAt: a.createdAt ? a.createdAt.toISOString() : null,
          originalPublishedAt: a.publishedAt || null,
          isExternal: true,
          externalUrl: a.externalUrl,
          publicationName: a.publicationName,
          isPaywalled: a.isPaywalled ?? false,
        })),
      ].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      res.json(normalized);
    } catch (error) {
      console.error("GET /api/articles error:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // ==================== NEWSLETTER SUBSCRIPTIONS ====================

  // POST /api/newsletter - Subscribe to newsletter (public)
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getNewsletterSubscriptionByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ 
          message: "This email is already subscribed to the newsletter!" 
        });
      }

      const subscription = await storage.createNewsletterSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: error.errors[0]?.message || "Invalid email address" 
        });
      }
      console.error("Error creating newsletter subscription:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // GET /api/newsletter - Get all newsletter subscriptions (password protected)
  app.get("/api/newsletter", requireAuth, async (req, res) => {
    try {
      const subscriptions = await storage.getAllNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching newsletter subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch newsletter subscriptions" });
    }
  });

  // ==================== FACT SUBMISSIONS ====================

  // POST /api/submissions — authenticated users submit a fact (max 5 per 24h, 20/hr per IP)
  app.post("/api/submissions", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const ip = getClientIP(req);

      // IP-based rate limit (20 per hour)
      if (isSubmissionIpRateLimited(ip)) {
        return res.status(429).json({ message: "Too many submissions from this IP. Please try again later." });
      }
      recordSubmissionIpAttempt(ip);

      // Check shadowban — silently succeed without writing to DB
      const [profile] = await db
        .select({ username: userProfiles.username, submissionBanned: userProfiles.submissionBanned })
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);

      if (!profile) {
        return res.status(401).json({ message: "User profile not found." });
      }

      if (profile.submissionBanned) {
        // Shadowban: return 201 as if successful, but don't write to DB
        return res.status(201).json({ id: "shadow", status: "pending" });
      }

      // Rate limit: max 5 submissions per 24 hours
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(factSubmissions)
        .where(and(eq(factSubmissions.userId, userId), gte(factSubmissions.createdAt, since)));
      const last24h = countResult?.count ?? 0;

      if (last24h >= 5) {
        return res.status(429).json({ message: "You've reached the 5 submission limit for today. Try again tomorrow." });
      }

      const data = insertFactSubmissionSchema.parse(req.body);

      const [submission] = await db.insert(factSubmissions)
        .values({
          userId,
          username: profile.username,
          mythHeader: data.mythHeader,
          mythDetails: data.mythDetails || "",
          truthHeader: data.truthHeader,
          truthDetails: data.truthDetails || "",
          sources: data.sources,
          considerations: data.considerations || "",
          otherDetails: data.otherDetails || "",
          status: "pending",
        })
        .returning();

      // Send confirmation email — fire and forget, never blocks the response
      (async () => {
        try {
          const [account] = await db
            .select({ email: userAccounts.email })
            .from(userAccounts)
            .where(eq(userAccounts.id, userId))
            .limit(1);

          if (account?.email) {
            const { subject, text, html } = buildSubmissionConfirmationEmail(data.mythHeader);
            await sendMail({ to: account.email, subject, text, html });
          }
        } catch (mailErr) {
          console.error("[mailer] Submission confirmation email failed:", mailErr);
        }
      })();

      return res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid submission data" });
      }
      console.error("POST /api/submissions error:", error);
      res.status(500).json({ message: "Failed to submit fact. Please try again." });
    }
  });

  // GET /api/submissions — admin: list submissions with submitter email, supports ?status= filter
  app.get("/api/submissions", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      let query = db
        .select({
          id: factSubmissions.id,
          userId: factSubmissions.userId,
          username: factSubmissions.username,
          mythHeader: factSubmissions.mythHeader,
          mythDetails: factSubmissions.mythDetails,
          truthHeader: factSubmissions.truthHeader,
          truthDetails: factSubmissions.truthDetails,
          sources: factSubmissions.sources,
          considerations: factSubmissions.considerations,
          otherDetails: factSubmissions.otherDetails,
          status: factSubmissions.status,
          adminNote: factSubmissions.adminNote,
          draftData: factSubmissions.draftData,
          createdAt: factSubmissions.createdAt,
          email: userAccounts.email,
          submissionBanned: userProfiles.submissionBanned,
        })
        .from(factSubmissions)
        .leftJoin(userAccounts, eq(userAccounts.id, factSubmissions.userId))
        .leftJoin(userProfiles, eq(userProfiles.id, factSubmissions.userId))
        .orderBy(desc(factSubmissions.createdAt));

      const results = status
        ? await query.where(eq(factSubmissions.status, status as string))
        : await query;

      return res.json(results);
    } catch (error) {
      console.error("GET /api/submissions error:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // GET /api/submissions/me — user: fetch own submissions ordered by date desc
  app.get("/api/submissions/me", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const submissions = await db
        .select({
          id: factSubmissions.id,
          mythHeader: factSubmissions.mythHeader,
          mythDetails: factSubmissions.mythDetails,
          truthHeader: factSubmissions.truthHeader,
          truthDetails: factSubmissions.truthDetails,
          sources: factSubmissions.sources,
          considerations: factSubmissions.considerations,
          status: factSubmissions.status,
          adminNote: factSubmissions.adminNote,
          draftData: factSubmissions.draftData,
          createdAt: factSubmissions.createdAt,
        })
        .from(factSubmissions)
        .where(eq(factSubmissions.userId, userId))
        .orderBy(desc(factSubmissions.createdAt));
      return res.json(submissions);
    } catch (error) {
      console.error("GET /api/submissions/me error:", error);
      res.status(500).json({ message: "Failed to fetch your submissions" });
    }
  });

  // GET /api/submissions/mine — alias for /api/submissions/me (backward compat)
  app.get("/api/submissions/mine", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const submissions = await db
        .select()
        .from(factSubmissions)
        .where(eq(factSubmissions.userId, userId))
        .orderBy(desc(factSubmissions.createdAt));
      return res.json(submissions);
    } catch (error) {
      console.error("GET /api/submissions/mine error:", error);
      res.status(500).json({ message: "Failed to fetch your submissions" });
    }
  });

  // PATCH /api/submissions/:id — admin: update status, adminNote, or draftData
  app.patch("/api/submissions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNote, draftData } = z.object({
        status: z.enum(["pending", "saved", "rejected", "published"]).optional(),
        adminNote: z.string().optional(),
        draftData: z.record(z.any()).optional(),
      }).parse(req.body);

      if (status === "rejected" && !adminNote) {
        return res.status(400).json({ message: "An admin note is required when rejecting a submission." });
      }

      const updates: Record<string, any> = {};
      if (status !== undefined) updates.status = status;
      if (adminNote !== undefined) updates.adminNote = adminNote;
      if (draftData !== undefined) updates.draftData = draftData;

      const [updated] = await db
        .update(factSubmissions)
        .set(updates)
        .where(eq(factSubmissions.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Submission not found." });
      }
      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid data" });
      }
      console.error("PATCH /api/submissions/:id error:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // POST /api/admin/toggle-submission-ban — admin: toggle submissionBanned on a user
  app.post("/api/admin/toggle-submission-ban", requireAuth, async (req, res) => {
    try {
      const { userId } = z.object({ userId: z.string().min(1) }).parse(req.body);
      const [profile] = await db
        .select({ submissionBanned: userProfiles.submissionBanned })
        .from(userProfiles)
        .where(eq(userProfiles.id, userId))
        .limit(1);
      if (!profile) {
        return res.status(404).json({ message: "User not found." });
      }
      const [updated] = await db
        .update(userProfiles)
        .set({ submissionBanned: !profile.submissionBanned })
        .where(eq(userProfiles.id, userId))
        .returning({ submissionBanned: userProfiles.submissionBanned });
      return res.json({ submissionBanned: updated.submissionBanned });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "userId is required" });
      }
      console.error("POST /api/admin/toggle-submission-ban error:", error);
      res.status(500).json({ message: "Failed to toggle submission ban" });
    }
  });

  // ==================== SITEMAP & ROBOTS ====================
  const SITE_URL = "https://theretrocodex.com";

  // GET /sitemap.xml - Dynamic sitemap for SEO
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const facts = await storage.getAllFacts();
      const blogPosts = await storage.getPublishedBlogPosts();
      const currentDate = new Date().toISOString().split('T')[0];

      // Static pages with priorities
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/about", priority: "0.8", changefreq: "monthly" },
        { url: "/articles", priority: "0.9", changefreq: "weekly" },
        { url: "/category/history", priority: "0.8", changefreq: "weekly" },
        { url: "/category/life-sciences", priority: "0.8", changefreq: "weekly" },
        { url: "/category/everyday-life", priority: "0.8", changefreq: "weekly" },
        { url: "/category/health-fitness", priority: "0.8", changefreq: "weekly" },
        { url: "/category/social-sciences", priority: "0.8", changefreq: "weekly" },
        { url: "/category/gender-sexuality", priority: "0.8", changefreq: "weekly" },
        { url: "/category/other", priority: "0.7", changefreq: "weekly" },
        { url: "/category/other/animals", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/astronomy", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/beauty", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/earth-science", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/food", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/linguistics", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/music", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/physics", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/technology", priority: "0.6", changefreq: "weekly" },
        { url: "/category/other/holidays", priority: "0.6", changefreq: "weekly" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      // Add static pages
      for (const page of staticPages) {
        xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }

      // Add fact pages
      for (const fact of facts) {
        const lastmod = fact.createdAt ? new Date(fact.createdAt).toISOString().split('T')[0] : currentDate;
        xml += `  <url>
    <loc>${SITE_URL}/fact/${fact.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }

      // Add blog post pages
      for (const post of blogPosts) {
        const lastmod = post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : currentDate;
        xml += `  <url>
    <loc>${SITE_URL}/articles/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }

      xml += `</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // GET /robots.txt - Search engine instructions
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  const POLL_OPTIONS = [
    "Yes, in school",
    "Yes, outside of school",
    "No",
    "Not sure",
    "I was taught a different version",
    "I was taught the presently accurate version",
    "Other",
  ] as const;

  // POST /api/poll-votes — save or update a user's poll vote
  app.post("/api/poll-votes", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { factId, optionChosen, locationChosen } = req.body;
      if (!factId || !optionChosen) {
        return res.status(400).json({ message: "factId and optionChosen are required" });
      }
      if (!POLL_OPTIONS.includes(optionChosen)) {
        return res.status(400).json({ message: "Invalid poll option" });
      }
      const vote = await storage.upsertPollVote({
        userId: req.session.userId,
        factId,
        optionChosen,
        locationChosen: locationChosen || null,
      });
      return res.json(vote);
    } catch (err) {
      console.error("Poll vote error:", err);
      return res.status(500).json({ message: "Failed to save vote" });
    }
  });

  // GET /api/poll-votes/me — fetch current user's poll votes with fact data
  app.get("/api/poll-votes/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const votes = await storage.getPollVotesByUser(req.session.userId);
      return res.json(votes);
    } catch (err) {
      console.error("Poll votes fetch error:", err);
      return res.status(500).json({ message: "Failed to fetch votes" });
    }
  });

  // GET /api/user/saved-articles — get authenticated user's saved articles
  app.get("/api/user/saved-articles", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const articles = await storage.getSavedArticlesByUser(req.session.userId);
      res.json(articles);
    } catch (error) {
      console.error("GET /api/user/saved-articles error:", error);
      res.status(500).json({ message: "Failed to fetch saved articles" });
    }
  });

  // POST /api/user/saved-articles — save an article to user's account
  app.post("/api/user/saved-articles", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { articleKey, articleType, title, summary, coverImage, category, slug, externalUrl } = req.body;
      if (!articleKey || !articleType || !title || !category) {
        return res.status(400).json({ message: "articleKey, articleType, title, and category are required" });
      }
      const saved = await storage.saveArticle({
        userId: req.session.userId,
        articleKey,
        articleType,
        title,
        summary: summary || "",
        coverImage: coverImage || "",
        category,
        slug: slug || "",
        externalUrl: externalUrl || "",
      });
      res.json(saved);
    } catch (error) {
      console.error("POST /api/user/saved-articles error:", error);
      res.status(500).json({ message: "Failed to save article" });
    }
  });

  // DELETE /api/user/saved-articles/:id — unsave an article by record ID
  app.delete("/api/user/saved-articles/:id", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const deleted = await storage.unsaveArticle(req.session.userId, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Saved article not found" });
      res.json({ message: "Article unsaved successfully" });
    } catch (error) {
      console.error("DELETE /api/user/saved-articles/:id error:", error);
      res.status(500).json({ message: "Failed to unsave article" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
