BEGIN;
CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose VARCHAR(30) NOT NULL,
  audience VARCHAR(20) NOT NULL,
  subject_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP(6) NOT NULL,
  used_at TIMESTAMP(6),
  created_at TIMESTAMP(6) NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_tokens_subject_idx ON auth_tokens (subject_id, purpose);
ALTER TABLE owners ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP(6);
ALTER TABLE customer_accounts ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP(6);
COMMIT;
