-- Kör efter 0033. Kan köras igen utan att återställa sparade behörigheter/bredder.
BEGIN;
ALTER TABLE planning_settings ADD COLUMN IF NOT EXISTS suggester_emails JSONB;
-- Behåll befintliga instruktörers förslagsrätt vid övergången. Chefer tilldelas explicit.
UPDATE planning_settings SET suggester_emails=COALESCE((SELECT jsonb_agg(email) FROM users WHERE role='Instruktör' AND disabled_at IS NULL AND NOT planning_settings.editor_emails @> jsonb_build_array(email)),'[]'::jsonb) WHERE suggester_emails IS NULL;
ALTER TABLE planning_settings ALTER COLUMN suggester_emails SET DEFAULT '[]'::jsonb;
ALTER TABLE planning_settings ALTER COLUMN suggester_emails SET NOT NULL;
ALTER TABLE planning_settings ADD COLUMN IF NOT EXISTS task_width INTEGER NOT NULL DEFAULT 130 CHECK(task_width BETWEEN 70 AND 800);
ALTER TABLE planning_settings ADD COLUMN IF NOT EXISTS task_width_revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE planning_columns ADD COLUMN IF NOT EXISTS width INTEGER NOT NULL DEFAULT 90 CHECK(width BETWEEN 70 AND 800);
ALTER TABLE planning_columns ADD COLUMN IF NOT EXISTS width_revision INTEGER NOT NULL DEFAULT 1;
COMMIT;
