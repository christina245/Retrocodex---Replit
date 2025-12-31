import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmailSubscriptionSchema, insertFactSchema, insertBlogPostSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

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
      const OTHER_SUBCATEGORIES = [
        "Animals", "Astronomy", "Beauty", "Earth Science", "Technology",
        "Food", "Linguistics", "Music", "Physics", "Uncategorized"
      ];
      
      const matchingSubcategories = OTHER_SUBCATEGORIES.filter(sub => 
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

  const httpServer = createServer(app);
  return httpServer;
}
