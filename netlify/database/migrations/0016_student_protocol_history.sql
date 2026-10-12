CREATE TABLE personnel_student_archives(
 id TEXT PRIMARY KEY,
 personnel_id TEXT NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('student','KP1','KP2')),
 event_at BIGINT NOT NULL,
 created_at BIGINT NOT NULL,
 created_by TEXT NOT NULL,
 payload JSONB NOT NULL,
 UNIQUE(personnel_id,event_at,kind)
);
