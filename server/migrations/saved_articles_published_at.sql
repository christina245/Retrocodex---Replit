ALTER TABLE saved_articles
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
