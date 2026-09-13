// تهيئة الخريطة التفاعلية باستخدام Leaflet.js (التركيز على المنامة)
const map = L.map('map').setView([26.2285, 50.5860], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// إضافة صالون أول على الخريطة
const salon1 = L.marker([26.2285, 50.5860]).addTo(map);
salon1.bindPopup("<b>صالون الذكاء الاصطناعي (الفرع الرئيسي)</b><br>متاح للحجز الفوري.");

// إضافة صالون ثانٍ على الخريطة
const salon2 = L.marker([26.2400, 50.5900]).addTo(map);
salon2.bindPopup("<b>صالون اللمسة الأنيقة (فرع السيف)</b><br>متخصص في العناية والتجميل.");

// ميزة تحديد موقع المستخدم الجغرافي (Geolocation)
const locateBtn = document.getElementById('locate-btn');

locateBtn.addEventListener('click', function() {
    if (!navigator.geolocation) {
        alert('متصفحك لا يدعم خاصية تحديد الموقع الجغرافي.');
        return;
    }

    locateBtn.textContent = 'جاري تحديد موقعك...';

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            map.setView([lat, lng], 15);

            const userMarker = L.marker([lat, lng]).addTo(map);
            userMarker.bindPopup("<b>📍 أنت هنا</b><br>موقعك الحالي.").openPopup();

            locateBtn.textContent = '📍 تم تحديد موقعك بنجاح';
        },
        function(error) {
            alert('تعذر تحديد موقعك. يرجى التحقق من الأذونات في المتصفح.');
            locateBtn.textContent = '📍 تحديد موقعي الحالي على الخريطة';
        }
    );
});

// عناصر DOM الخاصة بالحجز والتخزين والنصائح العامة
const bookingForm = document.getElementById('booking-form');
const successMessage = document.getElementById('success-message');
const bookingsList = document.getElementById('bookings-list');
const serviceSelect = document.getElementById('service-type');
const aiSuggestionText = document.getElementById('ai-suggestion-text');

// قاعدة بيانات آمنة للنصائح العامة والخبراء (بدون أي تتبع شخصي)
const generalTips = {
    "قص شعر وتصفيف": "💡 نصيحة عامة: يُنصح بغسل الشعر قبل موعد القص بـ 24 ساعة ليكون في أفضل حالة للتصفيف.",
    "عناية بالبشرة": "💡 نصيحة عامة: يفضل تجنب وضع المكياج الثقيل بعد جلسات التنظيف العميق لترتاح البشرة.",
    "مكياج وتجميل": "💡 نصيحة عامة: الترطيب الجيد للبشرة قبل جلسة التجميل يمنحك مظهراً أكثر إشراقاً وثباتاً."
};

// الاستماع لتغيير نوع الخدمة لعرض النصيحة العامة الآمنة
serviceSelect.addEventListener('change', function() {
    const selectedService = this.value;
    if (generalTips[selectedService]) {
        aiSuggestionText.textContent = generalTips[selectedService];
        aiSuggestionText.style.color = "#7c4dff";
        aiSuggestionText.style.fontWeight = "bold";
    } else {
        aiSuggestionText.textContent = "اختر نوع الخدمة في نموذج الحجز بالأعلى للاطلاع على نصائح العناية العامة المرتبطة بها.";
        aiSuggestionText.style.color = "#555";
        aiSuggestionText.style.fontWeight = "normal";
    }
});

// دالة لعرض الحجوزات المحفوظة من الذاكرة المحلية (LocalStorage)
function loadBookings() {
    bookingsList.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    
    if (savedBookings.length === 0) {
        bookingsList.innerHTML = '<li style="color: #666; padding: 8px 0;">لا توجد حجوزات مسجلة حتى الآن.</li>';
        return;
    }

    savedBookings.forEach((booking, index) => {
        const li = document.createElement('li');
        li.style.cssText = "background: #f9f9f9; margin-bottom: 10px; padding: 10px; border-radius: 6px; border-right: 4px solid #ff4081;";
        li.innerHTML = `<strong>الحجز #${index + 1}:</strong> ${booking.salon} - ${booking.service} <br><small style="color: #666;">الموعد: ${booking.date}</small>`;
        bookingsList.appendChild(li);
    });
}

// تنفيذ دالة التحميل عند بدء تشغيل الصفحة
loadBookings();

// الاستماع لعملية إرسال نموذج الحجز
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const salon = document.getElementById('salon-name').value;
    const service = serviceSelect.value;
    const date = document.getElementById('booking-date').value;

    if (salon && service && date) {
        const newBooking = { salon, service, date };

        const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
        savedBookings.push(newBooking);
        
        localStorage.setItem('salon_bookings', JSON.stringify(savedBookings));

        successMessage.style.display = 'block';
        successMessage.textContent = `تم تسجيل حجزك بنجاح وحفظه في الذاكرة المحلية ✨`;
        
        loadBookings();
        bookingForm.reset();
        aiSuggestionText.textContent = "اختر نوع الخدمة في نموذج الحجز بالأعلى للاطلاع على نصائح العناية العامة المرتبطة بها.";
        aiSuggestionText.style.color = "#555";
        aiSuggestionText.style.fontWeight = "normal";
    }
});