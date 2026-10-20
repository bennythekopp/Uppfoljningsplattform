-- After 0025. Existing operative moments remain under Utan kategori.
ALTER TABLE exam_templates ADD COLUMN categories JSONB NOT NULL DEFAULT '[]'::jsonb;
