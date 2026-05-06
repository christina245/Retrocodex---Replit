# Retrocodex

A fact-checking website that challenges common misconceptions by presenting myths alongside current scientific understanding — helping users "unlearn" outdated beliefs.

## Run & Operate
- **Dev**: `npm run dev` → Express + Vite on port 5000
- **DB push**: `npx drizzle-kit push`
- **Required env vars**: `DATABASE_URL`, `SENDGRID_API_KEY`

## Stack
- **Frontend**: React 18, TypeScript, Vite, Wouter (routing), TanStack Query v5
- **UI**: Shadcn/ui (Radix UI + Tailwind CSS, "New York" variant)
- **Backend**: Express.js + TypeScript
- **ORM**: Drizzle ORM → Neon serverless PostgreSQL
- **Validation**: Zod + drizzle-zod

## Where Things Live
- `client/src/pages/` — page components (HomePage, ArticlesPage, SingleBlogPage, UserDashboard…)
- `client/src/components/` — shared components (FactCard, WorldMapPlaceholder, HamburgerMenu, SEO…)
- `server/routes.ts` — all API endpoints
- `server/storage.ts` — DatabaseStorage class (repository pattern)
- `shared/schema.ts` — Drizzle schema + Zod insert schemas (source of truth)
- `client/public/countries-110m.json` — world-atlas TopoJSON served locally for the Regionally Taught map

## Architecture Decisions
- **Monorepo**: shared schema/types via `@shared/*` path alias
- **World map**: Uses `react-simple-maps` (MIT) + local `countries-110m.json` — replaced the licensed FLA/Raphael map to eliminate the demo watermark; no iframe needed
- **Server state**: TanStack Query caches all API responses; no global client state manager
- **Static fonts**: Loaded via Google Fonts CDN; custom Vite aliases for assets
- **Admin auth**: Basic HTTP auth on `/api/admin/*` routes; `isAdmin` flag on user row

## Product
- Browse curated fact cards by decade, category, tab (Featured / New / Popular / Current Events / Debated / Regionally Taught)
- Regionally Taught tab: interactive world map (click country → filter facts) + US sub-region buttons
- User accounts: save facts, avatar picker (DiceBear), follow system, notifications
- Blog/Articles: full CMS with Tiptap editor (admin), Beehiiv newsletter banner, external article ingestion with OG metadata
- SEO: per-page meta tags, Open Graph, JSON-LD FAQ schema, dynamic sitemap + robots.txt, GA4

## User Preferences
- Preferred communication style: Simple, everyday language.

## Gotchas
- `client/public/countries-110m.json` must stay in sync with `world-atlas@2` if the npm package is updated
- Country name mapping between the DB (`mapRegions` text[]) and world-atlas feature names lives in `WorldMapPlaceholder.tsx` (`DB_TO_GEO` / `GEO_TO_DB`)
- Pre-existing TypeScript strict-mode errors in `HeroSection.tsx`, `CommentsSection.tsx`, `formerCountries.ts` — unrelated to map work
