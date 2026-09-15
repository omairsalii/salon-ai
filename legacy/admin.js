// ==========================================================================
// SALON AI - THE ULTIMATE GLOBAL ENTERPRISE ADMIN CORE (God-Mode v4.0)
// ==========================================================================

const SystemStorage = {
    get: (key, fallback) => JSON.parse(localStorage.getItem(key)) || fallback,
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    remove: (key) => localStorage.removeItem(key)
};

// 1. تهيئة البنية التحتية الأساسية للنظام في حال الفراغ الأول
function initSystemDatabase() {
    if (!SystemStorage.get('salon_admin_team', null)) {
        SystemStorage.set('salon_admin_team', [
            { id: 1, username: "admin", pass: "123456", role: "superadmin", scope: "global" }
        ]);
    }

    if (!SystemStorage.get('salons_custom_data', null)) {
        SystemStorage.set('salons_custom_data', {
            "salon1": {
                name: "صالون الجمال الملكي",
                lat: 26.2285,
                lng: 50.5860,
                logo: "https://via.placeholder.com/150",
                details: "صالون نسائي متكامل للعناية بالشعر والتجميل والعرائس",
                status: "active",
                services: [
                    { id: 101, name: "قص شعر وتصفيف", price: "15 BHD", duration: "30 min", addedBy: "النظام" },
                    { id: 102, name: "مكياج سهرة", price: "30 BHD", duration: "60 min", addedBy: "النظام" }
                ]
            },
            "salon2": {
                name: "مركز الأناقة للرجال",
                lat: 26.2350,
                lng: 50.5900,
                logo: "https://via.placeholder.com/150",
                details: "حلاقة عصرية وعناية متكاملة بالرجل",
                status: "active",
                services: [
                    { id: 201, name: "حلاقة شعر وتدريج", price: "10 BHD", duration: "25 min", addedBy: "النظام" },
                    { id: 202, name: "تنظيف بشرة رجالي", price: "20 BHD", duration: "45 min", addedBy: "النظام" }
                ]
            }
        });
    }
}
initSystemDatabase();

// إدارة الجلسات والمصادقة
const loginForm = document.getElementById('admin-login-form');
const loginSection = document.getElementById('admin-login-section');
const dashboardSection = document.getElementById('admin-dashboard-section');
const loginErrorMsg = document.getElementById('login-error-msg');
const logoutBtn = document.getElementById('admin-logout-btn');
const welcomeAdminTitle = document.getElementById('welcome-admin-title');
const roleBadge = document.getElementById('role-badge');

function checkAdminSession() {
    const currentAdmin = SystemStorage.get('current_logged_admin', null);
    if (currentAdmin) {
        if(loginSection) loginSection.classList.add('hidden');
        if(dashboardSection) dashboardSection.classList.remove('hidden');
        
        if(welcomeAdminTitle) welcomeAdminTitle.textContent = `مرحباً بك، ${currentAdmin.username} (المدير العام 🚀)`;
        if(roleBadge) roleBadge.textContent = `الصلاحية: ${currentAdmin.role.toUpperCase()}`;

        renderEnterpriseDashboard();
    } else {
        if(loginSection) loginSection.classList.remove('hidden');
        if(dashboardSection) dashboardSection.classList.add('hidden');
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('admin-user').value.trim();
        const p = document.getElementById('admin-pass').value.trim();
        const team = SystemStorage.get('salon_admin_team', []);
        const found = team.find(m => m.username === u && m.pass === p);

        if (found) {
            SystemStorage.set('current_logged_admin', found);
            if(loginErrorMsg) loginErrorMsg.classList.add('hidden');
            loginForm.reset();
            checkAdminSession();
            logSystemEvent(`تسجيل دخول ناجح للمدير: ${u}`);
        } else {
            if(loginErrorMsg) loginErrorMsg.classList.remove('hidden');
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        logSystemEvent(`تسجيل خروج المدير`);
        SystemStorage.remove('current_logged_admin');
        checkAdminSession();
    });
}

