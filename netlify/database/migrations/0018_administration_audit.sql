CREATE TABLE activity_log (
 id TEXT PRIMARY KEY,
 occurred_at BIGINT NOT NULL,
 actor_email TEXT NOT NULL,
 actor_name TEXT NOT NULL,
 actor_role TEXT NOT NULL,
 action TEXT NOT NULL,
 area TEXT NOT NULL,
 target TEXT NOT NULL
);
CREATE INDEX activity_log_recent ON activity_log(occurred_at DESC,id DESC);
CREATE INDEX activity_log_actor ON activity_log(actor_email,occurred_at DESC);
ALTER TABLE personnel_student_archives ADD COLUMN deleted_at BIGINT;
ALTER TABLE personnel_student_archives ADD COLUMN deleted_by TEXT;
