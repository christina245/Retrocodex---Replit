# Retrocodex

## Overview

Retrocodex is a fact-checking website designed to challenge and correct common misconceptions across various domains like History, Life Sciences, and Health. It aims to "unlearn" outdated beliefs by presenting common myths alongside current scientific understanding. The platform allows users to browse curated facts, with future plans for features like saving, sharing, and commenting. The project's vision is to become a go-to resource for accurate information, fostering critical thinking and promoting evidence-based understanding in everyday life. It's built as a full-stack web application, adhering strictly to a meticulously designed Figma specification for a high-quality user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 and TypeScript, using Vite for development and Wouter for routing. Server state management is handled by TanStack Query. The UI leverages Shadcn/ui (based on Radix UI) and Tailwind CSS, following a "New York" design system with specific typography (Merriweather, Public Sans) and a defined color palette. Key components include `FactCard` for displaying myth vs. truth, `HomepageCategoryNav` for navigation, and `SourcesModal` for beta-only fact details. User dashboard functionality includes a profile page, editable profile modal with an `AvatarPickerModal` (DiceBear-powered), and tabbed feeds for "For You", "Following", "Local", and "Saved" facts. A comprehensive blog system features `ArticlesPage`, `SingleBlogPage`, and `BlogCard` components, with content creation managed via `TiptapEditor` in the admin panel. SEO is managed through a reusable `SEO` component and `FAQSchema` for structured data.

### Backend Architecture

The backend is an Express.js application with TypeScript, designed for both development (Vite integration) and production environments. It provides a RESTful API under the `/api` prefix for managing email subscriptions, blog posts (CRUD), facts by tags, and saved facts. Authentication for admin routes uses simple HTTP Basic Auth and role-based authorization via an `isAdmin` flag in the user profile. Request payloads are validated using Zod schemas.

### Data Storage Solutions

The application uses a PostgreSQL database hosted on Neon, accessed via Drizzle ORM for type-safe operations. The schema includes tables for `email_subscriptions`, `newsletter_subscriptions`, `facts` (with detailed myth/truth, sources, timeline, nuances), `pages` (for standalone content), `blog_posts` (WordPress-style), `users` (planned for authentication), `saved_facts` (user bookmarks), and `comments` (supporting both facts and pages). UUIDs are used as primary keys.

### Key Architectural Decisions

A monorepo structure with shared schema definitions in a `/shared` folder promotes code reuse. State management relies on TanStack Query for server state and local component state for UI interactions, avoiding global client-side state managers. Zod is used for consistent client-side and server-side form validation. Static assets are managed with custom Vite aliases.

## External Dependencies

**Database & ORM:** Neon Serverless PostgreSQL, Drizzle ORM, `ws`.
**UI Component Libraries:** Radix UI, Shadcn/ui, Lucide React, React Icons, DiceBear (for avatar generation).
**Styling & Forms:** Tailwind CSS, `class-variance-authority`, React Hook Form with Zod resolvers.
**Developer Experience:** Replit plugins, TypeScript, ESBuild.
**External Services:** Typeform (for fact submission), Buy Me a Coffee (for donations), social media platforms (Instagram, Bluesky, X/Twitter).
**Analytics:** Google Analytics 4.
**External Articles CMS:** Integration with `externalArticles` table and an `/api/articles` endpoint to merge blog posts and curated third-party content.