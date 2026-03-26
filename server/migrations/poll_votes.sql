-- Task #25: Poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL,
  fact_id varchar NOT NULL,
  option_chosen varchar NOT NULL,
  location_chosen varchar,
  voted_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT poll_votes_user_fact UNIQUE (user_id, fact_id)
);
