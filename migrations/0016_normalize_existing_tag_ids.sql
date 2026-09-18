-- Normalize legacy tag identifiers to the same opaque UUID format used by new tags.
PRAGMA foreign_keys=OFF;

CREATE TABLE tag_id_map (
  old_id TEXT PRIMARY KEY,
  new_id TEXT NOT NULL UNIQUE
) STRICT;

INSERT INTO tag_id_map(old_id,new_id)
SELECT id,'tag_' || lower(hex(randomblob(16)))
FROM tags;

CREATE TABLE tags_id_normalized (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL COLLATE NOCASE,
  normalized_name TEXT,
  search_key TEXT
) STRICT;

INSERT INTO tags_id_normalized(id,user_id,name,normalized_name,search_key)
SELECT m.new_id,t.user_id,t.name,t.normalized_name,t.search_key
FROM tags t JOIN tag_id_map m ON m.old_id=t.id;

CREATE TABLE task_tags_id_normalized (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags_id_normalized(id) ON DELETE CASCADE,
  PRIMARY KEY(task_id,tag_id)
) WITHOUT ROWID, STRICT;

INSERT INTO task_tags_id_normalized(task_id,tag_id)
SELECT tt.task_id,m.new_id
FROM task_tags tt JOIN tag_id_map m ON m.old_id=tt.tag_id;

DROP TABLE task_tags;
DROP TABLE tags;
ALTER TABLE tags_id_normalized RENAME TO tags;
ALTER TABLE task_tags_id_normalized RENAME TO task_tags;
DROP TABLE tag_id_map;

CREATE UNIQUE INDEX idx_tags_user_normalized
  ON tags(user_id,normalized_name)
  WHERE user_id IS NOT NULL;
CREATE INDEX idx_tags_user_search ON tags(user_id,search_key);

PRAGMA foreign_keys=ON;
