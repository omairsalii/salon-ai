import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createSession } from '@/lib/session';

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
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_published = true
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
        where: { isPublished: true, ...(city ? { city } : {}) },
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

// تسجيل صالون جديد + إنشاء حساب مالكه، عبر نموذج /[locale]/salons/new.
// ملاحظة أمنية متبقية: ما فيه تحقق من البريد الإلكتروني بعد (verification) —
// أي شخص بإيميل صحيح الصيغة يقدر يسجل. هذا قرار مؤجل عن قصد لحين الحاجة له.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city, addressText, lat, lng, ownerName, email, password } = body;

    if (!name || !city) {
      return NextResponse.json(
        { success: false, error: 'Name and city are required' },
        { status: 400 }
      );
    }

    if (!ownerName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'اسم المالك والبريد الإلكتروني وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingOwner = await prisma.owner.findUnique({ where: { email: normalizedEmail } });
    if (existingOwner) {
      return NextResponse.json(
        { success: false, error: 'يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { tenant, owner } = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          city,
          addressText: addressText || null,
          latitude: lat ? parseFloat(lat) : null,
          longitude: lng ? parseFloat(lng) : null,
        },
      });

      const owner = await tx.owner.create({
        data: {
          tenantId: tenant.id,
          name: ownerName,
          email: normalizedEmail,
          passwordHash,
        },
      });

      return { tenant, owner };
    });

    await createSession({ ownerId: owner.id, tenantId: tenant.id, email: owner.email });

    return NextResponse.json({ success: true, data: tenant }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating salon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create salon', details: error.message },
      { status: 500 }
    );
  }
}
