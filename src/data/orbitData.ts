// News Sources
export const newsSources = [
  {
    id: "sabq",
    name: "سبأ نت",
    logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=100&h=100&fit=crop",
    color: "#1e40af",
    trusted: true,
  },
  {
    id: "belqees",
    name: "بلقيس",
    logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
    color: "#dc2626",
    trusted: true,
  },
  {
    id: "yemen-shabab",
    name: "يمن شباب",
    logo: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop",
    color: "#059669",
    trusted: true,
  },
  {
    id: "almasdar",
    name: "المصدر",
    logo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    color: "#7c3aed",
    trusted: true,
  },
  {
    id: "mareb-press",
    name: "مأرب برس",
    logo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    color: "#ea580c",
    trusted: true,
  },
  {
    id: "aden-ghad",
    name: "عدن الغد",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    color: "#0891b2",
    trusted: true,
  },
];

// Context Tags
export const contextTags = [
  { id: "scholarships", label: "المنح", color: "bg-green-600" },
  { id: "economy", label: "الاقتصاد", color: "bg-blue-600" },
  { id: "passport", label: "الجوازات", color: "bg-purple-600" },
  { id: "education", label: "التعليم", color: "bg-cyan-600" },
  { id: "politics", label: "السياسة", color: "bg-red-600" },
  { id: "society", label: "المجتمع", color: "bg-amber-600" },
  { id: "sports", label: "الرياضة", color: "bg-emerald-600" },
  { id: "tech", label: "التقنية", color: "bg-indigo-600" },
];

// Mock News Articles
export const newsArticles = [
  {
    id: "1",
    sourceId: "sabq",
    headline: "الحكومة اليمنية تعلن عن منح دراسية جديدة للطلاب في الخارج",
    summary: "أعلنت وزارة التعليم العالي عن توفر 500 منحة دراسية للعام 2024",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop",
    videoUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    tags: ["scholarships", "education"],
    readTime: 3,
  },
  {
    id: "2",
    sourceId: "belqees",
    headline: "البنك المركزي يصدر قرارات جديدة بشأن سعر الصرف",
    summary: "إجراءات عاجلة لتثبيت العملة الوطنية أمام الدولار",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop",
    videoUrl: "https://example.com/video1.mp4",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    tags: ["economy"],
    readTime: 5,
  },
  {
    id: "3",
    sourceId: "yemen-shabab",
    headline: "افتتاح مركز خدمات الجوازات الإلكترونية في صنعاء",
    summary: "تسهيلات جديدة لإصدار وتجديد الجوازات اليمنية",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop",
    videoUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    tags: ["passport"],
    readTime: 2,
  },
  {
    id: "4",
    sourceId: "almasdar",
    headline: "مباحثات سلام جديدة برعاية أممية في مسقط",
    summary: "جولة محادثات تهدف لإنهاء الصراع وتحقيق السلام الشامل",
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop",
    videoUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    tags: ["politics"],
    readTime: 7,
  },
  {
    id: "5",
    sourceId: "mareb-press",
    headline: "إطلاق برنامج تدريبي للشباب اليمني في مجال التقنية",
    summary: "بالشراكة مع شركات عالمية لتأهيل 1000 شاب يمني",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    videoUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    tags: ["tech", "education"],
    readTime: 4,
  },
  {
    id: "6",
    sourceId: "aden-ghad",
    headline: "المنتخب اليمني يستعد لتصفيات كأس العالم",
    summary: "معسكر تدريبي مكثف استعداداً للمباريات المقبلة",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",
    videoUrl: "https://example.com/video2.mp4",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    tags: ["sports"],
    readTime: 3,
  },
];

// Daily Pulse Summary
export const dailyPulse = {
  date: new Date().toISOString(),
  highlights: [
    "🎓 500 منحة دراسية جديدة للطلاب اليمنيين في الخارج",
    "💰 البنك المركزي يتخذ إجراءات لتثبيت سعر الصرف",
    "🛂 تسهيلات جديدة لإصدار الجوازات الإلكترونية",
    "🕊️ جولة محادثات سلام جديدة في مسقط",
    "⚽ المنتخب الوطني يبدأ معسكره التدريبي",
  ],
  totalArticles: 48,
  sources: 6,
};

