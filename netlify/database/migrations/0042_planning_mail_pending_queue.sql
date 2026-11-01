-- Preserve uncertainty of existing queued deliveries; never change a sent payload.
ALTER TABLE planning_mail_outbox ADD COLUMN IF NOT EXISTS attempted_at BIGINT;
UPDATE planning_mail_outbox SET attempted_at=created_at WHERE sent_at IS NULL AND attempted_at IS NULL;
