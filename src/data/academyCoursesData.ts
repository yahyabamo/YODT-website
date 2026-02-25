// Academy 2.0 - Coursera-like Data Structures
/*
export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "12:45"
  videoUrl: string;
  resources?: { title: string; url: string; type: 'pdf' | 'link' | 'code' }[];
  hasQuiz: boolean;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: Lesson[];
  project?: Project;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  points: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
    bio: string;
  };
  thumbnail: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  totalLessons: number;
  rating: number;
  studentsCount: number;
  modules: Module[];
  skills: string[];
  prerequisites: string[];
  certificate: boolean;
  points: number;
  badges: Badge[];
  language: string;
  updatedAt: string;
  learningOutcomes: string[];
  project?: Project;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
}

export interface UserCourseProgress {
  courseId: string;
  completedLessons: string[];
  completedModules: string[];
  completedQuizzes: { quizId: string; score: number; attempts: number }[];
  submittedProjects: { projectId: string; status: 'pending' | 'approved' | 'revision'; feedback?: string }[];
  notes: { lessonId: string; timestamp: number; content: string }[];
  bookmarks: { lessonId: string; timestamp: number; label: string }[];
  totalTimeSpent: number; // in minutes
  lastAccessedAt: string;
  startedAt: string;
  completedAt?: string;
}

// Sample Courses Data
export const academyCourses: Course[] = [
  {
    id: 'web-dev-fundamentals',
    title: 'أساسيات تطوير الويب',
    description: 'تعلم HTML, CSS, JavaScript من الصفر حتى الاحتراف',
    longDescription: 'دورة شاملة تأخذك من المبتدئ إلى المحترف في تطوير الويب. ستتعلم بناء مواقع تفاعلية من الصفر باستخدام أحدث التقنيات والممارسات.',
    instructor: {
      name: 'أحمد محمد',
      title: 'مهندس برمجيات أول في Google',
      avatar: '👨‍💻',
      bio: 'مهندس برمجيات بخبرة 10+ سنوات، عمل في Google و Meta، ومتخصص في تطوير الواجهات الأمامية.',
    },
    thumbnail: '🌐',
    category: 'البرمجة',
    level: 'beginner',
    duration: '25 ساعة',
    totalLessons: 48,
    rating: 4.8,
    studentsCount: 2450,
    skills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Git'],
    prerequisites: ['لا يوجد متطلبات سابقة'],
    certificate: true,
    points: 500,
    language: 'العربية',
    updatedAt: '2025-01-10',
    learningOutcomes: [
      'بناء صفحات ويب متكاملة من الصفر',
      'تصميم واجهات مستخدم متجاوبة',
      'إضافة التفاعل باستخدام JavaScript',
      'استخدام Git للتحكم بالنسخ',
    ],
    project: {
      id: 'web-final-project',
      title: 'موقع شخصي كامل',
      description: 'أنشئ موقعك الشخصي المتكامل',
      requirements: ['HTML متقن', 'CSS متجاوب', 'JavaScript تفاعلي'],
      deliverables: ['رابط الموقع', 'كود المصدر'],
      points: 150,
      difficulty: 'intermediate',
    },
    badges: [
      { id: 'first-code', name: 'أول كود', icon: '🚀', description: 'أكملت أول درس برمجة', condition: 'complete_first_lesson' },
      { id: 'html-master', name: 'محترف HTML', icon: '📄', description: 'أكملت وحدة HTML', condition: 'complete_module_html' },
      { id: 'css-artist', name: 'فنان CSS', icon: '🎨', description: 'أكملت وحدة CSS', condition: 'complete_module_css' },
      { id: 'js-ninja', name: 'نينجا JavaScript', icon: '⚡', description: 'أكملت وحدة JavaScript', condition: 'complete_module_js' },
      { id: 'web-graduate', name: 'خريج الويب', icon: '🎓', description: 'أكملت الدورة بالكامل', condition: 'complete_course' },
    ],
    modules: [
      {
        id: 'html-basics',
        title: 'أساسيات HTML',
        description: 'تعلم بناء هيكل صفحات الويب',
        duration: '4 ساعات',
        lessons: [
          {
            id: 'html-1',
            title: 'مقدمة في HTML',
            description: 'ما هو HTML ولماذا نستخدمه',
            duration: '15:30',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q1',
                question: 'ماذا يعني الاختصار HTML؟',
                options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Management'],
                correctAnswer: 0,
                explanation: 'HTML يعني HyperText Markup Language وهي لغة ترميز النص الفائق المستخدمة لبناء صفحات الويب.',
              },
              {
                id: 'q2',
                question: 'ما هو العنصر الجذري في أي صفحة HTML؟',
                options: ['<body>', '<head>', '<html>', '<div>'],
                correctAnswer: 2,
                explanation: 'العنصر <html> هو العنصر الجذري الذي يحتوي على جميع محتويات الصفحة.',
              },
            ],
            resources: [
              { title: 'ملخص الدرس PDF', url: '#', type: 'pdf' },
              { title: 'مرجع HTML', url: 'https://developer.mozilla.org/ar/docs/Web/HTML', type: 'link' },
            ],
          },
          {
            id: 'html-2',
            title: 'العناصر والوسوم',
            description: 'تعرف على أهم عناصر HTML',
            duration: '22:15',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q3',
                question: 'أي وسم يستخدم للعناوين الرئيسية؟',
                options: ['<p>', '<h1>', '<span>', '<div>'],
                correctAnswer: 1,
                explanation: 'الوسم <h1> يستخدم للعنوان الرئيسي الأكبر في الصفحة.',
              },
            ],
          },
          {
            id: 'html-3',
            title: 'الروابط والصور',
            description: 'إضافة الوسائط والتنقل',
            duration: '18:45',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: false,
          },
          {
            id: 'html-4',
            title: 'النماذج والإدخال',
            description: 'جمع بيانات المستخدم',
            duration: '25:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q4',
                question: 'ما هو الوسم المستخدم لإنشاء نموذج؟',
                options: ['<input>', '<form>', '<button>', '<fieldset>'],
                correctAnswer: 1,
                explanation: 'الوسم <form> يستخدم كحاوية لعناصر الإدخال.',
              },
            ],
          },
        ],
        project: {
          id: 'html-project',
          title: 'بناء صفحة شخصية',
          description: 'أنشئ صفحة HTML كاملة تعرض معلوماتك الشخصية',
          requirements: [
            'استخدام جميع العناصر المتعلمة',
            'صفحة واحدة على الأقل',
            'روابط للتواصل الاجتماعي',
            'صورة شخصية أو placeholder',
          ],
          deliverables: ['ملف index.html', 'لقطة شاشة للصفحة'],
          points: 50,
          difficulty: 'beginner',
        },
      },
      {
        id: 'css-basics',
        title: 'أساسيات CSS',
        description: 'تنسيق وتجميل صفحات الويب',
        duration: '6 ساعات',
        lessons: [
          {
            id: 'css-1',
            title: 'مقدمة في CSS',
            description: 'ما هو CSS وكيف يعمل',
            duration: '14:20',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q5',
                question: 'ما هي طرق إضافة CSS للصفحة؟',
                options: ['Inline فقط', 'External فقط', 'Inline, Internal, External', 'لا يمكن إضافة CSS'],
                correctAnswer: 2,
                explanation: 'يمكن إضافة CSS بثلاث طرق: Inline داخل العنصر، Internal في head، وExternal كملف منفصل.',
              },
            ],
          },
          {
            id: 'css-2',
            title: 'المحددات والخصائص',
            description: 'كيف نختار العناصر ونصممها',
            duration: '28:30',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q6',
                question: 'كيف نختار عنصر بـ class معين؟',
                options: ['#className', '.className', 'className', '*className'],
                correctAnswer: 1,
                explanation: 'نستخدم النقطة (.) متبوعة باسم الـ class.',
              },
            ],
          },
          {
            id: 'css-3',
            title: 'Box Model',
            description: 'فهم نموذج الصندوق',
            duration: '20:15',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: false,
          },
          {
            id: 'css-4',
            title: 'Flexbox',
            description: 'التخطيط المرن الحديث',
            duration: '35:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q7',
                question: 'ما الخاصية التي تفعّل Flexbox؟',
                options: ['display: flex', 'flex: enable', 'flexbox: true', 'layout: flex'],
                correctAnswer: 0,
                explanation: 'نستخدم display: flex على الحاوية الأب.',
              },
            ],
          },
          {
            id: 'css-5',
            title: 'التصميم المتجاوب',
            description: 'مواقع تعمل على جميع الأجهزة',
            duration: '30:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: false,
          },
        ],
        project: {
          id: 'css-project',
          title: 'تصميم واجهة Landing Page',
          description: 'صمم صفحة هبوط احترافية ومتجاوبة',
          requirements: [
            'تصميم متجاوب يعمل على الجوال والكمبيوتر',
            'استخدام Flexbox أو Grid',
            'ألوان متناسقة',
            'تأثيرات hover',
          ],
          deliverables: ['ملفات HTML و CSS', 'لقطات شاشة من أجهزة مختلفة'],
          points: 75,
          difficulty: 'intermediate',
        },
      },
      {
        id: 'js-basics',
        title: 'أساسيات JavaScript',
        description: 'إضافة التفاعل للصفحات',
        duration: '8 ساعات',
        lessons: [
          {
            id: 'js-1',
            title: 'مقدمة في JavaScript',
            description: 'ما هي JavaScript ولماذا نحتاجها',
            duration: '16:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q8',
                question: 'أين يتم تنفيذ JavaScript؟',
                options: ['على الخادم فقط', 'في المتصفح فقط', 'في المتصفح والخادم', 'لا يتم تنفيذها'],
                correctAnswer: 2,
                explanation: 'JavaScript تعمل في المتصفح (Frontend) وعلى الخادم (Node.js).',
              },
            ],
          },
          {
            id: 'js-2',
            title: 'المتغيرات وأنواع البيانات',
            description: 'تخزين البيانات والتعامل معها',
            duration: '25:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q9',
                question: 'ما الفرق بين let و const؟',
                options: ['لا فرق', 'let ثابت و const متغير', 'const ثابت و let متغير', 'كلاهما ثابت'],
                correctAnswer: 2,
                explanation: 'const للقيم الثابتة التي لا تتغير، let للقيم القابلة للتغيير.',
              },
            ],
          },
          {
            id: 'js-3',
            title: 'الدوال والكائنات',
            description: 'تنظيم الكود وإعادة استخدامه',
            duration: '30:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: false,
          },
          {
            id: 'js-4',
            title: 'التعامل مع DOM',
            description: 'تعديل الصفحة ديناميكياً',
            duration: '35:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: true,
            quiz: [
              {
                id: 'q10',
                question: 'ما هي الدالة لاختيار عنصر بالـ ID؟',
                options: ['document.query()', 'document.getElementById()', 'document.select()', 'element.find()'],
                correctAnswer: 1,
                explanation: 'نستخدم document.getElementById("id") لاختيار عنصر محدد.',
              },
            ],
          },
          {
            id: 'js-5',
            title: 'الأحداث والمستمعين',
            description: 'الاستجابة لتفاعل المستخدم',
            duration: '28:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            hasQuiz: false,
          },
        ],
        project: {
          id: 'js-project',
          title: 'تطبيق قائمة مهام',
          description: 'أنشئ تطبيق Todo List تفاعلي كامل',
          requirements: [
            'إضافة وحذف المهام',
            'تحديد المهام كمكتملة',
            'حفظ البيانات في localStorage',
            'تصميم جميل ومتجاوب',
          ],
          deliverables: ['ملفات HTML, CSS, JS', 'رابط GitHub أو CodePen'],
          points: 100,
          difficulty: 'intermediate',
        },
      },
    ],
  },
  {
    id: 'english-ielts',
    title: 'دورة IELTS الشاملة',
    description: 'استعد لاختبار IELTS واحصل على درجة 7+ بثقة',
    longDescription: 'دورة مكثفة تغطي جميع أقسام اختبار IELTS الأكاديمي والعام. تشمل استراتيجيات، تمارين، ونماذج اختبارات حقيقية.',
    instructor: {
      name: 'سارة أحمد',
      title: 'مدربة IELTS معتمدة من British Council',
      avatar: '👩‍🏫',
      bio: 'مدربة لغة إنجليزية بخبرة 8 سنوات، ساعدت أكثر من 500 طالب في تحقيق أهدافهم.',
    },
    thumbnail: '📚',
    category: 'اللغات',
    level: 'intermediate',
    duration: '40 ساعة',
    totalLessons: 60,
    rating: 4.9,
    studentsCount: 1890,
    skills: ['Reading', 'Writing', 'Listening', 'Speaking', 'Vocabulary'],
    prerequisites: ['مستوى متوسط في الإنجليزية'],
    certificate: true,
    points: 750,
    language: 'العربية والإنجليزية',
    updatedAt: '2025-01-12',
    learningOutcomes: [
      'تحقيق درجة 7+ في اختبار IELTS',
      'إتقان استراتيجيات الاستماع والقراءة',
      'كتابة مقالات أكاديمية احترافية',
      'التحدث بثقة في المقابلة الشفهية',
    ],
    badges: [
      { id: 'listener', name: 'مستمع ماهر', icon: '👂', description: 'أكملت قسم Listening', condition: 'complete_module_listening' },
      { id: 'reader', name: 'قارئ متميز', icon: '📖', description: 'أكملت قسم Reading', condition: 'complete_module_reading' },
      { id: 'writer', name: 'كاتب محترف', icon: '✍️', description: 'أكملت قسم Writing', condition: 'complete_module_writing' },
      { id: 'speaker', name: 'متحدث واثق', icon: '🎤', description: 'أكملت قسم Speaking', condition: 'complete_module_speaking' },
      { id: 'ielts-ready', name: 'جاهز للاختبار', icon: '🏆', description: 'أكملت الدورة بالكامل', condition: 'complete_course' },
    ],
    modules: [
      {
        id: 'listening',
        title: 'Listening Section',
        description: 'إتقان قسم الاستماع',
        duration: '10 ساعات',
        lessons: [
          { id: 'l1', title: 'فهم بنية الاختبار', description: 'تعرف على أنواع الأسئلة', duration: '20:00', videoUrl: '', hasQuiz: true, quiz: [] },
          { id: 'l2', title: 'استراتيجيات الاستماع', description: 'تقنيات للفهم السريع', duration: '25:00', videoUrl: '', hasQuiz: true, quiz: [] },
          { id: 'l3', title: 'تمرين عملي 1', description: 'اختبار تجريبي كامل', duration: '45:00', videoUrl: '', hasQuiz: true, quiz: [] },
        ],
      },
      {
        id: 'reading',
        title: 'Reading Section',
        description: 'إتقان قسم القراءة',
        duration: '10 ساعات',
        lessons: [
          { id: 'r1', title: 'أنواع النصوص', description: 'فهم أنماط النصوص المختلفة', duration: '22:00', videoUrl: '', hasQuiz: true, quiz: [] },
          { id: 'r2', title: 'تقنيات القراءة السريعة', description: 'Skimming و Scanning', duration: '30:00', videoUrl: '', hasQuiz: false },
          { id: 'r3', title: 'حل الأسئلة', description: 'استراتيجيات الإجابة', duration: '35:00', videoUrl: '', hasQuiz: true, quiz: [] },
        ],
      },
    ],
  },
  {
    id: 'leadership-skills',
    title: 'مهارات القيادة والتأثير',
    description: 'كن قائداً ملهماً يحرك الفرق نحو النجاح',
    longDescription: 'دورة عملية في القيادة تجمع بين النظرية والتطبيق. تعلم كيف تقود فريقاً، تتخذ قرارات صعبة، وتؤثر إيجابياً.',
    instructor: {
      name: 'د. خالد علي',
      title: 'استشاري تطوير القيادات في McKinsey',
      avatar: '👔',
      bio: 'دكتوراه في إدارة الأعمال، درّب أكثر من 1000 قائد في المنطقة العربية.',
    },
    thumbnail: '👑',
    category: 'المهارات الناعمة',
    level: 'advanced',
    duration: '15 ساعة',
    totalLessons: 24,
    rating: 4.7,
    studentsCount: 980,
    skills: ['Communication', 'Decision Making', 'Team Building', 'Conflict Resolution', 'Strategic Thinking'],
    prerequisites: ['خبرة عمل سنة على الأقل'],
    certificate: true,
    points: 400,
    language: 'العربية',
    updatedAt: '2025-01-08',
    learningOutcomes: [
      'قيادة الفرق بفعالية وإلهام',
      'اتخاذ قرارات استراتيجية صحيحة',
      'حل النزاعات والتعامل مع التحديات',
      'التأثير الإيجابي على الآخرين',
    ],
    badges: [
      { id: 'communicator', name: 'متواصل فعال', icon: '💬', description: 'أتقنت مهارات التواصل', condition: 'complete_module_communication' },
      { id: 'decision-maker', name: 'صانع قرار', icon: '⚖️', description: 'أتقنت اتخاذ القرارات', condition: 'complete_module_decisions' },
      { id: 'team-builder', name: 'بانٍ للفرق', icon: '🤝', description: 'أتقنت بناء الفرق', condition: 'complete_module_teams' },
      { id: 'leader', name: 'قائد متميز', icon: '🌟', description: 'أكملت الدورة بالكامل', condition: 'complete_course' },
    ],
    modules: [
      {
        id: 'communication',
        title: 'التواصل القيادي',
        description: 'كيف يتواصل القادة الفعالون',
        duration: '5 ساعات',
        lessons: [
          { id: 'c1', title: 'أساسيات التواصل', description: 'مهارات الاستماع والتحدث', duration: '18:00', videoUrl: '', hasQuiz: true, quiz: [] },
          { id: 'c2', title: 'التواصل غير اللفظي', description: 'لغة الجسد والحضور', duration: '20:00', videoUrl: '', hasQuiz: false },
          { id: 'c3', title: 'إدارة الاجتماعات', description: 'قيادة اجتماعات فعالة', duration: '25:00', videoUrl: '', hasQuiz: true, quiz: [] },
        ],
        project: {
          id: 'comm-project',
          title: 'تقديم عرض قيادي',
          description: 'قدم عرضاً لمدة 5 دقائق عن رؤيتك القيادية',
          requirements: ['عرض واضح ومنظم', 'استخدام لغة جسد فعالة', 'رسالة ملهمة'],
          deliverables: ['فيديو العرض', 'شرائح العرض'],
          points: 60,
          difficulty: 'intermediate',
        },
      },
    ],
  },
];

// Categories
export const courseCategories = [
  { id: 'all', label: 'الكل', icon: '📚' },
  { id: 'programming', label: 'البرمجة', icon: '💻' },
  { id: 'languages', label: 'اللغات', icon: '🌍' },
  { id: 'soft-skills', label: 'المهارات الناعمة', icon: '🤝' },
  { id: 'business', label: 'الأعمال', icon: '💼' },
  { id: 'design', label: 'التصميم', icon: '🎨' },
];

// Levels
export const courseLevels = [
  { id: 'beginner', label: 'مبتدئ', color: 'bg-green-100 text-green-700' },
  { id: 'intermediate', label: 'متوسط', color: 'bg-blue-100 text-blue-700' },
  { id: 'advanced', label: 'متقدم', color: 'bg-purple-100 text-purple-700' },
];

// User Progress Helpers
export const getDefaultProgress = (courseId: string): UserCourseProgress => ({
  courseId,
  completedLessons: [],
  completedModules: [],
  completedQuizzes: [],
  submittedProjects: [],
  notes: [],
  bookmarks: [],
  totalTimeSpent: 0,
  lastAccessedAt: new Date().toISOString(),
  startedAt: new Date().toISOString(),
});

*/