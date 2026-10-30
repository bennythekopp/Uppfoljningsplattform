BEGIN;
CREATE TABLE IF NOT EXISTS planning_operational_overrides (
 column_id TEXT NOT NULL REFERENCES planning_columns(id),month TEXT NOT NULL CHECK(month ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'),
 count INTEGER CHECK(count BETWEEN 0 AND 999),revision INTEGER NOT NULL DEFAULT 1,updated_at BIGINT NOT NULL,updated_by TEXT NOT NULL,
 PRIMARY KEY(column_id,month)
);
CREATE TABLE IF NOT EXISTS backup_protocol_history (
 id TEXT PRIMARY KEY,person_id TEXT NOT NULL,person_name TEXT NOT NULL,kind TEXT NOT NULL,source TEXT NOT NULL,
 payload JSONB NOT NULL,created_at BIGINT NOT NULL,created_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS backup_protocol_person ON backup_protocol_history(person_id,created_at);
CREATE TABLE IF NOT EXISTS sharepoint_backup_settings (
 id INTEGER PRIMARY KEY CHECK(id=1),enabled BOOLEAN NOT NULL DEFAULT FALSE,interval_hours INTEGER NOT NULL DEFAULT 24 CHECK(interval_hours IN(1,6,12,24)),
 restricted_confirmed BOOLEAN NOT NULL DEFAULT FALSE,revision INTEGER NOT NULL DEFAULT 1,last_queued_at BIGINT,last_completed_at BIGINT
);
INSERT INTO sharepoint_backup_settings(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS sharepoint_backup_runs (
 id TEXT PRIMARY KEY,created_at BIGINT NOT NULL,completed_at BIGINT,state TEXT NOT NULL DEFAULT 'queued',created_by TEXT NOT NULL,folder TEXT NOT NULL,destination JSONB NOT NULL,error TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS sharepoint_backup_one_active ON sharepoint_backup_runs((TRUE)) WHERE state IN('preparing','queued','running');
CREATE TABLE IF NOT EXISTS sharepoint_backup_jobs (
 id TEXT PRIMARY KEY,run_id TEXT NOT NULL REFERENCES sharepoint_backup_runs(id),path TEXT NOT NULL,kind TEXT NOT NULL,payload JSONB NOT NULL,
 state TEXT NOT NULL DEFAULT 'queued',attempts INTEGER NOT NULL DEFAULT 0,lease_until BIGINT NOT NULL DEFAULT 0,next_try_at BIGINT NOT NULL DEFAULT 0,error TEXT NOT NULL DEFAULT '',UNIQUE(run_id,path)
);
CREATE INDEX IF NOT EXISTS sharepoint_backup_work ON sharepoint_backup_jobs(state,next_try_at);
COMMIT;
