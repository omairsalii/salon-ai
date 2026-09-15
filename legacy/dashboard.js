// تعريف العناصر والواجهات
const loginModal = document.getElementById('login-modal');
const dashboardContent = document.getElementById('dashboard-content');

const showTenantLoginBtn = document.getElementById('show-tenant-login');
const showTenantRegisterBtn = document.getElementById('show-tenant-register');
const tenantLoginForm = document.getElementById('tenant-login-form');
const tenantRegisterForm = document.getElementById('tenant-register-form');
const authModalTitle = document.getElementById('auth-modal-title');
const authModalDesc = document.getElementById('auth-modal-desc');
const loginErrorMsg = document.getElementById('login-error-msg');
const regSuccessMsg = document.getElementById('reg-success-msg');

const loginTenantCrInput = document.getElementById('login-tenant-cr');
const loginTenantPassInput = document.getElementById('login-tenant-pass');

const regTenantNameInput = document.getElementById('reg-tenant-name');
const regTenantCrInput = document.getElementById('reg-tenant-cr');
const regTenantPhoneInput = document.getElementById('reg-tenant-phone');
const regTenantPassInput = document.getElementById('reg-tenant-pass');

const logoutBtn = document.getElementById('logout-btn');
const tenantWelcomeTitle = document.getElementById('tenant-welcome-title');

// عناصر إدارة الصالون والتحليلات
const brandSettingsForm = document.getElementById('brand-settings-form');
const salonLogoInput = document.getElementById('salon-logo-url');
const salonPhoneInput = document.getElementById('salon-phone');
const salonCrInput = document.getElementById('salon-cr');
const brandSuccess = document.getElementById('brand-success');

const addServiceForm = document.getElementById('add-service-form');
const newServiceNameInput = document.getElementById('new-service-name');
const newServicePriceInput = document.getElementById('new-service-price');
const salonServicesList = document.getElementById('salon-services-list');
const tenantBookingsList = document.getElementById('tenant-bookings-list');

const addStaffForm = document.getElementById('add-staff-form');
const staffNameInput = document.getElementById('staff-name');
const staffRoleInput = document.getElementById('staff-role');
const staffList = document.getElementById('staff-list');
const statCurrentRevenue = document.getElementById('stat-current-revenue');
const statTotalBookings = document.getElementById('stat-total-bookings');

// عناصر التقويم
const calendarFilterDateInput = document.getElementById('calendar-filter-date');
const resetDateFilterBtn = document.getElementById('reset-date-filter');
const salonCalendarTbody = document.getElementById('salon-calendar-tbody');

// عناصر نموذج العميل اليدوي والحملات
const addManualClientForm = document.getElementById('add-manual-client-form');
const manualClientNameInput = document.getElementById('manual-client-name');
const broadcastCampaignForm = document.getElementById('broadcast-campaign-form');
const broadcastOccasionInput = document.getElementById('broadcast-occasion');
const broadcastServiceSelect = document.getElementById('broadcast-service-select');
const broadcastDiscountSelect = document.getElementById('broadcast-discount');
const broadcastChannelSelect = document.getElementById('broadcast-channel');

// التبديل بين واجهة تسجيل الدخول والاشتراك
showTenantLoginBtn.addEventListener('click', () => {
    tenantLoginForm.style.display = 'block';
    tenantRegisterForm.style.display = 'none';
    showTenantLoginBtn.style.background = '#7c4dff';
    showTenantLoginBtn.style.color = 'white';
    showTenantRegisterBtn.style.background = '#e0e0e0';
    showTenantRegisterBtn.style.color = '#333';
    authModalTitle.textContent = 'بوابة أصحاب الصالونات 🏢';
    authModalDesc.textContent = 'قم بتسجيل الدخول لوحة التحكم الخاصة بصالونك.';
    loginErrorMsg.style.display = 'none';
});

