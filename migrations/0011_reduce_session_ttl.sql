UPDATE sessions
SET expires_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+30 minutes')
WHERE revoked_at IS NULL
  AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+30 minutes');
