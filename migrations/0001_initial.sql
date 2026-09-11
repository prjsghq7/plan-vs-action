PRAGMA foreign_keys = ON;

CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
) STRICT;

INSERT INTO workspaces (id, name, slug, created_at)
VALUES ('public', 'Plan vs Action 공개 공간', 'public', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
  success_criteria TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL CHECK(estimated_minutes >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  CHECK(start_date <= end_date)
) STRICT;

CREATE TABLE plan_history (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  priority TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  recorded_at TEXT NOT NULL,
  UNIQUE(plan_id, version)
) STRICT;

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
  due_date TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
  estimated_minutes INTEGER NOT NULL CHECK(estimated_minutes >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed')),
  status_version INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
) STRICT;

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL COLLATE NOCASE,
  UNIQUE(workspace_id, name)
) STRICT;

CREATE TABLE task_tags (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(task_id, tag_id)
) WITHOUT ROWID, STRICT;

CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  actual_minutes INTEGER NOT NULL CHECK(actual_minutes >= 0),
  blocker_reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  CHECK(started_at <= ended_at)
) STRICT;

CREATE TABLE task_status_events (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  from_status TEXT NOT NULL CHECK(from_status IN ('active', 'completed')),
  to_status TEXT NOT NULL CHECK(to_status IN ('active', 'completed')),
  version_before INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(task_id, to_status, version_before)
) STRICT;

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  plan_id TEXT NOT NULL REFERENCES plans(id),
  improvement_text TEXT NOT NULL CHECK(length(improvement_text) BETWEEN 1 AND 500),
  next_plan_id TEXT REFERENCES plans(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE INDEX idx_plans_workspace ON plans(workspace_id, deleted_at, created_at);
CREATE INDEX idx_tasks_plan ON tasks(plan_id, deleted_at, due_date, created_at);
CREATE INDEX idx_tasks_status ON tasks(plan_id, status, deleted_at);
CREATE INDEX idx_actions_task ON actions(task_id, created_at);
CREATE INDEX idx_events_task ON task_status_events(task_id, created_at);
CREATE INDEX idx_reviews_plan ON reviews(plan_id, created_at);
