-- Task #29: Saved facts table (user bookmarks)
CREATE TABLE IF NOT EXISTS saved_facts (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  fact_id varchar NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  saved_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT saved_facts_user_fact UNIQUE (user_id, fact_id)
);
