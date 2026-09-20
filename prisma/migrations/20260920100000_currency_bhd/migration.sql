BEGIN;
ALTER TABLE tenants ALTER COLUMN currency SET DEFAULT 'BHD';
UPDATE tenants SET currency = 'BHD' WHERE currency = 'USD';
COMMIT;
