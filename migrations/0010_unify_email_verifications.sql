-- The old table was created by an earlier local-only auth draft and is unused.
DROP TABLE email_verifications;

ALTER TABLE signup_flows RENAME TO email_verifications;
ALTER TABLE email_verifications ADD COLUMN purpose TEXT NOT NULL DEFAULT 'signup'
  CHECK(purpose IN ('signup','password_reset'));
CREATE INDEX idx_email_verifications_purpose ON email_verifications(email, purpose, status, expires_at);
