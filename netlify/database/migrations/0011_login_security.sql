-- Old sessions are revoked because they had no reliable activity timestamp.
ALTER TABLE sessions ADD COLUMN last_activity_at BIGINT NOT NULL DEFAULT 0;
DELETE FROM sessions;
ALTER TABLE sessions ALTER COLUMN last_activity_at DROP DEFAULT;
CREATE TABLE auth_rate_limits (
 key TEXT PRIMARY KEY,
 count INTEGER NOT NULL,
 reset_at BIGINT NOT NULL
);
CREATE INDEX auth_rate_limits_expiry ON auth_rate_limits(reset_at);
