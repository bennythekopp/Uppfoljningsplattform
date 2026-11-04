-- A preview belongs to the administrator session and never changes the target account.
ALTER TABLE sessions ADD COLUMN preview_user_email TEXT REFERENCES users(email);
