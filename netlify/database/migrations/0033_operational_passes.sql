BEGIN;
CREATE TABLE IF NOT EXISTS planning_operational_settings (
 id INTEGER PRIMARY KEY CHECK(id=1), config JSONB, revision INTEGER NOT NULL DEFAULT 1,
 updated_at BIGINT, updated_by TEXT
);
INSERT INTO planning_operational_settings(id) VALUES(1) ON CONFLICT(id) DO NOTHING;
COMMIT;
