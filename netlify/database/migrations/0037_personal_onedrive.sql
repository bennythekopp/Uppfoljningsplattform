-- Kör efter 0036. Byter anslutning, bevarar filval och intervall.
BEGIN;
CREATE TABLE IF NOT EXISTS onedrive_backup_connection (
 id INTEGER PRIMARY KEY CHECK(id=1),connection_id TEXT NOT NULL,drive_id TEXT NOT NULL,root_id TEXT NOT NULL,
 folder_name TEXT NOT NULL,web_url TEXT NOT NULL DEFAULT '',access_cipher TEXT NOT NULL,refresh_cipher TEXT NOT NULL,
 expires_at BIGINT NOT NULL,needs_reconnect BOOLEAN NOT NULL DEFAULT FALSE,connected_at BIGINT NOT NULL,connected_by TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS onedrive_backup_oauth (
 state_hash TEXT PRIMARY KEY,session_hash TEXT NOT NULL,actor_email TEXT NOT NULL,verifier_cipher TEXT NOT NULL,
 expected_connection TEXT NOT NULL,expires_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS onedrive_oauth_expiry ON onedrive_backup_oauth(expires_at);
-- Gör bytet bara första gången. Omkörning återställer inte användarens val.
CREATE TABLE IF NOT EXISTS backup_provider_migrations(id INTEGER PRIMARY KEY);
UPDATE sharepoint_backup_settings SET enabled=FALSE,restricted_confirmed=FALSE,revision=revision+1 WHERE NOT EXISTS(SELECT 1 FROM backup_provider_migrations WHERE id=37);
UPDATE sharepoint_backup_runs SET state='failed',error='Anslutningen byts till privat OneDrive. Starta en ny kopia efter anslutning.' WHERE state IN('preparing','queued','running') AND NOT EXISTS(SELECT 1 FROM backup_provider_migrations WHERE id=37);
INSERT INTO backup_provider_migrations(id) VALUES(37) ON CONFLICT DO NOTHING;
COMMIT;
