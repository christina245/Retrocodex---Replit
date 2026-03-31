-- Migration: add decade_chosen column to poll_votes
-- Applied: 2026-03-31
-- Allows users to optionally record which decade they learned a fact

ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS decade_chosen VARCHAR;
