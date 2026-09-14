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

// التبديل بين واجهة تسجيل الدخول والاشتراك
showTenantLoginBtn.addEventListener('click', () => {
    tenantLoginForm.style.display = 'block';
    tenantRegisterForm.style.display = 'none';
    showTenantLoginBtn.style.background = '#7c4dff';
    showTenantLoginBtn.style.color = 'white';
    showTenantRegisterBtn.style.background = '#e0e0e0';
    showTenantRegisterBtn.style.color = '#333';
    authModalTitle.textContent = 'بوابة أصحاب الصالونات 🏢';
    authModalDesc.textContent = 'قم بتسجيل الدخول للوحة التحكم الخاصة بصالونك.';
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

// فحص الجلسة والتحقق من حالة الاشتراك وفترة الـ 14 يوم
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

    // التحقق من صلاحية الفترة التجريبية (14 يوم) أو الاشتراك المدفوع
    const now = new Date();
    const trialEnds = new Date(salon.trialEndsAt);
    const isSubscriptionActive = salon.isPaidPlan || (now <= trialEnds);

    if (!isSubscriptionActive) {
        // انتهت الـ 14 يوم ولم يشترك بباقة مدفوعة -> إظهار نافذة اختيار الباقات الثلاث
        loginModal.style.display = 'flex';
        dashboardContent.style.display = 'none';
        showUpgradeModal(salon);
        return;
    }

    loginModal.style.display = 'none';
    dashboardContent.style.display = 'block';
    loadSalonManagementData(currentCr);
}

// نافذة اختيار الـ 3 باقات عند انتهاء التجربة المجانية
function showUpgradeModal(salon) {
    const modalBox = loginModal.querySelector('div');
    modalBox.style.maxWidth = "550px";
    modalBox.innerHTML = `
        <h2 style="color: #ff5252; margin-bottom: 5px;">انتهت فترتك التجريبية (14 يوماً) ⏳</h2>
        <p style="color: #666; font-size: 0.85rem; margin-bottom: 1rem;">اختر إحدى الباقات الثلاث أدناه لمتابعة العمل في لوحة تحكم صالون ${salon.name}:</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 1.2rem; text-align: right;">
            <!-- الباقة 1: الأساسية -->
            <div style="border: 2px solid #ccc; padding: 10px; border-radius: 8px; cursor: pointer;" onclick="upgradePlan('${salon.cr}', 'الباقة الأساسية', 19)">
                <strong style="color: #333;">1. الأساسية</strong><br>
                <span style="color: #7c4dff; font-weight: bold; font-size: 1.1rem;">19 BHD</span><small>/شهرياً</small>
                <hr style="margin: 5px 0; border:0; border-top:1px solid #eee;">
                <small style="color:#666; font-size: 0.75rem;">إدارة الخدمات وطاقم العمل الأساسي والحجوزات.</small>
            </div>
            
            <!-- الباقة 2: الاحترافية -->
            <div style="border: 2px solid #7c4dff; padding: 10px; border-radius: 8px; cursor: pointer; background: #f3e5f5;" onclick="upgradePlan('${salon.cr}', 'الباقة الاحترافية', 39)">
                <strong style="color: #7c4dff;">2. الاحترافية ⭐</strong><br>
                <span style="color: #7c4dff; font-weight: bold; font-size: 1.1rem;">39 BHD</span><small>/شهرياً</small>
                <hr style="margin: 5px 0; border:0; border-top:1px solid #d1c4e9;">
                <small style="color:#555; font-size: 0.75rem;">التحليلات المالية المتقدمة + نظام العملاء VIP.</small>
            </div>

            <!-- الباقة 3: المؤسسات -->
            <div style="border: 2px solid #2e7d32; padding: 10px; border-radius: 8px; cursor: pointer; background: #e8f5e9;" onclick="upgradePlan('${salon.cr}', 'باقة المؤسسات', 79)">
                <strong style="color: #2e7d32;">3. المؤسسات 🏢</strong><br>
                <span style="color: #2e7d32; font-weight: bold; font-size: 1.1rem;">79 BHD</span><small>/شهرياً</small>
                <hr style="margin: 5px 0; border:0; border-top:1px solid #c8e6c9;">
                <small style="color:#555; font-size: 0.75rem;">دعم متعدد الفروع، عروض واتساب ذكية، وأولوية دعم.</small>
            </div>
        </div>
        <button onclick="location.reload()" class="btn-secondary" style="background: #666; color: white; width: 100%; padding: 8px;">تسجيل الخروج</button>
    `;
}

// دالة تفعيل الباقة المدفوعة المختارة
window.upgradePlan = function(cr, planName, price) {
    let allSalons = JSON.parse(localStorage.getItem('all_registered_salons')) || {};
    if (allSalons[cr]) {
        allSalons[cr].isPaidPlan = true;
        allSalons[cr].currentPlan = planName;
        localStorage.setItem('all_registered_salons', JSON.stringify(allSalons));
        alert(`تم تفعيل اشتراكك بنجاح في ${planName} بقيمة ${price} BHD للشهر! شكراً لثقتك.`);
        location.reload();
    }
};

// تسجيل دخول الصالون
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
            logo: ""
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

// تسجيل صالون جديد وبدء الـ 14 يوم مجاناً
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
        staff: [{ name: "أخصائية الصالون", role: "خبير تجميل عام" }]
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

// نظام علاقات العملاء VIP CRM
function renderVipCrmDashboard(salonName, salonServices) {
    const crmListContainer = document.getElementById('vip-crm-list');
    if (!crmListContainer) return;
    
    crmListContainer.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const myBookings = savedBookings.filter(b => b.salon === salonName || b.salonId === salonName);

    if (myBookings.length === 0) {
        crmListContainer.innerHTML = '<li style="color: #666;">لا توجد بيانات عملاء كافية حتى الآن. سيظهر العملاء تلقائياً عند أول حجز.</li>';
        return;
    }

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

    let clientsArray = Object.keys(clientsMap).map(name => ({ name, ...clientsMap[name] }));
    clientsArray.sort((a, b) => b.totalSpent - a.totalSpent);

    clientsArray.forEach(client => {
        const isVip = client.totalSpent >= 20 || client.visits >= 2;
        const li = document.createElement('li');
        li.style.cssText = `background: ${isVip ? '#fff8e1' : '#f9f9f9'}; padding: 10px 12px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-right: 4px solid ${isVip ? '#ffa000' : '#7c4dff'};`;
        
        li.innerHTML = `
            <div>
                <strong>${client.name}</strong> ${isVip ? '<span style="background: #ffa000; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-right: 5px;">VIP عميل مميز</span>' : ''}
                <div style="font-size: 0.85rem; color: #666; margin-top: 3px;">الزيارات: ${client.visits} | إجمالي الإنفاق: ${client.totalSpent} BHD</div>
            </div>
            <button onclick="alert('تم إرسال عرض ترويجي خصم 20% للعميل: ${client.name}')" style="background: #1565c0; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">إرسال عرض استرجاع 🎁</button>
        `;
        crmListContainer.appendChild(li);
    });
}

// تشغيل الفحص عند التحميل
checkAuthSession();