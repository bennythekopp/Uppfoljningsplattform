-- Run after 0046, BEFORE deploying V18. Safe to re-run; no cell/history deletion.
BEGIN;
CREATE OR REPLACE FUNCTION tc_sync_planning_user_column() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE first_name text; slot integer;
BEGIN
 IF NEW.disabled_at IS NULL AND NEW.role IN ('Administratör','Instruktör') THEN
  first_name := split_part(lower(NEW.name),' ',1);
  slot := array_position(ARRAY['linnea','gustav','sarah','olle','elin','lisa'],first_name);
  INSERT INTO planning_columns(id,title,kind,user_email,position)
   VALUES('person:'||NEW.email,NEW.name,'person',NEW.email,CASE WHEN slot IS NULL THEN 110 ELSE 9+slot END)
   ON CONFLICT(user_email) DO UPDATE SET title=EXCLUDED.title WHERE planning_columns.title IS DISTINCT FROM EXCLUDED.title;
 ELSE
  -- Keep historical columns/cells when a user changes role or is disabled.
  UPDATE planning_columns SET title=NEW.name WHERE user_email=NEW.email AND title IS DISTINCT FROM NEW.name;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS tc_planning_user_column ON users;
CREATE TRIGGER tc_planning_user_column AFTER INSERT OR UPDATE OF name,role,disabled_at ON users
 FOR EACH ROW EXECUTE FUNCTION tc_sync_planning_user_column();
INSERT INTO planning_columns(id,title,kind,user_email,position)
 SELECT 'person:'||email,name,'person',email,
 COALESCE(9+array_position(ARRAY['linnea','gustav','sarah','olle','elin','lisa'],split_part(lower(name),' ',1)),110)
 FROM users WHERE disabled_at IS NULL AND role IN ('Administratör','Instruktör')
 ON CONFLICT(user_email) DO UPDATE SET title=EXCLUDED.title WHERE planning_columns.title IS DISTINCT FROM EXCLUDED.title;
COMMIT;
