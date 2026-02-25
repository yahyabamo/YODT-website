export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  points: number;
  rank: number;
  avatar?: string;
  joinDate: string;
  volunteerLevel: 'none' | 'volunteer' | 'active' | 'leader';
  completedCourses: string[];
  certificates: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  points: number;
  attendees: number;
  maxAttendees: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  isRegistered?: boolean;
}

export interface PointHistory {
  id: string;
  activity: string;
  points: number;
  date: string;
  type: 'earned' | 'bonus';
}

export interface Supporter {
  id: string;
  name: string;
  logo: string;
  type: 'platinum' | 'gold' | 'silver';
  website?: string;
  description?: string;
  discount?: string;
}
/*
export interface Course {
  id: string;
  title: string;
  description: string;
  path: 'english' | 'professional' | 'smart';
  lessons: number;
  duration: string;
  points: number;
  progress?: number;
  isCompleted?: boolean;
  hasCertificate?: boolean;
}
*/
export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  type: 'full-time' | 'part-time' | 'internship' | 'remote';
  requirements: {
    englishLevel?: string;
    turkishLevel?: string;
    skills?: string[];
    minPoints?: number;
    requiredCourses?: string[];
    volunteerOnly?: boolean;
  };
  isOpen: boolean;
  isEligible?: boolean;
}

export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

export const currentStudent: Student = {
  id: '1',
  name: 'أحمد محمد الحسني',
  email: 'ahmed@example.com',
  phone: '+90 555 123 4567',
  university: 'جامعة إسطنبول',
  major: 'هندسة البرمجيات',
  points: 450,
  rank: 3,
  joinDate: '2024-01-15',
  volunteerLevel: 'active',
  completedCourses: ['cv-writing', 'linkedin'],
  certificates: ['cv-writing', 'linkedin'],
};

export const activities: Activity[] = [
  {
    id: '1',
    title: 'ورشة تطوير المهارات القيادية',
    description: 'ورشة عمل تفاعلية لتطوير المهارات القيادية والتواصل الفعال',
    date: '2025-01-15',
    time: '14:00',
    location: 'قاعة المؤتمرات - الطابق الثالث',
    points: 50,
    attendees: 25,
    maxAttendees: 40,
    status: 'upcoming',
    isRegistered: true,
  },
  {
    id: '2',
    title: 'لقاء التعارف الشهري',
    description: 'لقاء شهري للتعارف بين الطلاب الجدد والقدامى',
    date: '2025-01-20',
    time: '18:00',
    location: 'مقر الاتحاد',
    points: 30,
    attendees: 40,
    maxAttendees: 50,
    status: 'upcoming',
    isRegistered: false,
  },
  {
    id: '3',
    title: 'دورة اللغة التركية',
    description: 'دورة مكثفة لتعلم أساسيات اللغة التركية',
    date: '2025-01-10',
    time: '10:00',
    location: 'المركز الثقافي',
    points: 100,
    attendees: 30,
    maxAttendees: 30,
    status: 'completed',
    isRegistered: true,
  },
  {
    id: '4',
    title: 'رحلة استكشافية لمعالم إسطنبول',
    description: 'جولة سياحية لزيارة أهم معالم مدينة إسطنبول التاريخية',
    date: '2025-01-25',
    time: '09:00',
    location: 'نقطة التجمع: ساحة تقسيم',
    points: 40,
    attendees: 15,
    maxAttendees: 25,
    status: 'upcoming',
    isRegistered: false,
  },
];

export const pointHistory: PointHistory[] = [
  { id: '1', activity: 'دورة اللغة التركية', points: 100, date: '2025-01-10', type: 'earned' },
  { id: '2', activity: 'لقاء التعارف', points: 30, date: '2024-12-20', type: 'earned' },
  { id: '3', activity: 'مكافأة الانضمام المبكر', points: 50, date: '2024-12-01', type: 'bonus' },
  { id: '4', activity: 'ورشة البرمجة', points: 80, date: '2024-11-15', type: 'earned' },
  { id: '5', activity: 'المسابقة الثقافية', points: 120, date: '2024-11-01', type: 'earned' },
  { id: '6', activity: 'ندوة التوظيف', points: 40, date: '2024-10-20', type: 'earned' },
  { id: '7', activity: 'مكافأة المشاركة الفعالة', points: 30, date: '2024-10-01', type: 'bonus' },
];

