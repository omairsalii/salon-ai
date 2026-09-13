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
const salonSelect = document.getElementById('salon-name');
const serviceSelect = document.getElementById('service-type');
const bookingDateInput = document.getElementById('booking-date');
const aiSuggestionText = document.getElementById('ai-suggestion-text');

// ضبط الحد الأدنى لتاريخ الحجز ليكون ابتداءً من اللحظة الحالية لمنع التواريخ الماضية
function setMinDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    bookingDateInput.min = minDateTime;
}

// تنفيذ دالة تعيين أقل تاريخ عند فتح الصفحة
setMinDateTime();

// متغير لتتبع ما إذا كنا نقوم بتعديل حجز حالي
let editingIndex = null;

// قاعدة بيانات آمنة للنصائح العامة والخبراء لكل الخدمات الشاملة
const generalTips = {
    "قص شعر وتصفيف": "💡 نصيحة عامة: يُنصح بغسل الشعر قبل موعد القص بـ 24 ساعة ليكون في أفضل حالة للتصفيف.",
    "صبغة الشعر وتلوينه": "💡 نصيحة عامة: يفضل عدم غسل الشعر بالماء الساخن لمدة 48 ساعة بعد الصبغة للحفاظ على ثبات اللون.",
    "علاج الشعر وفرد الكيراتين": "💡 نصيحة عامة: استخدمي أنواع شامبو خالية من الكبريت (Sulfat-free) لضمان استمرارية نتائج علاج الشعر.",
    "تسريحات المناسبات": "💡 نصيحة عامة: يفضل ارتداء ملابس بأزرار أمامية لتجنب إفساد التسريحة أثناء تبديل الملابس.",
    
    "تنظيف بشرة عميق": "💡 نصيحة عامة: يفضل تجنب التعرض المباشر لأشعة الشمس الحارقة أو وضع المكياج الثقيل لمدة 24 ساعة بعد جلسة التنظيف.",
    "علاج النضارة والترطيب": "💡 نصيحة عامة: شرب كميات وفيرة من الماء بعد جلسات ترطيب البشرة يعزز من إشراقتها ونتائجها.",
    "جلسات العناية بمنطقة العيون": "💡 نصيحة عامة: احرصي على الحصول على قسط كافٍ من النوم لتعزيز نتائج استرخاء وحيوية منطقة العين.",

    "بدكير ومنيكير": "💡 نصيحة عامة: ترطيب اليدين والقدمين باستمرار يحافظ على نعومة الجلد لفترة أطول بعد الجلسة.",
    "تركيب وتزيين الأظافر": "💡 نصيحة عامة: تجنبي استخدام الأظافر كأدوات لفتح العبوات للحفاظ على ثباتها وعدم تعرضها للكسر.",
    "عناية وترطيب اليدين والقدمين": "💡 نصيحة عامة: استخدام القفازات القطنية ليلاً بعد تطبيق المرطب يعطي نتائج مذهلة في النعومة.",

    "مكياج سهرات ومناسبات": "💡 نصيحة عامة: الترطيب الخفيف للبشرة قبل موعد المكياج يمنحك مظهراً متألقاً وثباتاً طوال السهرة.",
    "مكياج عرائس": "💡 نصيحة عامة: ننصح بعمل جلسة بروفة مسبقة لتحديد الألوان والستايل الأنسب للمناسبة الكبرى.",
    "تنسيق وتخطيط الحواجب والرموش": "💡 نصيحة عامة: تجنبي فرك العينين بقوة أو تعريضهما للبخار المباشر خلال الـ 24 ساعة الأولى."
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

// دالة لعرض الحجوزات المحفوظة مع أزرار التعديل والحذف
function loadBookings() {
    bookingsList.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    
    if (savedBookings.length === 0) {
        bookingsList.innerHTML = '<li style="color: #666; padding: 8px 0;">لا توجد حجوزات مسجلة حتى الآن.</li>';
        return;
    }

    savedBookings.forEach((booking, index) => {
        const li = document.createElement('li');
        li.style.cssText = "background: #f9f9f9; margin-bottom: 10px; padding: 10px; border-radius: 6px; border-right: 4px solid #ff4081; display: flex; justify-content: space-between; align-items: center;";
        
        const bookingInfo = document.createElement('div');
        bookingInfo.innerHTML = `<strong>الحجز #${index + 1}:</strong> ${booking.salon} - ${booking.service} <br><small style="color: #666;">الموعد: ${booking.date}</small>`;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = "flex";
        actionsDiv.style.gap = "8px";

        const editBtn = document.createElement('button');
        editBtn.textContent = 'تعديل';
        editBtn.style.cssText = "background-color: #7c4dff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;";
        editBtn.addEventListener('click', function() {
            editBooking(index);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'إلغاء';
        deleteBtn.style.cssText = "background-color: #ff5252; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;";
        deleteBtn.addEventListener('click', function() {
            removeBooking(index);
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(bookingInfo);
        li.appendChild(actionsDiv);
        bookingsList.appendChild(li);
    });
}

// دالة لتعبئة النموذج ببيانات الحجز المراد تعديله
function editBooking(index) {
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const booking = savedBookings[index];

    salonSelect.value = booking.salon;
    serviceSelect.value = booking.service;
    bookingDateInput.value = booking.date;

    editingIndex = index;
    window.location.hash = '#booking';
    
    if (generalTips[booking.service]) {
        aiSuggestionText.textContent = generalTips[booking.service];
        aiSuggestionText.style.color = "#7c4dff";
        aiSuggestionText.style.fontWeight = "bold";
    }
}

// دالة لحذف حجز معين من الذاكرة المحلية وتحديث القائمة
function removeBooking(index) {
    let savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    savedBookings.splice(index, 1);
    localStorage.setItem('salon_bookings', JSON.stringify(savedBookings));
    
    if (editingIndex === index) {
        editingIndex = null;
        bookingForm.reset();
        setMinDateTime();
    }
    
    loadBookings();
}

// تنفيذ دالة التحميل عند بدء تشغيل الصفحة
loadBookings();

// الاستماع لعملية إرسال نموذج الحجز مع التحقق من صحة التاريخ
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const salon = salonSelect.value;
    const service = serviceSelect.value;
    const date = bookingDateInput.value;

    // التحقق الإضافي لرفض أي تواريخ سابقة
    const nowIsoString = new Date().toISOString().slice(0, 16);
    if (date < nowIsoString) {
        alert('عذراً، لا يمكن حجز موعد في تاريخ أو وقت مضى.');
        return;
    }

    if (salon && service && date) {
        const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];

        if (editingIndex !== null) {
            savedBookings[editingIndex] = { salon, service, date };
            successMessage.textContent = `تم تحديث حجزك بنجاح ✨`;
            editingIndex = null;
        } else {
            const newBooking = { salon, service, date };
            savedBookings.push(newBooking);
            successMessage.textContent = `تم تسجيل حجزك بنجاح وحفظه في الذاكرة المحلية ✨`;
        }
        
        localStorage.setItem('salon_bookings', JSON.stringify(savedBookings));

        successMessage.style.display = 'block';
        
        loadBookings();
        bookingForm.reset();
        setMinDateTime(); // إعادة ضبط أقل تاريخ متاح
        aiSuggestionText.textContent = "اختر نوع الخدمة في نموذج الحجز بالأعلى للاطلاع على نصائح العناية العامة المرتبطة بها.";
        aiSuggestionText.style.color = "#555";
        aiSuggestionText.style.fontWeight = "normal";
    }
});