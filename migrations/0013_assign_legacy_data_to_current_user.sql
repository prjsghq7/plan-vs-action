-- T06 legacy records predate authentication. Assign them only when the
-- database has exactly one account, so migration cannot guess between users.
UPDATE plans
SET user_id = (SELECT id FROM users ORDER BY created_at, id LIMIT 1)
WHERE user_id IS NULL
  AND (SELECT COUNT(*) FROM users) = 1;

UPDATE tags
SET user_id = (SELECT id FROM users ORDER BY created_at, id LIMIT 1)
WHERE user_id IS NULL
  AND (SELECT COUNT(*) FROM users) = 1;

-- Tag identity is per user, not per shared legacy workspace.
DROP INDEX IF EXISTS idx_tags_normalized;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_user_normalized
  ON tags(user_id, normalized_name)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tags_user_search
  ON tags(user_id, search_key);
