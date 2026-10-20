-- Run after 0022. Notes are separate from documents and have no export or history tables.
CREATE TABLE panel_notes (
 id TEXT PRIMARY KEY,
 owner_email TEXT,
 state TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1,
 updated_at BIGINT NOT NULL,
 updated_by TEXT NOT NULL,
 CHECK ((id='shared' AND owner_email IS NULL) OR (id<>'shared' AND owner_email IS NOT NULL))
);
CREATE INDEX panel_notes_owner ON panel_notes(owner_email);
