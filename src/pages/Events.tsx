import { ChevronRight, Calendar, Moon, Star, Flag, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';

const Events = () => {
  const navigate = useNavigate();

  const islamicEvents = [
    { name: 'ليلة الإسراء والمعراج', date: '27 رجب', hijriDate: '1446', emoji: '🌙' },
    { name: 'بداية شهر رمضان', date: '1 رمضان', hijriDate: '1446', emoji: '☪️' },
    { name: 'ليلة القدر', date: '27 رمضان', hijriDate: '1446', emoji: '✨' },
    { name: 'عيد الفطر المبارك', date: '1 شوال', hijriDate: '1446', emoji: '🎉' },
    { name: 'يوم عرفة', date: '9 ذو الحجة', hijriDate: '1446', emoji: '🕋' },
    { name: 'عيد الأضحى المبارك', date: '10 ذو الحجة', hijriDate: '1446', emoji: '🐑' },
    { name: 'رأس السنة الهجرية', date: '1 محرم', hijriDate: '1447', emoji: '📅' },
    { name: 'عاشوراء', date: '10 محرم', hijriDate: '1447', emoji: '🤲' },
    { name: 'المولد النبوي الشريف', date: '12 ربيع الأول', hijriDate: '1447', emoji: '🕌' },
  ];

  const yemeniEvents = [
    { name: 'ثورة 26 سبتمبر', date: '26 سبتمبر', year: '1962', description: 'ذكرى ثورة 26 سبتمبر المجيدة', emoji: '🇾🇪' },
    { name: 'ثورة 14 أكتوبر', date: '14 أكتوبر', year: '1963', description: 'ذكرى ثورة 14 أكتوبر', emoji: '✊' },
    { name: 'عيد الاستقلال', date: '30 نوفمبر', year: '1967', description: 'ذكرى استقلال الجنوب', emoji: '🎗️' },
    { name: 'عيد الوحدة اليمنية', date: '22 مايو', year: '1990', description: 'ذكرى إعادة تحقيق الوحدة', emoji: '🤝' },
  ];

  const unionEvents = [
    { name: 'اللقاء الشهري للطلاب', date: 'كل أول سبت من الشهر', type: 'دوري', emoji: '👥' },
    { name: 'ورشة تطوير المهارات', date: '15 يناير 2025', type: 'قادم', emoji: '📚' },
    { name: 'رحلة بورصة', date: '25 يناير 2025', type: 'قادم', emoji: '🚌' },
    { name: 'مسابقة القرآن الكريم', date: 'رمضان 1446', type: 'قادم', emoji: '📖' },
    { name: 'إفطار جماعي', date: 'رمضان 1446', type: 'قادم', emoji: '🍽️' },
    { name: 'احتفالية العيد', date: 'شوال 1446', type: 'قادم', emoji: '🎊' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الأعياد والمناسبات" showBack />

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* Islamic Events */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-foreground">المناسبات الإسلامية</h2>
          </div>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="space-y-3">
                {islamicEvents.map((event, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 py-2 ${
                      index !== islamicEvents.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <span className="text-2xl">{event.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.date} - {event.hijriDate} هـ</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Yemeni National Events */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Flag className="w-5 h-5 text-rose-500" />
            <h2 className="font-semibold text-foreground">المناسبات الوطنية اليمنية</h2>
          </div>
          <div className="space-y-2">
            {yemeniEvents.map((event, index) => (
              <Card key={index} className="border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{event.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{event.name}</h3>
                        <Badge variant="outline" className="text-xs">{event.year}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-primary mt-1">{event.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Union Events */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">فعاليات الاتحاد</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {unionEvents.map((event, index) => (
              <Card key={index} className="border-0 shadow-soft cursor-pointer hover:shadow-card transition-shadow">
                <CardContent className="p-4 text-center">
                  <span className="text-3xl block mb-2">{event.emoji}</span>
                  <h3 className="font-medium text-foreground text-sm mb-1">{event.name}</h3>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                  <Badge 
                    variant={event.type === 'دوري' ? 'secondary' : 'default'} 
                    className="text-xs mt-2"
                  >
                    {event.type}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reminder Card */}
        <Card className="border-0 shadow-soft bg-primary/5">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-foreground mb-1">لا تفوّت الفعاليات!</h3>
            <p className="text-sm text-muted-foreground">
              تابع صفحة الأنشطة للتسجيل في الفعاليات القادمة
            </p>
            <button 
              onClick={() => navigate('/activities')}
              className="text-primary text-sm font-medium mt-2 flex items-center gap-1 mx-auto"
            >
              عرض الأنشطة
              <ChevronRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Events;
