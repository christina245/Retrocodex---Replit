ALTER TABLE facts ADD COLUMN IF NOT EXISTS map_regions text[] DEFAULT '{}';
