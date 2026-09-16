-- Authentication v2: email verification is a temporary signup flow, not a user.
CREATE TABLE signup_flows (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  flow_token_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','verified','completed','expired')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  user_id TEXT REFERENCES users(id)
) STRICT;

CREATE UNIQUE INDEX idx_signup_flows_email_active ON signup_flows(email)
  WHERE status IN ('pending','verified');
CREATE INDEX idx_signup_flows_token ON signup_flows(flow_token_hash, expires_at);

ALTER TABLE plans ADD COLUMN user_id TEXT REFERENCES users(id);
ALTER TABLE tags ADD COLUMN user_id TEXT REFERENCES users(id);
CREATE INDEX idx_plans_user ON plans(user_id, deleted_at, created_at);
CREATE INDEX idx_tags_user ON tags(user_id, normalized_name);
