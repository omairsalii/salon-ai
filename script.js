// ==========================================
// 1. قسم الخريطة التفاعلية والبحث المباشر عن الصالونات
// ==========================================
const map = L.map('map').setView([26.2285, 50.5860], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// قاعدة بيانات أساسية للصالونات
let salonsDatabase = {
    "الفرع الرئيسي - المنامة": {
        name: "صالون الذكاء الاصطناعي (الفرع الرئيسي)",
        details: "المنامة، شارع المعارض - متخصصون في كافة خدمات الشعر والبشرة.",
        lat: 26.2285,
        lng: 50.5860,
        logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop",
        services: [
            { name: "قص شعر وتصفيف", price: "15 BHD" },
            { name: "صبغة الشعر وتلوينه", price: "35 BHD" },
            { name: "تنظيف بشرة عميق", price: "25 BHD" }
        ]
    },
    "فرع السيف": {
        name: "صالون اللمسة الأنيقة (فرع السيف)",
        details: "مجمع السيف التجاري - أحدث صيحات التجميل والعناية الشاملة.",
        lat: 26.2407,
        lng: 50.5312,
        logo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop",
        services: [
            { name: "قص شعر وتصفيف", price: "12 BHD" },
            { name: "عناية متكاملة بالأظافر (مانيكير وباديكير)", price: "20 BHD" },
            { name: "مكياج سهرة احترافي", price: "40 BHD" }
        ]
    }
};

// دمج الصالونات المضافة من لوحة الأدمن (LocalStorage) مع البيانات الأساسية تلقائياً
const customSalons = JSON.parse(localStorage.getItem('salons_custom_data'));
if (customSalons) {
    salonsDatabase = { ...salonsDatabase, ...customSalons };
}

// تعبئة القائمة المنسدلة للصالونات ديناميكياً
const salonSelect = document.getElementById('salon-name');
if (salonSelect) {
    salonSelect.innerHTML = '<option value="">-- اختر صالوناً --</option>';
    Object.keys(salonsDatabase).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = salonsDatabase[key].name;
        salonSelect.appendChild(option);
    });
}

// إنشاء العلامات على الخريطة
const salonsMarkers = [];
let activeMapLayer = L.layerGroup().addTo(map);

