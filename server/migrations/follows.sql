-- Task #32: Follows table and allow_follows column on user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS allow_follows BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS follows (
  follower_id varchar NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  followee_id varchar NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_followee_id_idx ON follows(followee_id);
