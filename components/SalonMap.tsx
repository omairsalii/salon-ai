'use client';

import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface Salon {
  id: string;
  name: string;
  city: string;
  lat: number | null;
  lng: number | null;
}

export default function SalonMap({ salons }: { salons: Salon[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // استيراد Leaflet داخل الـ useEffect لضمان تشغيلها في المتصفح فقط وبشكل آمن
    import('leaflet').then((L) => {
      // إعداد الأيقونات الافتراضية بشكل صحيح
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // منع تكرار تهيئة الخريطة إذا كانت موجودة مسبقاً
      const container = document.getElementById('map');
      if (container && (container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
      }

      const map = L.map('map').setView([26.2285, 50.5860], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      salons.forEach((salon) => {
        if (salon.lat && salon.lng) {
          L.marker([salon.lat, salon.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${salon.name}</b><br>المدينة: ${salon.city}`);
        }
      });

      return () => {
        map.remove();
      };
    });
  }, [isMounted, salons]);

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-400">
        جاري تحميل الخريطة...
      </div>
    );
  }

  return <div id="map" className="w-full h-[400px] rounded-lg shadow-inner z-0" />;
}