showTenantRegisterBtn.addEventListener('click', () => {
    tenantLoginForm.style.display = 'none';
    tenantRegisterForm.style.display = 'block';
    showTenantRegisterBtn.style.background = '#7c4dff';
    showTenantRegisterBtn.style.color = 'white';
    showTenantLoginBtn.style.background = '#e0e0e0';
    showTenantLoginBtn.style.color = '#333';
    authModalTitle.textContent = 'ابدأ 14 يوماً مجاناً (Free Trial) 🚀';
    authModalDesc.textContent = 'أنشئ حساب صالونك الآن واستمتع بكافة مميزات النظام مجاناً لفترة محدودة.';
    regSuccessMsg.style.display = 'none';
});

// فحص الجلسة والاشتراك
function checkAuthSession() {
    const currentCr = sessionStorage.getItem('current_salon_cr');
    if (!currentCr) {
        loginModal.style.display = 'flex';
        dashboardContent.style.display = 'none';
        return;
    }

    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
    const salon = allSalons[currentCr];

    if (!salon) {
        sessionStorage.removeItem('current_salon_cr');
        loginModal.style.display = 'flex';
        dashboardContent.style.display = 'none';
        return;
    }

    const now = new Date();
    const trialEnds = new Date(salon.trialEndsAt);
    const isSubscriptionActive = salon.isPaidPlan || (now <= trialEnds);

    if (!isSubscriptionActive) {
        loginModal.style.display = 'flex';
        dashboardContent.style.display = 'none';
        showUpgradeModal(salon);
        return;
    }

    loginModal.style.display = 'none';
    dashboardContent.style.display = 'block';
    loadSalonManagementData(currentCr);
}

// نافذة اختيار الباقات الثلاث
function showUpgradeModal(salon) {
    const modalBox = loginModal.querySelector('div');
    modalBox.style.maxWidth = "550px";
    modalBox.innerHTML = `
        <h2 style="color: #ff5252; margin-bottom: 5px;">انتهت فترتك التجريبية (14 يوماً) ⏳</h2>
        <p style="color: #666; font-size: 0.85rem; margin-bottom: 1rem;">اختر إحدى الباقات الثلاث أدناه لمتابعة العمل في لوحة تحكم صالون ${salon.name}:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 1.2rem; text-align: right;">
            <div style="border: 2px solid #ccc; padding: 10px; border-radius: 8px; cursor: pointer;" onclick="upgradePlan('${salon.cr}', 'الباقة الأساسية', 19)">
                <strong style="color: #333;">1. الأساسية</strong><br>
                <span style="color: #7c4dff; font-weight: bold; font-size: 1.1rem;">19 BHD</span><small>/شهرياً</small>
                <hr style="margin: 5px 0; border:0; border-top:1px solid #eee;">
                <small style="color:#666; font-size: 0.75rem;">إدارة الخدمات وطاقم العمل الأساسي والحجوزات.</small>
            </div>
            
            <div style="border: 2px solid #7c4dff; padding: 10px; border-radius: 8px; cursor: pointer; background: #f3e5f5;" onclick="upgradePlan('${salon.cr}', 'الباقة الاحترافية', 39)">
                <strong style="color: #7c4dff;">2. الاحترافية ⭐</strong><br>
                <span style="color: #7c4dff; font-weight: bold; font-size: 1.1rem;">39 BHD</span><small>/شهرياً</small>
                <hr style="margin: 5px 0; border:0; border-top:1px solid #d1c4e9;">
                <small style="color:#555; font-size: 0.75rem;">التحليلات المالية المتقدمة + نظام العملاء VIP.</small>
            </div>

            <div style="border: 2px solid #2e7d32; padding: 10px; border-radius: 8px; cursor: pointer; background: #e8f5e9;" onclick="upgradePlan('${salon.cr}', 'باقة المؤسسات', 79)">
                <strong style="color: #2e7d32;">3. المؤسسات 🏢</strong><br>
                <span style="color: #2e7d32; font-weight: bold; font-size: 1.1rem;">79 BHD</span><small>/شهرياً</small>
                <hr style="margin: 5px 0; border:0; border-top:1px solid #c8e6c9;">
                <small style="color:#555; font-size: 0.75rem;">دعم متعدد الفروع، وعروض واتساب وإيميل ذكية.</small>
            </div>
        </div>
        <button onclick="location.reload()" class="btn-secondary" style="background: #666; color: white; width: 100%; padding: 8px;">تسجيل الخروج</button>
    `;
}

