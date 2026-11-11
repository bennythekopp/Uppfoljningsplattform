-- Preserve the layout known at installation. Already overwritten historical names cannot be reconstructed.
BEGIN;
CREATE TABLE IF NOT EXISTS planning_column_versions (
 column_id text NOT NULL REFERENCES planning_columns(id), from_year integer NOT NULL,
 title text NOT NULL,kind text NOT NULL,user_email text,position integer NOT NULL,
 width integer NOT NULL,width_revision integer NOT NULL,revision integer NOT NULL,deleted_at bigint,
 PRIMARY KEY(column_id,from_year)
);
INSERT INTO planning_column_versions SELECT id,2020,title,kind,user_email,position,width,width_revision,revision,deleted_at FROM planning_columns c WHERE NOT EXISTS(SELECT 1 FROM planning_column_versions v WHERE v.column_id=c.id) ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION tc_version_planning_column() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE y integer := extract(year FROM CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Stockholm');
BEGIN
 INSERT INTO planning_column_versions(column_id,from_year,title,kind,user_email,position,width,width_revision,revision,deleted_at)
 VALUES(NEW.id,y,NEW.title,NEW.kind,NEW.user_email,NEW.position,NEW.width,NEW.width_revision,NEW.revision,NEW.deleted_at)
 ON CONFLICT(column_id,from_year) DO UPDATE SET title=EXCLUDED.title,kind=EXCLUDED.kind,user_email=EXCLUDED.user_email,position=EXCLUDED.position,width=EXCLUDED.width,width_revision=EXCLUDED.width_revision,revision=EXCLUDED.revision,deleted_at=EXCLUDED.deleted_at;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS tc_planning_column_version ON planning_columns;
CREATE TRIGGER tc_planning_column_version AFTER INSERT OR UPDATE ON planning_columns FOR EACH ROW EXECUTE FUNCTION tc_version_planning_column();
CREATE OR REPLACE FUNCTION tc_planning_columns_for_year(y integer)
RETURNS TABLE(id text,title text,kind text,user_email text,"position" integer,width integer,width_revision integer,revision integer,deleted_at bigint)
LANGUAGE sql STABLE AS $$
 SELECT v.column_id,v.title,v.kind,v.user_email,v.position,v.width,v.width_revision,v.revision,v.deleted_at
 FROM (SELECT DISTINCT ON(column_id) * FROM planning_column_versions WHERE from_year<=y ORDER BY column_id,from_year DESC) v
 WHERE v.deleted_at IS NULL
$$;
COMMIT;