export const supporters: Supporter[] = [
  { id: '1', name: 'السفارة اليمنية', logo: '🏛️', type: 'platinum', description: 'شريك رسمي في دعم الطلاب اليمنيين', discount: '15%' },
  { id: '2', name: 'جمعية الطلاب العرب', logo: '🤝', type: 'platinum', description: 'دعم أكاديمي واجتماعي', discount: '20%' },
  { id: '3', name: 'مؤسسة التعليم الدولي', logo: '📚', type: 'gold', description: 'منح دراسية ودورات مجانية', discount: '10%' },
  { id: '4', name: 'بنك الشباب', logo: '🏦', type: 'gold', description: 'خدمات مصرفية مميزة للطلاب', discount: '5%' },
  { id: '5', name: 'شركة التقنية المتقدمة', logo: '💻', type: 'silver', description: 'فرص تدريب وتوظيف', discount: '25%' },
  { id: '6', name: 'مركز اللغات الدولي', logo: '🌍', type: 'silver', description: 'دورات لغوية بأسعار مخفضة', discount: '30%' },
];

export const topStudents: { name: string; points: number; rank: number }[] = [
  { name: 'سارة أحمد', points: 520, rank: 1 },
  { name: 'محمد علي', points: 480, rank: 2 },
  { name: 'أحمد محمد الحسني', points: 450, rank: 3 },
  { name: 'فاطمة حسن', points: 420, rank: 4 },
  { name: 'عمر خالد', points: 380, rank: 5 },
];

export const courses: Course[] = [
  {
    id: 'english-basics',
    title: 'أساسيات اللغة الإنجليزية',
    description: 'تعلم الأساسيات اللازمة للتواصل باللغة الإنجليزية',
    path: 'english',
    lessons: 12,
    duration: '6 ساعات',
    points: 100,
    progress: 75,
  },
  {
    id: 'cv-writing',
    title: 'كتابة السيرة الذاتية',
    description: 'احترف كتابة سيرة ذاتية احترافية تجذب أصحاب العمل',
    path: 'professional',
    lessons: 5,
    duration: '2 ساعة',
    points: 50,
    progress: 100,
    isCompleted: true,
    hasCertificate: true,
  },
  {
    id: 'linkedin',
    title: 'LinkedIn باحتراف',
    description: 'بناء حضور مهني قوي على منصة LinkedIn',
    path: 'professional',
    lessons: 6,
    duration: '3 ساعات',
    points: 60,
    progress: 100,
    isCompleted: true,
    hasCertificate: true,
  },
  {
    id: 'canva',
    title: 'Canva للتصميم',
    description: 'تعلم تصميم الجرافيك باستخدام Canva',
    path: 'smart',
    lessons: 8,
    duration: '4 ساعات',
    points: 70,
    progress: 30,
  },
  {
    id: 'presentation',
    title: 'مهارات العرض والتقديم',
    description: 'أسرار العرض التقديمي الناجح',
    path: 'professional',
    lessons: 7,
    duration: '3.5 ساعات',
    points: 65,
  },
  {
    id: 'time-management',
    title: 'إدارة الوقت',
    description: 'تقنيات فعالة لإدارة وقتك بذكاء',
    path: 'smart',
    lessons: 5,
    duration: '2.5 ساعات',
    points: 45,
  },
];

