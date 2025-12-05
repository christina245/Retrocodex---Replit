import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmailSubscriptionSchema, insertFactSchema, insertBlogPostSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: uploadStorage,
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

function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ message: "Authentication required" });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ message: "Invalid credentials" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  // POST /api/uploads - Upload a file (password protected)
  app.post("/api/uploads", requireAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded files statically
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

  const httpServer = createServer(app);
  return httpServer;
}
