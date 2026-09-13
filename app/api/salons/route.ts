import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// جلب الصالونات مع إحداثياتها
export async function GET() {
  try {
    const salons = await prisma.salon.findMany();
    return NextResponse.json({ success: true, data: salons }, { status: 200 });
  } catch (error) {
    console.error('Error fetching salons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch salons' },
      { status: 500 }
    );
  }
}

// إضافة صالون جديد مع الإحداثيات
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city, lat, lng } = body;

    if (!name || !city) {
      return NextResponse.json(
        { success: false, error: 'Name and city are required' },
        { status: 400 }
      );
    }

    const newSalon = await prisma.salon.create({
      data: {
        name,
        city,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      },
    });

    return NextResponse.json({ success: true, data: newSalon }, { status: 201 });
  } catch (error) {
    console.error('Error creating salon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create salon' },
      { status: 500 }
    );
  }
}