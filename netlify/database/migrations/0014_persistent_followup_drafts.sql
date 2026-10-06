-- One shared working copy per person and IU part. Null forms retain the revision
-- after saving/discarding, preventing stale requests from resurrecting a draft.
CREATE TABLE IF NOT EXISTS personnel_followup_drafts (
 personnel_id TEXT NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK (kind IN ('op','simulator')),
 form JSONB,
 draft_year TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 0,
 updated_at BIGINT NOT NULL,
 updated_by TEXT NOT NULL,
 PRIMARY KEY (personnel_id,kind)
);
