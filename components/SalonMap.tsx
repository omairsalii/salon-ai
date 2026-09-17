'use client';

import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { googleMapsUrl } from '@/lib/geo';

interface Salon {
  id: string;
  name: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  distanceKm?: number;
}

export default function SalonMap({ salons }: { salons: Salon[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // استيراد Leaflet داخل الـ useEffect لضمان تشغيلها بالمتصفح فقط. يجب
    // تحميل leaflet أولًا وتعيينها كمتغير عالمي (window.L) قبل استيراد
    // leaflet.markercluster، لأنه إضافة قديمة الطراز تتوقع L متاحة عالميًا
    // بدل استيرادها كوحدة ES منفصلة — تحميلهما بالتوازي يفشل بخطأ "L is not defined".
    import('leaflet').then(async ({ default: L }) => {
      (window as any).L = L;
      await import('leaflet.markercluster');

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

      const clusterGroup = (L as any).markerClusterGroup();

      const bounds: [number, number][] = [];
      salons.forEach((salon) => {
        if (salon.lat && salon.lng) {
          bounds.push([salon.lat, salon.lng]);
          const distanceLine = salon.distanceKm !== undefined
            ? `<br>المسافة: ${salon.distanceKm.toFixed(1)} كم`
            : '';
          L.marker([salon.lat, salon.lng], { icon: customIcon })
            .bindPopup(
              `<b>${salon.name}</b><br>المدينة: ${salon.city || '—'}${distanceLine}` +
              `<br><a href="${googleMapsUrl(salon.lat, salon.lng)}" target="_blank" rel="noopener noreferrer">فتح في خرائط قوقل ↗</a>`
            )
            .addTo(clusterGroup);
        }
      });

      map.addLayer(clusterGroup);
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [30, 30] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      }

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