// Opinion Leaders
export const opinionLeaders = [
  {
    id: "1",
    name: "د. أحمد الشرجبي",
    title: "محلل سياسي",
    category: "political",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    bio: "أستاذ العلوم السياسية في جامعة صنعاء، متخصص في الشؤون اليمنية والخليجية",
    followers: 15420,
    articles: 89,
    topArticles: [
      { id: "a1", title: "مستقبل المفاوضات اليمنية", readTime: 8 },
      { id: "a2", title: "قراءة في المشهد السياسي", readTime: 12 },
      { id: "a3", title: "اليمن والمنطقة: رؤية استشرافية", readTime: 10 },
    ],
  },
  {
    id: "2",
    name: "د. نبيلة العنسي",
    title: "خبيرة اقتصادية",
    category: "economic",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    bio: "مستشارة اقتصادية سابقة، متخصصة في السياسات النقدية والتنمية المستدامة",
    followers: 8930,
    articles: 56,
    topArticles: [
      { id: "b1", title: "أزمة العملة: الأسباب والحلول", readTime: 15 },
      { id: "b2", title: "الاقتصاد اليمني إلى أين؟", readTime: 10 },
      { id: "b3", title: "فرص الاستثمار في ظل الأزمة", readTime: 8 },
    ],
  },
  {
    id: "3",
    name: "أ. محمد الحميري",
    title: "أكاديمي وباحث",
    category: "academic",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    bio: "باحث في مركز الدراسات الاستراتيجية، متخصص في شؤون التعليم والشباب",
    followers: 6200,
    articles: 42,
    topArticles: [
      { id: "c1", title: "التعليم اليمني: تحديات وآفاق", readTime: 12 },
      { id: "c2", title: "الشباب اليمني والهجرة", readTime: 9 },
      { id: "c3", title: "المنح الدراسية: دليل شامل", readTime: 7 },
    ],
  },
  {
    id: "4",
    name: "أ. سارة المقطري",
    title: "كاتبة ومحللة",
    category: "social",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    bio: "كاتبة في الشؤون الاجتماعية والثقافية، ناشطة في مجال حقوق المرأة",
    followers: 11500,
    articles: 78,
    topArticles: [
      { id: "d1", title: "المرأة اليمنية في زمن الحرب", readTime: 11 },
      { id: "d2", title: "الثقافة اليمنية: هوية وانتماء", readTime: 8 },
      { id: "d3", title: "قصص نجاح يمنية ملهمة", readTime: 6 },
    ],
  },
];

// Opinion Articles
export const opinionArticles = [
  {
    id: "op1",
    authorId: "1",
    title: "مستقبل السلام في اليمن: قراءة تحليلية",
    excerpt: "في ظل التطورات الأخيرة، تبدو فرص السلام أكثر واقعية من أي وقت مضى...",
    content: `
      في ظل التطورات الأخيرة على الساحة اليمنية، تبدو فرص السلام أكثر واقعية من أي وقت مضى. 
      
      لقد شهدنا خلال الأشهر الماضية تحولات جوهرية في مواقف الأطراف المختلفة، مدفوعة بضغوط إقليمية ودولية متزايدة.
      
      ## العوامل المساعدة
      
      تتضافر عدة عوامل لدفع عملية السلام قدماً:
      
      1. الإرهاق من الحرب لدى جميع الأطراف
      2. الضغوط الاقتصادية المتفاقمة
      3. التوافق الإقليمي الجديد
      4. المبادرات الأممية المتجددة
      
      ## التحديات المتبقية
      
      رغم التفاؤل الحذر، تظل هناك تحديات جوهرية يجب معالجتها...
    `,
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    readTime: 12,
    reactions: { agree: 245, disagree: 32, insightful: 189 },
    comments: 67,
  },
  {
    id: "op2",
    authorId: "2",
    title: "الريال اليمني: إلى أين يتجه؟",
    excerpt: "تحليل معمق لأسباب تدهور العملة الوطنية والحلول الممكنة...",
    content: `
      يعاني الريال اليمني من تراجع مستمر أمام العملات الأجنبية، مما يفاقم الأزمة الإنسانية ويزيد من معاناة المواطنين.
      
      ## الأسباب الجذرية
      
      يمكن إرجاع هذا التدهور إلى عدة عوامل متشابكة...
    `,
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    readTime: 15,
    reactions: { agree: 189, disagree: 45, insightful: 156 },
    comments: 89,
  },
  {
    id: "op3",
    authorId: "3",
    title: "المنح الدراسية 2024: دليلك الشامل",
    excerpt: "كل ما تحتاج معرفته عن فرص المنح المتاحة للطلاب اليمنيين هذا العام...",
    content: `
      مع اقتراب موسم التقديم على المنح الدراسية، نقدم لكم دليلاً شاملاً لأهم الفرص المتاحة...
    `,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    readTime: 10,
    reactions: { agree: 567, disagree: 12, insightful: 423 },
    comments: 234,
  },
];
