/*
export interface Track {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  courses: UniversityCourse[];
}

export interface UniversityCourse {
  id: string;
  title: string;
  description: string;
  trackId: string;
  videoUrl?: string;
  contentText?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  duration: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  points: number;
}

export interface Lesson {
  id: string;
  title: string;
  videoUrl?: string;
  content?: string;
  duration: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const tracks: Track[] = [
  {
    id: 'academic',
    name: 'المسار الأكاديمي',
    icon: '🎓',
    description: 'دورات لدعم مسيرتك الأكاديمية والجامعية',
    color: 'bg-blue-500',
    courses: [
      {
        id: 'research-basics',
        title: 'أساسيات البحث العلمي',
        description: 'تعلم كيفية كتابة البحوث والأوراق العلمية بشكل احترافي',
        trackId: 'academic',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '3 ساعات',
        points: 50,
        lessons: [
          { id: 'l1', title: 'مقدمة في البحث العلمي', duration: '30 دقيقة' },
          { id: 'l2', title: 'اختيار موضوع البحث', duration: '25 دقيقة' },
          { id: 'l3', title: 'المصادر والمراجع', duration: '35 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما أول خطوة في البحث العلمي؟', options: ['جمع البيانات', 'تحديد المشكلة', 'كتابة النتائج', 'المراجعة'], correctAnswer: 1 },
          { id: 'q2', question: 'ما هي المصادر الأولية؟', options: ['الكتب', 'الموسوعات', 'البيانات الأصلية', 'المقالات'], correctAnswer: 2 },
          { id: 'q3', question: 'ما أهمية توثيق المراجع؟', options: ['شكلية فقط', 'حقوق ملكية فكرية', 'زيادة الصفحات', 'لا أهمية'], correctAnswer: 1 }
        ]
      },
      {
        id: 'academic-writing',
        title: 'الكتابة الأكاديمية',
        description: 'إتقان أساليب الكتابة الأكاديمية المعتمدة',
        trackId: 'academic',
        duration: '2.5 ساعة',
        points: 40,
        lessons: [
          { id: 'l1', title: 'أساسيات الكتابة الأكاديمية', duration: '30 دقيقة' },
          { id: 'l2', title: 'هيكل المقالة العلمية', duration: '25 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما الأسلوب المناسب للكتابة الأكاديمية؟', options: ['عامي', 'رسمي موضوعي', 'شعري', 'قصصي'], correctAnswer: 1 },
          { id: 'q2', question: 'ما هو الاقتباس؟', options: ['نسخ بدون مصدر', 'نقل نص مع توثيق', 'ترجمة', 'تلخيص'], correctAnswer: 1 }
        ]
      }
    ]
  },
  {
    id: 'skills',
    name: 'المسار المهاري',
    icon: '💡',
    description: 'مهارات عملية للحياة المهنية (Canva, LinkedIn, CV)',
    color: 'bg-green-500',
    courses: [
      {
        id: 'cv-professional',
        title: 'السيرة الذاتية الاحترافية',
        description: 'اكتب سيرة ذاتية تفتح لك أبواب الفرص',
        trackId: 'skills',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '2 ساعة',
        points: 40,
        lessons: [
          { id: 'l1', title: 'مكونات السيرة الذاتية', duration: '20 دقيقة' },
          { id: 'l2', title: 'تنسيق السيرة الذاتية', duration: '25 دقيقة' },
          { id: 'l3', title: 'أخطاء يجب تجنبها', duration: '15 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما الطول المناسب للسيرة الذاتية؟', options: ['5 صفحات', '1-2 صفحة', '10 صفحات', 'نصف صفحة'], correctAnswer: 1 },
          { id: 'q2', question: 'هل يجب وضع صورة شخصية؟', options: ['دائماً', 'حسب البلد والوظيفة', 'أبداً', 'فقط للنساء'], correctAnswer: 1 }
        ]
      },
      {
        id: 'linkedin-mastery',
        title: 'إتقان LinkedIn',
        description: 'ابنِ شبكة علاقات مهنية قوية',
        trackId: 'skills',
        duration: '2.5 ساعة',
        points: 45,
        lessons: [
          { id: 'l1', title: 'إنشاء ملف شخصي جذاب', duration: '30 دقيقة' },
          { id: 'l2', title: 'بناء شبكة العلاقات', duration: '25 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما أهم قسم في LinkedIn؟', options: ['الصورة', 'العنوان الرئيسي', 'المهارات', 'التوصيات'], correctAnswer: 1 },
          { id: 'q2', question: 'كم مرة يجب النشر؟', options: ['يومياً', 'مرة أسبوعياً', 'شهرياً', 'لا يهم'], correctAnswer: 1 }
        ]
      },
      {
        id: 'canva-design',
        title: 'التصميم بـ Canva',
        description: 'صمم بوسترات ومنشورات احترافية',
        trackId: 'skills',
        duration: '3 ساعات',
        points: 50,
        lessons: [
          { id: 'l1', title: 'واجهة Canva', duration: '20 دقيقة' },
          { id: 'l2', title: 'تصميم البوسترات', duration: '35 دقيقة' },
          { id: 'l3', title: 'تصميم منشورات السوشيال ميديا', duration: '30 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما هو Canva؟', options: ['لغة برمجة', 'أداة تصميم', 'نظام تشغيل', 'متصفح'], correctAnswer: 1 },
          { id: 'q2', question: 'هل Canva مجاني؟', options: ['لا', 'نعم بالكامل', 'نسخة مجانية ومدفوعة', 'فقط للطلاب'], correctAnswer: 2 }
        ]
      }
    ]
  },
  {
    id: 'values',
    name: 'المسار القيمي',
    icon: '🌟',
    description: 'آداب الحوار والانضباط والقيم السلوكية',
    color: 'bg-purple-500',
    courses: [
      {
        id: 'communication-ethics',
        title: 'آداب الحوار والتواصل',
        description: 'تعلم فن الحوار البناء والتواصل الفعال',
        trackId: 'values',
        duration: '2 ساعة',
        points: 35,
        lessons: [
          { id: 'l1', title: 'أساسيات الحوار', duration: '25 دقيقة' },
          { id: 'l2', title: 'الاستماع الفعال', duration: '20 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما أهم عنصر في الحوار الفعال؟', options: ['الصوت العالي', 'الاستماع', 'المقاطعة', 'السرعة'], correctAnswer: 1 },
          { id: 'q2', question: 'كيف تتعامل مع الخلاف؟', options: ['تجاهل', 'احترام الرأي الآخر', 'الانسحاب', 'الصراخ'], correctAnswer: 1 }
        ]
      },
      {
        id: 'time-discipline',
        title: 'الانضباط وإدارة الوقت',
        description: 'نظم وقتك وحياتك بفعالية',
        trackId: 'values',
        duration: '2.5 ساعة',
        points: 40,
        lessons: [
          { id: 'l1', title: 'أهمية الانضباط', duration: '20 دقيقة' },
          { id: 'l2', title: 'تقنيات إدارة الوقت', duration: '30 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما تقنية Pomodoro؟', options: ['رياضة', 'طبخ', 'إدارة وقت', 'موسيقى'], correctAnswer: 2 },
          { id: 'q2', question: 'كم دقيقة في جلسة Pomodoro؟', options: ['10', '25', '60', '45'], correctAnswer: 1 }
        ]
      }
    ]
  },
  {
    id: 'volunteer',
    name: 'المسار التطوعي',
    icon: '🤝',
    description: 'مهارات القيادة والعمل التطوعي',
    color: 'bg-orange-500',
    courses: [
      {
        id: 'volunteer-basics',
        title: 'أساسيات العمل التطوعي',
        description: 'كيف تكون متطوعاً فعالاً ومؤثراً',
        trackId: 'volunteer',
        duration: '2 ساعة',
        points: 35,
        lessons: [
          { id: 'l1', title: 'مفهوم التطوع', duration: '20 دقيقة' },
          { id: 'l2', title: 'أنواع التطوع', duration: '25 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما الهدف من التطوع؟', options: ['المال', 'خدمة المجتمع', 'الشهرة', 'الواجب'], correctAnswer: 1 },
          { id: 'q2', question: 'هل يمكن التطوع عن بعد؟', options: ['لا', 'نعم', 'أحياناً', 'للخبراء فقط'], correctAnswer: 1 }
        ]
      },
      {
        id: 'leadership-skills',
        title: 'مهارات القيادة',
        description: 'كن قائداً ملهماً ومؤثراً',
        trackId: 'volunteer',
        duration: '3 ساعات',
        points: 55,
        lessons: [
          { id: 'l1', title: 'صفات القائد الناجح', duration: '30 دقيقة' },
          { id: 'l2', title: 'إدارة الفريق', duration: '35 دقيقة' },
          { id: 'l3', title: 'حل المشكلات', duration: '25 دقيقة' }
        ],
        quiz: [
          { id: 'q1', question: 'ما أهم صفة للقائد؟', options: ['القوة', 'النزاهة', 'السرعة', 'الصمت'], correctAnswer: 1 },
          { id: 'q2', question: 'كيف يحفز القائد فريقه؟', options: ['التهديد', 'التشجيع والتقدير', 'الصمت', 'المال فقط'], correctAnswer: 1 },
          { id: 'q3', question: 'ما معنى القيادة التحويلية؟', options: ['تغيير المكان', 'إلهام وتطوير الآخرين', 'السيطرة', 'التفويض فقط'], correctAnswer: 1 }
        ]
      }
    ]
  }
];

export const getAllCourses = (): UniversityCourse[] => {
  return tracks.flatMap(track => track.courses);
};

export const getCourseById = (courseId: string): UniversityCourse | undefined => {
  return getAllCourses().find(course => course.id === courseId);
};

export const getTrackById = (trackId: string): Track | undefined => {
  return tracks.find(track => track.id === trackId);
};

*/