// ==========================================================================
// واجهة التحكم المؤسسية الشاملة (Enterprise Dashboard UI Generator)
// ==========================================================================
function renderEnterpriseDashboard() {
    let container = document.getElementById('enterprise-master-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'enterprise-master-container';
        container.style.cssText = "margin-top: 25px; display: flex; flex-direction: column; gap: 25px;";
        dashboardSection.appendChild(container);
    }

    container.innerHTML = `
        <!-- لوحة التحكم في النسخ الاحتياطي والأمن السحابي -->
        <div style="background: #1e1e2f; color: #fff; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3 style="margin: 0 0 5px 0; color: #a29bfe;">🛡️ مركز التحكم السحابي والنسخ الاحتياطي</h3>
                <p style="margin: 0; font-size: 0.85rem; color: #b2bec3;">حماية بيانات المنصة الكاملة، تصديرها أو استرجاعها فورياً بضغطة زر.</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="window.exportSystemBackup()" style="background: #00b894; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">📥 تصدير نسخة احتياطية (JSON)</button>
                <label style="background: #0984e3; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.9rem;">
                    📤 استعادة نسخة<input type="file" id="import-file-input" onchange="window.importSystemBackup(event)" style="display: none;">
                </label>
            </div>
        </div>

        <!-- 1. قسم إدارة الصالونات الجغرافي والخدمات الشامل -->
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h3 style="color: #2d3436; margin-bottom: 15px; border-bottom: 2px solid #f1f2f6; padding-bottom: 8px;">🏢 الإدارة المتقدمة للصالونات، الإحداثيات، والخدمات</h3>
            
            <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center;">
                <select id="enterprise-salon-select" onchange="window.onEnterpriseSalonSelect(this.value)" style="flex: 1; padding: 10px; border: 1px solid #dfe6e9; border-radius: 6px; font-weight: bold; background: #fdfdfd;"></select>
                <button onclick="window.resetEnterpriseSalonForm()" style="background: #6c5ce7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">+ إضافة صالون جديد</button>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e1e1e1;">
                <h4 id="ent-form-title" style="margin-top: 0; color: #2d3436;">➕ إضافة صالون جديد للنظام</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                    <input type="text" id="ent-salon-key" placeholder="المعرف الفريد (مثال: salon3)" style="padding: 9px; border: 1px solid #ccc; border-radius: 4px;">
                    <input type="text" id="ent-salon-name" placeholder="اسم الصالون التجاري" style="padding: 9px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                    <input type="number" step="any" id="ent-salon-lat" placeholder="خط العرض Lat (مثال: 26.2285)" style="padding: 9px; border: 1px solid #ccc; border-radius: 4px;">
                    <input type="number" step="any" id="ent-salon-lng" placeholder="خط الطول Lng (مثال: 50.5860)" style="padding: 9px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 10px;">
                    <input type="text" id="ent-salon-logo" placeholder="رابط الشعار (Logo URL)" style="width: 100%; padding: 9px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <textarea id="ent-salon-details" placeholder="وصف وتفاصيل الصالون" style="width: 100%; padding: 9px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.saveEnterpriseSalon()" id="ent-save-salon-btn" style="background: #00b894; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; flex: 1;">حفظ بيانات الصالون وإحداثياته 💾</button>
                    <button onclick="window.deleteEnterpriseSalon()" id="ent-del-salon-btn" style="background: #d63031; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; display: none;">حذف الصالون نهائياً</button>
                </div>
            </div>

            <!-- إدارة خدمات الصالون المحدد -->
            <div id="ent-services-box" style="margin-top: 15px; padding: 15px; background: #fff; border: 1px dashed #6c5ce7; border-radius: 6px; display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #6c5ce7;">🛠️ جدول خدمات الصالون (إضافة، تعديل متقدم، حذف)</h4>
                    <button onclick="window.openAddServiceModal()" style="background: #0984e3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">+ إضافة خدمة للصالون</button>
                </div>
                <div id="ent-services-list"></div>
            </div>
        </div>

        <!-- 2. سجل التدقيق والمراجعة الشامل (Audit Logs) -->
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="color: #2d3436; margin: 0;">📝 سجل التدقيق المالي والأحداث اللحظية (Audit Logs)</h3>
                <button onclick="window.clearSystemLogs()" style="background: #b2bec3; color: #2d3436; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">مسح السجل</button>
            </div>
            <div id="ent-system-logs" style="max-height: 180px; overflow-y: auto; background: #fdfdfd; padding: 10px; border-radius: 6px; border: 1px solid #dfe6e9;"></div>
        </div>
    `;

    updateSalonDropdownOptions();
    renderSystemLogs();
}

