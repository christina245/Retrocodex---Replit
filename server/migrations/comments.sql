-- Task #31: Comments and comment upvotes tables
CREATE TABLE IF NOT EXISTS comments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_id varchar NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  user_id varchar NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  parent_id varchar,
  body text NOT NULL,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_fact_id_idx ON comments(fact_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_id);

CREATE TABLE IF NOT EXISTS comment_upvotes (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id varchar NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id varchar NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT comment_upvotes_comment_user UNIQUE (comment_id, user_id)
);
