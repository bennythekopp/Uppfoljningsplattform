-- Categories organize operational IU moments; existing IDs and protocol snapshots stay intact.
CREATE TABLE iu_operational_categories (
 id TEXT PRIMARY KEY,title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 180),
 position INTEGER NOT NULL,updated_at BIGINT NOT NULL,updated_by TEXT NOT NULL
);
CREATE UNIQUE INDEX iu_operational_category_title ON iu_operational_categories(lower(title));
ALTER TABLE iu_moments ADD COLUMN operational_category_id TEXT REFERENCES iu_operational_categories(id) ON DELETE SET NULL;
ALTER TABLE iu_moments ADD CONSTRAINT iu_operational_category_kind CHECK (kind='op' OR operational_category_id IS NULL);
CREATE INDEX iu_operational_category_moments ON iu_moments(operational_category_id,position) WHERE deleted_at IS NULL;

INSERT INTO iu_operational_categories(id,title,position,updated_at,updated_by) VALUES
 ('op-category-general','Operativa moment',1,0,'initial'),
 ('op-category-chef','Ämnen till chef',2,0,'initial');
UPDATE iu_moments SET operational_category_id=CASE WHEN section='chef' THEN 'op-category-chef' ELSE 'op-category-general' END WHERE kind='op';
