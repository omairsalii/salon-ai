import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SalonMap from '@/components/SalonMap';

export default async function SalonsPage({
  searchParams,
}: {
  searchParams: { city?: string };
}) {
  const selectedCity = searchParams.city;

  // جلب الصالونات مع تطبيق الفلتر إذا تم تحديد المدينة
  const salons = await prisma.salon.findMany({
    where: selectedCity ? { city: selectedCity } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  // جلب المدن الفريدة لتعبئة أزرار الفلترة
  const allSalons = await prisma.salon.findMany({ select: { city: true } });
  const cities = Array.from(new Set(allSalons.map((s) => s.city)));

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">خريطة وقائمة الصالونات (Salon AI)</h1>
        <Link 
          href="/salons/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + إضافة صالون جديد
        </Link>
      </div>

      {/* أزرار الفلترة حسب المدينة */}
      <div className="mb-6 flex gap-2 items-center flex-wrap">
        <span className="text-sm font-semibold text-gray-600">فلترة حسب المدينة:</span>
        <Link
          href="/salons"
          className={`px-3 py-1 rounded-full text-sm transition ${
            !selectedCity ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الكل
        </Link>
        {cities.map((city) => (
          <Link
            key={city}
            href={`/salons?city=${encodeURIComponent(city)}`}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedCity === city ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {city}
          </Link>
        ))}
      </div>

      {/* عرض الخريطة التفاعلية */}
      <div className="mb-8 bg-white p-2 rounded-lg shadow border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 px-2 text-gray-700">📍 الخريطة التفاعلية للصالونات</h2>
        <SalonMap salons={salons} />
      </div>

      {/* قائمة البطاقات */}
      {salons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">لا توجد صالونات مطابقة للبحث أو مضافة حتى الآن.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {salons.map((salon) => (
            <div key={salon.id} className="p-5 bg-white shadow rounded-lg border border-gray-100 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{salon.name}</h2>
                <p className="text-gray-600 text-sm mb-3">📍 المدينة: <span className="font-medium">{salon.city}</span></p>
              </div>

              {salon.lat && salon.lng ? (
                <div className="text-xs bg-gray-50 p-2 rounded text-gray-600 mb-3 flex items-center justify-between" dir="ltr">
                  <span className="text-gray-400">Lat, Lng:</span>
                  <span className="font-mono font-medium">{salon.lat}, {salon.lng}</span>
                </div>
              ) : (
                <div className="text-xs bg-yellow-50 p-2 rounded text-yellow-600 mb-3">
                  ⚠️ لم يتم تحديد الإحداثيات الجغرافية بعد
                </div>
              )}

              <div className="text-xs text-gray-400 border-t pt-2">
                تاريخ الإضافة: {new Date(salon.createdAt).toLocaleDateString('ar-SA')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}