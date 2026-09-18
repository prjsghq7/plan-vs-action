-- User ownership fully replaces the original shared workspace placeholder.
-- Remove abandoned migration copies and redundant legacy indexes as well.
DROP TABLE IF EXISTS plans__owned;
DROP TABLE IF EXISTS tags__owned;

DROP INDEX IF EXISTS idx_plans_workspace;
DROP INDEX IF EXISTS idx_plans_owner;
DROP INDEX IF EXISTS idx_tags_owner;

ALTER TABLE users DROP COLUMN workspace_id;
ALTER TABLE plans DROP COLUMN workspace_id;
ALTER TABLE tags DROP COLUMN workspace_id;
ALTER TABLE reviews DROP COLUMN workspace_id;

DROP TABLE workspaces;