window.upgradePlan = function(cr, planName, price) {
    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
    if (allSalons[cr]) {
        allSalons[cr].isPaidPlan = true;
        allSalons[cr].currentPlan = planName;
        localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));
        alert(`تم تفعيل اشتراكك بنجاح في ${planName} بقيمة ${price} BHD للشهر!`);
        location.reload();
    }
};

// تسجيل الدخول
tenantLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cr = loginTenantCrInput.value.trim();
    const pass = loginTenantPassInput.value.trim();

    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};

    if (cr === "123456-1" && pass === "salon123" && !allSalons[cr]) {
        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() + 14);
        allSalons[cr] = {
            name: "الفرع الرئيسي - المنامة",
            cr: "123456-1",
            phone: "+973 17000000",
            password: "salon123",
            trialEndsAt: trialDate.toISOString(),
            isPaidPlan: false,
            services: [{ name: "قص شعر وتصفيف", price: "10 BHD" }],
            staff: [{ name: "سارة أحمد", role: "أخصائية شعر" }],
            logo: "",
            manualVipClients: []
        };
        localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));
    }

    if (allSalons[cr] && allSalons[cr].password === pass) {
        sessionStorage.setItem('current_salon_cr', cr);
        loginErrorMsg.style.display = 'none';
        checkAuthSession();
    } else {
        loginErrorMsg.textContent = 'رقم السجل التجاري أو كلمة المرور غير صحيحة!';
        loginErrorMsg.style.display = 'block';
    }
});

// تسجيل صالون جديد
tenantRegisterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = regTenantNameInput.value.trim();
    const cr = regTenantCrInput.value.trim();
    const phone = regTenantPhoneInput.value.trim();
    const password = regTenantPassInput.value.trim();

    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};

    if (allSalons[cr]) {
        alert('رقم السجل التجاري هذا مسجل مسبقاً! يرجى تسجيل الدخول.');
        return;
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    allSalons[cr] = {
        name: name,
        cr: cr,
        phone: phone,
        password: password,
        trialEndsAt: trialEndDate.toISOString(),
        isPaidPlan: false,
        logo: "",
        services: [{ name: "خدمة افتتاحية", price: "15 BHD" }],
        staff: [{ name: "أخصائية الصالون", role: "خبير تجميل عام" }],
        manualVipClients: []
    };

    localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));

    regSuccessMsg.textContent = '🎉 مبروك! تم منحك 14 يوماً مجاناً. جاري نقلك للوحة التحكم...';
    regSuccessMsg.style.display = 'block';

    setTimeout(() => {
        sessionStorage.setItem('current_salon_cr', cr);
        checkAuthSession();
    }, 1500);
});

// تسجيل الخروج
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('current_salon_cr');
    location.reload();
});

// تحميل بيانات الصالون
function loadSalonManagementData(cr) {
    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
    const currentSalon = allSalons[cr];

    const now = new Date();
    const trialEnds = new Date(currentSalon.trialEndsAt);
    const diffTime = trialEnds - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let trialBadge = currentSalon.isPaidPlan ? `⭐ [${currentSalon.currentPlan}]` : `⏳ [فترة تجريبية: متبقي ${diffDays > 0 ? diffDays : 0} يوم]`;

    tenantWelcomeTitle.textContent = `إدارة صالون: ${currentSalon.name} ${trialBadge}`;

    salonLogoInput.value = currentSalon.logo || '';
    salonPhoneInput.value = currentSalon.phone || '';
    salonCrInput.value = currentSalon.cr || '';

    renderSalonServices(cr, currentSalon.services);
    renderStaffList(cr, currentSalon.staff || []);
    loadTenantBookingsAndAnalytics(currentSalon.name, currentSalon.services);
    renderVipCrmDashboard(currentSalon.name, currentSalon.services);
    renderSalonCalendar(currentSalon.name, currentSalon.services);
    populateBroadcastServices(currentSalon.services);
}

