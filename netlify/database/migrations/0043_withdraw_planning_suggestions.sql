BEGIN;
ALTER TABLE planning_suggestions DROP CONSTRAINT IF EXISTS planning_suggestions_status_check;
ALTER TABLE planning_suggestions ADD CONSTRAINT planning_suggestions_status_check CHECK(status IN('pending','approved','rejected','superseded','withdrawn'));
COMMIT;
