ALTER TABLE personnel_followups ADD COLUMN outcome TEXT NOT NULL DEFAULT ''
  CHECK (outcome IN ('','approved','requires_completion'));
