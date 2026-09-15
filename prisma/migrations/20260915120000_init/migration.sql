-- Initial schema, consolidated from the previously hand-written SQL files.
-- ملاحظة: عمود PostGIS الجغرافي (location) من ملف SQL اليدوي القديم لم يُستخدم
-- في أي استعلام فعلي بالكود — البحث الجغرافي الحالي يعتمد بالكامل على
-- latitude/longitude + صيغة Haversine في SQL خام (راجع app/api/salons/route.ts).
-- إن احتجتم PostGIS لاحقًا لأداء أفضل على نطاق واسع، فعّلوا الامتداد وأضيفوا
-- عمود geometry عبر migration منفصل بدل تعديل هذا الملف.

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100),
    "subdomain" VARCHAR(100),
    "custom_domain" VARCHAR(255),
    "default_language" VARCHAR(10) DEFAULT 'ar',
    "timezone" VARCHAR(50) DEFAULT 'UTC',
    "currency" VARCHAR(10) DEFAULT 'USD',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "address_text" TEXT,
    "booking_policy" VARCHAR(50) DEFAULT 'DEPOSIT_REQUIRED',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "name" JSONB,
    "description" JSONB,
    "base_price" DECIMAL(10,2),
    "pricing_model" VARCHAR(50),
    "visibility_setting" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID,
    "option_name" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_pricing_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" UUID,
    "option_value" VARCHAR(100),
    "additional_price" DECIMAL(10,2),
    "additional_duration_minutes" INTEGER,
    "buffer_time_minutes" INTEGER DEFAULT 15,

    CONSTRAINT "service_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "customer_id" UUID,
    "employee_id" UUID,
    "service_id" UUID,
    "status" VARCHAR(50),
    "total_amount" DECIMAL(10,2),
    "deposit_amount" DECIMAL(10,2),
    "payment_status" VARCHAR(50),
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "hold_expires_at" TIMESTAMP(6),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "customer_id" UUID,
    "service_id" UUID,
    "package_name" JSONB,
    "price" DECIMAL(10,2),
    "status" VARCHAR(50) DEFAULT 'ACTIVE',
    "total_sessions" INTEGER,
    "remaining_sessions" INTEGER,
    "expires_at" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "service_options" ADD CONSTRAINT "service_options_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "service_pricing_rules" ADD CONSTRAINT "service_pricing_rules_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_packages" ADD CONSTRAINT "customer_packages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_packages" ADD CONSTRAINT "customer_packages_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

