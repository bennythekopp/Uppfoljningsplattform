-- Kör efter 0030, före publicering av den nya versionen. Omkörbar transaktion.
BEGIN;
DROP INDEX IF EXISTS schedule_one_active;
ALTER TABLE planning_schedule_periods DROP CONSTRAINT IF EXISTS planning_schedule_periods_start_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS planning_period_group_date ON planning_schedule_periods(group_id,start_date);
ALTER TABLE planning_cells DROP CONSTRAINT IF EXISTS planning_cells_field_check;
ALTER TABLE planning_cells ADD CONSTRAINT planning_cells_field_check CHECK(field IN ('tour','task','shared','color'));
CREATE TABLE IF NOT EXISTS schedule_memberships (
 id TEXT PRIMARY KEY, user_email TEXT NOT NULL, group_id TEXT NOT NULL,
 row_number INTEGER NOT NULL CHECK(row_number BETWEEN 1 AND 52),
 start_date DATE NOT NULL, end_date DATE,
 created_at BIGINT NOT NULL, created_by TEXT NOT NULL,
 CHECK(end_date IS NULL OR end_date>start_date),
 UNIQUE(user_email,start_date)
);
CREATE INDEX IF NOT EXISTS schedule_membership_person_date ON schedule_memberships(user_email,start_date,end_date);
CREATE INDEX IF NOT EXISTS schedule_membership_group ON schedule_memberships(group_id);
-- Convert legacy snapshots into non-overlapping personal intervals. End dates
-- are EXCLUSIVE. Omitted people retain their last scheme until their next event.
WITH events AS (
 SELECT p.id,p.group_id,p.start_date,p.created_at,p.created_by,
        a->>'userEmail' AS email,(a->>'row')::integer AS row_number
 FROM planning_schedule_periods p CROSS JOIN LATERAL jsonb_array_elements(p.assignments) a
), dated AS (
 SELECT *,LEAD(start_date) OVER(PARTITION BY email ORDER BY start_date,id) AS end_date
 FROM events
)
INSERT INTO schedule_memberships(id,user_email,group_id,row_number,start_date,end_date,created_at,created_by)
 SELECT 'legacy-'||id||':'||email,email,group_id,row_number,start_date,end_date,created_at,created_by FROM dated
 WHERE email IS NOT NULL AND (end_date IS NULL OR end_date>start_date)
 AND NOT EXISTS(SELECT 1 FROM schedule_memberships)
 ON CONFLICT DO NOTHING;
-- The trigger also protects against accidental direct database writes. Runtime
-- schedule mutations are additionally serialized by the schedule_groups lock.
CREATE OR REPLACE FUNCTION prevent_schedule_membership_overlap() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('schedule-membership:'||NEW.user_email,0));
 IF EXISTS(SELECT 1 FROM schedule_memberships m WHERE m.user_email=NEW.user_email AND m.id<>NEW.id
    AND m.start_date<COALESCE(NEW.end_date,'infinity'::date)
    AND NEW.start_date<COALESCE(m.end_date,'infinity'::date)) THEN
  RAISE EXCEPTION 'Overlapping schedule membership' USING ERRCODE='23505';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS schedule_membership_overlap ON schedule_memberships;
CREATE TRIGGER schedule_membership_overlap BEFORE INSERT OR UPDATE ON schedule_memberships
 FOR EACH ROW EXECUTE FUNCTION prevent_schedule_membership_overlap();
COMMIT;
