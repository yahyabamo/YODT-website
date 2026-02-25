import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const quotes = [
  { text: 'العلم نور والجهل ظلام', author: 'حكمة عربية' },
  { text: 'من طلب العلا سهر الليالي', author: 'الإمام الشافعي' },
  { text: 'إذا المرء لم يدنس من اللؤم عرضه، فكل رداء يرتديه جميل', author: 'المتنبي' },
  { text: 'ليس الفتى من يقول كان أبي، إنما الفتى من يقول ها أنا ذا', author: 'أحمد شوقي' },
  { text: 'الناجحون يبحثون دائماً عن الفرص لمساعدة الآخرين', author: 'براين تريسي' },
  { text: 'لا تستسلم، فالبدايات دائماً صعبة', author: 'حكمة' },
  { text: 'النجاح ليس نهائياً والفشل ليس قاتلاً', author: 'ونستون تشرشل' },
  { text: 'تعلّم من الأمس، عش اليوم، وتطلّع للغد', author: 'ألبرت أينشتاين' },
  { text: 'الغربة ليست عقوبة، بل فرصة للتميز', author: 'حكمة الطالب' },
  { text: 'أنت أقوى مما تظن وأقرب للنجاح مما تتخيل', author: 'تحفيز' },
  { text: 'العلم في الصغر كالنقش على الحجر', author: 'حديث شريف' },
  { text: 'من سار على الدرب وصل', author: 'مثل عربي' },
  { text: 'اليمن تنتظر عودتك ناجحاً', author: 'رسالة لكل طالب' },
  { text: 'الصبر مفتاح الفرج', author: 'حكمة إسلامية' },
  { text: 'كن التغيير الذي تريد رؤيته في العالم', author: 'غاندي' },
];

export const MotivationalQuote = () => {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Get quote based on day of year for daily change
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;
    setQuote(quotes[quoteIndex]);
  }, []);

  return (
    <div className="bg-gradient-to-l from-primary/5 to-amber-500/5 rounded-2xl p-4 border border-primary/10">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="text-foreground font-medium mb-1">"{quote.text}"</p>
          <p className="text-sm text-muted-foreground">— {quote.author}</p>
        </div>
      </div>
    </div>
  );
};
