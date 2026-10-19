CREATE TABLE IF NOT EXISTS iu_annual_resets (
  year TEXT PRIMARY KEY,
  reset_at BIGINT NOT NULL,
  reset_by TEXT NOT NULL
);
