-- Simulator moments are parents; the existing assessed rows remain stable child IDs.
CREATE TABLE iu_simulator_groups (
 id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',
 position INTEGER NOT NULL,updated_at BIGINT NOT NULL,updated_by TEXT NOT NULL,deleted_at BIGINT
);
ALTER TABLE iu_moments ADD COLUMN simulator_group_id TEXT REFERENCES iu_simulator_groups(id);
INSERT INTO iu_simulator_groups(id,title,position,updated_at,updated_by,deleted_at)
 SELECT 'sim-group-'||md5(section),section,MIN(position),0,'initial',
 CASE WHEN COUNT(*) FILTER (WHERE deleted_at IS NULL)=0 THEN MAX(deleted_at) ELSE NULL END
 FROM iu_moments WHERE kind='simulator' GROUP BY section;
UPDATE iu_moments SET simulator_group_id='sim-group-'||md5(section) WHERE kind='simulator';
ALTER TABLE iu_moments ADD CONSTRAINT iu_simulator_parent_check CHECK (
 (kind='simulator' AND simulator_group_id IS NOT NULL) OR (kind='op' AND simulator_group_id IS NULL)
);
CREATE INDEX iu_simulator_children ON iu_moments(simulator_group_id,position) WHERE deleted_at IS NULL;
-- Existing followup template snapshots and answers are deliberately preserved.
