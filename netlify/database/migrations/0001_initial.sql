CREATE TABLE users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administratör','Instruktör','Handledare')),
  created_at BIGINT NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,
  password_salt TEXT
);
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE TABLE assessments (
  student_id TEXT NOT NULL REFERENCES students(id),
  item_id INTEGER NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('','Grön','Gul','Röd')),
  comment TEXT NOT NULL DEFAULT '',
  updated_at BIGINT NOT NULL,
  updated_by TEXT NOT NULL,
  PRIMARY KEY (student_id,item_id)
);
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  item_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  author_email TEXT NOT NULL,
  deleted_at BIGINT,
  deleted_by TEXT
);
CREATE INDEX comments_student_active ON comments(student_id,item_id) WHERE deleted_at IS NULL;
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES users(email),
  expires_at BIGINT NOT NULL
);
CREATE INDEX sessions_user_email ON sessions(user_email);
CREATE TABLE login_attempts (
  username TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  until BIGINT NOT NULL
);
CREATE TABLE moment_edits (
  item_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  updated_at BIGINT NOT NULL,
  updated_by TEXT NOT NULL
);
CREATE TABLE custom_moments (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  created_by TEXT NOT NULL
);
