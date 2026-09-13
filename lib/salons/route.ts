import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat'); // خط العرض للمستخدم
    const lng = searchParams.get('lng'); // خط الطول للمستخدم
    const radiusKm = searchParams.get('radius') || '20'; // النطاق الافتراضي 20 كم

    let salons;

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusMeters = parseFloat(radiusKm) * 1000; // التحويل إلى الأمتار لـ PostGIS

      // استخدام استعلام SQL خام لدعم PostGIS وحساب المسافة بدقة
      salons = await prisma.$queryRaw`
        SELECT 
          id, 
          name, 
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
      // في حال لم يتم إرسال الإحداثيات، يتم جلب أحدث الصالونات كخيار افتراضي
      salons = await prisma.tenant.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(
      {
        success: true,
        count: Array.isArray(salons) ? salons.length : 0,
        data: salons,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching geo-salons:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch nearby salons',
        details: error.message,
      },
      { status: 500 }
    );
  }
}