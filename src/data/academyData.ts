// Books Data
/*
export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  category: string;
  summary: string;
  downloadUrl: string;
  readers: number;
}

export const books: Book[] = [
  {
    id: '1',
    title: 'فن التفكير الواضح',
    author: 'رولف دوبلي',
    pages: 240,
    category: 'تطوير الذات',
    summary: 'كتاب يكشف الأخطاء الشائعة في التفكير التي تمنعنا من اتخاذ قرارات صائبة. يقدم 52 فخًا فكريًا يجب تجنبها، مع أمثلة عملية من الحياة اليومية والأعمال. مثالي للطلاب الذين يريدون تحسين قدرتهم على التحليل والتفكير النقدي.',
    downloadUrl: '#',
    readers: 1245,
  },
  {
    id: '2',
    title: 'العادات الذرية',
    author: 'جيمس كلير',
    pages: 320,
    category: 'تطوير الذات',
    summary: 'دليل عملي لبناء عادات جيدة والتخلص من العادات السيئة. يشرح الكتاب كيف يمكن للتغييرات الصغيرة أن تؤدي إلى نتائج كبيرة. يقدم استراتيجيات مثبتة علميًا لتطوير الذات بطريقة مستدامة.',
    downloadUrl: '#',
    readers: 2340,
  },
  {
    id: '3',
    title: 'الأب الغني والأب الفقير',
    author: 'روبرت كيوساكي',
    pages: 280,
    category: 'المال والأعمال',
    summary: 'كتاب يغير طريقة تفكيرك حول المال والثروة. يقارن بين عقلية الفقراء والأغنياء، ويشرح كيف تجعل المال يعمل لصالحك. أساسي لكل طالب يريد فهم الاستقلال المالي.',
    downloadUrl: '#',
    readers: 1890,
  },
  {
    id: '4',
    title: 'قواعد اللغة التركية',
    author: 'أحمد المصري',
    pages: 180,
    category: 'اللغات',
    summary: 'مرجع شامل لقواعد اللغة التركية مصمم خصيصًا للناطقين بالعربية. يشرح القواعد بأسلوب مبسط مع أمثلة وتمارين تطبيقية. مثالي للطلاب الجدد في تركيا.',
    downloadUrl: '#',
    readers: 3450,
  },
  {
    id: '5',
    title: 'فكر كمبرمج',
    author: 'أنتون سبراؤول',
    pages: 260,
    category: 'البرمجة والتقنية',
    summary: 'مقدمة لحل المشكلات بأسلوب المبرمجين. يعلمك كيف تفكك المشكلات المعقدة وتبني حلولًا منطقية. لا يتطلب خبرة سابقة بالبرمجة، مناسب لجميع التخصصات.',
    downloadUrl: '#',
    readers: 980,
  },
  {
    id: '6',
    title: 'كيف تكسب الأصدقاء وتؤثر في الناس',
    author: 'ديل كارنيجي',
    pages: 290,
    category: 'التواصل والعلاقات',
    summary: 'الكتاب الكلاسيكي في فن التعامل مع الناس. يقدم مبادئ خالدة لبناء علاقات قوية والتأثير الإيجابي. ضروري لكل طالب يريد النجاح في الحياة الاجتماعية والمهنية.',
    downloadUrl: '#',
    readers: 2100,
  },
];

// Theses Data
export interface Thesis {
  id: string;
  title: string;
  researcher: string;
  specialty: string;
  type: 'masters' | 'phd';
  summary: string;
  downloadUrl: string;
}

export const theses: Thesis[] = [
  {
    id: '1',
    title: 'تأثير وسائل التواصل الاجتماعي على التحصيل الأكاديمي',
    researcher: 'سارة أحمد الحميري',
    specialty: 'علم النفس التربوي',
    type: 'masters',
    summary: 'دراسة تحليلية لتأثير استخدام وسائل التواصل الاجتماعي على الأداء الأكاديمي للطلاب الجامعيين في تركيا.',
    downloadUrl: '#',
  },
  {
    id: '2',
    title: 'تطوير نموذج ذكاء اصطناعي للترجمة العربية-التركية',
    researcher: 'محمد علي الصنعاني',
    specialty: 'هندسة البرمجيات',
    type: 'phd',
    summary: 'بحث في تطوير نموذج ترجمة آلية يراعي خصوصيات اللغتين العربية والتركية باستخدام تقنيات التعلم العميق.',
    downloadUrl: '#',
  },
  {
    id: '3',
    title: 'دراسة جدوى مشاريع ريادة الأعمال للطلاب الدوليين',
    researcher: 'فاطمة حسن المقطري',
    specialty: 'إدارة الأعمال',
    type: 'masters',
    summary: 'تحليل الفرص والتحديات التي تواجه الطلاب الدوليين في إطلاق مشاريعهم الخاصة في تركيا.',
    downloadUrl: '#',
  },
  {
    id: '4',
    title: 'تصميم مواد تعليمية تفاعلية للغة التركية',
    researcher: 'عمر خالد الحضرمي',
    specialty: 'تقنيات التعليم',
    type: 'masters',
    summary: 'تطوير منهجية لتصميم محتوى تعليمي تفاعلي يساعد الطلاب العرب على تعلم اللغة التركية بفعالية.',
    downloadUrl: '#',
  },
];

// University Materials Data
export interface UniversityMaterial {
  id: string;
  name: string;
  specialty: string;
  description: string;
  downloadUrl: string;
  downloads: number;
}

export const universityMaterials: UniversityMaterial[] = [
  {
    id: '1',
    name: 'مقدمة في طب الأسنان',
    specialty: 'طب الأسنان',
    description: 'ملخص شامل لمادة مقدمة طب الأسنان للسنة الأولى',
    downloadUrl: '#',
    downloads: 567,
  },
  {
    id: '2',
    name: 'تشريح الفم والأسنان',
    specialty: 'طب الأسنان',
    description: 'شرح مفصل لتشريح الفم والأسنان مع صور توضيحية',
    downloadUrl: '#',
    downloads: 423,
  },
  {
    id: '3',
    name: 'أساسيات البرمجة بلغة Python',
    specialty: 'البرمجة',
    description: 'ملف تعليمي شامل لأساسيات البرمجة بلغة بايثون',
    downloadUrl: '#',
    downloads: 1234,
  },
  {
    id: '4',
    name: 'هياكل البيانات والخوارزميات',
    specialty: 'البرمجة',
    description: 'شرح مبسط لهياكل البيانات الأساسية مع أمثلة عملية',
    downloadUrl: '#',
    downloads: 890,
  },
  {
    id: '5',
    name: 'مبادئ الميكانيكا الهندسية',
    specialty: 'الهندسة',
    description: 'ملخص لمادة الميكانيكا للسنة الأولى هندسة',
    downloadUrl: '#',
    downloads: 345,
  },
  {
    id: '6',
    name: 'الدوائر الكهربائية',
    specialty: 'الهندسة',
    description: 'شرح مفصل للدوائر الكهربائية الأساسية',
    downloadUrl: '#',
    downloads: 456,
  },
  {
    id: '7',
    name: 'أساسيات التصميم الجرافيكي',
    specialty: 'التصميم',
    description: 'مبادئ التصميم الأساسية ونظرية الألوان',
    downloadUrl: '#',
    downloads: 678,
  },
  {
    id: '8',
    name: 'تصميم واجهات المستخدم UI/UX',
    specialty: 'التصميم',
    description: 'دليل شامل لتصميم واجهات المستخدم وتجربة المستخدم',
    downloadUrl: '#',
    downloads: 789,
  },
];

// Guidance Questions
export interface GuidanceQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    next?: string; // ID of next question or null for result
    result?: string;
  }[];
}

export const guidanceQuestions: GuidanceQuestion[] = [
  {
    id: 'start',
    question: 'كيف تصف حالتك الحالية؟',
    options: [
      { text: 'طالب جديد في تركيا', next: 'new_student' },
      { text: 'أبحث عن فرصة عمل', next: 'job_seeker' },
      { text: 'أريد تطوير مهاراتي', next: 'skill_builder' },
      { text: 'أشعر بالضغط والتشتت', next: 'stressed' },
    ],
  },
  {
    id: 'new_student',
    question: 'ما هو أكثر ما يشغل تفكيرك الآن؟',
    options: [
      { text: 'تعلم اللغة التركية', result: 'language' },
      { text: 'التعرف على زملاء', result: 'social' },
      { text: 'فهم النظام الجامعي', result: 'academic' },
      { text: 'ترتيب الأوراق الرسمية', result: 'documents' },
    ],
  },
  {
    id: 'job_seeker',
    question: 'ما نوع الفرصة التي تبحث عنها؟',
    options: [
      { text: 'وظيفة بدوام كامل', result: 'fulltime_job' },
      { text: 'عمل جزئي أثناء الدراسة', result: 'parttime_job' },
      { text: 'تدريب عملي', result: 'internship' },
      { text: 'عمل حر عن بُعد', result: 'freelance' },
    ],
  },
  {
    id: 'skill_builder',
    question: 'ما المجال الذي تريد التطوير فيه؟',
    options: [
      { text: 'المهارات التقنية', result: 'tech_skills' },
      { text: 'اللغات', result: 'languages' },
      { text: 'المهارات القيادية', result: 'leadership' },
      { text: 'إدارة الوقت والإنتاجية', result: 'productivity' },
    ],
  },
  {
    id: 'stressed',
    question: 'ما سبب الضغط الأساسي؟',
    options: [
      { text: 'كثرة المهام والواجبات', result: 'overwhelmed' },
      { text: 'صعوبة في التركيز', result: 'focus_issues' },
      { text: 'الشعور بالوحدة', result: 'loneliness' },
      { text: 'القلق من المستقبل', result: 'future_anxiety' },
    ],
  },
];

export const guidanceResults: Record<string, { title: string; priorities: string[]; tips: string[]; suggestedPath: string; suggestedLink: string }> = {
  language: {
    title: 'مسار تعلم اللغة التركية',
    priorities: ['ابدأ بدورة اللغة التركية الأساسية', 'مارس يوميًا 30 دقيقة', 'تحدث مع زملاء أتراك'],
    tips: ['استخدم تطبيق Duolingo يوميًا', 'شاهد مسلسلات تركية بترجمة عربية', 'اكتب 5 كلمات جديدة يوميًا'],
    suggestedPath: 'دورة اللغة التركية للمبتدئين',
    suggestedLink: '/academy',
  },
  social: {
    title: 'بناء شبكة علاقات',
    priorities: ['احضر لقاء التعارف الشهري', 'انضم لمجموعات الطلاب', 'شارك في الأنشطة الاجتماعية'],
    tips: ['كن مبادرًا في التعارف', 'انضم لنادٍ جامعي', 'شارك في الأنشطة التطوعية'],
    suggestedPath: 'الأنشطة والفعاليات',
    suggestedLink: '/activities',
  },
  academic: {
    title: 'فهم النظام الأكاديمي',
    priorities: ['اقرأ دليل الطالب الجديد', 'تواصل مع المرشد الأكاديمي', 'افهم نظام الساعات المعتمدة'],
    tips: ['احضر جميع المحاضرات الأولى', 'احفظ التواريخ المهمة', 'تعرف على موارد المكتبة'],
    suggestedPath: 'دليل الطالب الجديد',
    suggestedLink: '/guide',
  },
  documents: {
    title: 'ترتيب الأوراق الرسمية',
    priorities: ['جدد الإقامة قبل انتهائها', 'سجل عنوانك في النفوس', 'افتح حسابًا بنكيًا'],
    tips: ['احتفظ بنسخ من جميع الأوراق', 'تابع مواعيد التجديد', 'استخدم التطبيقات الرسمية'],
    suggestedPath: 'دليل الإجراءات الرسمية',
    suggestedLink: '/guide',
  },
  fulltime_job: {
    title: 'البحث عن وظيفة كاملة',
    priorities: ['أكمل سيرتك الذاتية', 'طور ملفك على LinkedIn', 'ابحث عن فرص عبر المنصة'],
    tips: ['تأكد من تصريح العمل', 'استعد للمقابلات', 'وسع شبكة علاقاتك المهنية'],
    suggestedPath: 'دورة كتابة السيرة الذاتية',
    suggestedLink: '/academy',
  },
  parttime_job: {
    title: 'عمل جزئي متوازن',
    priorities: ['حدد ساعاتك المتاحة', 'ابحث عن عمل قرب الجامعة', 'وازن بين العمل والدراسة'],
    tips: ['العمل عن بُعد خيار ممتاز', 'لا تتجاوز 20 ساعة أسبوعيًا', 'اختر عملًا يطور مهاراتك'],
    suggestedPath: 'فرص العمل المتاحة',
    suggestedLink: '/jobs',
  },
  internship: {
    title: 'فرص التدريب العملي',
    priorities: ['ابحث عن تدريب في مجالك', 'تواصل مع الشركات الداعمة', 'أكمل الدورات المطلوبة'],
    tips: ['التدريب الصيفي مثالي', 'الشركات التركية ترحب بالطلاب', 'وثق كل تجربة تدريبية'],
    suggestedPath: 'فرص التدريب',
    suggestedLink: '/jobs',
  },
  freelance: {
    title: 'العمل الحر عن بُعد',
    priorities: ['طور مهارة قابلة للبيع', 'أنشئ ملفًا على Upwork أو Fiverr', 'ابدأ بمشاريع صغيرة'],
    tips: ['التصميم والبرمجة مطلوبان جدًا', 'بناء السمعة يأخذ وقتًا', 'احتفظ بأعمالك في portfolio'],
    suggestedPath: 'دورة Canva للتصميم',
    suggestedLink: '/academy',
  },
  tech_skills: {
    title: 'تطوير المهارات التقنية',
    priorities: ['اختر مجالًا محددًا', 'أكمل دورة كاملة', 'طبق ما تعلمته في مشروع'],
    tips: ['البرمجة مجال واعد', 'تعلم يوميًا ولو 30 دقيقة', 'شارك في hackathons'],
    suggestedPath: 'المسار التقني',
    suggestedLink: '/academy',
  },
  languages: {
    title: 'تعلم لغة جديدة',
    priorities: ['حدد اللغة المستهدفة', 'التزم بجدول يومي', 'مارس المحادثة'],
    tips: ['التركية ضرورية للحياة اليومية', 'الإنجليزية ضرورية للعمل', 'استخدم تطبيقات التعلم'],
    suggestedPath: 'دورات اللغات',
    suggestedLink: '/academy',
  },
  leadership: {
    title: 'تطوير المهارات القيادية',
    priorities: ['انضم لفريق تطوعي', 'احضر ورش القيادة', 'تحمل مسؤولية في نشاط'],
    tips: ['القيادة تُكتسب بالممارسة', 'تعلم من القادة الناجحين', 'اقرأ كتب القيادة'],
    suggestedPath: 'ورشة المهارات القيادية',
    suggestedLink: '/activities',
  },
  productivity: {
    title: 'إدارة الوقت والإنتاجية',
    priorities: ['استخدم تقنية Pomodoro', 'خطط يومك مسبقًا', 'حدد أولوياتك'],
    tips: ['أزل المشتتات', 'نم 7-8 ساعات', 'راجع إنجازاتك أسبوعيًا'],
    suggestedPath: 'دورة إدارة الوقت',
    suggestedLink: '/academy',
  },
  overwhelmed: {
    title: 'التعامل مع كثرة المهام',
    priorities: ['قسم المهام الكبيرة', 'ابدأ بالأهم فالمهم', 'لا تخجل من طلب المساعدة'],
    tips: ['اكتب كل مهامك', 'أنجز مهمة واحدة في وقت واحد', 'خذ استراحات قصيرة'],
    suggestedPath: 'دورة إدارة الوقت',
    suggestedLink: '/academy',
  },
  focus_issues: {
    title: 'تحسين التركيز',
    priorities: ['حدد وقتًا للدراسة بدون هاتف', 'اختر مكانًا هادئًا', 'استخدم تقنية Pomodoro'],
    tips: ['التمارين الرياضية تحسن التركيز', 'النوم الكافي ضروري', 'قلل السكريات والكافيين'],
    suggestedPath: 'مساحة الطالب للدعم',
    suggestedLink: '/community',
  },
  loneliness: {
    title: 'التغلب على الشعور بالوحدة',
    priorities: ['احضر الأنشطة الاجتماعية', 'انضم لمجموعات الطلاب', 'شارك في التطوع'],
    tips: ['الوحدة طبيعية في البداية', 'كن صبورًا على بناء الصداقات', 'تواصل مع عائلتك بانتظام'],
    suggestedPath: 'مجتمع الطلاب',
    suggestedLink: '/community',
  },
  future_anxiety: {
    title: 'التعامل مع قلق المستقبل',
    priorities: ['ركز على الحاضر', 'ضع أهدافًا قصيرة المدى', 'طور مهارات مطلوبة'],
    tips: ['القلق طبيعي لكن لا تدعه يشلّك', 'تحدث مع من سبقوك', 'كل خطوة صغيرة تقربك'],
    suggestedPath: 'مساحة الطالب للدعم',
    suggestedLink: '/community',
  },
};

export const bookCategories = ['الكل', 'تطوير الذات', 'المال والأعمال', 'اللغات', 'البرمجة والتقنية', 'التواصل والعلاقات'];
export const thesisSpecialties = ['الكل', 'علم النفس التربوي', 'هندسة البرمجيات', 'إدارة الأعمال', 'تقنيات التعليم'];
export const materialSpecialties = ['الكل', 'طب الأسنان', 'البرمجة', 'الهندسة', 'التصميم'];

*/
