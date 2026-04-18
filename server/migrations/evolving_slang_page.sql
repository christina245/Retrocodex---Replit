-- Migration: Seed the Evolving Slang page
-- Applied: 2026-04-18
-- Idempotent: safe to re-run.

INSERT INTO pages (id, slug, title)
VALUES (
  'e5db9065-9728-4a0f-8062-0511780202ac',
  'evolving-slang',
  'American English slang that evolved over time'
)
ON CONFLICT (slug) DO NOTHING;
