BEGIN;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_scope TEXT NOT NULL DEFAULT 'website' CHECK(session_scope IN ('website','planning'));
ALTER TABLE planning_suggestions ADD COLUMN IF NOT EXISTS previous_color TEXT;
ALTER TABLE planning_suggestions ADD COLUMN IF NOT EXISTS proposed_color TEXT;
ALTER TABLE planning_suggestions ADD COLUMN IF NOT EXISTS color_revision INTEGER;
COMMIT;
