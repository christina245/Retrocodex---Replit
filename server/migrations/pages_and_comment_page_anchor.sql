-- Migration: Add pages table and page-aware comment anchoring
-- Applied: 2026-04-16

-- 1. Create the pages table for standalone non-fact pages (e.g. Former Countries)
CREATE TABLE IF NOT EXISTS pages (
  id        VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  slug      VARCHAR NOT NULL UNIQUE,
  title     VARCHAR NOT NULL,
  description TEXT
);

-- 2. Seed the Former Countries page
INSERT INTO pages (id, slug, title, description)
VALUES (
  '97e5dfa9-25bf-4470-8c47-4d8dc8905b6c',
  'former-countries',
  'List of former countries from 1930-2026',
  'A list of former countries sorted by the year they ceased to exist.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Allow comments.fact_id to be NULL (page comments won't have a fact anchor)
ALTER TABLE comments ALTER COLUMN fact_id DROP NOT NULL;

-- 4. Add page_id FK column to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS page_id VARCHAR REFERENCES pages(id);

-- 5. Re-anchor the former-countries comment(s) from the stub fact to the page
--    (stub fact slug was 'former-countries-page'; update any comments that pointed to it)
UPDATE comments
SET fact_id = NULL,
    page_id = '97e5dfa9-25bf-4470-8c47-4d8dc8905b6c'
WHERE fact_id = (
  SELECT id FROM facts WHERE slug = 'former-countries-page' LIMIT 1
);

-- 6. Delete the stub fact that was used as a workaround
DELETE FROM facts WHERE slug = 'former-countries-page';
