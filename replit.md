# Retrocodex

## Overview
Retrocodex is a fact-checking website designed to challenge and correct common misconceptions across various categories like History, Life Sciences, and Health & Fitness. It presents common myths alongside current scientific understanding, aiming to "unlearn" outdated beliefs. The platform is a full-stack web application built with React and Express, meticulously designed to match Figma specifications, focusing on typography, color, and spacing for a polished user experience. Key capabilities include browsing curated facts, with future plans for user accounts, saving, sharing, and commenting features. The project aims to become a primary resource for evidence-based information, fostering critical thinking and promoting accurate understanding.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Build Tools**: React 18 with TypeScript, Vite, Wouter for routing, and TanStack Query for server state management.
- **UI Component System**: Shadcn/ui based on Radix UI, styled with Tailwind CSS following a "New York" style variant. Custom CSS modules for complex components.
- **Design System**: Employs Merriweather (serif) and Public Sans (sans-serif) fonts, a primary brand red (#FF5353), and category-specific colors, strictly adhering to Figma designs for responsiveness and visual consistency.
- **Key Components**: Includes `FactCard` for myth vs. truth display, `HomepageCategoryNav`, `EmailSignupBanner`, `SaveModal`, `ShareModal`, and `SourcesModal` for detailed fact information. A `HamburgerMenu` for navigation and an `SEO` component for page metadata are also central.
- **Dashboard Components**: Features a `UserDashboard` with profile editing, a 4-tab feed (For You, Following, Local, Saved), and an `AvatarPickerModal` using DiceBear for avatar generation.
- **Blog System Components**: Includes `ArticlesPage`, `SingleBlogPage`, `BlogCard`, `HeroSection` for featured posts, `TiptapEditor` for content creation (admin), and `BeehiivBanner` for newsletter subscriptions.

### Backend Architecture
- **Server Framework**: Express.js with TypeScript, supporting separate development and production environments.
- **API Design**: RESTful API endpoints (`/api`) for managing emails, newsletter subscriptions, blog posts (CRUD), facts by tags, and saved facts. It also includes file upload and basic HTTP authentication for admin routes.
- **Authentication & Authorization**: Basic HTTP authentication for admin access, with an `isAdmin` flag in the user profile. Admin management features are available.

### Data Storage Solutions
- **Database**: PostgreSQL via Neon serverless platform, utilizing Drizzle ORM for type-safe operations.
- **Schema Design**: Tables include `email_subscriptions`, `newsletter_subscriptions`, `facts` (with detailed myth/truth, sources, timeline, nuances), `pages`, `blog_posts`, `users`, `saved_facts`, and `comments` (supporting both fact and page comments). UUIDs are used for primary keys and timestamps for tracking.
- **Data Access Layer**: Implements a repository pattern with a `DatabaseStorage` class for clear separation of concerns.

### Key Architectural Decisions
- **Monorepo Structure**: Shared schema definitions and path aliases for client and server code.
- **State Management**: TanStack Query for server state, local component state for UI, avoiding global client state management for current scope.
- **Form Validation**: Zod for both client-side and server-side validation, integrated with Drizzle-zod.
- **Static Assets**: Stored locally and loaded via CDN for fonts, with custom Vite aliases.
- **Error Handling**: Custom error overlay in development and structured error responses.

## External Dependencies

- **Database & ORM**: Neon Serverless PostgreSQL, Drizzle ORM, `ws` package.
- **UI Component Libraries**: Radix UI primitives, Shadcn/ui, Lucide React, React Icons, DiceBear for avatar generation.
- **Styling & Forms**: Tailwind CSS, `class-variance-authority`, React Hook Form with Zod resolvers.
- **Developer Experience**: Replit-specific plugins, TypeScript, ESBuild.
- **External Services**: Typeform (fact submission), Buy Me a Coffee (donations), social media platforms (Instagram, Bluesky, X/Twitter).
- **SEO Implementation**: Reusable `SEO` and `FAQSchema` components, dynamic sitemap and `robots.txt` generation, Google Analytics 4 integration.
- **External Articles CMS**: `externalArticles` table for curated third-party articles, with server-side OG metadata parsing and a unified public endpoint (`/api/articles`) merging blog posts and external content.