// تعبئة خدمات نموذج الحملات الجماعية
function populateBroadcastServices(services) {
    if (!broadcastServiceSelect) return;
    broadcastServiceSelect.innerHTML = '';
    services.forEach(s => {
        const option = document.createElement('option');
        option.value = s.name;
        option.textContent = `${s.name} (${s.price})`;
        broadcastServiceSelect.appendChild(option);
    });
}

// جدول التقويم والمواعيد
function renderSalonCalendar(salonName, salonServices, filterDate = '') {
    if (!salonCalendarTbody) return;
    salonCalendarTbody.innerHTML = '';

    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    let myBookings = savedBookings.filter(b => b.salon === salonName || b.salonId === salonName);

    if (filterDate) {
        myBookings = myBookings.filter(b => b.date && b.date.startsWith(filterDate));
    }

    if (myBookings.length === 0) {
        salonCalendarTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px; color: #666;">لا توجد مواعيد مسجلة في هذا التاريخ.</td></tr>`;
        return;
    }

    myBookings.forEach(booking => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #eee";
        tr.innerHTML = `
            <td style="padding: 10px; border: 1px solid #ddd;">${booking.date || 'غير محدد'}</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>${booking.clientName || 'عميل زائر'}</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${booking.service}</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="background: #e8f5e9; color: #2e7d32; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem;">مؤكد ✅</span></td>
        `;
        salonCalendarTbody.appendChild(tr);
    });
}

if (calendarFilterDateInput) {
    calendarFilterDateInput.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        const currentCr = sessionStorage.getItem('current_salon_cr');
        let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
        if (allSalons[currentCr]) {
            renderSalonCalendar(allSalons[currentCr].name, allSalons[currentCr].services, selectedDate);
        }
    });
}

if (resetDateFilterBtn) {
    resetDateFilterBtn.addEventListener('click', () => {
        if (calendarFilterDateInput) calendarFilterDateInput.value = '';
        const currentCr = sessionStorage.getItem('current_salon_cr');
        let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
        if (allSalons[currentCr]) {
            renderSalonCalendar(allSalons[currentCr].name, allSalons[currentCr].services, '');
        }
    });
}

