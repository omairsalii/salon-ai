BEGIN;

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  discount_percent INTEGER,
  discount_amount DECIMAL(10,2),
  applies_to_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  free_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  ends_at TIMESTAMP(6),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