// ==========================================================================
// منطق العمل والتحكم الوظيفي (Business Logic & Handlers)
// ==========================================================================

let activeSalonKey = null;

function updateSalonDropdownOptions() {
    const dropdown = document.getElementById('enterprise-salon-select');
    if (!dropdown) return;

    const salons = SystemStorage.get('salons_custom_data', {});
    const keys = Object.keys(salons);

    let html = '<option value="">-- اختر صالوناً للإدارة والتحكم الشامل --</option>';
    keys.forEach(k => {
        html += `<option value="${k}">${salons[k].name} (ID: ${k})</option>`;
    });
    dropdown.innerHTML = html;

    if (activeSalonKey && salons[activeSalonKey]) {
        dropdown.value = activeSalonKey;
    }
}

window.onEnterpriseSalonSelect = function(key) {
    activeSalonKey = key;
    const salons = SystemStorage.get('salons_custom_data', {});
    const salon = salons[key];

    const kInput = document.getElementById('ent-salon-key');
    const nInput = document.getElementById('ent-salon-name');
    const latInput = document.getElementById('ent-salon-lat');
    const lngInput = document.getElementById('ent-salon-lng');
    const logoInput = document.getElementById('ent-salon-logo');
    const detailsInput = document.getElementById('ent-salon-details');
    const saveBtn = document.getElementById('ent-save-salon-btn');
    const delBtn = document.getElementById('ent-del-salon-btn');
    const formTitle = document.getElementById('ent-form-title');
    const servicesBox = document.getElementById('ent-services-box');

    if (!salon) {
        window.resetEnterpriseSalonForm();
        return;
    }

    kInput.value = key;
    kInput.disabled = true; // منع تغيير المعرف حفاظاً على سلامة الـ Database
    nInput.value = salon.name;
    latInput.value = salon.lat;
    lngInput.value = salon.lng;
    logoInput.value = salon.logo || '';
    detailsInput.value = salon.details || '';

    formTitle.textContent = `✏️ تعديل صالون: ${salon.name}`;
    saveBtn.textContent = "💾 حفظ التحديثات والإحداثيات الجديدة";
    delBtn.style.display = "inline-block";
    servicesBox.style.display = "block";

    renderSalonServicesList(key);
};

window.resetEnterpriseSalonForm = function() {
    activeSalonKey = null;
    const dropdown = document.getElementById('enterprise-salon-select');
    if (dropdown) dropdown.value = "";

    document.getElementById('ent-salon-key').value = '';
    document.getElementById('ent-salon-key').disabled = false;
    document.getElementById('ent-salon-name').value = '';
    document.getElementById('ent-salon-lat').value = '';
    document.getElementById('ent-salon-lng').value = '';
    document.getElementById('ent-salon-logo').value = '';
    document.getElementById('ent-salon-details').value = '';

    document.getElementById('ent-form-title').textContent = "➕ إضافة صالون جديد للنظام";
    document.getElementById('ent-save-salon-btn').textContent = "حفظ بيانات الصالون وإحداثياته 💾";
    document.getElementById('ent-del-salon-btn').style.display = "none";
    document.getElementById('ent-services-box').style.display = "none";
};

window.saveEnterpriseSalon = function() {
    const key = document.getElementById('ent-salon-key').value.trim();
    const name = document.getElementById('ent-salon-name').value.trim();
    const lat = parseFloat(document.getElementById('ent-salon-lat').value);
    const lng = parseFloat(document.getElementById('ent-salon-lng').value);
    const logo = document.getElementById('ent-salon-logo').value.trim();
    const details = document.getElementById('ent-salon-details').value.trim();

    if (!key || !name || isNaN(lat) || isNaN(lng)) {
        alert('خطأ: يرجى إدخال المعرف، الاسم، وإحداثيات خطوط الطول والعرض بصيغة صحيحة.');
        return;
    }

    let salons = SystemStorage.get('salons_custom_data', {});
    let existingServices = salons[activeSalonKey]?.services || [
        { id: Date.now(), name: "خدمة أساسية افتراضية", price: "10 BHD", duration: "30 min", addedBy: "المدير العام" }
    ];

    salons[key] = {
        name,
        lat,
        lng,
        logo,
        details,
        status: "active",
        services: existingServices
    };

    SystemStorage.set('salons_custom_data', salons);
    logSystemEvent(activeSalonKey ? `تحديث بيانات وإحداثيات الصالون: [${name}]` : `إضافة صالون جديد: [${name}]`);

    updateSalonDropdownOptions();
    if (!activeSalonKey) {
        activeSalonKey = key;
        document.getElementById('enterprise-salon-select').value = key;
        window.onEnterpriseSalonSelect(key);
    }
    alert('تم حفظ البيانات بنجاح تام وجاهزة للعمل على الخريطة 🚀');
};