// نظام علاقات العملاء الذكي (VIP CRM المطور مع دعم القنوات وحجم الخصم)
function renderVipCrmDashboard(salonName, salonServices) {
    const crmListContainer = document.getElementById('vip-crm-list');
    if (!crmListContainer) return;
    
    crmListContainer.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const myBookings = savedBookings.filter(b => b.salon === salonName || b.salonId === salonName);

    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
    const currentCr = sessionStorage.getItem('current_salon_cr');
    let salonData = allSalons[currentCr] || {};
    if (!salonData.manualVipClients) salonData.manualVipClients = [];

    let clientsMap = {};
    myBookings.forEach(booking => {
        const clientName = booking.clientName || "عميل زائر";
        const matchedService = salonServices.find(s => s.name === booking.service);
        const price = matchedService ? (parseFloat(matchedService.price) || 0) : 10;

        if (!clientsMap[clientName]) {
            clientsMap[clientName] = { visits: 0, totalSpent: 0, lastBooking: booking.date };
        }
        clientsMap[clientName].visits += 1;
        clientsMap[clientName].totalSpent += price;
    });

    salonData.manualVipClients.forEach(clientName => {
        if (!clientsMap[clientName]) {
            clientsMap[clientName] = { visits: 0, totalSpent: 0, lastBooking: 'يدوي' };
        }
    });

    let clientsArray = Object.keys(clientsMap).map(name => ({ 
        name, 
        ...clientsMap[name],
        isManualVip: salonData.manualVipClients.includes(name)
    }));

    clientsArray.sort((a, b) => b.totalSpent - a.totalSpent);

    if (clientsArray.length === 0) {
        crmListContainer.innerHTML = '<li style="color: #666;">قائمة الزبائن فارغة حالياً. أضف عملاء جدد وسيتم حفظهم هنا بشكل دائم.</li>';
        return;
    }

    clientsArray.forEach(client => {
        const isVip = client.isManualVip || client.totalSpent >= 20 || client.visits >= 2;
        const li = document.createElement('li');
        li.style.cssText = `background: ${isVip ? '#fff8e1' : '#f9f9f9'}; padding: 12px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-right: 4px solid ${isVip ? '#ffa000' : '#7c4dff'}; flex-wrap: wrap; gap: 10px;`;
        
        let servicesOptionsHtml = salonServices.map(s => `<option value="${s.name}">${s.name} (${s.price})</option>`).join('');

        li.innerHTML = `
            <div style="flex: 1; min-width: 170px;">
                <strong>${client.name}</strong> ${isVip ? '<span style="background: #ffa000; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-right: 5px;">VIP مميز ⭐</span>' : ''}
                <div style="font-size: 0.85rem; color: #666; margin-top: 3px;">الزيارات: ${client.visits} | الإنفاق: ${client.totalSpent} BHD</div>
            </div>
            
            <div style="display: flex; gap: 5px; align-items: center; flex-wrap: wrap;">
                <button onclick="toggleVipStatus('${client.name}')" style="background: ${client.isManualVip ? '#d32f2f' : '#2e7d32'}; color: white; border: none; padding: 5px 7px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                    ${client.isManualVip ? 'إلغاء VIP' : 'تعيين VIP ⭐'}
                </button>

                <select id="service-select-${client.name.replace(/\s+/g, '')}" style="padding: 4px; font-size: 0.75rem; border-radius: 4px; border: 1px solid #ccc;">
                    ${servicesOptionsHtml || '<option>لا توجد خدمات</option>'}
                </select>

                <select id="discount-select-${client.name.replace(/\s+/g, '')}" style="padding: 4px; font-size: 0.75rem; border-radius: 4px; border: 1px solid #ccc;">
                    <option value="10%">خصم 10%</option>
                    <option value="20%" selected>خصم 20%</option>
                    <option value="30%">خصم 30%</option>
                    <option value="50%">خصم 50%</option>
                </select>

                <select id="channel-select-${client.name.replace(/\s+/g, '')}" style="padding: 4px; font-size: 0.75rem; border-radius: 4px; border: 1px solid #ccc;">
                    <option value="whatsapp">واتساب 📱</option>
                    <option value="email">إيميل 📧</option>
                </select>

                <button onclick="sendTargetedRetentionOffer('${client.name}')" style="background: #1565c0; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                    إرسال 🎁
                </button>
            </div>
        `;
        crmListContainer.appendChild(li);
    });
}

// دالة تبديل حالة VIP يدوياً وحفظها
window.toggleVipStatus = function(clientName) {
    const currentCr = sessionStorage.getItem('current_salon_cr');
    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
    if (allSalons[currentCr]) {
        if (!allSalons[currentCr].manualVipClients) {
            allSalons[currentCr].manualVipClients = [];
        }
        let index = allSalons[currentCr].manualVipClients.indexOf(clientName);
        if (index > -1) {
            allSalons[currentCr].manualVipClients.splice(index, 1);
            alert(`تم إزالة العميل ${clientName} من قائمة VIP.`);
        } else {
            allSalons[currentCr].manualVipClients.push(clientName);
            alert(`تم ترقية العميل ${clientName} إلى قائمة VIP بنجاح! ⭐`);
        }
        localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));
        loadSalonManagementData(currentCr);
    }
};

