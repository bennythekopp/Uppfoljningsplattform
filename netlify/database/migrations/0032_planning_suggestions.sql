BEGIN;
CREATE TABLE IF NOT EXISTS planning_suggestions (
 seq BIGSERIAL UNIQUE NOT NULL, id TEXT PRIMARY KEY,
 day DATE NOT NULL, column_id TEXT NOT NULL REFERENCES planning_columns(id),
 field TEXT NOT NULL CHECK(field IN('tour','task','shared')),
 previous_value TEXT NOT NULL, proposed_value TEXT NOT NULL,
 previous_label TEXT NOT NULL, proposed_label TEXT NOT NULL,
 base_revision INTEGER NOT NULL, author_email TEXT NOT NULL, author_name TEXT NOT NULL,
 created_at BIGINT NOT NULL, status TEXT NOT NULL DEFAULT 'pending'
 CHECK(status IN('pending','approved','rejected','superseded')),
 resolved_at BIGINT, resolved_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS planning_suggestion_own_pending ON planning_suggestions(day,column_id,field,author_email) WHERE status='pending';
CREATE INDEX IF NOT EXISTS planning_suggestion_pending ON planning_suggestions(day,status);
CREATE TABLE IF NOT EXISTS planning_mail_settings (
 id INTEGER PRIMARY KEY CHECK(id=1), enabled BOOLEAN NOT NULL DEFAULT false,
 recipient_email TEXT NOT NULL DEFAULT '', recipient_user TEXT NOT NULL DEFAULT '',
 cadence TEXT NOT NULL DEFAULT 'daily' CHECK(cadence IN('daily','workday')),
 send_time TEXT NOT NULL DEFAULT '07:00', revision INTEGER NOT NULL DEFAULT 1,
 enabled_at BIGINT NOT NULL DEFAULT 0, last_sent_day DATE, last_sent_at BIGINT,
 last_error TEXT NOT NULL DEFAULT ''
);
INSERT INTO planning_mail_settings(id) VALUES(1) ON CONFLICT(id) DO NOTHING;
CREATE TABLE IF NOT EXISTS planning_mail_outbox (
 id TEXT PRIMARY KEY, send_day DATE NOT NULL, created_at BIGINT NOT NULL,
 payload JSONB NOT NULL, suggestion_seqs JSONB NOT NULL,
 sent_at BIGINT, provider_id TEXT, last_error TEXT NOT NULL DEFAULT '',
 review_required BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX IF NOT EXISTS planning_mail_one_pending ON planning_mail_outbox((true)) WHERE sent_at IS NULL;
CREATE TABLE IF NOT EXISTS planning_mailed_suggestions (
 suggestion_seq BIGINT PRIMARY KEY REFERENCES planning_suggestions(seq),
 outbox_id TEXT NOT NULL REFERENCES planning_mail_outbox(id)
);
COMMIT;
