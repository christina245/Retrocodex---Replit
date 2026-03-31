-- Add allow_public_profile to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS allow_public_profile BOOLEAN NOT NULL DEFAULT true;

-- Saved comments table
CREATE TABLE IF NOT EXISTS saved_comments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  comment_id varchar NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  saved_at timestamp NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Make comments.user_id nullable (SET NULL when user account is deleted, preserving the comment)
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE SET NULL;
