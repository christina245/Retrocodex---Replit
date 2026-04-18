-- Add archived flag to facts so admins can hide facts from the public site without deleting them.
ALTER TABLE facts ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
