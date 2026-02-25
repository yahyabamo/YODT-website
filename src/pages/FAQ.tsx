import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';

const faqs = [
  {
    question: 'كيف أسجل في الاتحاد؟',
    answer: 'يمكنك التسجيل من خلال التطبيق بإدخال بياناتك الشخصية، أو زيارة مقر الاتحاد في إسطنبول. ستحتاج إلى صورة من جواز السفر وإثبات القيد الجامعي.',
  },
  {
    question: 'كيف أحصل على النقاط؟',
    answer: 'تحصل على النقاط من خلال حضور الأنشطة والفعاليات، المشاركة في الورش التدريبية، التطوع في أنشطة الاتحاد، والمشاركة في المسابقات الثقافية.',
  },
  {
    question: 'ما فائدة النقاط؟',
    answer: 'النقاط تحدد ترتيبك بين الطلاب، وتؤهلك للحصول على جوائز ومكافآت، وأولوية في بعض الأنشطة المميزة، وشهادات تقدير من الاتحاد.',
  },
  {
    question: 'كيف أسجل حضوري في نشاط؟',
    answer: 'اذهب إلى صفحة الأنشطة، اختر النشاط المطلوب، واضغط على زر "تسجيل الحضور". تأكد من التسجيل قبل الموعد المحدد.',
  },
  {
    question: 'هل يمكنني إلغاء تسجيلي في نشاط؟',
    answer: 'نعم، يمكنك إلغاء التسجيل قبل 24 ساعة من موعد النشاط من خلال صفحة الأنشطة.',
  },
  {
    question: 'كيف أتواصل مع الاتحاد؟',
    answer: 'يمكنك التواصل معنا عبر البريد الإلكتروني: info@ysu-istanbul.org أو عبر حساباتنا على وسائل التواصل الاجتماعي، أو زيارة مقر الاتحاد.',
  },
  {
    question: 'هل العضوية مجانية؟',
    answer: 'نعم، العضوية في الاتحاد مجانية تماماً لجميع الطلاب اليمنيين في تركيا.',
  },
  {
    question: 'كيف أصبح متطوعاً في الاتحاد؟',
    answer: 'يمكنك التقدم للتطوع من خلال ملء استمارة التطوع المتاحة في مقر الاتحاد أو التواصل معنا عبر البريد الإلكتروني.',
  },
];

const FAQ = () => {
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

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card rounded-xl border border-border/50 shadow-soft px-4 animate-slide-up overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <AccordionTrigger className="text-right py-4 hover:no-underline">
                <span className="font-medium text-sm">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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
