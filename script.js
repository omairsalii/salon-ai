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

// عناصر DOM الخاصة بالتسجيل، الحجز، والنصائح
const clientRegisterForm = document.getElementById('client-register-form');
const regNameInput = document.getElementById('reg-name');
const regPhoneInput = document.getElementById('reg-phone');
const regEmailInput = document.getElementById('reg-email');
const regNationalityInput = document.getElementById('reg-nationality');
const regSuccess = document.getElementById('reg-success');

const clientAuthBox = document.getElementById('client-auth-box');
const clientDashboardBox = document.getElementById('client-dashboard-box');
const welcomeClientTitle = document.getElementById('welcome-client-title');
const clientInfoDetails = document.getElementById('client-info-details');
const clientPointsBadge = document.getElementById('client-points-badge');
const clientSpentBadge = document.getElementById('client-spent-badge');
const clientLogoutBtn = document.getElementById('client-logout-btn');

const bookingForm = document.getElementById('booking-form');
const successMessage = document.getElementById('success-message');
const bookingsList = document.getElementById('bookings-list');
const salonSelect = document.getElementById('salon-name');
const serviceSelect = document.getElementById('service-type');
const bookingDateInput = document.getElementById('booking-date');
const aiSuggestionText = document.getElementById('ai-suggestion-text');
const clientNameInput = document.getElementById('client-name');
const clientPhoneInput = document.getElementById('client-phone-input');

// عناصر بطاقة معلومات الصالون
const salonProfileCard = document.getElementById('salon-profile-card');
const displaySalonLogo = document.getElementById('display-salon-logo');
const displaySalonName = document.getElementById('display-salon-name');
const displaySalonDetails = document.getElementById('display-salon-details');

// ضبط الحد الأدنى لتاريخ الحجز لمنع التواريخ الماضية
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
setMinDateTime();

let editingIndex = null;

// إدارة جلسة العميل المسجل في الـ localStorage
function checkClientSession() {
    const loggedInClient = JSON.parse(localStorage.getItem('current_logged_client'));
    if (loggedInClient) {
        clientAuthBox.style.display = 'none';
        clientDashboardBox.style.display = 'block';
        welcomeClientTitle.textContent = `أهلاً بك، ${loggedInClient.name} ✨`;
        clientInfoDetails.innerHTML = `الهاتف: ${loggedInClient.phone} | البريد: ${loggedInClient.email} | الجنسية: ${loggedInClient.nationality}`;
        
        // تعبئة حقول الحجز تلقائياً للعميل المسجل
        if (clientNameInput) clientNameInput.value = loggedInClient.name;
        if (clientPhoneInput) clientPhoneInput.value = loggedInClient.phone;

        updateClientStats(loggedInClient.name);
    } else {
        clientAuthBox.style.display = 'block';
        clientDashboardBox.style.display = 'none';
        if (clientNameInput) clientNameInput.value = '';
        if (clientPhoneInput) clientPhoneInput.value = '';
    }
}

// حساب النقاط والمعاملات للعميل المسجل
function updateClientStats(clientName) {
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const salonsData = JSON.parse(localStorage.getItem('salons_custom_data')) || {};
    
    let totalSpent = 0;
    let clientBookingsCount = 0;

    savedBookings.forEach(booking => {
        if (booking.clientName === clientName) {
            clientBookingsCount++;
            const salonServices = salonsData[booking.salon]?.services || [];
            const matchedSrv = salonServices.find(s => s.name === booking.service);
            totalSpent += matchedSrv ? (parseFloat(matchedSrv.price) || 0) : 10;
        }
    });

    const points = clientBookingsCount * 50; // كل حجز يمنح 50 نقطة ولاء
    clientPointsBadge.textContent = `⭐ رصيد النقاط: ${points} نقطة`;
    clientSpentBadge.textContent = `💳 إجمالي المعاملات: ${totalSpent} BHD`;
}

// تنفيذ التسجيل الخفيف
clientRegisterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newClient = {
        name: regNameInput.value.trim(),
        phone: regPhoneInput.value.trim(),
        email: regEmailInput.value.trim(),
        nationality: regNationalityInput.value.trim()
    };

    localStorage.setItem('current_logged_client', JSON.stringify(newClient));
    regSuccess.textContent = 'تم تسجيل حسابك بنجاح وأصبحت عضواً معنا! 🎉';
    regSuccess.style.display = 'block';

    setTimeout(() => {
        regSuccess.style.display = 'none';
        checkClientSession();
        loadBookings();
    }, 1500);
});

// تسجيل الخروج
if (clientLogoutBtn) {
    clientLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('current_logged_client');
        checkClientSession();
        loadBookings();
    });
}

// قاعدة بيانات آمنة للنصائح العامة
const generalTips = {
    "قص شعر وتصفيف": "💡 نصيحة عامة: يُنصح بغسل الشعر قبل موعد القص بـ 24 ساعة ليكون في أفضل حالة للتصفيف.",
    "صبغة الشعر وتلوينه": "💡 نصيحة عامة: يفضل عدم غسل الشعر بالماء الساخن لمدة 48 ساعة بعد الصبغة للحفاظ على ثبات اللون.",
    "تنظيف بشرة عميق": "💡 نصيحة عامة: يفضل تجنب التعرض المباشر لأشعة الشمس الحارقة أو وضع المكياج الثقيل لمدة 24 ساعة بعد جلسة التنظيف."
};

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

