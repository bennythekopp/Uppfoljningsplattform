ALTER TABLE moment_edits ADD COLUMN category TEXT NOT NULL DEFAULT 'System E2' CHECK (category IN ('System E2','System M','Lokalt'));
ALTER TABLE custom_moments ADD COLUMN category TEXT NOT NULL DEFAULT 'System E2' CHECK (category IN ('System E2','System M','Lokalt'));
