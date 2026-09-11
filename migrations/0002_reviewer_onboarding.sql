CREATE TABLE IF NOT EXISTS reviewer_onboarding_requests (
  id TEXT PRIMARY KEY,
  target_display_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  target_role TEXT NOT NULL CHECK(target_role IN ('reviewer','administrator')),
  requested_by TEXT NOT NULL,
  request_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','expired','rejected')),
  expires_at TEXT NOT NULL,
  approved_by TEXT,
  approval_reason TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS reviewer_onboarding_pending ON reviewer_onboarding_requests(target_display_id) WHERE status='pending';

CREATE TABLE IF NOT EXISTS reviewer_admin_audit (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL CHECK(action IN ('bootstrap','onboarding_requested','onboarding_approved','invite','suspend','resume')),
  target_display_id TEXT NOT NULL,
  actor_display_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(details_json)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS reviewer_admin_audit_target ON reviewer_admin_audit(target_display_id,created_at);
