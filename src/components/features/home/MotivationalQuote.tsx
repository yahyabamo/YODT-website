import { useEffect, useState } from 'react';

const quotes = [
  { text: 'العلم نور والجهل ظلام', author: 'حكمة عربية', textEn: 'Knowledge is light and ignorance is darkness', authorEn: 'Arab Proverb' },
  { text: 'من طلب العلا سهر الليالي', author: 'الإمام الشافعي', textEn: 'Those who seek excellence endure sleepless nights', authorEn: 'Imam Al-Shafi\'i' },
  { text: 'إذا المرء لم يدنس من اللؤم عرضه، فكل رداء يرتديه جميل', author: 'المتنبي', textEn: 'If a person\'s honor is untainted by meanness, every garment they wear is beautiful', authorEn: 'Al-Mutanabbi' },
  { text: 'ليس الفتى من يقول كان أبي، إنما الفتى من يقول ها أنا ذا', author: 'أحمد شوقي', textEn: 'A youth is not one who says "this was my father", but one who says "here I stand"', authorEn: 'Ahmed Shawqi' },
  { text: 'لا تستسلم، فالبدايات دائماً صعبة', author: 'حكمة', textEn: 'Never give up — beginnings are always hard', authorEn: 'Wisdom' },
  { text: 'الغربة ليست عقوبة، بل فرصة للتميز', author: 'حكمة الطالب', textEn: 'Living abroad is not a punishment, it is an opportunity to excel', authorEn: 'Student Wisdom' },
  { text: 'أنت أقوى مما تظن وأقرب للنجاح مما تتخيل', author: 'تحفيز', textEn: 'You are stronger than you think and closer to success than you imagine', authorEn: 'Motivation' },
  { text: 'العلم في الصغر كالنقش على الحجر', author: 'حديث شريف', textEn: 'Knowledge in youth is like engraving in stone', authorEn: 'Hadith' },
  { text: 'من سار على الدرب وصل', author: 'مثل عربي', textEn: 'Whoever walks the path will reach the destination', authorEn: 'Arab Proverb' },
  { text: 'اليمن تنتظر عودتك ناجحاً', author: 'رسالة لكل طالب', textEn: 'Yemen awaits your successful return', authorEn: 'A Message to Every Student' },
  { text: 'الصبر مفتاح الفرج', author: 'حكمة إسلامية', textEn: 'Patience is the key to relief', authorEn: 'Islamic Wisdom' },
  { text: 'كن التغيير الذي تريد رؤيته في العالم', author: 'غاندي', textEn: 'Be the change you wish to see in the world', authorEn: 'Gandhi' },
];

export const MotivationalQuote = () => {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setQuote(quotes[dayOfYear % quotes.length]);
  }, []);

  return (
    <section id="motivational-quote">
      <div className="quote-inner reveal">
        <span className="quote-mark" aria-hidden="true">"</span>
        <p className="quote-text">
          <span className="ar-only">{quote.text}</span>
          <span className="en-only">{quote.textEn}</span>
        </p>
        <p className="quote-author">
          <span className="ar-only">— {quote.author}</span>
          <span className="en-only">— {quote.authorEn}</span>
        </p>
      </div>
    </section>
  );
};
