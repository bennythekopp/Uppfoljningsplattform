ALTER TABLE moment_edits DROP CONSTRAINT moment_edits_category_check;
ALTER TABLE custom_moments DROP CONSTRAINT custom_moments_category_check;

UPDATE moment_edits SET category='Övrigt' WHERE category='Lokalt';
UPDATE custom_moments SET category='Övrigt' WHERE category='Lokalt';

ALTER TABLE moment_edits ADD CONSTRAINT moment_edits_category_check CHECK (category IN ('System E2','System M','Övrigt'));
ALTER TABLE custom_moments ADD CONSTRAINT custom_moments_category_check CHECK (category IN ('System E2','System M','Övrigt'));