window.deleteEnterpriseSalon = function() {
    if (!activeSalonKey) return;
    if (confirm(`تحذير خطر: هل أنت متأكد من حذف هذا الصالون نهائياً من النظام؟`)) {
        let salons = SystemStorage.get('salons_custom_data', {});
        const salonName = salons[activeSalonKey]?.name || activeSalonKey;
        delete salons[activeSalonKey];
        SystemStorage.set('salons_custom_data', salons);

        logSystemEvent(`حذف الصالون نهائياً: [${salonName}]`);
        window.resetEnterpriseSalonForm();
        updateSalonDropdownOptions();
        alert('تم حذف الصالون بنجاح.');
    }
};

// إدارة الخدمات داخل الصالون المحدد
function renderSalonServicesList(salonKey) {
    const container = document.getElementById('ent-services-list');
    const salons = SystemStorage.get('salons_custom_data', {});
    const salon = salons[salonKey];

    if (!salon || !salon.services || salon.services.length === 0) {
        container.innerHTML = '<p style="color: #636e72; font-size: 0.85rem; margin: 0;">لا توجد خدمات مسجلة لهذا الصالون.</p>';
        return;
    }

    container.innerHTML = salon.services.map((s, idx) => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 8px 12px; margin-bottom: 6px; border: 1px solid #e1e1e1; border-radius: 4px; font-size: 0.9rem;">
            <span>✨ <strong>${s.name}</strong> — السعر: <strong>${s.price}</strong> — المدة: <strong>${s.duration || '30 دقيقة'}</strong></span>
            <div>
                <button onclick="window.editSalonService('${salonKey}', ${idx})" style="background: #0984e3; color: white; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 0.75rem; margin-left: 5px;">تعديل</button>
                <button onclick="window.removeSalonService('${salonKey}', ${idx})" style="background: #d63031; color: white; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">حذف</button>
            </div>
        </div>
    `).join('');
}

window.openAddServiceModal = function() {
    if (!activeSalonKey) return;
    const sName = prompt('أدخل اسم الخدمة الجديدة:');
    if (!sName) return;
    const sPrice = prompt('أدخل السعر (مثال: 15 BHD):');
    if (!sPrice) return;
    const sDuration = prompt('أدخل مدة الخدمة (مثال: 45 min):', '30 min');

    let salons = SystemStorage.get('salons_custom_data', {});
    if (salons[activeSalonKey]) {
        if (!salons[activeSalonKey].services) salons[activeSalonKey].services = [];
        salons[activeSalonKey].services.push({
            id: Date.now(),
            name: sName.trim(),
            price: sPrice.trim(),
            duration: sDuration ? sDuration.trim() : '30 min',
            addedBy: "المدير العام"
        });
        SystemStorage.set('salons_custom_data', salons);
        logSystemEvent(`إضافة خدمة [${sName.trim()}] للصالون [${activeSalonKey}]`);
        renderSalonServicesList(activeSalonKey);
        alert('تمت إضافة الخدمة بنجاح!');
    }
};

window.editSalonService = function(salonKey, index) {
    let salons = SystemStorage.get('salons_custom_data', {});
    const service = salons[salonKey]?.services[index];
    if (!service) return;

    const newName = prompt('تعديل اسم الخدمة:', service.name);
    if (newName === null) return;
    const newPrice = prompt('تعديل سعر الخدمة:', service.price);
    if (newPrice === null) return;
    const newDuration = prompt('تعديل مدة الخدمة:', service.duration || '30 min');
    if (newDuration === null) return;

    salons[salonKey].services[index] = {
        ...service,
        name: newName.trim() || service.name,
        price: newPrice.trim() || service.price,
        duration: newDuration.trim() || service.duration
    };

    SystemStorage.set('salons_custom_data', salons);
    logSystemEvent(`تعديل خدمة [${service.name} ➡️ ${newName.trim()}] في الصالون [${salonKey}]`);
    renderSalonServicesList(salonKey);
    alert('تم تحديث الخدمة بنجاح!');
};

window.removeSalonService = function(salonKey, index) {
    let salons = SystemStorage.get('salons_custom_data', {});
    const service = salons[salonKey]?.services[index];
    if (!service) return;

    if (confirm(`هل أنت متأكد من حذف خدمة [${service.name}]؟`)) {
        salons[salonKey].services.splice(index, 1);
        SystemStorage.set('salons_custom_data', salons);
        logSystemEvent(`حذف خدمة [${service.name}] من الصالون [${salonKey}]`);
        renderSalonServicesList(salonKey);
        alert('تم حذف الخدمة بنجاح.');
    }
};

// ==========================================================================
// نظام النسخ الاحتياطي وسجل التدقيق (Backup & Audit Subsystem)
// ==========================================================================
window.exportSystemBackup = function() {
    const backupData = {
        timestamp: new Date().toISOString(),
        team: SystemStorage.get('salon_admin_team', []),
        salons: SystemStorage.get('salons_custom_data', {}),
        clients: SystemStorage.get('salon_registered_clients', []),
        bookings: SystemStorage.get('salon_client_bookings', []),
        logs: SystemStorage.get('salon_system_logs', [])
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `salon_ai_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logSystemEvent("تصدير نسخة احتياطية كاملة لقاعدة بيانات المنصة (JSON)");
};

window.importSystemBackup = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.salons && imported.team) {
                if (confirm('تنبيه: استعادة هذه النسخة ستستبدل البيانات الحالية بالكامل. هل أنت متأكد؟')) {
                    SystemStorage.set('salon_admin_team', imported.team);
                    SystemStorage.set('salons_custom_data', imported.salons);
                    if (imported.clients) SystemStorage.set('salon_registered_clients', imported.clients);
                    if (imported.bookings) SystemStorage.set('salon_client_bookings', imported.bookings);
                    if (imported.logs) SystemStorage.set('salon_system_logs', imported.logs);
                    
                    logSystemEvent("استعادة ناجحة لقاعدة البيانات من ملف نسخ احتياطي");
                    alert('تم استعادة النظام والبيانات بنجاح تام! جاري تحديث اللوحة...');
                    location.reload();
                }
            } else {
                alert('خطأ: ملف النسخة الاحتياطية غير صالح أو تالف.');
            }
        } catch (err) {
            alert('خطأ في قراءة ملف JSON.');
        }
    };
    reader.readAsText(file);
};

