-- Task 7 ownership indexes. Existing local sample records remain unassigned;
-- records created after authentication are assigned by the Worker.
CREATE INDEX IF NOT EXISTS idx_plans_owner ON plans(user_id, deleted_at, created_at);
CREATE INDEX IF NOT EXISTS idx_tags_owner ON tags(user_id, normalized_name);
