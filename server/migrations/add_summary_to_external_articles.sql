-- Migration: Add summary column to external_articles table
-- Executed: 2026-03-25
ALTER TABLE external_articles ADD COLUMN IF NOT EXISTS summary text;