function logSystemEvent(desc) {
    let logs = SystemStorage.get('salon_system_logs', []);
    logs.unshift({ desc, time: new Date().toLocaleString() });
    if (logs.length > 150) logs.pop();
    SystemStorage.set('salon_system_logs', logs);
    renderSystemLogs();
}

window.clearSystemLogs = function() {
    if (confirm('هل تريد مسح سجل الأحداث التدقيقي بالكامل؟')) {
        SystemStorage.remove('salon_system_logs');
        renderSystemLogs();
    }
};

function renderSystemLogs() {
    const container = document.getElementById('ent-system-logs');
    if (!container) return;
    let logs = SystemStorage.get('salon_system_logs', []);

    if (logs.length === 0) {
        container.innerHTML = '<p style="color: #636e72; font-size: 0.85rem; margin: 0;">لا توجد سجلات مسجلة حتى الآن.</p>';
        return;
    }

    container.innerHTML = logs.map(l => `
        <div style="font-size: 0.8rem; color: #2d3436; border-bottom: 1px solid #f1f2f6; padding: 4px 0;">
            🕒 <span style="color: #0984e3; font-weight: bold;">[${l.time}]</span>: ${l.desc}
        </div>
    `).join('');
}

// تشغيل فحص الجلسة عند التحميل
checkAdminSession();