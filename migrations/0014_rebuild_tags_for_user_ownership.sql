-- Remove the legacy UNIQUE(workspace_id, name) table constraint. Tags are
-- intentionally allowed to have the same display name for different users.
CREATE TABLE tags_user_owned (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL COLLATE NOCASE,
  normalized_name TEXT,
  search_key TEXT,
  user_id TEXT REFERENCES users(id)
) STRICT;

INSERT INTO tags_user_owned(id,workspace_id,name,normalized_name,search_key,user_id)
SELECT id,workspace_id,name,normalized_name,search_key,user_id FROM tags;

CREATE TABLE task_tags_user_owned (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags_user_owned(id) ON DELETE CASCADE,
  PRIMARY KEY(task_id,tag_id)
) WITHOUT ROWID, STRICT;

INSERT INTO task_tags_user_owned(task_id,tag_id)
SELECT task_id,tag_id FROM task_tags;

DROP TABLE task_tags;
DROP TABLE tags;
ALTER TABLE tags_user_owned RENAME TO tags;
ALTER TABLE task_tags_user_owned RENAME TO task_tags;

CREATE UNIQUE INDEX idx_tags_user_normalized
  ON tags(user_id,normalized_name)
  WHERE user_id IS NOT NULL;
CREATE INDEX idx_tags_user_search ON tags(user_id,search_key);
CREATE INDEX idx_tags_owner ON tags(user_id,normalized_name);