// إرسال عرض مخصص فردي مع اختيار القناة والخصم
window.sendTargetedRetentionOffer = function(clientName) {
    const sanitizedId = clientName.replace(/\s+/g, '');
    const serviceSelect = document.getElementById(`service-select-${sanitizedId}`);
    const discountSelect = document.getElementById(`discount-select-${sanitizedId}`);
    const channelSelect = document.getElementById(`channel-select-${sanitizedId}`);
    
    if (!serviceSelect || !discountSelect || !channelSelect) return;

    const chosenService = serviceSelect.value;
    const chosenDiscount = discountSelect.value;
    const chosenChannel = channelSelect.value === 'whatsapp' ? 'تطبيق واتساب (WhatsApp 📱)' : 'البريد الإلكتروني (Email 📧)';

    alert(`🎉 تم إرسال عرض الاسترجاع للعميل (${clientName}) بنجاح!\n\n• القناة: ${chosenChannel}\n• الخصم: ${chosenDiscount}\n• الخدمة: ${chosenService}`);
};

// نموذج إضافة عميل جديد لقائمة الزبائن
if (addManualClientForm) {
    addManualClientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const clientName = manualClientNameInput.value.trim();
        const currentCr = sessionStorage.getItem('current_salon_cr');
        let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
        
        if (allSalons[currentCr]) {
            if (!allSalons[currentCr].manualVipClients) allSalons[currentCr].manualVipClients = [];
            if (!allSalons[currentCr].manualVipClients.includes(clientName)) {
                allSalons[currentCr].manualVipClients.push(clientName);
                localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));
                alert(`تم حفظ العميل ${clientName} في قائمة زبائن الصالون وتصنيفه كـ VIP بنجاح!`);
                manualClientNameInput.value = '';
                loadSalonManagementData(currentCr);
            } else {
                alert('هذا العميل مسجل مسبقاً في القائمة.');
            }
        }
    });
}

// إرسال حملة جماعية لكل الزبائن دفعة واحدة عبر القناة المختارة
if (broadcastCampaignForm) {
    broadcastCampaignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const occasion = broadcastOccasionInput.value.trim();
        const service = broadcastServiceSelect.value;
        const discount = broadcastDiscountSelect.value;
        const channel = broadcastChannelSelect.value === 'whatsapp' ? 'واتساب 📱' : 'البريد الإلكتروني 📧';

        const currentCr = sessionStorage.getItem('current_salon_cr');
        let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
        const salonName = allSalons[currentCr] ? allSalons[currentCr].name : "الصالون";

        const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
        let myBookings = savedBookings.filter(b => b.salon === salonName || b.salonId === salonName);
        let manualClients = allSalons[currentCr] ? (allSalons[currentCr].manualVipClients || []) : [];

        // تجميع كل أسماء الزبائن الفريدة
        let uniqueClients = new Set();
        myBookings.forEach(b => { if (b.clientName) uniqueClients.add(b.clientName); });
        manualClients.forEach(c => uniqueClients.add(c));

        const totalRecipients = uniqueClients.size;

        if (totalRecipients === 0) {
            alert('لا توجد أي عملاء أو زبائن مسجلين حالياً لإرسال الحملة لهم.');
            return;
        }

        alert(`🚀 نجاح الحملة التسويقية الجماعية!\n\n• المناسبة: ${occasion}\n• القناة: ${channel}\n• الخصم: ${discount}\n• الخدمة: ${service}\n• عدد المستلمين: (${totalRecipients}) عميل مسجل دفعة واحدة.`);
        broadcastOccasionInput.value = '';
    });
}

// حفظ الهوية التجارية
brandSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cr = sessionStorage.getItem('current_salon_cr');
    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};

    if (allSalons[cr]) {
        allSalons[cr].logo = salonLogoInput.value;
        allSalons[cr].phone = salonPhoneInput.value;
        localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));

        brandSuccess.textContent = 'تم حفظ الهوية التجارية والبيانات بنجاح ✨';
        brandSuccess.style.display = 'block';
        setTimeout(() => { brandSuccess.style.display = 'none'; }, 3000);
    }
});

