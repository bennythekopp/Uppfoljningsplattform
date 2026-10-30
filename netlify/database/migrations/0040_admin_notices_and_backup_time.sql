-- Kör efter 0039. Befintliga notiser behålls utan slutdatum.
BEGIN;
ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '' CHECK(char_length(title)<=160);
ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS starts_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS expires_at BIGINT;
ALTER TABLE site_notifications ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='site_notifications_visible_period') THEN
  ALTER TABLE site_notifications ADD CONSTRAINT site_notifications_visible_period CHECK(expires_at IS NULL OR expires_at>starts_at);
 END IF;
END $$;
-- Äldre intervall kör vidare som tidigare tills administratören sparar en klocktid.
ALTER TABLE sharepoint_backup_settings ADD COLUMN IF NOT EXISTS schedule_anchored BOOLEAN NOT NULL DEFAULT false;
COMMIT;