// تحديث الخدمات وبطاقة الصالون ديناميكياً
function updateSalonProfileAndServices() {
    const selectedSalon = salonSelect.value;
    serviceSelect.innerHTML = '<option value="">-- اختر الخدمة المطلوبة --</option>';

    if (!selectedSalon) {
        salonProfileCard.style.display = 'none';
        return;
    }

    const salonsData = JSON.parse(localStorage.getItem('salons_custom_data')) || {};
    const salonInfo = salonsData[selectedSalon];

    if (salonInfo) {
        salonProfileCard.style.display = 'flex';
        displaySalonLogo.src = salonInfo.logo || 'https://via.placeholder.com/50';
        displaySalonName.textContent = selectedSalon;
        displaySalonDetails.innerHTML = `هاتف: ${salonInfo.phone || 'غير متوفر'} | السجل التجاري (CR): ${salonInfo.cr || 'غير متوفر'}`;
        
        if (salonInfo.services && salonInfo.services.length > 0) {
            salonInfo.services.forEach(srv => {
                const option = document.createElement('option');
                option.value = srv.name;
                option.textContent = `${srv.name} (${srv.price})`;
                serviceSelect.appendChild(option);
            });
        }
    } else {
        salonProfileCard.style.display = 'none';
    }
}

salonSelect.addEventListener('change', updateSalonProfileAndServices);

// عرض الحجوزات (إذا كان مسجلاً يعرض حجوزاته الخاصة فقط، أو يظهر الكل للزائر)
function loadBookings() {
    bookingsList.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const loggedInClient = JSON.parse(localStorage.getItem('current_logged_client'));

    // تصفية الحجوزات بناءً على العميل المسجل إن وجدت جلسة نشطة
    const displayBookings = loggedInClient ? savedBookings.filter(b => b.clientName === loggedInClient.name) : savedBookings;
    
    if (displayBookings.length === 0) {
        bookingsList.innerHTML = '<li style="color: #666; padding: 8px 0;">لا توجد حجوزات مسجلة حتى الآن.</li>';
        return;
    }

    displayBookings.forEach((booking, index) => {
        const li = document.createElement('li');
        li.style.cssText = "background: #f9f9f9; margin-bottom: 10px; padding: 10px; border-radius: 6px; border-right: 4px solid #ff4081; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;";
        
        const bookingInfo = document.createElement('div');
        bookingInfo.innerHTML = `<strong>الحجز:</strong> العميل: ${booking.clientName || 'زائر'} (${booking.phone || 'بدون هاتف'}) | الصالون: ${booking.salon} - الخدمة: ${booking.service} <br><small style="color: #666;">الموعد: ${booking.date}</small>`;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.style.display = "flex";
        actionsDiv.style.gap = "8px";

        const editBtn = document.createElement('button');
        editBtn.textContent = 'تعديل';
        editBtn.style.cssText = "background-color: #7c4dff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;";
        editBtn.addEventListener('click', () => editBooking(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'إلغاء';
        deleteBtn.style.cssText = "background-color: #ff5252; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;";
        deleteBtn.addEventListener('click', () => removeBooking(index));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(bookingInfo);
        li.appendChild(actionsDiv);
        bookingsList.appendChild(li);
    });
}

function editBooking(index) {
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const booking = savedBookings[index];

    if (clientNameInput && booking.clientName) clientNameInput.value = booking.clientName;
    if (clientPhoneInput && booking.phone) clientPhoneInput.value = booking.phone;
    
    salonSelect.value = booking.salon;
    updateSalonProfileAndServices();
    serviceSelect.value = booking.service;
    bookingDateInput.value = booking.date;

    editingIndex = index;
    window.location.hash = '#booking';
}

function removeBooking(index) {
    let savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    savedBookings.splice(index, 1);
    localStorage.setItem('salon_bookings', JSON.stringify(savedBookings));
    
    if (editingIndex === index) {
        editingIndex = null;
        bookingForm.reset();
        setMinDateTime();
        checkClientSession();
    }
    loadBookings();
    const loggedIn = JSON.parse(localStorage.getItem('current_logged_client'));
    if (loggedIn) updateClientStats(loggedIn.name);
}

// إرسال الحجز
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault(); 
    const clientName = clientNameInput ? clientNameInput.value.trim() : "زائر";
    const phone = clientPhoneInput ? clientPhoneInput.value.trim() : "";
    const salon = salonSelect.value;
    const service = serviceSelect.value;
    const date = bookingDateInput.value;

    const nowIsoString = new Date().toISOString().slice(0, 16);
    if (date < nowIsoString) {
        alert('عذراً، لا يمكن حجز موعد في تاريخ أو وقت مضى.');
        return;
    }

    if (salon && service && date) {
        const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];

        if (editingIndex !== null) {
            savedBookings[editingIndex] = { clientName, phone, salon, service, date };
            successMessage.textContent = `تم تحديث حجزك بنجاح ✨`;
            editingIndex = null;
        } else {
            savedBookings.push({ clientName, phone, salon, service, date });
            successMessage.textContent = `تم تسجيل حجزك بنجاح وإضافته لسجلك الشخصي ✨`;
        }
        
        localStorage.setItem('salon_bookings', JSON.stringify(savedBookings));
        successMessage.style.display = 'block';
        
        loadBookings();
        
        const loggedInClient = JSON.parse(localStorage.getItem('current_logged_client'));
        bookingForm.reset();
        setMinDateTime();
        
        if (loggedInClient) {
            clientNameInput.value = loggedInClient.name;
            clientPhoneInput.value = loggedInClient.phone;
            updateClientStats(loggedInClient.name);
        }

        salonProfileCard.style.display = 'none';
        aiSuggestionText.textContent = "اختر نوع الخدمة في نموذج الحجز بالأعلى للاطلاع على نصائح العناية العامة المرتبطة بها.";
    }
});

// تهيئة أولية عند تشغيل الصفحة
checkClientSession();
loadBookings();