export const jobs: Job[] = [
  {
    id: '1',
    title: 'مطور واجهات أمامية',
    company: 'شركة التقنية المتقدمة',
    companyLogo: '💻',
    type: 'full-time',
    requirements: {
      englishLevel: 'متوسط',
      turkishLevel: 'مبتدئ',
      skills: ['React', 'TypeScript', 'CSS'],
      minPoints: 300,
    },
    isOpen: true,
    isEligible: true,
  },
  {
    id: '2',
    title: 'متدرب تسويق رقمي',
    company: 'مؤسسة التعليم الدولي',
    companyLogo: '📚',
    type: 'internship',
    requirements: {
      englishLevel: 'متقدم',
      requiredCourses: ['linkedin'],
    },
    isOpen: true,
    isEligible: true,
  },
  {
    id: '3',
    title: 'مساعد إداري',
    company: 'السفارة اليمنية',
    companyLogo: '🏛️',
    type: 'part-time',
    requirements: {
      turkishLevel: 'متوسط',
      volunteerOnly: true,
    },
    isOpen: true,
    isEligible: true,
  },
  {
    id: '4',
    title: 'مصمم جرافيك',
    company: 'جمعية الطلاب العرب',
    companyLogo: '🤝',
    type: 'remote',
    requirements: {
      skills: ['Canva', 'Photoshop'],
      requiredCourses: ['canva'],
    },
    isOpen: true,
    isEligible: false,
  },
];

export const guideSections: GuideSection[] = [
  {
    id: 'airport',
    title: 'من المطار إلى السكن',
    icon: '✈️',
    content: [
      'احجز سكنك قبل الوصول عبر مجموعات الطلاب',
      'استخدم تطبيق Havaist للتنقل من المطار',
      'احتفظ بعنوان سكنك باللغة التركية',
      'تأكد من وجود رصيد كافٍ للتاكسي إن لزم',
    ],
  },
  {
    id: 'transport',
    title: 'المواصلات',
    icon: '🚇',
    content: [
      'احصل على بطاقة İstanbulkart من المترو أو الأكشاك',
      'اشحن البطاقة من الآلات أو التطبيق',
      'استخدم تطبيق Moovit للتنقل',
      'بطاقة الطالب توفر 50% خصم على المواصلات',
    ],
  },
  {
    id: 'banking',
    title: 'الحسابات البنكية',
    icon: '🏦',
    content: [
      'افتح حسابًا في Ziraat أو Vakıf Bank بسهولة',
      'احضر جواز السفر وإقامة الطالب',
      'فعّل الخدمات الإلكترونية فورًا',
      'احتفظ بنسخة من بياناتك البنكية',
    ],
  },
  {
    id: 'warnings',
    title: 'تحذيرات مهمة',
    icon: '⚠️',
    content: [
      'لا تثق بأي شخص يطلب أموالًا عبر الإنترنت',
      'تأكد من تصريح العمل قبل أي وظيفة',
      'احذر من الإيجارات الوهمية',
      'سجل عنوانك في النفوس خلال 20 يومًا',
    ],
  },
];

export const faqItems = [
  {
    question: 'كيف أسجل في الاتحاد؟',
    answer: 'يمكنك التسجيل من خلال التطبيق أو زيارة مقر الاتحاد مع إحضار جواز السفر وورقة القبول الجامعي.',
  },
  {
    question: 'ما هي الفوائد من الانضمام للاتحاد؟',
    answer: 'ستحصل على دعم أكاديمي، أنشطة اجتماعية، خصومات من الشركاء، فرص توظيف، ودورات تدريبية مجانية.',
  },
  {
    question: 'كيف أحصل على النقاط؟',
    answer: 'تحصل على النقاط من خلال حضور الأنشطة، إتمام الدورات، التطوع، والمشاركة الفعالة في برامج الاتحاد.',
  },
  {
    question: 'هل العضوية مجانية؟',
    answer: 'نعم، العضوية الأساسية مجانية. كما توجد عضوية داعمة اختيارية بمزايا إضافية.',
  },
  {
    question: 'كيف أتواصل مع الاتحاد؟',
    answer: 'يمكنك التواصل عبر التطبيق، البريد الإلكتروني، أو زيارة مقر الاتحاد في أوقات العمل الرسمية.',
  },
];