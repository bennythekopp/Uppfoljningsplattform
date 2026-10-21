-- Grundschema: grupper, rangordnade önskemål och låsta tilldelningar.
CREATE TABLE IF NOT EXISTS schedule_groups (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 active BOOLEAN NOT NULL DEFAULT FALSE,
 visible BOOLEAN NOT NULL DEFAULT FALSE,
 wishes_open BOOLEAN NOT NULL DEFAULT FALSE,
 config JSONB NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1,
 updated_at BIGINT NOT NULL,
 updated_by TEXT NOT NULL,
 CHECK (NOT active OR (visible AND NOT wishes_open))
);
CREATE UNIQUE INDEX IF NOT EXISTS schedule_one_active ON schedule_groups(active) WHERE active;
CREATE TABLE IF NOT EXISTS schedule_wishes (
 group_id TEXT NOT NULL REFERENCES schedule_groups(id) ON DELETE CASCADE,
 user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
 rows JSONB NOT NULL DEFAULT '[]',
 revision INTEGER NOT NULL DEFAULT 1,
 updated_at BIGINT NOT NULL,
 PRIMARY KEY(group_id,user_email)
);
CREATE TABLE IF NOT EXISTS schedule_assignments (
 group_id TEXT NOT NULL REFERENCES schedule_groups(id) ON DELETE CASCADE,
 row_number INTEGER NOT NULL CHECK(row_number BETWEEN 1 AND 52),
 user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
 locked BOOLEAN NOT NULL DEFAULT TRUE,
 updated_at BIGINT NOT NULL,
 updated_by TEXT NOT NULL,
 PRIMARY KEY(group_id,row_number),
 UNIQUE(group_id,user_email)
);

-- Förberedd grupp från INS-schema 2027. Publiceras och aktiveras av administratören.
INSERT INTO schedule_groups(id,name,config,updated_at,updated_by) VALUES('ins-schema-2027','Instruktör 2027','{"year":2027,"startDate":"2027-01-04","unit":"Nord – Tågtrafikledning och trafikinformation Boden","reference":"TRV 2024/3100","validUntil":"","tours":[{"code":"8630","passes":[{"start":"06:30","end":"14:15","type":"Disptur"}],"color":"#dedede","meal":true},{"code":"8230","passes":[{"start":"21:15","end":"24:00","type":"Disptur"}],"color":"#dedede","meal":true},{"code":"8231","passes":[{"start":"00:00","end":"06:45","type":"Disptur"},{"start":"21:15","end":"24:00","type":"Disptur"}],"color":"#dedede","meal":true},{"code":"8232","passes":[{"start":"00:00","end":"06:45","type":"Disptur"}],"color":"#dedede","meal":true},{"code":"8400","passes":[{"start":"14:00","end":"21:30","type":"Disptur"}],"color":"#dedede","meal":true},{"code":"4400","passes":[{"start":"12:00","end":"14:00","type":"Dispadm"},{"start":"14:00","end":"21:30","type":"Disptur"}],"color":"#f4ad56","meal":true},{"code":"INS","passes":[{"start":"08:00","end":"12:00","type":"Admin"},{"start":"12:30","end":"16:30","type":"Admin"}],"color":"#b00000","meal":false},{"code":"INSf","passes":[{"start":"06:30","end":"14:15","type":"Admin"}],"color":"#b00000","meal":true},{"code":"INSe","passes":[{"start":"14:00","end":"21:30","type":"Admin"}],"color":"#b00000","meal":true},{"code":"INSk","passes":[{"start":"08:00","end":"15:00","type":"Admin"}],"color":"#b00000","meal":true},{"code":"INSm","passes":[{"start":"07:30","end":"12:00","type":"Admin"},{"start":"12:30","end":"16:30","type":"Admin"}],"color":"#b00000","meal":false},{"code":"INSko","passes":[{"start":"08:00","end":"12:30","type":"Admin"}],"color":"#b00000","meal":true},{"code":"FP","passes":[],"color":"#ffffff","meal":false}],"pattern":[["INS","INSf","INSk","INSe","8400","8400","8630"],["INS","INS","INS","8630","FP","FP","FP"],["INS","4400","8400","8230","8232","FP","FP"],["INS","INS","INSe","INS","8630","FP","FP"],["INS","INSf","INS","8630","FP","FP","FP"]],"agreements":[{"label":"Arbetstiden får vara max","value":"11:00"},{"label":"Viloperioden ska vara minst","value":"09:00"},{"label":"Fridagsperioden kan vara 24 + 12","value":"Ja"},{"label":"Sjudagarsperioden börjar/slutar kl.","value":"14:00"},{"label":"Mer än 11 nätter/person/4 veckor får förekomma","value":"Nej"},{"label":"Begränsningsperioden är listans längd","value":"Ja"}]}'::jsonb,0,'migration-0027') ON CONFLICT(id) DO NOTHING;
