import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Shield, FileText, Briefcase, AlertCircle } from 'lucide-react';

const policies = [
  {
    icon: Shield,
    title: 'سياسة الخصوصية',
    sections: [
      {
        subtitle: 'جمع البيانات',
        content: 'نجمع فقط البيانات الضرورية لتقديم خدماتنا: الاسم، البريد الإلكتروني، ومعلومات الدراسة. لا نشارك بياناتك مع أطراف ثالثة دون موافقتك.',
      },
      {
        subtitle: 'استخدام البيانات',
        content: 'نستخدم بياناتك لتخصيص تجربتك، إرسال إشعارات مهمة، وربطك بالفرص المناسبة. يمكنك طلب حذف بياناتك في أي وقت.',
      },
      {
        subtitle: 'أمان البيانات',
        content: 'نستخدم تشفيرًا متقدمًا لحماية بياناتك. نراجع إجراءاتنا الأمنية دوريًا لضمان أعلى مستويات الحماية.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'قواعد الاستخدام',
    sections: [
      {
        subtitle: 'السلوك المقبول',
        content: 'يُتوقع من جميع المستخدمين التعامل باحترام ومهنية. لا يُسمح بالتنمر أو المحتوى المسيء أو انتحال الهوية.',
      },
      {
        subtitle: 'المحتوى',
        content: 'المستخدم مسؤول عن أي محتوى يرفعه. يحق للاتحاد إزالة أي محتوى مخالف دون إشعار مسبق.',
      },
      {
        subtitle: 'الحساب',
        content: 'كل مستخدم مسؤول عن حسابه. مشاركة بيانات الدخول ممنوعة وقد تؤدي لإيقاف الحساب.',
      },
    ],
  },
  {
    icon: Briefcase,
    title: 'سياسة الوظائف والفرص',
    sections: [
      {
        subtitle: 'نشر الفرص',
        content: 'تُنشر الفرص من جهات موثوقة فقط بعد التحقق منها. الاتحاد غير مسؤول عن قرارات التوظيف النهائية.',
      },
      {
        subtitle: 'التقديم',
        content: 'تقديم معلومات صحيحة إلزامي. تقديم معلومات مضللة قد يؤدي لإلغاء الترشيح وإيقاف الحساب.',
      },
      {
        subtitle: 'الأولوية',
        content: 'بعض الفرص متاحة حصريًا للمتطوعين النشطين أو من أتم دورات محددة، كجزء من نظام المكافآت.',
      },
    ],
  },
];

const Policies = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="السياسات والقوانين" showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* Intro */}
        <Card className="border-0 shadow-soft mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-2">التزامنا تجاهك</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  نلتزم بالشفافية في جميع تعاملاتنا. اقرأ هذه السياسات لتفهم حقوقك ومسؤولياتك كعضو في منصة الاتحاد.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Sections */}
        <div className="space-y-6">
          {policies.map((policy) => {
            const Icon = policy.icon;
            return (
              <Card key={policy.title} className="border-0 shadow-soft">
                <CardContent className="p-6">
                  {/* Policy Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{policy.title}</h3>
                  </div>

                  {/* Policy Content */}
                  <div className="space-y-5">
                    {policy.sections.map((section, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-foreground mb-2">{section.subtitle}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Last Updated */}
        <p className="text-center text-muted-foreground text-xs mt-8">
          آخر تحديث: يناير 2025
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Policies;
