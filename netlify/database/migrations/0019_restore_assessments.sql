ALTER TABLE activity_log ADD COLUMN undo_payload JSONB;
ALTER TABLE activity_log ADD COLUMN restored_at BIGINT;
ALTER TABLE activity_log ADD COLUMN restored_by TEXT;
ALTER TABLE activity_log ADD COLUMN restored_by_name TEXT;
-- Older archived protocols are still soft-deleted. Link only an unambiguous
-- deletion by the same actor within two seconds; never guess between candidates.
WITH candidates AS (
 SELECT l.id AS log_id,a.id AS archive_id,a.personnel_id,a.deleted_at,
 COUNT(*) OVER(PARTITION BY l.id) AS matches,
 COUNT(*) OVER(PARTITION BY a.id) AS log_matches
 FROM activity_log l JOIN personnel_student_archives a
 ON a.deleted_by=l.actor_email AND a.deleted_at IS NOT NULL
 AND l.occurred_at BETWEEN a.deleted_at AND a.deleted_at+2000
 WHERE l.area='Elevhistorik' AND l.action='Arkiverad bedömning borttagen'
)
UPDATE activity_log l SET undo_payload=jsonb_build_object(
 'version',1,'type','archive','personId',c.personnel_id,
 'id',c.archive_id,'expectedDeletedAt',c.deleted_at)
FROM candidates c WHERE l.id=c.log_id AND c.matches=1 AND c.log_matches=1;
