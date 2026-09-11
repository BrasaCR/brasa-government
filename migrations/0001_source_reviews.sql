CREATE TABLE IF NOT EXISTS government_reviewers (
  display_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('reviewer','administrator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS source_reviews (
  service_id TEXT PRIMARY KEY,
  source_url TEXT NOT NULL,
  evidence_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('reviewed','suspended','expired')),
  reviewer_display_id TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(reviewer_display_id) REFERENCES government_reviewers(display_id)
);
CREATE INDEX IF NOT EXISTS source_review_public_index ON source_reviews(status, expires_at);

CREATE TABLE IF NOT EXISTS source_review_audit (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('review','renew','suspend','expire')),
  actor_display_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS source_review_audit_service_index ON source_review_audit(service_id, created_at);
