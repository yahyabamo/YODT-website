import { Percent, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { SuggestionBoxes } from '@/components/SuggestionBoxes';

interface Discount {
  id: string;
  supporter: string;
  logo: string;
  discountPercent: number;
  description: string;
  location: string;
  validUntil: string;
  category: 'food' | 'education' | 'services' | 'shopping';
}

const discounts: Discount[] = [
  {
    id: '1',
    supporter: 'مطعم اليمن الأصيل',
    logo: '🍽️',
    discountPercent: 20,
    description: 'خصم على جميع الوجبات الرئيسية',
    location: 'شارع الاستقلال، إسطنبول',
    validUntil: '2025-06-30',
    category: 'food',
  },
  {
    id: '2',
    supporter: 'مركز اللغات الدولي',
    logo: '🌍',
    discountPercent: 30,
    description: 'خصم على دورات اللغة التركية والإنجليزية',
    location: 'منطقة تقسيم، إسطنبول',
    validUntil: '2025-12-31',
    category: 'education',
  },
  {
    id: '3',
    supporter: 'مكتبة العلم والمعرفة',
    logo: '📚',
    discountPercent: 15,
    description: 'خصم على جميع الكتب والقرطاسية',
    location: 'منطقة الفاتح، إسطنبول',
    validUntil: '2025-08-31',
    category: 'shopping',
  },
  {
    id: '4',
    supporter: 'مركز الطباعة السريعة',
    logo: '🖨️',
    discountPercent: 25,
    description: 'خصم على خدمات الطباعة والتصوير',
    location: 'بالقرب من جامعة إسطنبول',
    validUntil: '2025-07-31',
    category: 'services',
  },
  {
    id: '5',
    supporter: 'صالة الرياضة الحديثة',
    logo: '🏋️',
    discountPercent: 40,
    description: 'خصم على الاشتراك الشهري والسنوي',
    location: 'منطقة كاديكوي، إسطنبول',
    validUntil: '2025-09-30',
    category: 'services',
  },
  {
    id: '6',
    supporter: 'مقهى الطلاب',
    logo: '☕',
    discountPercent: 10,
    description: 'خصم على جميع المشروبات',
    location: 'بالقرب من مقر الاتحاد',
    validUntil: '2025-12-31',
    category: 'food',
  },
];

const categoryLabels = {
  food: 'مطاعم وكافيهات',
  education: 'تعليم',
  services: 'خدمات',
  shopping: 'تسوق',
};

const categoryColors = {
  food: 'bg-orange-500/10 text-orange-600',
  education: 'bg-blue-500/10 text-blue-600',
  services: 'bg-purple-500/10 text-purple-600',
  shopping: 'bg-green-500/10 text-green-600',
};

const Discounts = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الخصومات والعروض" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5 animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Percent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary">خصومات حصرية للأعضاء</h3>
                <p className="text-xs text-muted-foreground">
                  أظهر بطاقة العضوية للحصول على الخصم
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discounts List */}
        <div className="space-y-3">
          {discounts.map((discount, index) => (
            <Card
              key={discount.id}
              className="shadow-soft hover:shadow-card transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
                    {discount.logo}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm">{discount.supporter}</h3>
                      <Badge className="bg-secondary text-secondary-foreground shrink-0">
                        {discount.discountPercent}% خصم
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {discount.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {discount.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className={categoryColors[discount.category]}>
                        {categoryLabels[discount.category]}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        حتى {discount.validUntil}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          * يرجى إظهار بطاقة العضوية الرقمية عند الشراء للحصول على الخصم
        </p>
      </div>

      <SuggestionBoxes page="discounts" className="mb-6" />
      <BottomNav />
    </div>
  );
};

export default Discounts;
