-- تفعيل امتداد PostGIS للبحث الجغرافي والمكاني
CREATE EXTENSION IF NOT EXISTS postgis;

-- مستأجري المنصة (الصالونات) مع الإحداثيات الجغرافية وسياسة الحجز  
CREATE TABLE IF NOT EXISTS tenants (  
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
 name VARCHAR(255) NOT NULL,  
 subdomain VARCHAR(100) UNIQUE,  
 custom_domain VARCHAR(255),  
 default_language VARCHAR(10) DEFAULT 'ar',  
 timezone VARCHAR(50) DEFAULT 'UTC',  
 currency VARCHAR(10) DEFAULT 'USD',  
 latitude DECIMAL(10, 8),  
 longitude DECIMAL(11, 8),  
 address_text TEXT,  
 booking_policy VARCHAR(50) DEFAULT 'DEPOSIT_REQUIRED',  
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);  

-- إضافة العمود الجغرافي المكاني إذا لم يكن موجوداً مسبقاً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='tenants' and column_name='location'
    ) THEN
        PERFORM AddGeometryColumn('public', 'tenants', 'location', 4326, 'POINT', 2);
    END IF
END $$;

-- الخدمات وقواعد التسعير الديناميكية  
CREATE TABLE IF NOT EXISTS services (  
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
 tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,  
 name JSONB,  
 description JSONB,  
 base_price DECIMAL(10,2),  
 pricing_model VARCHAR(50),  
 visibility_setting VARCHAR(50),  
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);  
  
CREATE TABLE IF NOT EXISTS service_options (  
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
 service_id UUID REFERENCES services(id) ON DELETE CASCADE,  
 option_name JSONB,  
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);  
  
CREATE TABLE IF NOT EXISTS service_pricing_rules (  
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
 service_id UUID REFERENCES services(id) ON DELETE CASCADE,  
 option_value VARCHAR(100),  
 additional_price DECIMAL(10,2),  
 additional_duration_minutes INT,  
 buffer_time_minutes INT DEFAULT 15  
);  
  
-- المواعيد والعربونات والدفع عند الوصول  
CREATE TABLE IF NOT EXISTS appointments (  
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
 tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,  
 customer_id UUID,  
 employee_id UUID,  
 service_id UUID REFERENCES services(id),  
 status VARCHAR(50),  
 total_amount DECIMAL(10,2),  
 deposit_amount DECIMAL(10,2),  
 payment_status VARCHAR(50),  
 start_time TIMESTAMP,  
 end_time TIMESTAMP,  
 hold_expires_at TIMESTAMP  
);  
  
-- الباقات والعضويات  
CREATE TABLE IF NOT EXISTS customer_packages (  
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
 tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,  
 customer_id UUID,  
 service_id UUID REFERENCES services(id),  
 total_sessions INT,  
 remaining_sessions INT,  
 expires_at DATE  
);