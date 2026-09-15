import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: جلب الباقات المتاحة لصالون معين
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const packages = await prisma.customerPackage.findMany({
      where: { tenantId },
    });

    return NextResponse.json(
      {
        success: true,
        count: packages.length,
        data: packages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching customer packages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch packages',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: شراء أو تخصيص باقة جديدة للعميل
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, customerId, packageName, totalSessions, price } = body;

    if (!tenantId || !customerId || !totalSessions || !price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields for package creation' },
        { status: 400 }
      );
    }

    const newPackage = await prisma.customerPackage.create({
      data: {
        tenantId,
        customerId,
        packageName: packageName || { ar: 'باقة مميزة', en: 'Special Package' },
        totalSessions: parseInt(totalSessions),
        remainingSessions: parseInt(totalSessions), // تبدأ الجلسات المتبقية مساوية لإجمالي الجلسات
        price: parseFloat(price),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Customer package created successfully',
        data: newPackage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating customer package:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create package',
        details: error.message,
      },
      { status: 500 }
    );
  }
}