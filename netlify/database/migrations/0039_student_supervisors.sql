-- Assignment timeline; null supervisor means an unassigned period. Names are snapshots.
CREATE TABLE IF NOT EXISTS student_supervisor_revisions(student_id TEXT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,revision INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS student_supervisor_events(
 id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 supervisor_email TEXT,supervisor_name TEXT NOT NULL DEFAULT '',
 effective_from TEXT NOT NULL CHECK(effective_from ~ '^\d{4}-\d{2}-\d{2}$'),
 created_at BIGINT NOT NULL,created_by TEXT NOT NULL,
 UNIQUE(student_id,effective_from)
);
CREATE INDEX IF NOT EXISTS student_supervisors_dates ON student_supervisor_events(student_id,effective_from);
