BEGIN;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS working_hours JSONB;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS working_hours JSONB;
ALTER TABLE tenants ALTER COLUMN timezone SET DEFAULT 'Asia/Bahrain';
UPDATE tenants SET timezone = 'Asia/Bahrain' WHERE timezone IS NULL OR timezone = 'UTC';
COMMIT;
