-- Saved presentation order never changes assessment IDs or historical snapshots.
CREATE TABLE display_orders (
 scope TEXT PRIMARY KEY,
 item_ids JSONB NOT NULL CHECK (jsonb_typeof(item_ids)='array'),
 updated_at BIGINT NOT NULL,
 updated_by TEXT NOT NULL
);
ALTER TABLE sessions ADD COLUMN preview_role TEXT CHECK (preview_role IN ('Instruktör','Handledare','Chef'));
