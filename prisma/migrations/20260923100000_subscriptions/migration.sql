BEGIN;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'TRIAL';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP(6);
-- الصالونات الموجودة تحصل على تجربة 14 يوم تبدأ الآن؛ الجديدة تُضبط من التطبيق عند التسجيل
UPDATE tenants SET trial_ends_at = now() + interval '14 days' WHERE trial_ends_at IS NULL;
COMMIT;
