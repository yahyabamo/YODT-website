import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { guideSections, faqItems } from '@/data/mockData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Guide = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="دليل الطالب الجديد" showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* Intro */}
        <Card className="border-0 shadow-soft mb-6 animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <h2 className="font-semibold text-foreground">مرحباً بك في تركيا</h2>
                <p className="text-sm text-muted-foreground">دليلك الشامل للبداية الصحيحة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Sections */}
        <h2 className="font-semibold text-foreground mb-3">الأدلة الأساسية</h2>
        <div className="space-y-3 mb-8">
          {guideSections.map((section, index) => (
            <Card 
              key={section.id}
              className="border-0 shadow-soft animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Accordion type="single" collapsible>
                <AccordionItem value={section.id} className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      <span className="font-medium text-foreground">{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <ul className="space-y-2">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="font-semibold text-foreground mb-3">الأسئلة الشائعة</h2>
        <Card className="border-0 shadow-soft">
          <Accordion type="single" collapsible>
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="border-b border-border last:border-0"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline text-right">
                  <span className="font-medium text-foreground text-sm">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Guide;