// إدارة الخدمات
function renderSalonServices(cr, services) {
    salonServicesList.innerHTML = '';
    services.forEach((srv, index) => {
        const li = document.createElement('li');
        li.style.cssText = "background: #f1f1f1; padding: 8px 12px; margin-bottom: 5px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;";
        li.innerHTML = `<span>${srv.name} - <strong>${srv.price}</strong></span>`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'حذف';
        deleteBtn.style.cssText = "background: #ff5252; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;";
        deleteBtn.addEventListener('click', () => {
            services.splice(index, 1);
            let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
            allSalons[cr].services = services;
            localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));
            renderSalonServices(cr, services);
            populateBroadcastServices(services);
        });

        li.appendChild(deleteBtn);
        salonServicesList.appendChild(li);
    });
}

addServiceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cr = sessionStorage.getItem('current_salon_cr');
    const name = newServiceNameInput.value.trim();
    const price = newServicePriceInput.value.trim();

    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
    if (!allSalons[cr].services) allSalons[cr].services = [];

    allSalons[cr].services.push({ name, price });
    localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));

    renderSalonServices(cr, allSalons[cr].services);
    populateBroadcastServices(allSalons[cr].services);
    newServiceNameInput.value = '';
    newServicePriceInput.value = '';
});

// إدارة طاقم العمل
function renderStaffList(cr, staffMembers) {
    staffList.innerHTML = '';
    staffMembers.forEach((staff, index) => {
        const li = document.createElement('li');
        li.style.cssText = "background: #f9f9f9; padding: 10px; margin-bottom: 6px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-right: 4px solid #7c4dff;";
        li.innerHTML = `<span><strong>${staff.name}</strong> - <span style="color:#666;">${staff.role}</span></span>`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'حذف';
        deleteBtn.style.cssText = "background: #ff5252; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;";
        deleteBtn.addEventListener('click', () => {
            staffMembers.splice(index, 1);
            let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
            allSalons[cr].staff = staffMembers;
            localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));
            renderStaffList(cr, staffMembers);
        });

        li.appendChild(deleteBtn);
        staffList.appendChild(li);
    });
}

addStaffForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cr = sessionStorage.getItem('current_salon_cr');
    const name = staffNameInput.value.trim();
    const role = staffRoleInput.value.trim();

    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
    if (!allSalons[cr].staff) allSalons[cr].staff = [];

    allSalons[cr].staff.push({ name, role });
    localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));

    renderStaffList(cr, allSalons[cr].staff);
    staffNameInput.value = '';
    staffRoleInput.value = '';
});

// الحجوزات والإيرادات
function loadTenantBookingsAndAnalytics(salonName, salonServices) {
    tenantBookingsList.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const myBookings = savedBookings.filter(b => b.salon === salonName || b.salonId === salonName);

    statTotalBookings.textContent = myBookings.length;

    let totalRevenue = 0;
    myBookings.forEach(booking => {
        const matchedService = salonServices.find(s => s.name === booking.service);
        if (matchedService) {
            const priceValue = parseFloat(matchedService.price) || 0;
            totalRevenue += priceValue;
        }
    });
    statCurrentRevenue.textContent = totalRevenue + " BHD";

    if (myBookings.length === 0) {
        tenantBookingsList.innerHTML = '<li style="color: #666;">لا توجد حجوزات واردة لصالونك حتى الآن.</li>';
        return;
    }

    myBookings.forEach((booking) => {
        const li = document.createElement('li');
        li.style.cssText = "background: #f9f9f9; margin-bottom: 8px; padding: 10px; border-radius: 6px; border-right: 4px solid #7c4dff;";
        li.innerHTML = `العميل: <strong>${booking.clientName || 'زائر'}</strong> | الخدمة: <strong>${booking.service}</strong> | الموعد: ${booking.date}`;
        tenantBookingsList.appendChild(li);
    });
}

// تشغيل الفحص عند التحميل
checkAuthSession();