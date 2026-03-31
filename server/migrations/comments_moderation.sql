-- Task #38: Comment moderation columns (soft-delete by admin + edit tracking)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_by_admin boolean NOT NULL DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at timestamp;
