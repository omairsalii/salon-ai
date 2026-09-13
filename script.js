// تهيئة الخريطة التفاعلية باستخدام Leaflet.js (تم التركيز على المنامة كمرجع جغرافي)
const map = L.map('map').setView([26.2285, 50.5860], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// إضافة صالون أول على الخريطة
const salon1 = L.marker([26.2285, 50.5860]).addTo(map);
salon1.bindPopup("<b>صالون الذكاء الاصطناعي (الفرع الرئيسي)</b><br>متاح للحجز الفوري.");

// إضافة صالون ثانٍ على الخريطة بقرب الموقع الأول
const salon2 = L.marker([26.2400, 50.5900]).addTo(map);
salon2.bindPopup("<b>صالون اللمسة الأنيقة (فرع السيف)</b><br>متخصص في العناية والتجميل.");

// نظام تفاعل نموذج الحجز (محاكاة الحجز الذكي وتخزين محلي مؤقت)
const bookingForm = document.getElementById('booking-form');
const successMessage = document.getElementById('success-message');

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة

    const salon = document.getElementById('salon-name').value;
    const service = document.getElementById('service-type').value;
    const date = document.getElementById('booking-date').value;

    if (salon && service && date) {
        successMessage.style.display = 'block';
        successMessage.textContent = `تم تسجيل حجزك بنجاح في ${salon} لخدمة (${service}) في موعد: ${date} ✨`;
        
        // مسح الحقول بعد النجاح
        bookingForm.reset();
    }
});