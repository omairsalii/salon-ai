import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// جلب الصالونات (المستأجرين)، مع دعم اختياري للبحث الجغرافي عبر PostGIS
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusKm = searchParams.get('radius') || '20';
    const city = searchParams.get('city');

    let salons;

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusMeters = parseFloat(radiusKm) * 1000;

      // استعلام SQL خام لحساب المسافة بدقة عبر صيغة Haversine
      salons = await prisma.$queryRaw`
        SELECT
          id,
          name,
          city,
          subdomain,
          custom_domain AS "customDomain",
          latitude,
          longitude,
          address_text AS "addressText",
          timezone,
          currency,
          (
            6371000 * acos(
              cos(radians(${userLat})) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(${userLng})) +
              sin(radians(${userLat})) * sin(radians(latitude))
            )
          ) AS distance_meters
        FROM tenants
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND (
          6371000 * acos(
            cos(radians(${userLat})) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(${userLng})) +
            sin(radians(${userLat})) * sin(radians(latitude))
          )
        ) <= ${radiusMeters}
        ORDER BY distance_meters ASC
        LIMIT 20;
      `;
    } else {
      salons = await prisma.tenant.findMany({
        where: city ? { city } : undefined,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(
      { success: true, count: Array.isArray(salons) ? salons.length : 0, data: salons },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching salons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch salons', details: error.message },
      { status: 500 }
    );
  }
}

// إضافة صالون (مستأجر) جديد عبر نموذج التسجيل الذاتي في /[locale]/salons/new.
// ملاحظة أمنية: هذا المسار مفتوح للجميع بدون تحقق — أي زائر يقدر يضيف صالونات
// وهمية بلا حدود (spam). قبل الإطلاق الفعلي يحتاج قرار منتج: تسجيل ذاتي مع
// تحقق (بريد/هاتف) + حدّ معدل الطلبات (rate limiting)، أو تحويله لأداة داخلية
// محمية بمصادقة إدارية (استخدم requireAdmin من lib/auth.ts في هذه الحالة).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city, addressText, lat, lng } = body;

    if (!name || !city) {
      return NextResponse.json(
        { success: false, error: 'Name and city are required' },
        { status: 400 }
      );
    }

    const newSalon = await prisma.tenant.create({
      data: {
        name,
        city,
        addressText: addressText || null,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null,
      },
    });

    return NextResponse.json({ success: true, data: newSalon }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating salon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create salon', details: error.message },
      { status: 500 }
    );
  }
}
