import { useState } from 'react';
import { 
  Users, Star, Award, CheckCircle, ChevronLeft, 
  Megaphone, Calendar, Heart, Code, GraduationCap, Handshake
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { currentStudent } from '@/data/mockData';
import { toast } from 'sonner';

interface VolunteerArea {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tasks: string[];
  points: number;
  levels: string[];
}

const volunteerAreas: VolunteerArea[] = [
  {
    id: 'media',
    title: 'الإعلام',
    description: 'التصوير والتصميم وإدارة وسائل التواصل',
    icon: Megaphone,
    color: 'bg-rose-500',
    tasks: ['تصوير الفعاليات', 'تصميم البوسترات', 'كتابة المحتوى', 'إدارة السوشيال ميديا'],
    points: 50,
    levels: ['مصور', 'مصمم', 'كاتب محتوى', 'مدير إعلامي']
  },
  {
    id: 'organization',
    title: 'التنظيم',
    description: 'تنظيم الفعاليات والأنشطة',
    icon: Calendar,
    color: 'bg-blue-500',
    tasks: ['التخطيط للفعاليات', 'التنسيق اللوجستي', 'استقبال الضيوف', 'إدارة القاعات'],
    points: 40,
    levels: ['منظم مساعد', 'منظم', 'مشرف فعاليات', 'مدير تنظيم']
  },
  {
    id: 'relations',
    title: 'العلاقات',
    description: 'بناء العلاقات مع المؤسسات والجهات',
    icon: Handshake,
    color: 'bg-emerald-500',
    tasks: ['التواصل مع الشركاء', 'تمثيل الاتحاد', 'متابعة الاتفاقيات', 'خدمة الأعضاء'],
    points: 45,
    levels: ['مندوب', 'منسق علاقات', 'مسؤول شراكات', 'مدير علاقات']
  },
  {
    id: 'tech',
    title: 'التقنية',
    description: 'الدعم التقني والتطوير البرمجي',
    icon: Code,
    color: 'bg-violet-500',
    tasks: ['تطوير المنصة', 'الدعم الفني', 'إدارة البيانات', 'تدريب الأعضاء'],
    points: 55,
    levels: ['مطور مبتدئ', 'مطور', 'مطور أول', 'مدير تقني']
  },
  {
    id: 'education',
    title: 'التعليم',
    description: 'التدريب والتوجيه الأكاديمي',
    icon: GraduationCap,
    color: 'bg-amber-500',
    tasks: ['تقديم ورش عمل', 'التوجيه الأكاديمي', 'إعداد المحتوى التعليمي', 'المساعدة الدراسية'],
    points: 50,
    levels: ['مساعد تدريب', 'مدرب', 'مرشد أكاديمي', 'مدير تعليم']
  }
];

const levels = [
  {
    id: 'volunteer',
    title: 'متطوع',
    description: 'المستوى الأول في برنامج التطوع',
    requirements: 'حضور 3 أنشطة تطوعية',
    benefits: ['شهادة تطوع', 'نقاط إضافية'],
    icon: '🌱',
    isCompleted: true,
  },
  {
    id: 'active',
    title: 'متطوع نشط',
    description: 'متطوع متميز بمشاركة فعالة',
    requirements: 'إتمام 10 أنشطة + تقييم إيجابي',
    benefits: ['أولوية في الفرص', 'شهادة متقدمة', 'عضوية مجانية'],
    icon: '⭐',
    isCompleted: currentStudent.volunteerLevel === 'active' || currentStudent.volunteerLevel === 'leader',
    isCurrent: currentStudent.volunteerLevel === 'active',
  },
  {
    id: 'leader',
    title: 'متطوع قيادي',
    description: 'قائد فريق تطوعي معتمد',
    requirements: 'قيادة 5 فعاليات + تدريب قيادي',
    benefits: ['خطاب توصية رسمي', 'فرص حصرية', 'عضوية VIP', 'أولوية التوظيف'],
    icon: '👑',
    isCompleted: currentStudent.volunteerLevel === 'leader',
  },
];

const Volunteers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'areas' | 'levels'>('areas');
  const [selectedArea, setSelectedArea] = useState<VolunteerArea | null>(null);

  const handleJoinArea = (areaId: string) => {
    toast.success('تم تسجيلك في هذا المجال بنجاح');
    setSelectedArea(null);
  };

  const handleJoin = () => {
    toast.success('تم تسجيلك في برنامج المتطوعين');
  };

  const gender = localStorage.getItem('userGender');
  const isStudent = gender === 'male';

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="برنامج المتطوعين" showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* Intro Card */}
        <Card className="border-0 shadow-soft mb-6 animate-slide-up bg-primary text-primary-foreground">
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-bold text-lg">
                  {isStudent ? 'التطوع طريقك للتميز' : 'التطوع طريقكِ للتميز'}
                </h2>
                <p className="text-primary-foreground/80 text-sm">فرص حقيقية ومزايا استثنائية</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {isStudent 
                ? 'برنامج المتطوعين يمنحك فرصة للتطور الشخصي والمهني، مع مزايا حصرية تفتح لك أبواب النجاح.'
                : 'برنامج المتطوعات يمنحكِ فرصة للتطور الشخصي والمهني، مع مزايا حصرية تفتح لكِ أبواب النجاح.'
              }
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'areas' ? 'default' : 'outline'}
            onClick={() => setActiveTab('areas')}
            className="flex-1 h-12 rounded-xl"
          >
            مجالات التطوع
          </Button>
          <Button
            variant={activeTab === 'levels' ? 'default' : 'outline'}
            onClick={() => setActiveTab('levels')}
            className="flex-1 h-12 rounded-xl"
          >
            المستويات
          </Button>
        </div>

        {/* Areas Tab */}
        {activeTab === 'areas' && (
          <div className="space-y-4">
            {volunteerAreas.map((area, index) => (
              <Card 
                key={area.id}
                className="border-0 shadow-soft animate-slide-up cursor-pointer hover:shadow-card transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedArea(area)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${area.color} flex items-center justify-center text-white shrink-0`}>
                      <area.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground">{area.title}</h3>
                        <div className="flex items-center gap-1 text-warning">
                          <Star className="h-4 w-4 fill-warning" />
                          <span className="text-sm font-medium">+{area.points}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{area.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {area.tasks.slice(0, 2).map((task) => (
                          <span 
                            key={task}
                            className="px-2 py-1 bg-secondary text-xs rounded-lg text-muted-foreground"
                          >
                            {task}
                          </span>
                        ))}
                        {area.tasks.length > 2 && (
                          <span className="px-2 py-1 bg-secondary text-xs rounded-lg text-muted-foreground">
                            +{area.tasks.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Levels Tab */}
        {activeTab === 'levels' && (
          <>
            {/* Current Status */}
            <Card className="border-0 shadow-soft mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {isStudent ? 'مستواك الحالي' : 'مستواكِ الحالي'}
                    </p>
                    <p className="font-bold text-lg text-foreground">
                      {currentStudent.volunteerLevel === 'none' ? 'غير مسجل' :
                       currentStudent.volunteerLevel === 'volunteer' ? 'متطوع' :
                       currentStudent.volunteerLevel === 'active' ? 'متطوع نشط' : 'متطوع قيادي'}
                    </p>
                  </div>
                  <div className="text-4xl">
                    {currentStudent.volunteerLevel === 'none' ? '🌱' :
                     currentStudent.volunteerLevel === 'volunteer' ? '🌱' :
                     currentStudent.volunteerLevel === 'active' ? '⭐' : '👑'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Levels */}
            <h2 className="font-semibold text-foreground mb-3">مستويات التطوع</h2>
            <div className="space-y-3">
              {levels.map((level, index) => (
                <Card 
                  key={level.id}
                  className={`border-0 shadow-soft animate-slide-up ${
                    level.isCurrent ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">{level.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{level.title}</h3>
                          {level.isCompleted && (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                          {level.isCurrent && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              {isStudent ? 'أنت هنا' : 'أنتِ هنا'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                    </div>

                    <div className="bg-secondary rounded-xl p-3 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">المتطلبات:</p>
                      <p className="text-sm text-foreground">{level.requirements}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">المزايا:</p>
                      <div className="flex flex-wrap gap-2">
                        {level.benefits.map((benefit) => (
                          <span 
                            key={benefit}
                            className="px-2 py-1 bg-success/10 text-success text-xs rounded-lg flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Join Button */}
            {currentStudent.volunteerLevel === 'none' && (
              <Button onClick={handleJoin} className="w-full mt-6 h-14 rounded-xl text-lg" size="lg">
                انضم لبرنامج المتطوعين
              </Button>
            )}
          </>
        )}

        {/* Area Detail Modal */}
        {selectedArea && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-background w-full rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
              <div className="sticky top-0 bg-background p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{selectedArea.title}</h2>
                  <button 
                    onClick={() => setSelectedArea(null)}
                    className="p-2 hover:bg-muted rounded-full"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-6">
                <div className={`w-20 h-20 rounded-2xl ${selectedArea.color} flex items-center justify-center text-white mx-auto`}>
                  <selectedArea.icon className="h-10 w-10" />
                </div>

                <p className="text-center text-muted-foreground">{selectedArea.description}</p>

                <div>
                  <h3 className="font-semibold mb-3">المهام المتاحة</h3>
                  <div className="space-y-2">
                    {selectedArea.tasks.map((task) => (
                      <div key={task} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">مسار الترقية</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedArea.levels.map((level, index) => (
                      <div 
                        key={level}
                        className="flex-shrink-0 flex flex-col items-center"
                      >
                        <div className={`w-12 h-12 rounded-full ${index === 0 ? selectedArea.color : 'bg-muted'} flex items-center justify-center text-white font-bold`}>
                          {index + 1}
                        </div>
                        <span className="text-xs mt-2 text-center">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-warning/10 rounded-xl">
                  <span className="font-medium">النقاط لكل مهمة</span>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="h-5 w-5 fill-warning" />
                    <span className="font-bold text-lg">+{selectedArea.points}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleJoinArea(selectedArea.id)} 
                  className="w-full h-14 rounded-xl text-lg"
                >
                  {isStudent ? 'انضم لهذا المجال' : 'انضمي لهذا المجال'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Volunteers;
