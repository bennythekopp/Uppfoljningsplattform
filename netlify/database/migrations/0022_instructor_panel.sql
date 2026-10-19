-- Run after 0021. Additive: existing assessments and protocols are untouched.
CREATE TABLE panel_items (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN('task','notice','introduction','reminder','document-template','email-template')),
 owner_email TEXT, data JSONB NOT NULL DEFAULT '{}'::jsonb, revision INTEGER NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL, updated_by TEXT NOT NULL,
 CHECK((kind='reminder' AND owner_email IS NOT NULL) OR (kind<>'reminder' AND owner_email IS NULL))
);
CREATE INDEX panel_items_kind ON panel_items(kind,updated_at);
CREATE TABLE panel_preferences (user_email TEXT PRIMARY KEY, data JSONB NOT NULL DEFAULT '{}'::jsonb, revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE panel_notice_reads (notice_id TEXT NOT NULL REFERENCES panel_items(id) ON DELETE CASCADE,user_email TEXT NOT NULL,read_at BIGINT NOT NULL,PRIMARY KEY(notice_id,user_email));
CREATE TABLE panel_documents (
 id TEXT PRIMARY KEY,title TEXT NOT NULL,state TEXT NOT NULL,epoch INTEGER NOT NULL DEFAULT 1,revision INTEGER NOT NULL DEFAULT 1,
 created_at BIGINT NOT NULL,created_by TEXT NOT NULL,updated_at BIGINT NOT NULL,updated_by TEXT NOT NULL,deleted_at BIGINT
);
CREATE TABLE panel_document_versions (
 id TEXT PRIMARY KEY,document_id TEXT NOT NULL REFERENCES panel_documents(id),state TEXT NOT NULL,title TEXT NOT NULL,
 created_at BIGINT NOT NULL,created_by TEXT NOT NULL,creator_name TEXT NOT NULL,label TEXT NOT NULL
);
CREATE INDEX panel_versions_document ON panel_document_versions(document_id,created_at DESC);
CREATE TABLE panel_document_comments (
 id TEXT PRIMARY KEY,document_id TEXT NOT NULL REFERENCES panel_documents(id),tab_id TEXT NOT NULL,body TEXT NOT NULL,
 quote TEXT NOT NULL DEFAULT '',suggestion TEXT,status TEXT NOT NULL DEFAULT 'open' CHECK(status IN('open','resolved','accepted','rejected')),
 created_at BIGINT NOT NULL,created_by TEXT NOT NULL,creator_name TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE panel_document_presence (
 document_id TEXT NOT NULL REFERENCES panel_documents(id),user_email TEXT NOT NULL,name TEXT NOT NULL,seen_at BIGINT NOT NULL,
 PRIMARY KEY(document_id,user_email)
);
