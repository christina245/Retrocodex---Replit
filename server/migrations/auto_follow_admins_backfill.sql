-- Task #39: Backfill existing non-admin users to follow all admin accounts
-- Idempotent: ON CONFLICT DO NOTHING skips pairs that already exist.
-- New registrations already auto-follow admins via routes.ts; this covers older accounts.
INSERT INTO follows (follower_id, followee_id, created_at)
SELECT non_admin.id AS follower_id,
       admin.id     AS followee_id,
       NOW()        AS created_at
FROM user_profiles non_admin
CROSS JOIN user_profiles admin
WHERE non_admin.is_admin = false
  AND admin.is_admin = true
  AND non_admin.id <> admin.id
ON CONFLICT DO NOTHING;
