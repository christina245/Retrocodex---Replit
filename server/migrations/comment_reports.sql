-- Add AI moderation columns to comments table
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_categories jsonb;

-- Create comment_reports table for user-submitted reports
CREATE TABLE IF NOT EXISTS comment_reports (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id varchar NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id varchar REFERENCES user_accounts(id) ON DELETE SET NULL,
  reasons text[] NOT NULL DEFAULT '{}',
  detail text DEFAULT '',
  resolved_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE(comment_id, reporter_id)
);
