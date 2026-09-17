export interface CatalogService {
  ar: string;
  en: string;
  category: string;
}

export interface CatalogCategory {
  key: string;
  labelAr: string;
  labelEn: string;
  icon: string;
}

export const SERVICE_CATEGORIES: CatalogCategory[] = [
  { key: 'hair', labelAr: 'الشعر', labelEn: 'Hair', icon: '💇‍♀️' },
  { key: 'skincare', labelAr: 'العناية بالبشرة', labelEn: 'Skincare', icon: '✨' },
  { key: 'nails', labelAr: 'الأظافر', labelEn: 'Nails', icon: '💅' },
  { key: 'makeup', labelAr: 'المكياج', labelEn: 'Makeup', icon: '💄' },
  { key: 'hair_removal', labelAr: 'إزالة الشعر', labelEn: 'Hair Removal', icon: '🪒' },
  { key: 'spa', labelAr: 'سبا وجسم', labelEn: 'Spa & Body', icon: '🧖‍♀️' },
  { key: 'brows_lashes', labelAr: 'الحواجب والرموش', labelEn: 'Brows & Lashes', icon: '👁️' },
  { key: 'barber', labelAr: 'الحلاقة الرجالية', labelEn: "Men's Grooming", icon: '🧔' },
  { key: 'bridal', labelAr: 'العروس والمناسبات', labelEn: 'Bridal & Events', icon: '👰' },
];

export const SERVICE_CATALOG: CatalogService[] = [
  // الشعر
  { ar: 'قص شعر رجالي', en: "Men's Haircut", category: 'hair' },
  { ar: 'قص شعر نسائي', en: "Women's Haircut", category: 'hair' },
  { ar: 'قص شعر أطفال', en: "Kids' Haircut", category: 'hair' },
  { ar: 'تصفيف وسشوار', en: 'Blow-dry & Styling', category: 'hair' },
  { ar: 'صبغة كاملة', en: 'Full Hair Color', category: 'hair' },
  { ar: 'هايلايت', en: 'Highlights', category: 'hair' },
  { ar: 'بالياج / أومبريه', en: 'Balayage / Ombre', category: 'hair' },
  { ar: 'بروتين / كيراتين', en: 'Keratin / Protein Treatment', category: 'hair' },
  { ar: 'وصلات شعر', en: 'Hair Extensions', category: 'hair' },
  { ar: 'علاج فروة الرأس', en: 'Scalp Treatment', category: 'hair' },
  { ar: 'فرد أو تجعيد دائم', en: 'Perm / Relaxing', category: 'hair' },
  // العناية بالبشرة
  { ar: 'تنظيف بشرة عادي', en: 'Classic Facial', category: 'skincare' },
  { ar: 'تنظيف بشرة عميق', en: 'Deep Cleansing Facial', category: 'skincare' },
  { ar: 'هايدرافيشل', en: 'Hydrafacial', category: 'skincare' },
  { ar: 'تقشير كيميائي', en: 'Chemical Peel', category: 'skincare' },
  { ar: 'ديرمابريجن', en: 'Microdermabrasion', category: 'skincare' },
  { ar: 'عناية مضادة للتقدم بالسن', en: 'Anti-aging Facial', category: 'skincare' },
  // الأظافر
  { ar: 'مانيكير عادي', en: 'Classic Manicure', category: 'nails' },
  { ar: 'مانيكير جل / شيلاك', en: 'Gel / Shellac Manicure', category: 'nails' },
  { ar: 'باديكير', en: 'Pedicure', category: 'nails' },
  { ar: 'تركيب أظافر أكريليك', en: 'Acrylic Nail Extensions', category: 'nails' },
  { ar: 'تركيب أظافر جل', en: 'Gel Nail Extensions', category: 'nails' },
  { ar: 'نيل آرت', en: 'Nail Art', category: 'nails' },
  // المكياج
  { ar: 'مكياج يومي', en: 'Day Makeup', category: 'makeup' },
  { ar: 'مكياج سهرة', en: 'Evening Makeup', category: 'makeup' },
  { ar: 'مكياج عروس', en: 'Bridal Makeup', category: 'makeup' },
  { ar: 'مكياج تصوير', en: 'Photoshoot Makeup', category: 'makeup' },
  // إزالة الشعر
  { ar: 'وكس جزئي', en: 'Partial Waxing', category: 'hair_removal' },
  { ar: 'وكس كامل الجسم', en: 'Full Body Waxing', category: 'hair_removal' },
  { ar: 'خيط', en: 'Threading', category: 'hair_removal' },
  { ar: 'سكر (حلاوة)', en: 'Sugaring', category: 'hair_removal' },
  { ar: 'ليزر إزالة الشعر', en: 'Laser Hair Removal', category: 'hair_removal' },
  // سبا وجسم
  { ar: 'مساج استرخاء', en: 'Relaxation Massage', category: 'spa' },
  { ar: 'مساج علاجي (عميق)', en: 'Deep Tissue Massage', category: 'spa' },
  { ar: 'مساج بالأحجار الساخنة', en: 'Hot Stone Massage', category: 'spa' },
  { ar: 'تقشير جسم', en: 'Body Scrub', category: 'spa' },
  { ar: 'لف الجسم', en: 'Body Wrap', category: 'spa' },
  { ar: 'جاكوزي / بخار', en: 'Jacuzzi / Steam', category: 'spa' },
  // الحواجب والرموش
  { ar: 'تصميم حواجب بالخيط', en: 'Eyebrow Threading', category: 'brows_lashes' },
  { ar: 'تصميم حواجب بالوكس', en: 'Eyebrow Waxing', category: 'brows_lashes' },
  { ar: 'تركيب رموش', en: 'Lash Extensions', category: 'brows_lashes' },
  { ar: 'لفت رموش (لاش ليفت)', en: 'Lash Lift', category: 'brows_lashes' },
  { ar: 'تصفيف حواجب (تثبيت)', en: 'Brow Lamination', category: 'brows_lashes' },
  { ar: 'مايكروبليدنج', en: 'Microblading', category: 'brows_lashes' },
  // الحلاقة الرجالية
  { ar: 'قص وتحديد لحية', en: 'Beard Trim & Shape', category: 'barber' },
  { ar: 'حلاقة بموس ساخن', en: 'Hot Towel Shave', category: 'barber' },
  { ar: 'صبغة رجالي', en: "Men's Hair Color", category: 'barber' },
  // العروس والمناسبات
  { ar: 'باقة عروس كاملة', en: 'Full Bridal Package', category: 'bridal' },
  { ar: 'حنّاء', en: 'Henna', category: 'bridal' },
  { ar: 'تجهيز مناسبات', en: 'Event Styling', category: 'bridal' },
];
