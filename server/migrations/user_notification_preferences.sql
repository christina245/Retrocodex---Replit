-- Add notification preference columns to user_profiles
-- These columns store per-user notification settings for followers, comments, and fact updates
-- Both website (in-app) and email variants for each notification type
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS notify_follows_web boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_follows_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_comments_web boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_comments_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_fact_updates_web boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_fact_updates_email boolean NOT NULL DEFAULT true;
