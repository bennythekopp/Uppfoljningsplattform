-- Autosaves in the same assessment editing burst share one audit entry.
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS edit_key TEXT;
CREATE INDEX IF NOT EXISTS activity_log_edit_burst_idx
  ON activity_log(edit_key,actor_email,occurred_at DESC)
  WHERE edit_key IS NOT NULL;
