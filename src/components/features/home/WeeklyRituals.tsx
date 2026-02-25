import { useState, useEffect } from 'react';
import { Trophy, Target, Zap, Calendar, CheckCircle2, Circle, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
}

interface WeeklyData {
  question: { text: string; options: string[] };
  challenge: { title: string; description: string; reward: string };
  opportunity: { title: string; description: string; deadline: string };
}

const weeklyContents: WeeklyData[] = [
  {
    question: { text: 'ما هي أكبر إنجازاتك هذا الأسبوع؟', options: ['أنهيت دورة', 'حضرت نشاط', 'ساعدت زميل', 'تعلمت شيء جديد'] },
    challenge: { title: 'تحدي القراءة', description: 'اقرأ 3 مقالات تعليمية', reward: '30 نقطة' },
    opportunity: { title: 'ورشة عمل مجانية', description: 'تعلم مهارات العرض', deadline: 'الخميس' }
  },
  {
    question: { text: 'ما الذي تود تحقيقه الأسبوع القادم؟', options: ['إكمال مشروع', 'تعلم مهارة', 'التواصل أكثر', 'تنظيم وقتي'] },
    challenge: { title: 'تحدي التواصل', description: 'تعرف على 2 طلاب جدد', reward: '25 نقطة' },
    opportunity: { title: 'فرصة تطوع', description: 'المساعدة في تنظيم فعالية', deadline: 'السبت' }
  },
  {
    question: { text: 'كيف كان أداؤك الدراسي؟', options: ['ممتاز', 'جيد', 'متوسط', 'أحتاج مساعدة'] },
    challenge: { title: 'تحدي المساعدة', description: 'ساعد زميلاً في دراسته', reward: '35 نقطة' },
    opportunity: { title: 'جلسة إرشاد', description: 'مع خريج ناجح', deadline: 'الأربعاء' }
  },
  {
    question: { text: 'ما أكثر ما استمتعت به هذا الأسبوع؟', options: ['الدراسة', 'الأصدقاء', 'نشاط جديد', 'وقت الراحة'] },
    challenge: { title: 'تحدي المحتوى', description: 'شاهد 5 فيديوهات تعليمية', reward: '20 نقطة' },
    opportunity: { title: 'مسابقة المعرفة', description: 'اختبر معلوماتك العامة', deadline: 'الجمعة' }
  },
];

const weeklyTasks: WeeklyChallenge[] = [
  { id: '1', title: 'حضور نشاط', description: 'شارك في أي نشاط للاتحاد', points: 20, completed: false },
  { id: '2', title: 'إكمال درس', description: 'أنهِ درساً من الأكاديمية', points: 15, completed: false },
  { id: '3', title: 'مشاركة تجربة', description: 'اكتب في مجتمع الطلاب', points: 10, completed: false },
  { id: '4', title: 'مساعدة زميل', description: 'قدم مساعدة لطالب آخر', points: 25, completed: false },
];

export const WeeklyRituals = () => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData>(weeklyContents[0]);
  const [tasks, setTasks] = useState<WeeklyChallenge[]>(weeklyTasks);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const weekOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24 * 7));
    const contentIndex = weekOfYear % weeklyContents.length;
    setWeeklyData(weeklyContents[contentIndex]);

    // Load completed tasks from localStorage
    const savedTasks = localStorage.getItem('weeklyTasks');
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      // Reset if it's a new week
      const savedWeek = localStorage.getItem('currentWeek');
      if (savedWeek !== weekOfYear.toString()) {
        localStorage.setItem('currentWeek', weekOfYear.toString());
        setTasks(weeklyTasks);
      } else {
        setTasks(parsed);
      }
    }
  }, []);

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('weeklyTasks', JSON.stringify(updatedTasks));
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <div className="space-y-4">
      {/* Weekly Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">طقوس الأسبوع</h2>
            <p className="text-xs text-muted-foreground">تحديات ومكافآت أسبوعية</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">{totalPoints}</span>
        </div>
      </div>

      {/* Weekly Progress */}
      <Card className="border-0 shadow-soft bg-gradient-to-l from-orange-500/5 to-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">تقدم الأسبوع</span>
            <span className="text-sm text-muted-foreground">{completedTasks}/{tasks.length} مهام</span>
          </div>
          <Progress value={progress} className="h-2 mb-3" />

          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${task.completed
                    ? 'bg-emerald-100/50 border border-emerald-200'
                    : 'bg-background border border-border hover:border-primary/30'
                  }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="flex-1 text-right">
                  <p className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
                <span className={`text-xs font-bold ${task.completed ? 'text-emerald-500' : 'text-primary'}`}>
                  +{task.points}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      <Card className="border-0 shadow-soft bg-gradient-to-l from-violet-500/5 to-purple-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-violet-600 font-medium">تحدي الأسبوع</p>
              <p className="font-semibold text-foreground">{weeklyData.challenge.title}</p>
            </div>
            <div className="flex items-center gap-1 bg-violet-100 px-2 py-1 rounded-full">
              <Gift className="w-3 h-3 text-violet-600" />
              <span className="text-xs font-bold text-violet-600">{weeklyData.challenge.reward}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{weeklyData.challenge.description}</p>
          <Button variant="outline" size="sm" className="w-full border-violet-200 text-violet-600 hover:bg-violet-50">
            <Zap className="w-4 h-4 ml-2" />
            قبول التحدي
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Question */}
      <Card className="border-0 shadow-soft bg-gradient-to-l from-sky-500/5 to-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <span className="text-lg">🤔</span>
            </div>
            <div>
              <p className="text-xs text-sky-600 font-medium">سؤال الأسبوع</p>
              <p className="font-semibold text-foreground">{weeklyData.question.text}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {weeklyData.question.options.map((option) => (
              <Button
                key={option}
                variant={selectedAnswer === option ? "default" : "outline"}
                size="sm"
                className={`text-sm ${selectedAnswer === option ? '' : 'border-sky-200 hover:bg-sky-50'}`}
                onClick={() => setSelectedAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Opportunity */}
      <Card className="border-0 shadow-soft bg-gradient-to-l from-emerald-500/5 to-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">فرصة الأسبوع</p>
                <p className="font-semibold text-foreground">{weeklyData.opportunity.title}</p>
                <p className="text-sm text-muted-foreground">{weeklyData.opportunity.description}</p>
              </div>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              {weeklyData.opportunity.deadline}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
