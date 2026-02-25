export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  cities: string[];
}

export const countries: Country[] = [
  { 
    code: 'TR', 
    name: 'تركيا', 
    phoneCode: '+90',
    cities: ['إسطنبول', 'أنقرة', 'إزمير', 'بورصة', 'أنطاليا', 'غازي عنتاب', 'قونية', 'أضنة', 'طرابزون', 'سامسون', 'قيصري', 'إسكي شهير', 'ديار بكر', 'ملاطية', 'سيواس']
  },
  { 
    code: 'YE', 
    name: 'اليمن', 
    phoneCode: '+967',
    cities: ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'المكلا', 'حضرموت', 'مأرب', 'صعدة', 'لحج', 'البيضاء', 'شبوة']
  },
  { 
    code: 'SA', 
    name: 'السعودية', 
    phoneCode: '+966',
    cities: ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'الطائف', 'تبوك', 'بريدة', 'أبها', 'خميس مشيط', 'نجران', 'جازان']
  },
  { 
    code: 'AE', 
    name: 'الإمارات', 
    phoneCode: '+971',
    cities: ['أبوظبي', 'دبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'العين']
  },
  { 
    code: 'EG', 
    name: 'مصر', 
    phoneCode: '+20',
    cities: ['القاهرة', 'الإسكندرية', 'الجيزة', 'شرم الشيخ', 'الأقصر', 'أسوان', 'بورسعيد', 'المنصورة', 'طنطا', 'الزقازيق']
  },
  { 
    code: 'JO', 
    name: 'الأردن', 
    phoneCode: '+962',
    cities: ['عمان', 'إربد', 'الزرقاء', 'العقبة', 'السلط', 'المفرق', 'جرش', 'مادبا']
  },
  { 
    code: 'KW', 
    name: 'الكويت', 
    phoneCode: '+965',
    cities: ['الكويت', 'حولي', 'الفروانية', 'الأحمدي', 'الجهراء', 'مبارك الكبير']
  },
  { 
    code: 'QA', 
    name: 'قطر', 
    phoneCode: '+974',
    cities: ['الدوحة', 'الوكرة', 'الخور', 'الريان', 'أم صلال', 'الشمال']
  },
  { 
    code: 'OM', 
    name: 'عمان', 
    phoneCode: '+968',
    cities: ['مسقط', 'صلالة', 'صحار', 'نزوى', 'صور', 'عبري', 'البريمي']
  },
  { 
    code: 'BH', 
    name: 'البحرين', 
    phoneCode: '+973',
    cities: ['المنامة', 'المحرق', 'الرفاع', 'الحد', 'عيسى', 'سترة']
  },
  { 
    code: 'LB', 
    name: 'لبنان', 
    phoneCode: '+961',
    cities: ['بيروت', 'طرابلس', 'صيدا', 'صور', 'جونية', 'زحلة', 'بعلبك']
  },
  { 
    code: 'SY', 
    name: 'سوريا', 
    phoneCode: '+963',
    cities: ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'حماة', 'طرطوس', 'دير الزور', 'الرقة', 'إدلب']
  },
  { 
    code: 'IQ', 
    name: 'العراق', 
    phoneCode: '+964',
    cities: ['بغداد', 'البصرة', 'أربيل', 'الموصل', 'النجف', 'كربلاء', 'السليمانية', 'كركوك']
  },
  { 
    code: 'PS', 
    name: 'فلسطين', 
    phoneCode: '+970',
    cities: ['القدس', 'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'غزة', 'رفح', 'خان يونس']
  },
  { 
    code: 'MA', 
    name: 'المغرب', 
    phoneCode: '+212',
    cities: ['الرباط', 'الدار البيضاء', 'مراكش', 'فاس', 'طنجة', 'أغادير', 'مكناس', 'وجدة']
  },
  { 
    code: 'DZ', 
    name: 'الجزائر', 
    phoneCode: '+213',
    cities: ['الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'باتنة', 'بليدة', 'سطيف', 'سيدي بلعباس']
  },
  { 
    code: 'TN', 
    name: 'تونس', 
    phoneCode: '+216',
    cities: ['تونس', 'صفاقس', 'سوسة', 'القيروان', 'بنزرت', 'قابس', 'نابل']
  },
  { 
    code: 'LY', 
    name: 'ليبيا', 
    phoneCode: '+218',
    cities: ['طرابلس', 'بنغازي', 'مصراتة', 'البيضاء', 'الزاوية', 'زليتن', 'سبها']
  },
  { 
    code: 'SD', 
    name: 'السودان', 
    phoneCode: '+249',
    cities: ['الخرطوم', 'أم درمان', 'بورتسودان', 'كسلا', 'الأبيض', 'ود مدني', 'نيالا']
  },
  { 
    code: 'MY', 
    name: 'ماليزيا', 
    phoneCode: '+60',
    cities: ['كوالالمبور', 'جورج تاون', 'إيبوه', 'جوهور باهرو', 'ملاكا', 'كوتا كينابالو']
  },
  { 
    code: 'ID', 
    name: 'إندونيسيا', 
    phoneCode: '+62',
    cities: ['جاكرتا', 'سورابايا', 'باندونغ', 'ميدان', 'سيمارانغ', 'ماكاسار', 'بالي']
  },
  { 
    code: 'UK', 
    name: 'بريطانيا', 
    phoneCode: '+44',
    cities: ['لندن', 'مانشستر', 'برمنغهام', 'ليفربول', 'ليدز', 'إدنبرة', 'غلاسكو']
  },
  { 
    code: 'US', 
    name: 'أمريكا', 
    phoneCode: '+1',
    cities: ['نيويورك', 'لوس أنجلوس', 'شيكاغو', 'هيوستن', 'فينيكس', 'فيلادلفيا', 'سان أنطونيو']
  },
  { 
    code: 'DE', 
    name: 'ألمانيا', 
    phoneCode: '+49',
    cities: ['برلين', 'ميونخ', 'فرانكفورت', 'هامبورغ', 'كولونيا', 'دوسلدورف', 'شتوتغارت']
  },
  { 
    code: 'FR', 
    name: 'فرنسا', 
    phoneCode: '+33',
    cities: ['باريس', 'مارسيليا', 'ليون', 'تولوز', 'نيس', 'نانت', 'ستراسبورغ']
  },
  { 
    code: 'CA', 
    name: 'كندا', 
    phoneCode: '+1',
    cities: ['تورونتو', 'مونتريال', 'فانكوفر', 'كالجاري', 'أوتاوا', 'إدمونتون', 'وينيبيغ']
  },
  { 
    code: 'AU', 
    name: 'أستراليا', 
    phoneCode: '+61',
    cities: ['سيدني', 'ملبورن', 'بريزبن', 'بيرث', 'أديلايد', 'كانبرا', 'جولد كوست']
  }
];

export const userTypes = [
  { id: 'student', label: 'طالب', icon: '🎓', description: 'طالب جامعي أو خريج حديث' },
  { id: 'professional', label: 'كادر', icon: '💼', description: 'صحي / تعليمي / مهني' },
  { id: 'volunteer', label: 'متطوع', icon: '🤝', description: 'مهتم بالعمل التطوعي والمجتمعي' },
  { id: 'supporter', label: 'داعم', icon: '💎', description: 'داعم للمنظمة وأنشطتها' }
];

export const getTimezone = (country: string): string => {
  const timezones: Record<string, string> = {
    'TR': 'Europe/Istanbul',
    'YE': 'Asia/Aden',
    'SA': 'Asia/Riyadh',
    'AE': 'Asia/Dubai',
    'EG': 'Africa/Cairo',
    'JO': 'Asia/Amman',
    'KW': 'Asia/Kuwait',
    'QA': 'Asia/Qatar',
    'OM': 'Asia/Muscat',
    'BH': 'Asia/Bahrain',
    'LB': 'Asia/Beirut',
    'SY': 'Asia/Damascus',
    'IQ': 'Asia/Baghdad',
    'PS': 'Asia/Gaza',
    'MA': 'Africa/Casablanca',
    'DZ': 'Africa/Algiers',
    'TN': 'Africa/Tunis',
    'LY': 'Africa/Tripoli',
    'SD': 'Africa/Khartoum',
    'MY': 'Asia/Kuala_Lumpur',
    'ID': 'Asia/Jakarta',
    'UK': 'Europe/London',
    'US': 'America/New_York',
    'DE': 'Europe/Berlin',
    'FR': 'Europe/Paris',
    'CA': 'America/Toronto',
    'AU': 'Australia/Sydney'
  };
  return timezones[country] || 'UTC';
};
