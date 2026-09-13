const loginModal = document.getElementById('login-modal');
const dashboardContent = document.getElementById('dashboard-content');
const loginForm = document.getElementById('login-form');
const tenantPassInput = document.getElementById('tenant-pass');
const logoutBtn = document.getElementById('logout-btn');

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

// عناصر طاقم العمل والإحصائيات
const addStaffForm = document.getElementById('add-staff-form');
const staffNameInput = document.getElementById('staff-name');
const staffRoleInput = document.getElementById('staff-role');
const staffList = document.getElementById('staff-list');
const statCurrentRevenue = document.getElementById('stat-current-revenue');
const statTotalBookings = document.getElementById('stat-total-bookings');

const TENANT_SECRET_KEY = "salon123";
const CURRENT_SALON_ID = "الفرع الرئيسي - المنامة";

function checkAuthSession() {
    if (sessionStorage.getItem('is_salon_owner') === 'true') {
        loginModal.style.display = 'none';
        dashboardContent.style.display = 'block';
        loadSalonManagementData();
    } else {
        loginModal.style.display = 'flex';
        dashboardContent.style.display = 'none';
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (tenantPassInput.value === TENANT_SECRET_KEY) {
        sessionStorage.setItem('is_salon_owner', 'true');
        checkAuthSession();
    } else {
        alert('كلمة المرور غير صحيحة (جرب: salon123)');
    }
});

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('is_salon_owner');
    checkAuthSession();
});

function loadSalonManagementData() {
    let salonsData = JSON.parse(localStorage.getItem('salons_custom_data')) || {};
    if (!salonsData[CURRENT_SALON_ID]) {
        salonsData[CURRENT_SALON_ID] = {
            services: [
                { name: "قص شعر وتصفيف", price: "10 BHD" },
                { name: "تنظيف بشرة عميق", price: "25 BHD" }
            ],
            staff: [
                { name: "سارة أحمد", role: "أخصائية شعر وتجميل" },
                { name: "منى خالد", role: "خبيرة عناية بالبشرة" }
            ],
            logo: "",
            phone: "+973 17000000",
            cr: "123456-1"
        };
        localStorage.setItem('salons_custom_data', JSON.stringify(salonsData));
    }

    const currentSalon = salonsData[CURRENT_SALON_ID];
    salonLogoInput.value = currentSalon.logo || '';
    salonPhoneInput.value = currentSalon.phone || '';
    salonCrInput.value = currentSalon.cr || '';

    renderSalonServices(currentSalon.services);
    renderStaffList(currentSalon.staff || []);
    loadTenantBookingsAndAnalytics(currentSalon.services);
    renderVipCrmDashboard(currentSalon.services);
}

// حفظ بيانات الهوية التجارية والسجل
brandSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let salonsData = JSON.parse(localStorage.getItem('salons_custom_data')) || {};
    if (!salonsData[CURRENT_SALON_ID]) salonsData[CURRENT_SALON_ID] = { services: [] };

    salonsData[CURRENT_SALON_ID].logo = salonLogoInput.value;
    salonsData[CURRENT_SALON_ID].phone = salonPhoneInput.value;
    salonsData[CURRENT_SALON_ID].cr = salonCrInput.value;

    localStorage.setItem('salons_custom_data', JSON.stringify(salonsData));

    brandSuccess.textContent = 'تم حفظ الهوية التجارية والسجل التجاري بنجاح ✨';
    brandSuccess.style.display = 'block';
    setTimeout(() => { brandSuccess.style.display = 'none'; }, 3000);
});

// إدارة الخدمات
function renderSalonServices(services) {
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
            let salonsData = JSON.parse(localStorage.getItem('salons_custom_data')) || {};
            salonsData[CURRENT_SALON_ID].services = services;
            localStorage.setItem('salons_custom_data', JSON.stringify(salonsData));
            renderSalonServices(services);
        });

        li.appendChild(deleteBtn);
        salonServicesList.appendChild(li);
    });
}

addServiceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = newServiceNameInput.value;
    const price = newServicePriceInput.value;

    let salonsData = JSON.parse(localStorage.getItem('salons_custom_data')) || {};
    if (!salonsData[CURRENT_SALON_ID]) salonsData[CURRENT_SALON_ID] = { services: [] };

    salonsData[CURRENT_SALON_ID].services.push({ name, price });
    localStorage.setItem('salons_custom_data', JSON.stringify(salonsData));

    renderSalonServices(salonsData[CURRENT_SALON_ID].services);
    newServiceNameInput.value = '';
    newServicePriceInput.value = '';
});

// إدارة طاقم العمل
function renderStaffList(staffMembers) {
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
            let salonsData = JSON.parse(localStorage.getItem('salons_custom_data')) || {};
            salonsData[CURRENT_SALON_ID].staff = staffMembers;
            localStorage.setItem('salons_custom_data', JSON.stringify(salonsData));
            renderStaffList(staffMembers);
        });

        li.appendChild(deleteBtn);
        staffList.appendChild(li);
    });
}

addStaffForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = staffNameInput.value;
    const role = staffRoleInput.value;

    let salonsData = JSON.parse(localStorage.getItem('salons_custom_data')) || {};
    if (!salonsData[CURRENT_SALON_ID].staff) salonsData[CURRENT_SALON_ID].staff = [];

    salonsData[CURRENT_SALON_ID].staff.push({ name, role });
    localStorage.setItem('salons_custom_data', JSON.stringify(salonsData));

    renderStaffList(salonsData[CURRENT_SALON_ID].staff);
    staffNameInput.value = '';
    staffRoleInput.value = '';
});

// تحميل الحجوزات وحساب الإيرادات وتحليل الأرقام الشهرية
function loadTenantBookingsAndAnalytics(salonServices) {
    tenantBookingsList.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const myBookings = savedBookings.filter(b => b.salon === CURRENT_SALON_ID);

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
        tenantBookingsList.innerHTML = '<li style="color: #666;">لا توجد حجوزات واردة لهذا الفرع حتى الآن.</li>';
        return;
    }

    myBookings.forEach((booking) => {
        const li = document.createElement('li');
        li.style.cssText = "background: #f9f9f9; margin-bottom: 8px; padding: 10px; border-radius: 6px; border-right: 4px solid #7c4dff;";
        li.innerHTML = `العميل: <strong>${booking.clientName || 'زائر'}</strong> | الخدمة: <strong>${booking.service}</strong> | الموعد: ${booking.date}`;
        tenantBookingsList.appendChild(li);
    });
}

// نظام إدارة علاقات العملاء الذكي (VIP CRM)
function renderVipCrmDashboard(salonServices) {
    const crmListContainer = document.getElementById('vip-crm-list');
    if (!crmListContainer) return;
    
    crmListContainer.innerHTML = '';
    const savedBookings = JSON.parse(localStorage.getItem('salon_bookings')) || [];
    const myBookings = savedBookings.filter(b => b.salon === CURRENT_SALON_ID);

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
        if (new Date(booking.date) > new Date(clientsMap[clientName].lastBooking)) {
            clientsMap[clientName].lastBooking = booking.date;
        }
    });

    let clientsArray = Object.keys(clientsMap).map(name => {
        return { name, ...clientsMap[name] };
    });
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
            <button onclick="alert('تم إرسال عرض ترويجي خصم 20% عبر رسائل الواتساب للعميل: ${client.name}')" style="background: #1565c0; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">إرسال عرض استرجاع 🎁</button>
        `;
        crmListContainer.appendChild(li);
    });
}

checkAuthSession();