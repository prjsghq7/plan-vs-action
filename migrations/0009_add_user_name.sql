ALTER TABLE users ADD COLUMN name TEXT;
CREATE INDEX idx_users_name ON users(name);