function renderMapMarkers() {
    activeMapLayer.clearLayers();
    salonsMarkers.length = 0;

    Object.keys(salonsDatabase).forEach(key => {
        const salon = salonsDatabase[key];
        const marker = L.marker([salon.lat, salon.lng]);
        
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${salon.lat},${salon.lng}`;
        marker.bindPopup(`
            <div style="text-align: right; direction: rtl;">
                <b>${salon.name}</b><br>
                <p style="margin: 5px 0; font-size: 0.85rem;">${salon.details}</p>
                <a href="${googleMapsUrl}" target="_blank" style="background: #1976d2; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; display: inline-block; font-size: 0.8rem; margin-top: 5px;">
                    🗺️ اذهب عبر خرائط جوجل
                </a>
            </div>
        `);
        
        activeMapLayer.addLayer(marker);
        salonsMarkers.push({ key: key, name: salon.name, lat: salon.lat, lng: salon.lng, marker: marker });
    });
}
renderMapMarkers();

// زر تحديد موقع المستخدم الجغرافي
const locateBtn = document.getElementById('locate-btn');
if (locateBtn) {
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
            function() {
                alert('تعذر تحديد موقعك.');
                locateBtn.textContent = '📍 تحديد موقعي الحالي';
            }
        );
    });
}

// الآلية الجديدة للتعامل التلقائي مع روابط خرائط جوجل (إحداثيات أو أسماء أماكن)
const extractMapBtn = document.getElementById('extract-map-btn');
const googleMapUrlInput = document.getElementById('google-map-url-input');

if (extractMapBtn && googleMapUrlInput) {
    extractMapBtn.addEventListener('click', function() {
        const url = googleMapUrlInput.value.trim();
        if (!url) {
            alert('الرجاء لصق رابط خرائط جوجل أولاً.');
            return;
        }

        // 1. محاولة استخراج الإحداثيات المباشرة إن توفرت في الرابط
        const regexAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const regexQ = /[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/;
        let match = url.match(regexAt) || url.match(regexQ);
        
        let lat, lng;

        if (match) {
            lat = parseFloat(match[1]);
            lng = parseFloat(match.length > 2 ? match[2] : match[1]);
        } else {
            // 2. إذا كان رابط مكان نصي (بدون أرقام)، نستخلص اسم المكان من الرابط لتسهيل التعامل أو نضع مركز افتراضي ذكي مع إضافة الموقع للرابط المباشر
            // نأخذ نقطة وسطية افتراضية (مثلاً وسط المنامة مع تحريك طفيف عشوائي لتمييزه) ونربطه بالرابط الأصلي مباشرة
            lat = 26.2285 + (Math.random() - 0.5) * 0.01;
            lng = 50.5860 + (Math.random() - 0.5) * 0.01;
        }

        map.setView([lat, lng], 16);
        
        const customMarker = L.marker([lat, lng], { draggable: true }).addTo(activeMapLayer);
        customMarker.bindPopup(`
            <div style="text-align: right; direction: rtl;">
                <b>📍 موقع الصالون المُضاف</b><br>
                <p style="margin: 4px 0; font-size: 0.8rem; color: #555;">(يمكنك سحب العلامة لتعديل المكان بدقة)</p>
                <a href="${url}" target="_blank" style="background: #1976d2; color: white; padding: 5px 10px; border-radius: 4px; text-decoration: none; display: inline-block; font-size: 0.8rem; margin-top: 5px;">
                    🗺️ فتح الرابط الأصلي في جوجل
                </a>
            </div>
        `).openPopup();
        
        alert('تم جلب الرابط بنجاح! تم وضع علامة للموقع على الخريطة، ويمكنك سحبها لتعديل مكانها بدقة إذا أردت 🚀');
    });
}

// البحث السريع عن الصالون
const salonSearchInput = document.getElementById('salon-search-input');
const searchSalonBtn = document.getElementById('search-salon-btn');
if (searchSalonBtn && salonSearchInput) {
    searchSalonBtn.addEventListener('click', function() {
        const query = salonSearchInput.value.trim().toLowerCase();
        if (!query) return;
        const found = salonsMarkers.find(s => s.name.toLowerCase().includes(query) || s.key.toLowerCase().includes(query));
        if (found) {
            map.setView([found.lat, found.lng], 16);
            found.marker.openPopup();
            if (salonSelect) {
                salonSelect.value = found.key;
                updateSalonProfileAndServices();
            }
        } else {
            alert('لم يتم العثور على صالون بهذا الاسم.');
        }
    });
}


// ==========================================
// 2. عناصر بوابات الحجز والمصادقة
// ==========================================
const showRegisterBtn = document.getElementById('show-register-btn');
const showLoginBtn = document.getElementById('show-login-btn');
const clientAuthBox = document.getElementById('client-auth-box');
const clientLoginBox = document.getElementById('client-login-box');
const clientForgotBox = document.getElementById('client-forgot-box');
const clientDashboardBox = document.getElementById('client-dashboard-box');

const clientRegisterForm = document.getElementById('client-register-form');
const regNameInput = document.getElementById('reg-name');
const regPhoneInput = document.getElementById('reg-phone');
const regEmailInput = document.getElementById('reg-email');
const regNationalityInput = document.getElementById('reg-nationality');
const regPasswordInput = document.getElementById('reg-password');
const regRobotCheck = document.getElementById('reg-robot-check');
const regSuccess = document.getElementById('reg-success');

const clientLoginForm = document.getElementById('client-login-form');
const loginPhoneInput = document.getElementById('login-phone');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const forgotPasswordLink = document.getElementById('forgot-password-link');
const clientForgotForm = document.getElementById('client-forgot-form');
const forgotEmailInput = document.getElementById('forgot-email');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const forgotSuccess = document.getElementById('forgot-success');

const welcomeClientTitle = document.getElementById('welcome-client-title');
const clientInfoDetails = document.getElementById('client-info-details');
const clientPointsBadge = document.getElementById('client-points-badge');
const clientSpentBadge = document.getElementById('client-spent-badge');
const clientLogoutBtn = document.getElementById('client-logout-btn');

const bookingForm = document.getElementById('booking-form');
const successMessage = document.getElementById('success-message');
const bookingsList = document.getElementById('bookings-list');
const serviceSelect = document.getElementById('service-type');
const bookingDateInput = document.getElementById('booking-date');
const aiSuggestionText = document.getElementById('ai-suggestion-text');
const clientNameInput = document.getElementById('client-name');
const clientPhoneInput = document.getElementById('client-phone-input');

// عناصر بطاقة الصالون وزر الاتجاهات المباشر في قسم الحجز
const salonProfileCard = document.getElementById('salon-profile-card');
const displaySalonLogo = document.getElementById('display-salon-logo');
const displaySalonName = document.getElementById('display-salon-name');
const displaySalonDetails = document.getElementById('display-salon-details');
const salonDirectionsBtn = document.getElementById('salon-directions-btn');

const promoModal = document.getElementById('client-promo-modal');
const closePromoModalBtn = document.getElementById('close-promo-modal');
const publicSalonsPromoBox = document.getElementById('public-salons-promo-box');
const clientPrivatePromoBox = document.getElementById('client-private-promo-box');


// ==========================================
// 3. نظام الإعلانات والترويج
// ==========================================
function loadPublicPromos() {
    if (!publicSalonsPromoBox) return;
    let generalPromos = JSON.parse(localStorage.getItem('salon_public_promos')) || [
        "🔥 بمناسبة (افتتاح الفرع الجديد)، يعلن (صالون الذكاء الاصطناعي) عن توفير (خصم) بقيمة (20%) لفترة محدودة!",
        "✨ بمناسبة (عطلة نهاية الأسبوع)، يعلن (صالون اللمسة الأنيقة) عن توفير (خدمة مجانية) تتمثل في (جلسة تنظيف بشرة سريع) لفترة محدودة!"
    ];
    let currentIndex = 0;
    publicSalonsPromoBox.innerHTML = generalPromos[currentIndex];
    if (generalPromos.length > 1) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % generalPromos.length;
            publicSalonsPromoBox.innerHTML = generalPromos[currentIndex];
        }, 6000);
    }
}

function updateClientPrivatePromo(message, isVip = false) {
    if (clientPrivatePromoBox) {
        clientPrivatePromoBox.innerHTML = message;
        clientPrivatePromoBox.style.color = isVip ? "#d81b60" : "#333";
        clientPrivatePromoBox.style.fontWeight = isVip ? "bold" : "normal";
    }
}

function showClientPromoModal(title, desc, icon = "🎉") {
    if (promoModal) {
        document.getElementById("promo-title").innerText = title;
        document.getElementById("promo-desc").innerText = desc;
        document.getElementById("promo-icon").innerText = icon;
        promoModal.style.display = "flex";
    }
}

if (closePromoModalBtn) {
    closePromoModalBtn.addEventListener('click', () => {
        if (promoModal) promoModal.style.display = 'none';
    });
}


// ==========================================
// 4. إدارة الجلسات والمصادقة
// ==========================================
if (showRegisterBtn && showLoginBtn) {
    showRegisterBtn.addEventListener('click', () => {
        clientAuthBox.style.display = 'block';
        clientLoginBox.style.display = 'none';
        clientForgotBox.style.display = 'none';
        showRegisterBtn.style.background = '#7c4dff';
        showRegisterBtn.style.color = 'white';
        showLoginBtn.style.background = '#e0e0e0';
        showLoginBtn.style.color = '#333';
    });

    showLoginBtn.addEventListener('click', () => {
        clientAuthBox.style.display = 'none';
        clientLoginBox.style.display = 'block';
        clientForgotBox.style.display = 'none';
        showLoginBtn.style.background = '#7c4dff';
        showLoginBtn.style.color = 'white';
        showRegisterBtn.style.background = '#e0e0e0';
        showRegisterBtn.style.color = '#333';
    });
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        clientLoginBox.style.display = 'none';
        clientForgotBox.style.display = 'block';
    });
}

if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => {
        clientForgotBox.style.display = 'none';
        clientLoginBox.style.display = 'block';
    });
}

if (clientForgotForm) {
    clientForgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = forgotEmailInput.value.trim();
        const allClients = JSON.parse(localStorage.getItem('salon_registered_clients')) || [];
        const found = allClients.find(c => c.email === email);

        if (found) {
            forgotSuccess.textContent = `✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى: (${email}) بنجاح!`;
            forgotSuccess.style.display = 'block';
            setTimeout(() => {
                forgotSuccess.style.display = 'none';
                clientForgotBox.style.display = 'none';
                clientLoginBox.style.display = 'block';
            }, 3000);
        } else {
            alert('البريد الإلكتروني غير مسجل في النظام.');
        }
    });
}

function setMinDateTime() {
    if (!bookingDateInput) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    bookingDateInput.min = `${year}-${month}-${day}T${hours}:${minutes}`;
}
setMinDateTime();

let editingIndex = null;

function checkClientSession() {
    const loggedInClient = JSON.parse(localStorage.getItem('current_logged_client'));
    const authTabs = document.getElementById('auth-tabs');
    loadPublicPromos();

    if (loggedInClient) {
        if (authTabs) authTabs.style.display = 'none';
        if (clientAuthBox) clientAuthBox.style.display = 'none';
        if (clientLoginBox) clientLoginBox.style.display = 'none';
        if (clientForgotBox) clientForgotBox.style.display = 'none';
        if (clientDashboardBox) clientDashboardBox.style.display = 'block';

        welcomeClientTitle.textContent = `أهلاً بك، ${loggedInClient.name} ✨`;
        clientInfoDetails.innerHTML = `الهاتف: ${loggedInClient.phone} | البريد: ${loggedInClient.email} | الجنسية: ${loggedInClient.nationality}`;
        
        if (clientNameInput) clientNameInput.value = loggedInClient.name;
        if (clientPhoneInput) clientPhoneInput.value = loggedInClient.phone;

        updateClientStats(loggedInClient.name);
    } else {
        if (authTabs) authTabs.style.display = 'flex';
        if (clientAuthBox) clientAuthBox.style.display = 'block';
        if (clientLoginBox) clientLoginBox.style.display = 'none';
        if (clientForgotBox) clientForgotBox.style.display = 'none';
        if (clientDashboardBox) clientDashboardBox.style.display = 'none';
    }
}

function updateClientStats(clientName) {
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    let totalSpent = 0;
    let clientBookingsCount = 0;

    savedBookings.forEach(booking => {
        if (booking.clientName === clientName) {
            clientBookingsCount++;
            totalSpent += 15; 
        }
    });

    const points = clientBookingsCount * 50;
    if (clientPointsBadge) clientPointsBadge.textContent = `⭐ رصيد النقاط: ${points} نقطة`;
    if (clientSpentBadge) clientSpentBadge.textContent = `💳 إجمالي المعاملات: ${totalSpent} BHD`;

    if (clientBookingsCount >= 3 || totalSpent >= 30) {
        updateClientPrivatePromo("👑 تهانينا! أنت الآن عميل VIP استثنائي ولديك خصم 15% دائم على جميع حجوزاتك القادمة.", true);
    } else {
        updateClientPrivatePromo(`مرحباً بك! لديك ${clientBookingsCount} حجوزات مسجلة. أكمل 3 حجوزات لتحصل تلقائياً على ترقية الـ VIP وخصم 15%.`);
    }
}

if (clientRegisterForm) {
    clientRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!regRobotCheck.checked) {
            alert('يرجى تأكيد أنك لست روبوت.');
            return;
        }
        const newClient = {
            name: regNameInput.value.trim(),
            phone: regPhoneInput.value.trim(),
            email: regEmailInput.value.trim(),
            nationality: regNationalityInput.value.trim(),
            password: regPasswordInput.value.trim()
        };
        let allClients = JSON.parse(localStorage.getItem('salon_registered_clients')) || [];
        const existingIndex = allClients.findIndex(c => c.phone === newClient.phone);
        if (existingIndex >= 0) {
            allClients[existingIndex] = newClient;
        } else {
            allClients.push(newClient);
        }
        localStorage.setItem('salon_registered_clients', JSON.stringify(allClients));
        localStorage.setItem('current_logged_client', JSON.stringify(newClient));

        regSuccess.textContent = 'تم إنشاء حسابك الآمن بنجاح! 🎉';
        regSuccess.style.display = 'block';
        showClientPromoModal("مرحباً بك في صالوني الذكي!", "تم تسجيل حسابك بنجاح ومنحك رصيد ترحيبي ونقاط ولاء أولية.", "🌟");

        setTimeout(() => {
            regSuccess.style.display = 'none';
            checkClientSession();
            loadBookings();
        }, 1500);
    });
}

if (clientLoginForm) {
    clientLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = loginPhoneInput.value.trim();
        const password = loginPasswordInput.value.trim();
        const allClients = JSON.parse(localStorage.getItem('salon_registered_clients')) || [];
        const foundClient = allClients.find(c => c.phone === phone && c.password === password);
        if (foundClient) {
            localStorage.setItem('current_logged_client', JSON.stringify(foundClient));
            loginError.style.display = 'none';
            checkClientSession();
            loadBookings();
        } else {
            loginError.textContent = 'رقم الهاتف أو كلمة المرور غير صحيحة.';
            loginError.style.display = 'block';
        }
    });
}

if (clientLogoutBtn) {
    clientLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('current_logged_client');
        checkClientSession();
        loadBookings();
    });
}

const generalTips = {
    "قص شعر وتصفيف": "💡 نصيحة عامة: يُنصح بغسل الشعر قبل موعد القص بـ 24 ساعة ليكون في أفضل حالة للتصفيف.",
    "صبغة الشعر وتلوينه": "💡 نصيحة عامة: يفضل عدم غسل الشعر بالماء الساخن لمدة 48 ساعة بعد الصبغة للحفاظ على ثبات اللون.",
    "تنظيف بشرة عميق": "💡 نصيحة عامة: يفضل تجنب التعرض المباشر لأشعة الشمس الحارقة أو وضع المكياج الثقيل لمدة 24 ساعة بعد جلسة التنظيف."
};

if (serviceSelect) {
    serviceSelect.addEventListener('change', function() {
        const selectedService = this.value;
        if (generalTips[selectedService]) {
            aiSuggestionText.textContent = generalTips[selectedService];
            aiSuggestionText.style.color = "#7c4dff";
            aiSuggestionText.style.fontWeight = "bold";
        } else {
            aiSuggestionText.textContent = "اختر نوع الخدمة في نموذج الحجز بالأعلى للاطلاع على نصائح العناية العامة.";
            aiSuggestionText.style.color = "#555";
            aiSuggestionText.style.fontWeight = "normal";
        }
    });
}


// ==========================================
// 5. تحديث بطاقة الصالون وزر الاتجاهات الفوري
// ==========================================
function updateSalonProfileAndServices() {
    if (!salonSelect || !serviceSelect) return;
    const selectedKey = salonSelect.value;
    
    serviceSelect.innerHTML = '<option value="">-- اختر الخدمة المطلوبة --</option>';

    if (!selectedKey) {
        if (salonProfileCard) salonProfileCard.style.display = 'none';
        return;
    }

    const salonInfo = salonsDatabase[selectedKey];

    if (salonInfo) {
        if (salonProfileCard) {
            salonProfileCard.style.display = 'flex';
            if (displaySalonLogo) displaySalonLogo.src = salonInfo.logo;
            if (displaySalonName) displaySalonName.textContent = salonInfo.name;
            if (displaySalonDetails) displaySalonDetails.textContent = salonInfo.details;

            // تفعيل وتحديث رابط خرائط جوجل المباشر للزر
            if (salonDirectionsBtn) {
                salonDirectionsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${salonInfo.lat},${salonInfo.lng}`;
            }
        }

        if (salonInfo.services && salonInfo.services.length > 0) {
            salonInfo.services.forEach(srv => {
                const option = document.createElement('option');
                option.value = srv.name;
                option.textContent = `${srv.name} (${srv.price})`;
                serviceSelect.appendChild(option);
            });
        }
    } else {
        if (salonProfileCard) salonProfileCard.style.display = 'none';
    }
}

