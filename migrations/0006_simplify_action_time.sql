CREATE TABLE actions_new (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  worked_on TEXT NOT NULL CHECK(length(worked_on) = 10),
  actual_minutes INTEGER NOT NULL CHECK(actual_minutes >= 0),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
) STRICT;

INSERT INTO actions_new (id, task_id, worked_on, actual_minutes, note, created_at)
SELECT id, task_id, date(started_at, '+9 hours'), actual_minutes, note, created_at
FROM actions;

DROP TABLE actions;
ALTER TABLE actions_new RENAME TO actions;

CREATE INDEX idx_actions_task ON actions(task_id, worked_on, created_at);
