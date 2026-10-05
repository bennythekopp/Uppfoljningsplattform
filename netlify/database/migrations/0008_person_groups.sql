ALTER TABLE students ADD COLUMN moved_at BIGINT;
ALTER TABLE personnel ADD COLUMN moved_at BIGINT;
CREATE INDEX students_active_name ON students(name) WHERE moved_at IS NULL;
CREATE INDEX personnel_active_name ON personnel(name) WHERE moved_at IS NULL;
ALTER TABLE personnel_followups ADD COLUMN completed BOOLEAN NOT NULL DEFAULT FALSE;
