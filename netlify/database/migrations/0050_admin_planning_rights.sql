-- Kör en gång efter 0049. Bevara tidigare administratörsrättigheter som uttryckliga val.
BEGIN;
CREATE TABLE IF NOT EXISTS tc_feature_migrations(id TEXT PRIMARY KEY);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM tc_feature_migrations WHERE id='admin-planning-v21') THEN
 UPDATE planning_settings SET editor_emails=(SELECT COALESCE(jsonb_agg(DISTINCT email),'[]'::jsonb) FROM (SELECT jsonb_array_elements_text(editor_emails) AS email UNION SELECT email FROM users WHERE role='Administratör') x),suggester_emails=(SELECT COALESCE(jsonb_agg(DISTINCT email),'[]'::jsonb) FROM (SELECT jsonb_array_elements_text(suggester_emails) AS email UNION SELECT email FROM users WHERE role='Administratör') x),revision=revision+1 WHERE id=1;
 INSERT INTO tc_feature_migrations VALUES('admin-planning-v21');
 END IF;
END $$;
COMMIT;
