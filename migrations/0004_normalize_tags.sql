ALTER TABLE tags ADD COLUMN normalized_name TEXT;
ALTER TABLE tags ADD COLUMN search_key TEXT;

UPDATE tags
SET normalized_name = lower(replace(trim(name), ' ', '')),
    search_key = lower(replace(trim(name), ' ', ''));

CREATE UNIQUE INDEX idx_tags_normalized ON tags(workspace_id, normalized_name);
CREATE INDEX idx_tags_search ON tags(workspace_id, search_key);
