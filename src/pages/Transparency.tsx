import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Heart, Briefcase, GraduationCap, TrendingUp, Building2, HandHeart, Award } from 'lucide-react';

const stats = [
  { 
    icon: Users, 
    value: '2,450', 
    label: 'عضو مسجل', 
    change: '+120 هذا الشهر',
    color: 'bg-primary/10 text-primary' 
  },
  { 
    icon: Heart, 
    value: '185', 
    label: 'متطوع نشط', 
    change: '+15 هذا الشهر',
    color: 'bg-rose-500/10 text-rose-500' 
  },
  { 
    icon: Briefcase, 
    value: '342', 
    label: 'فرصة وظيفية', 
    change: 'منذ التأسيس',
    color: 'bg-amber-500/10 text-amber-600' 
  },
  { 
    icon: GraduationCap, 
    value: '1,890', 
    label: 'شهادة صادرة', 
    change: '+230 هذا الشهر',
    color: 'bg-emerald-500/10 text-emerald-600' 
  },
];

const supportStats = [
  { icon: Building2, value: '28', label: 'جهة داعمة' },
  { icon: HandHeart, value: '₺45,000', label: 'دعم مقدم للطلاب' },
  { icon: Award, value: '156', label: 'دورة تدريبية مكتملة' },
];

const recentAchievements = [
  { date: 'ديسمبر 2024', title: 'شراكة جديدة مع 5 شركات توظيف' },
  { date: 'نوفمبر 2024', title: 'إطلاق برنامج المنح الدراسية' },
  { date: 'أكتوبر 2024', title: 'تخريج 200 طالب من الأكاديمية' },
  { date: 'سبتمبر 2024', title: 'افتتاح مقر الاتحاد الجديد' },
];

const Transparency = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="الشفافية والأرقام" showBack />
      
      <div className="px-4 py-6 space-y-6">
        {/* Intro */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            نؤمن بالشفافية الكاملة. هذه أرقامنا الحقيقية.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-soft">
              <CardContent className="p-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {stat.label}
                </div>
                <div className="text-xs text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Stats */}
        <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 text-center">
              الدعم والإنجازات
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {supportStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-background flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              آخر الإنجازات
            </h3>
            <div className="space-y-4">
              {recentAchievements.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{item.date}</div>
                    <div className="text-sm text-foreground">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trust Badge */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-sm">
            <Award className="w-4 h-4" />
            منظمة موثوقة ومسجلة رسمياً
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Transparency;
