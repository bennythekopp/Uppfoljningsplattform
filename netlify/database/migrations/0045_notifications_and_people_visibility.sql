-- Kör efter 0044. Befintliga data och notiser bevaras.
BEGIN;
CREATE TABLE IF NOT EXISTS people_visibility (
 user_email TEXT PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
 students BOOLEAN NOT NULL DEFAULT true, personnel BOOLEAN NOT NULL DEFAULT true,
 revision INTEGER NOT NULL DEFAULT 1, updated_at BIGINT NOT NULL DEFAULT 0, updated_by TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS planning_notification_settings (
 id INTEGER PRIMARY KEY CHECK(id=1), enabled BOOLEAN NOT NULL DEFAULT false,
 horizon TEXT NOT NULL DEFAULT '7days' CHECK(horizon IN ('week','7days','14days','month')),
 revision INTEGER NOT NULL DEFAULT 1
);
INSERT INTO planning_notification_settings(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS planning_notification_preferences (
 user_email TEXT PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
 web_enabled BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS planning_push_subscriptions (
 id TEXT PRIMARY KEY, user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
 endpoint TEXT NOT NULL UNIQUE, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
 enabled BOOLEAN NOT NULL DEFAULT true, created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS planning_push_owner ON planning_push_subscriptions(user_email);
CREATE TABLE IF NOT EXISTS planning_notifications (
 id TEXT PRIMARY KEY, event_key TEXT NOT NULL, user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('schedule','proposal')), day DATE NOT NULL,
 column_id TEXT NOT NULL, suggestion_id TEXT, payload JSONB NOT NULL,
 created_at BIGINT NOT NULL, read_at BIGINT,
 UNIQUE(event_key,user_email)
);
CREATE INDEX IF NOT EXISTS planning_notifications_owner ON planning_notifications(user_email,created_at DESC);
CREATE TABLE IF NOT EXISTS planning_push_outbox (
 id TEXT PRIMARY KEY, event_key TEXT NOT NULL, subscription_id TEXT NOT NULL REFERENCES planning_push_subscriptions(id) ON DELETE CASCADE,
 payload JSONB NOT NULL, created_at BIGINT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
 available_at BIGINT NOT NULL, sent_at BIGINT, last_error TEXT NOT NULL DEFAULT '',
 UNIQUE(event_key,subscription_id)
);
CREATE INDEX IF NOT EXISTS planning_push_pending ON planning_push_outbox(available_at) WHERE sent_at IS NULL;
COMMIT;
