-- Run after 0023. Existing shared tasks and private reminders retain their owners.
ALTER TABLE panel_items DROP CONSTRAINT panel_items_check;
ALTER TABLE panel_items ADD CONSTRAINT panel_items_owner_scope
 CHECK (kind IN ('task','reminder') OR owner_email IS NULL);
