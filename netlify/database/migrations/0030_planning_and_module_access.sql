-- Planering och modulåtkomst. Kör efter 0029. Transaktionen är omkörbar.
BEGIN;
CREATE TABLE IF NOT EXISTS panel_module_access (
 kind TEXT PRIMARY KEY, restricted BOOLEAN NOT NULL DEFAULT FALSE,
 user_emails JSONB NOT NULL DEFAULT '[]', revision INTEGER NOT NULL DEFAULT 1,
 updated_at BIGINT NOT NULL DEFAULT 0, updated_by TEXT NOT NULL DEFAULT ''
);
INSERT INTO panel_module_access(kind,restricted) VALUES('planning',TRUE) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS planning_settings (
 id INTEGER PRIMARY KEY CHECK(id=1), editor_emails JSONB NOT NULL DEFAULT '[]', revision INTEGER NOT NULL DEFAULT 1
);
INSERT INTO planning_settings(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS planning_columns (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('shared','person')),
 user_email TEXT UNIQUE, position INTEGER NOT NULL, revision INTEGER NOT NULL DEFAULT 1,
 deleted_at BIGINT, created_at BIGINT NOT NULL DEFAULT 0
);
INSERT INTO planning_columns(id,title,kind,position) VALUES
 ('ht2025','HT2025','shared',1),('vt2026','VT2026','shared',2),
 ('ht2026','HT2026','shared',3),('other','ÖVRIGT','shared',4) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS planning_cells (
 day DATE NOT NULL, column_id TEXT NOT NULL REFERENCES planning_columns(id),
 field TEXT NOT NULL CHECK(field IN ('tour','task','shared')), value TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL DEFAULT 1, updated_at BIGINT NOT NULL, updated_by TEXT NOT NULL,
 PRIMARY KEY(day,column_id,field)
);
CREATE TABLE IF NOT EXISTS planning_schedule_periods (
 id TEXT PRIMARY KEY, group_id TEXT NOT NULL, name TEXT NOT NULL, start_date DATE NOT NULL UNIQUE,
 config JSONB NOT NULL, assignments JSONB NOT NULL DEFAULT '[]', list_change BOOLEAN NOT NULL DEFAULT TRUE, created_at BIGINT NOT NULL, created_by TEXT NOT NULL
);
-- Behåll en kopia av redan aktivt schema. Borttagna grupper raderar inte historiken.
INSERT INTO planning_schedule_periods(id,group_id,name,start_date,config,assignments,created_at,created_by)
 SELECT 'initial-'||g.id,g.id,g.name,(g.config->>'startDate')::date,g.config,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('userEmail',a.user_email,'row',a.row_number)) FROM schedule_assignments a WHERE a.group_id=g.id),'[]'::jsonb),
 g.updated_at,g.updated_by FROM schedule_groups g WHERE g.active=TRUE AND NOT EXISTS(SELECT 1 FROM planning_schedule_periods)
 ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS planning_log (
 id TEXT PRIMARY KEY, occurred_at BIGINT NOT NULL, actor_email TEXT NOT NULL, actor_name TEXT NOT NULL,
 action TEXT NOT NULL, day DATE, column_id TEXT, column_name TEXT NOT NULL DEFAULT '',
 field TEXT NOT NULL DEFAULT '', previous_value TEXT NOT NULL DEFAULT '', new_value TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS planning_log_time ON planning_log(occurred_at DESC,id);
CREATE INDEX IF NOT EXISTS planning_cells_date ON planning_cells(day);
COMMIT;
