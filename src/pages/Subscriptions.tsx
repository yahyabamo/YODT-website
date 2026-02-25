import { CreditCard, Check, Crown, Sparkles, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: React.ElementType;
  features: string[];
  popular?: boolean;
  color: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'العضوية الأساسية',
    price: 0,
    period: 'مجاناً',
    icon: Shield,
    features: [
      'حضور الأنشطة العامة',
      'تجميع النقاط',
      'الوصول للأخبار والإعلانات',
    ],
    color: 'from-gray-400 to-gray-500',
  },
  {
    id: 'premium',
    name: 'العضوية المميزة',
    price: 50,
    period: 'شهرياً',
    icon: Sparkles,
    features: [
      'جميع مميزات العضوية الأساسية',
      'أولوية التسجيل في الأنشطة',
      'خصومات حصرية من الشركاء',
      'شهادات حضور معتمدة',
    ],
    popular: true,
    color: 'from-primary to-primary/80',
  },
  {
    id: 'gold',
    name: 'العضوية الذهبية',
    price: 100,
    period: 'شهرياً',
    icon: Crown,
    features: [
      'جميع مميزات العضوية المميزة',
      'دعوات VIP للفعاليات الخاصة',
      'استشارات أكاديمية شخصية',
      'نقاط مضاعفة على كل نشاط',
      'بطاقة عضوية ذهبية',
    ],
    color: 'from-yellow-500 to-yellow-600',
  },
];

const Subscriptions = () => {
  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (plan.price === 0) {
      toast.info('أنت مشترك بالفعل في العضوية الأساسية');
    } else {
      toast.success(`تم إرسال طلب الاشتراك في ${plan.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الاشتراكات" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-4 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-2">خطط الاشتراك</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            اختر الخطة المناسبة لك واستمتع بمزايا حصرية
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-4">
          {subscriptionPlans.map((plan, index) => (
            <Card 
              key={plan.id}
              className={cn(
                "shadow-soft animate-slide-up overflow-hidden relative",
                plan.popular && "ring-2 ring-primary shadow-card"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-xs text-center py-1 font-medium">
                  الأكثر شعبية
                </div>
              )}
              <CardContent className={cn("p-6", plan.popular && "pt-10")}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                    plan.color
                  )}>
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      {plan.price > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-primary">{plan.price}</span>
                          <span className="text-sm text-muted-foreground">ليرة / {plan.period}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  className={cn(
                    "w-full mt-4",
                    plan.price === 0 ? "variant-outline" : ""
                  )}
                  variant={plan.price === 0 ? "outline" : "default"}
                >
                  {plan.price === 0 ? 'مشترك حالياً' : 'اشترك الآن'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          يمكنك إلغاء الاشتراك في أي وقت • جميع الأسعار بالليرة التركية
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Subscriptions;
