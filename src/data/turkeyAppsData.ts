export interface TurkeyApp {
  id: string;
  name: string;
  nameTr: string;
  category: 'government' | 'transport' | 'banking' | 'services' | 'education';
  description: string;
  icon: string;
  downloadUrl: {
    android?: string;
    ios?: string;
  };
  isEssential: boolean;
}

export const turkeyApps: TurkeyApp[] = [
  // Government Apps
  {
    id: 'edevlet',
    name: 'الحكومة الإلكترونية',
    nameTr: 'e-Devlet',
    category: 'government',
    description: 'البوابة الرسمية للخدمات الحكومية - إلزامي لكل مقيم في تركيا',
    icon: '🏛️',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=tr.gov.turkiye.edevlet.kapisi',
      ios: 'https://apps.apple.com/app/e-devlet-kap%C4%B1s%C4%B1/id1105530574',
    },
    isEssential: true,
  },
  {
    id: 'enabiz',
    name: 'ملفي الصحي',
    nameTr: 'e-Nabız',
    category: 'government',
    description: 'السجل الصحي الإلكتروني - مواعيد المستشفيات والتقارير الطبية',
    icon: '🏥',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=tr.gov.saglik.enabiz',
      ios: 'https://apps.apple.com/app/e-nab%C4%B1z/id1016925530',
    },
    isEssential: true,
  },
  {
    id: 'ptt',
    name: 'البريد التركي',
    nameTr: 'PTT',
    category: 'government',
    description: 'خدمات البريد وتتبع الشحنات والتحويلات المالية',
    icon: '📮',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.ptt.android',
      ios: 'https://apps.apple.com/app/ptt/id1001098430',
    },
    isEssential: false,
  },
  // Transport Apps
  {
    id: 'moovit',
    name: 'موفيت',
    nameTr: 'Moovit',
    category: 'transport',
    description: 'أفضل تطبيق للمواصلات العامة - الباصات والمترو والترامواي',
    icon: '🚌',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.tranzmate',
      ios: 'https://apps.apple.com/app/moovit/id498477945',
    },
    isEssential: true,
  },
  {
    id: 'istanbulkart',
    name: 'إسطنبول كارت',
    nameTr: 'İstanbulkart',
    category: 'transport',
    description: 'شحن وإدارة بطاقة المواصلات في إسطنبول',
    icon: '💳',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.belbim.istanbulkart',
      ios: 'https://apps.apple.com/app/istanbulkart/id1148498529',
    },
    isEssential: true,
  },
  {
    id: 'havaist',
    name: 'حافلات المطار',
    nameTr: 'Havaist',
    category: 'transport',
    description: 'حافلات المطار الرسمية - من وإلى مطار إسطنبول',
    icon: '✈️',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=iett.havaist',
      ios: 'https://apps.apple.com/app/havaist/id1460661215',
    },
    isEssential: false,
  },
  {
    id: 'bitaksi',
    name: 'بي تاكسي',
    nameTr: 'BiTaksi',
    category: 'transport',
    description: 'طلب تاكسي بسعر محدد مسبقاً',
    icon: '🚕',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.bitaksi',
      ios: 'https://apps.apple.com/app/bitaksi/id597421807',
    },
    isEssential: false,
  },
  // Banking Apps
  {
    id: 'ziraat',
    name: 'زراعات بنك',
    nameTr: 'Ziraat Mobil',
    category: 'banking',
    description: 'البنك الحكومي الأكبر - سهل فتح الحساب للطلاب',
    icon: '🏦',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.ziraat.ziraatmobil',
      ios: 'https://apps.apple.com/app/ziraat-mobil/id1004656975',
    },
    isEssential: true,
  },
  {
    id: 'vakif',
    name: 'وقف بنك',
    nameTr: 'VakıfBank',
    category: 'banking',
    description: 'بنك موثوق مع خدمات مميزة للطلاب',
    icon: '💰',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.vakifbank.mobile',
      ios: 'https://apps.apple.com/app/vak%C4%B1fbank-mobil-bankac%C4%B1l%C4%B1k/id951610465',
    },
    isEssential: false,
  },
  {
    id: 'papara',
    name: 'بابارا',
    nameTr: 'Papara',
    category: 'banking',
    description: 'محفظة إلكترونية سهلة - بدون حاجة لحساب بنكي',
    icon: '💜',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.papara.app',
      ios: 'https://apps.apple.com/app/papara/id1155195636',
    },
    isEssential: true,
  },
  // Services
  {
    id: 'yemeksepeti',
    name: 'يميك سبتي',
    nameTr: 'Yemeksepeti',
    category: 'services',
    description: 'طلب الطعام من المطاعم - أكبر تطبيق توصيل',
    icon: '🍔',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.isinolsun.app',
      ios: 'https://apps.apple.com/app/yemeksepeti/id482638695',
    },
    isEssential: false,
  },
  {
    id: 'getir',
    name: 'قتير',
    nameTr: 'Getir',
    category: 'services',
    description: 'توصيل سريع للبقالة والمستلزمات - 10 دقائق',
    icon: '💜',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.getir',
      ios: 'https://apps.apple.com/app/getir/id995280265',
    },
    isEssential: false,
  },
  {
    id: 'n11',
    name: 'ن11',
    nameTr: 'n11',
    category: 'services',
    description: 'تسوق إلكتروني - منتجات متنوعة بأسعار جيدة',
    icon: '🛒',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.n11.android',
      ios: 'https://apps.apple.com/app/n11-com/id655498126',
    },
    isEssential: false,
  },
  // Education
  {
    id: 'obs',
    name: 'نظام الطالب',
    nameTr: 'OBS',
    category: 'education',
    description: 'نظام معلومات الطالب - الدرجات والجدول الدراسي',
    icon: '📖',
    downloadUrl: {},
    isEssential: true,
  },
  {
    id: 'yok',
    name: 'التعليم العالي',
    nameTr: 'YÖK',
    category: 'education',
    description: 'مجلس التعليم العالي - معادلة الشهادات والجامعات',
    icon: '🎓',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=tr.gov.yok.yokatlas',
    },
    isEssential: false,
  },
];

export const appCategories = [
  { id: 'government', label: 'حكومية', icon: '🏛️' },
  { id: 'transport', label: 'مواصلات', icon: '🚌' },
  { id: 'banking', label: 'بنوك', icon: '🏦' },
  { id: 'services', label: 'خدمات', icon: '🛒' },
  { id: 'education', label: 'تعليم', icon: '🎓' },
];
