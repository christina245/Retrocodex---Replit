# Retrocodex

## Overview

Retrocodex is a fact-checking website that helps users "unlearn" outdated or untrue beliefs. The platform displays curated facts across various categories (History, Life Sciences, Health & Fitness, Social Sciences, Gender & Sexuality, and Everyday Life), presenting common myths alongside current scientific understanding. Users can browse featured or recently added facts, with planned functionality for saving, sharing, and commenting on facts.

The application is built as a full-stack web application with a React frontend and Express backend, designed to match exact Figma specifications with careful attention to typography, color palette, and spacing requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management

**UI Component System**
- Shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Component architecture follows the "New York" style variant
- Custom CSS modules for complex components (FactCard, Header, Footer, etc.)

**Design System**
- Typography: Merriweather (serif) for content, Public Sans (sans-serif) for UI elements
- Color palette: Primary brand red (#FF5353), text color (#2C2C2C), category-specific colors
- Strict adherence to Figma specifications (290px × 460px fact cards, exact spacing, etc.)
- Responsive design with mobile-first breakpoints

**Key Frontend Components**
- `FactCard`: Displays myth vs. truth with category-specific styling
- `CategoryNav`: Horizontal scrollable navigation for fact categories
- `EmailSignupBanner`: Sticky sidebar for email collection
- `SaveModal` & `ShareModal`: Future functionality placeholders
- `HamburgerMenu`: Slide-out navigation menu

**Blog System Components**
- `ArticlesPage`: Lists published blog posts with category/tag filtering, fetches from `/api/blog-posts/published`
- `SingleBlogPage`: Individual article view at `/articles/:slug` with sticky header, 60% width hero image (desktop), action buttons (comment/save/share), sidebar with Beehiiv newsletter embed, comments section, and related articles
- `BlogCard`: Card component for blog post previews with navigation links to individual articles
- `HeroSection`: Displays featured blog posts from `/api/blog-posts/featured` with actual published dates
- `TiptapEditor`: Rich text editor in admin panel for creating/editing blog posts
- `BeehiivBanner`: External newsletter subscription embed from Beehiiv service (270px x 264px)
- `ArticleShareModal`: Share modal for blog articles with preview (cover image, title, summary) and copy link functionality
- `CommentModal`: Comment modal placeholder directing users to Reddit community

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for type-safe API development
- Separate development (`index-dev.ts`) and production (`index-prod.ts`) entry points
- Custom middleware for request logging and JSON parsing with raw body access

**Development vs Production**
- Development: Vite dev server integrated as Express middleware for HMR
- Production: Static file serving from pre-built `dist/public` directory
- Hot module replacement and error overlay in development

**API Design**
- RESTful API endpoints under `/api` prefix
- Email subscription management (`POST /api/emails`, `GET /api/emails`)
- Newsletter subscriptions (`POST /api/newsletter-subscriptions`)
- Blog posts CRUD (`GET /api/blog-posts`, `GET /api/blog-posts/published`, `GET /api/blog-posts/featured`, `GET /api/blog-posts/:slug`, `POST /api/blog-posts`, `PUT /api/blog-posts/:id`, `DELETE /api/blog-posts/:id`)
- File upload for cover images (`POST /api/upload`)
- Basic HTTP authentication for admin routes using environment variable
- Zod schema validation for request payloads

**Authentication & Authorization**
- Simple HTTP Basic Auth for admin panel access
- Password stored in `ADMIN_PASSWORD` environment variable (default: "admin123")
- Auth middleware (`requireAuth`) protects admin-only routes

### Data Storage Solutions

**Database**
- PostgreSQL database via Neon serverless platform
- Drizzle ORM for type-safe database operations
- WebSocket-based connection pooling for serverless environments

**Schema Design**
- `email_subscriptions`: Captures user emails with source tracking ('signup-banner' or 'save-modal')
- `newsletter_subscriptions`: Separate table for newsletter signups (distinct from account emails)
- `blog_posts`: WordPress-style blog posts with title, slug, summary, coverImage, category, tags (array), content (rich text), authorName, authorType (Staff/Guest), authorLink, authorPhoto, heroFeatured, published status, publishedAt, relatedManualIds (optional array for manual related article selection)
- `users`: Planned table for future user authentication (currently unused)
- UUID primary keys using PostgreSQL's `gen_random_uuid()`
- Timestamps with automatic `defaultNow()` for creation tracking

**Data Access Layer**
- Repository pattern via `DatabaseStorage` class implementing `IStorage` interface
- Separation of concerns between route handlers and data access
- Type-safe queries using Drizzle's query builder

### Key Architectural Decisions

**Monorepo Structure**
- Shared schema definitions in `/shared` folder accessible to both client and server
- Path aliases (`@/`, `@shared/`, `@assets/`) for clean imports
- Single TypeScript configuration covering client, server, and shared code

**State Management**
- Server state managed by TanStack Query with infinite stale time
- Local component state for UI interactions (modals, menus, forms)
- No global client state management (Redux/Zustand) as not needed for current scope

**Form Validation**
- Zod for runtime type validation and schema definition
- Drizzle-zod integration for generating Zod schemas from database schema
- Client-side and server-side validation using same schema definitions

**Static Assets**
- Images stored in `/attached_assets` directory
- Custom Vite alias (`@assets`) for clean asset imports
- Google Fonts (Merriweather, Public Sans) loaded via CDN

**Error Handling**
- Custom error overlay in development via Replit plugin
- Structured error responses with appropriate HTTP status codes
- Toast notifications for user-facing errors

## External Dependencies

**Database & ORM**
- Neon Serverless PostgreSQL (`@neondatabase/serverless`) - Serverless Postgres with WebSocket support
- Drizzle ORM (`drizzle-orm`, `drizzle-kit`) - Type-safe ORM with migration support
- `ws` package for WebSocket constructor in Node.js environment

**UI Component Libraries**
- Radix UI primitives (20+ component packages) - Unstyled, accessible UI components
- Shadcn/ui - Pre-styled component patterns built on Radix
- Lucide React - Icon library
- React Icons - Additional icons (Instagram, Bluesky, X/Twitter, etc.)

**Styling & Forms**
- Tailwind CSS with autoprefixer - Utility-first CSS framework
- `class-variance-authority` - Type-safe variant styling
- React Hook Form with Zod resolvers - Form state management and validation

**Developer Experience**
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal)
- TypeScript for full-stack type safety
- ESBuild for production server bundling

**External Services**
- Typeform integration for fact submission (external link)
- Buy Me a Coffee for donations (external link)
- Social media platforms (Instagram, Bluesky, X/Twitter) for engagement

**Future Integrations**
- User authentication system (schema exists but not implemented)
- Commenting system (UI placeholder exists)
- Social sharing APIs (Facebook, WhatsApp, Telegram, Messenger, Discord)
- Fact permalink system with unique URLs