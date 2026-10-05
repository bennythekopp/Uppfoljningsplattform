CREATE TABLE personnel (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE TABLE personnel_followups (
  id TEXT PRIMARY KEY,
  personnel_id TEXT NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('op','simulator')),
  followup_date TEXT NOT NULL,
  responsible TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  news TEXT NOT NULL DEFAULT '',
  local_result TEXT NOT NULL DEFAULT '',
  central_result TEXT NOT NULL DEFAULT '',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  updated_by TEXT NOT NULL
);
CREATE INDEX personnel_followups_person_date ON personnel_followups(personnel_id,followup_date DESC,created_at DESC);
