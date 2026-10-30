-- Kör efter 0035. Befintlig automatisk export behåller sitt intervall och full kopiering.
BEGIN;
ALTER TABLE sharepoint_backup_settings ADD COLUMN IF NOT EXISTS copy_mode TEXT NOT NULL DEFAULT 'all' CHECK(copy_mode IN('all','changed','selected'));
ALTER TABLE sharepoint_backup_settings ADD COLUMN IF NOT EXISTS selected_paths JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE sharepoint_backup_settings ADD COLUMN IF NOT EXISTS schedule_kind TEXT NOT NULL DEFAULT 'interval' CHECK(schedule_kind IN('interval','daily','weekly'));
ALTER TABLE sharepoint_backup_settings ADD COLUMN IF NOT EXISTS send_time TEXT NOT NULL DEFAULT '07:00' CHECK(send_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
ALTER TABLE sharepoint_backup_settings ADD COLUMN IF NOT EXISTS week_day INTEGER NOT NULL DEFAULT 1 CHECK(week_day BETWEEN 1 AND 7);
ALTER TABLE sharepoint_backup_runs ADD COLUMN IF NOT EXISTS configuration JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE sharepoint_backup_jobs ADD COLUMN IF NOT EXISTS content_hash TEXT NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS sharepoint_backup_files (
 destination_key TEXT NOT NULL,path TEXT NOT NULL,content_hash TEXT NOT NULL,kind TEXT NOT NULL,
 run_id TEXT NOT NULL REFERENCES sharepoint_backup_runs(id),folder TEXT NOT NULL,
 PRIMARY KEY(destination_key,path)
);
COMMIT;
