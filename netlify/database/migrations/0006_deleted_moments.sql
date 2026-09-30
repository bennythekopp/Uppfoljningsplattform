CREATE TABLE deleted_moments (
  item_id INTEGER PRIMARY KEY,
  deleted_at BIGINT NOT NULL,
  deleted_by TEXT NOT NULL
);
