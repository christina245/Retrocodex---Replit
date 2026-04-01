ALTER TABLE saved_articles
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

ALTER TABLE saved_articles
  ADD COLUMN IF NOT EXISTS publication_name text;

ALTER TABLE saved_articles
  ADD COLUMN IF NOT EXISTS original_published_at text;
