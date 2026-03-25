-- Migration: Rename "Facts" tag → "Fact Collection" in all articles
-- Executed: 2026-03-25
-- Reason: BLOG_TAGS enum renamed "Facts" to "Fact Collection" and added "Questioning the Facts"

UPDATE external_articles
SET tags = array_replace(tags, 'Facts', 'Fact Collection')
WHERE 'Facts' = ANY(tags);

UPDATE blog_posts
SET tags = array_replace(tags, 'Facts', 'Fact Collection')
WHERE 'Facts' = ANY(tags);
