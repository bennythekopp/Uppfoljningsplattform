-- Administratörens manuella meddelanden och per-användare-läskvitton.
CREATE TABLE IF NOT EXISTS site_notifications (
 id TEXT PRIMARY KEY,
 body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
 roles JSONB NOT NULL CHECK (jsonb_typeof(roles)='array'),
 created_at BIGINT NOT NULL,
 created_by TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS site_notification_reads (
 notification_id TEXT NOT NULL REFERENCES site_notifications(id) ON DELETE CASCADE,
 user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
 read_at BIGINT NOT NULL,
 PRIMARY KEY(notification_id,user_email)
);
CREATE INDEX IF NOT EXISTS site_notifications_created ON site_notifications(created_at DESC);
