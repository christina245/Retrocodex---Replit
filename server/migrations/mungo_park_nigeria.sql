-- Migration: Assign the Mungo Park fact to Nigeria on the world map
-- Executed: 2026-05-06
--
-- Uses a title-based lookup so this is safe across environments regardless
-- of UUID differences.  ARRAY_APPEND is idempotent when the value is
-- already present (the IF NOT EXISTS guard in the WHERE clause ensures a
-- repeat run does not duplicate the entry).
UPDATE facts
SET map_regions = CASE
  WHEN 'Nigeria' = ANY(COALESCE(map_regions, '{}'))
    THEN map_regions
  ELSE COALESCE(map_regions, '{}') || ARRAY['Nigeria']
END
WHERE title ILIKE '%Mungo Park%';

-- Verification query (for manual confirmation):
-- SELECT id, title, map_regions FROM facts WHERE title ILIKE '%Mungo Park%';
-- Expected: map_regions contains 'Nigeria'
