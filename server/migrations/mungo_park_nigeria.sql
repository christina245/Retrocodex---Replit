-- Migration: Assign the Mungo Park fact to Nigeria on the world map
-- Executed: 2026-05-06
UPDATE facts
SET map_regions = ARRAY['Nigeria']
WHERE id = 'f655143c-617f-46a2-88dd-93c18de1db10';
