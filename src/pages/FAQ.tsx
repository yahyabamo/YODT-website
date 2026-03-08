import { HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';

const FAQ = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب الأسئلة من قاعدة البيانات
  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('type', 'faq') // جلب البيانات من نوع الأسئلة فقط
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching FAQs:', error);
      } else {
        setFaqs(data || []);
      }
      setLoading(false);
    };

    fetchFaqs();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الأسئلة الشائعة" />

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center py-6 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-2">كيف يمكننا مساعدتك؟</h2>
          <p className="text-sm text-muted-foreground">
            إجابات على الأسئلة الأكثر شيوعاً
          </p>
        </div>

        {/* FAQ Accordion - الآن يقرأ من قاعدة البيانات */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border/50 shadow-soft px-4 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <AccordionTrigger className="text-right py-4 hover:no-underline">
                  <span className="font-medium text-sm">{faq.title}</span> {/* title هو السؤال */}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.content} {/* content هي الإجابة */}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* إذا لم تكن هناك أسئلة */}
        {!loading && faqs.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            لا توجد أسئلة حالياً.
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-8 p-6 bg-primary/5 rounded-2xl text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-muted-foreground mb-3">
            لم تجد إجابة لسؤالك؟
          </p>
          <button className="px-6 py-2 rounded-full gradient-primary text-primary-foreground font-medium text-sm shadow-soft hover:shadow-card transition-all">
            تواصل معنا
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FAQ;