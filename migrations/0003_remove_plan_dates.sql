CREATE TABLE plans_new (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
  priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
  success_criteria TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
) STRICT;

CREATE TABLE plan_history_new (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans_new(id),
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  UNIQUE(plan_id, version)
) STRICT;

CREATE TABLE tasks_new (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans_new(id),
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

CREATE TABLE task_tags_new (
  task_id TEXT NOT NULL REFERENCES tasks_new(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(task_id, tag_id)
) WITHOUT ROWID, STRICT;

CREATE TABLE actions_new (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks_new(id),
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  actual_minutes INTEGER NOT NULL CHECK(actual_minutes >= 0),
  blocker_reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  CHECK(started_at <= ended_at)
) STRICT;

CREATE TABLE task_status_events_new (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks_new(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  from_status TEXT NOT NULL CHECK(from_status IN ('active', 'completed')),
  to_status TEXT NOT NULL CHECK(to_status IN ('active', 'completed')),
  version_before INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(task_id, to_status, version_before)
) STRICT;

CREATE TABLE reviews_new (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  plan_id TEXT NOT NULL REFERENCES plans_new(id),
  improvement_text TEXT NOT NULL CHECK(length(improvement_text) BETWEEN 1 AND 500),
  next_plan_id TEXT REFERENCES plans_new(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

INSERT INTO plans_new (id, workspace_id, title, priority, success_criteria, created_at, updated_at, deleted_at)
SELECT id, workspace_id, title, priority, success_criteria, created_at, updated_at, deleted_at FROM plans;

INSERT INTO plan_history_new (id, plan_id, version, title, priority, success_criteria, recorded_at)
SELECT id, plan_id, version, title, priority, success_criteria, recorded_at FROM plan_history;

INSERT INTO tasks_new SELECT id, plan_id, title, due_date, priority, estimated_minutes, status, status_version, completed_at, created_at, updated_at, deleted_at FROM tasks;
INSERT INTO task_tags_new SELECT task_id, tag_id FROM task_tags;
INSERT INTO actions_new SELECT id, task_id, started_at, ended_at, actual_minutes, blocker_reason, created_at FROM actions;
INSERT INTO task_status_events_new SELECT id, task_id, idempotency_key, from_status, to_status, version_before, created_at FROM task_status_events;
INSERT INTO reviews_new SELECT id, workspace_id, plan_id, improvement_text, next_plan_id, created_at, updated_at FROM reviews;

DROP TABLE task_tags;
DROP TABLE actions;
DROP TABLE task_status_events;
DROP TABLE reviews;
DROP TABLE plan_history;
DROP TABLE tasks;
DROP TABLE plans;

ALTER TABLE plans_new RENAME TO plans;
ALTER TABLE plan_history_new RENAME TO plan_history;
ALTER TABLE tasks_new RENAME TO tasks;
ALTER TABLE task_tags_new RENAME TO task_tags;
ALTER TABLE actions_new RENAME TO actions;
ALTER TABLE task_status_events_new RENAME TO task_status_events;
ALTER TABLE reviews_new RENAME TO reviews;

CREATE INDEX idx_plans_workspace ON plans(workspace_id, deleted_at, created_at);
CREATE INDEX idx_tasks_plan ON tasks(plan_id, deleted_at, due_date, created_at);
CREATE INDEX idx_tasks_status ON tasks(plan_id, status, deleted_at);
CREATE INDEX idx_actions_task ON actions(task_id, created_at);
CREATE INDEX idx_events_task ON task_status_events(task_id, created_at);
CREATE INDEX idx_reviews_plan ON reviews(plan_id, created_at);
