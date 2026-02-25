import { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, HelpCircle, ChevronLeft, Gift, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DailyContent {
  quote: { text: string; author: string };
  opportunity: { title: string; description: string; link: string };
  question: { text: string; options: string[] };
  fact: string;
}

const dailyContents: DailyContent[] = [
  {
    quote: { text: 'العلم نور والجهل ظلام', author: 'حكمة عربية' },
    opportunity: { title: 'دورة LinkedIn مجانية', description: 'تعلم كيف تبني ملفك المهني', link: '/academy' },
    question: { text: 'ما هي أهم مهارة تريد تطويرها؟', options: ['اللغة الإنجليزية', 'المهارات التقنية', 'التواصل', 'القيادة'] },
    fact: 'هل تعلم أن 85% من النجاح المهني يعتمد على المهارات الناعمة؟'
  },
  {
    quote: { text: 'من طلب العلا سهر الليالي', author: 'الإمام الشافعي' },
    opportunity: { title: 'فرصة تطوع جديدة', description: 'انضم لفريق الفعاليات', link: '/volunteers' },
    question: { text: 'كم ساعة تدرس يومياً؟', options: ['1-2 ساعة', '3-4 ساعات', '5+ ساعات', 'أحتاج تنظيم'] },
    fact: 'الطلاب اليمنيون في تركيا يتجاوز عددهم 3000 طالب!'
  },
  {
    quote: { text: 'الغربة ليست عقوبة، بل فرصة للتميز', author: 'حكمة الطالب' },
    opportunity: { title: 'وظيفة جزئية متاحة', description: 'فرصة عمل في مجال الترجمة', link: '/jobs' },
    question: { text: 'ما الذي يحفزك للتعلم؟', options: ['بناء المستقبل', 'مساعدة اليمن', 'تطوير الذات', 'الحصول على وظيفة'] },
    fact: 'إكمال دورة واحدة يمنحك 50 نقطة في الاتحاد!'
  },
  {
    quote: { text: 'كن التغيير الذي تريد رؤيته', author: 'غاندي' },
    opportunity: { title: 'ورشة عمل مجانية', description: 'تعلم تصميم CV احترافي', link: '/academy' },
    question: { text: 'ما هو هدفك لهذا الشهر؟', options: ['إنهاء دورة', 'التطوع', 'البحث عن عمل', 'تحسين اللغة'] },
    fact: 'المتطوعون النشطون يحصلون على أولوية في الفرص الوظيفية!'
  },
  {
    quote: { text: 'اليمن تنتظر عودتك ناجحاً', author: 'رسالة لكل طالب' },
    opportunity: { title: 'منحة تدريبية', description: 'تدريب مجاني في شركة تقنية', link: '/jobs' },
    question: { text: 'كيف تقيّم تجربتك في تركيا؟', options: ['ممتازة', 'جيدة', 'تحتاج تحسين', 'صعبة'] },
    fact: 'أكثر من 500 طالب استفادوا من دورات الأكاديمية!'
  },
  {
    quote: { text: 'الصبر مفتاح الفرج', author: 'حكمة إسلامية' },
    opportunity: { title: 'لقاء شبكات', description: 'تعرف على طلاب من جامعتك', link: '/activities' },
    question: { text: 'ما أكثر شيء يشغلك الآن؟', options: ['الدراسة', 'العمل', 'الأصدقاء', 'المستقبل'] },
    fact: 'حضور نشاط واحد يمنحك 20 نقطة!'
  },
  {
    quote: { text: 'من سار على الدرب وصل', author: 'مثل عربي' },
    opportunity: { title: 'مسابقة أسبوعية', description: 'شارك واربح جوائز قيمة', link: '/activities' },
    question: { text: 'ما الذي يميز الطالب اليمني؟', options: ['الذكاء', 'الطموح', 'الصبر', 'التعاون'] },
    fact: 'الاتحاد نظم أكثر من 100 فعالية هذا العام!'
  },
];

export const DailyTrigger = () => {
  const [content, setContent] = useState<DailyContent>(dailyContents[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const contentIndex = dayOfYear % dailyContents.length;
    setContent(dailyContents[contentIndex]);
  }, []);

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
    setShowResult(true);
  };

  return (
    <div className="space-y-4">
      {/* Today's Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-foreground">اليوم في الاتحاد</h2>
          <p className="text-xs text-muted-foreground">محتوى جديد كل يوم</p>
        </div>
      </div>

      {/* Daily Quote */}
      <Card className="border-0 bg-gradient-to-l from-primary/5 to-amber-500/5 shadow-soft overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-foreground font-semibold text-lg mb-1">"{content.quote.text}"</p>
              <p className="text-sm text-muted-foreground">— {content.quote.author}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Opportunity */}
      <Card className="border-0 bg-gradient-to-l from-emerald-500/5 to-green-500/5 shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium mb-0.5">فرصة اليوم</p>
                <p className="font-semibold text-foreground">{content.opportunity.title}</p>
                <p className="text-sm text-muted-foreground">{content.opportunity.description}</p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Question */}
      <Card className="border-0 bg-gradient-to-l from-violet-500/5 to-purple-500/5 shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-violet-600 font-medium mb-0.5">سؤال اليوم</p>
              <p className="font-semibold text-foreground">{content.question.text}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {content.question.options.map((option) => (
              <Button
                key={option}
                variant={selectedAnswer === option ? "default" : "outline"}
                size="sm"
                className={`text-sm ${selectedAnswer === option ? '' : 'border-violet-200 hover:bg-violet-50'}`}
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>

          {showResult && (
            <div className="mt-3 p-3 rounded-lg bg-violet-100/50 text-center">
              <p className="text-sm text-violet-700">شكراً لمشاركتك! ✨</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Fact */}
      <Card className="border-0 bg-gradient-to-l from-sky-500/5 to-blue-500/5 shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <p className="text-xs text-sky-600 font-medium mb-0.5">معلومة اليوم</p>
              <p className="text-foreground font-medium">{content.fact}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
