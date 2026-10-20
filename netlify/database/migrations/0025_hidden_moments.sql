-- After 0024. Visibility is independent of assessments and saved protocol snapshots.
CREATE TABLE hidden_moments (
 area TEXT NOT NULL CHECK(area IN ('student','iu-op','iu-simulator','kp','exam')),
 moment_id TEXT NOT NULL,
 updated_at BIGINT NOT NULL,
 updated_by TEXT NOT NULL,
 PRIMARY KEY(area,moment_id)
);