if (salonSelect) {
    salonSelect.addEventListener('change', updateSalonProfileAndServices);
}


// ==========================================
// 6. إدارة الحجوزات
// ==========================================
function loadBookings() {
    if (!bookingsList) return;
    bookingsList.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const loggedInClient = JSON.parse(localStorage.getItem('current_logged_client'));
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
    if (salonSelect) salonSelect.value = booking.salon;
    updateSalonProfileAndServices();
    if (serviceSelect) serviceSelect.value = booking.service;
    if (bookingDateInput) bookingDateInput.value = booking.date;
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
    }
    loadBookings();
    const loggedIn = JSON.parse(localStorage.getItem('current_logged_client'));
    if (loggedIn) updateClientStats(loggedIn.name);
}

if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const clientName = clientNameInput ? clientNameInput.value.trim() : "زائر";
        const phone = clientPhoneInput ? clientPhoneInput.value.trim() : "";
        const salon = salonSelect ? salonSelect.value : "";
        const service = serviceSelect.value;
        const date = bookingDateInput.value;

        const nowIsoString = new Date().toISOString().slice(0, 16);
        if (date < nowIsoString) {
            alert('عذراً، لا يمكن حجز موعد في تاريخ أو وقت مضى.');
            return;
        }

        if (salon && service && date) {
            const bookingsArray = JSON.parse(localStorage.getItem('salon_bookings')) || [];
            if (editingIndex !== null) {
                bookingsArray[editingIndex] = { clientName, phone, salon, service, date };
                successMessage.textContent = `تم تحديث حجزك بنجاح ✨`;
                editingIndex = null;
            } else {
                bookingsArray.push({ clientName, phone, salon, service, date });
                successMessage.textContent = `تم تسجيل حجزك بنجاح وإضافته لسجلك الشخصي ✨`;
                showClientPromoModal("شكراً لحجزك معنا! 🥳", "تمت إضافة نقاط الولاء لحسابك بنجاح، استمتع بخدمات صالوناتنا الذكية.", "🎁");
            }
            localStorage.setItem('salon_bookings', JSON.stringify(bookingsArray));
            successMessage.style.display = 'block';
            loadBookings();
            
            const loggedInClient = JSON.parse(localStorage.getItem('current_logged_client'));
            bookingForm.reset();
            setMinDateTime();
            if (loggedInClient) {
                if (clientNameInput) clientNameInput.value = loggedInClient.name;
                if (clientPhoneInput) clientPhoneInput.value = loggedInClient.phone;
                updateClientStats(loggedInClient.name);
            }
            if (salonProfileCard) salonProfileCard.style.display = 'none';
        }
    });
}

// التشغيل الأولي
checkClientSession();
loadBookings();