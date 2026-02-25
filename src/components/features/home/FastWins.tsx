import { Trophy, Star, Award, Zap, ChevronLeft, Gift, Video, BookOpen, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  points: number;
  progress: number;
  total: number;
  reward: string;
  color: string;
  bgColor: string;
  link: string;
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'مشاهد نشط',
    description: 'شاهد 5 فيديوهات تعليمية',
    icon: Video,
    points: 25,
    progress: 3,
    total: 5,
    reward: 'شارة المتابع النشط',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    link: '/videos'
  },
  {
    id: '2',
    title: 'متعلم مثابر',
    description: 'أكمل دورة واحدة',
    icon: BookOpen,
    points: 50,
    progress: 60,
    total: 100,
    reward: 'شهادة إتمام',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    link: '/academy'
  },
  {
    id: '3',
    title: 'روح الفريق',
    description: 'شارك في 3 أنشطة',
    icon: Users,
    points: 40,
    progress: 2,
    total: 3,
    reward: 'امتياز المتطوع',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    link: '/activities'
  },
];

export const FastWins = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">إنجازاتك القريبة</h2>
            <p className="text-xs text-muted-foreground">أكمل المهام واحصل على مكافآت</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/points')}
          className="text-xs text-primary flex items-center gap-1"
        >
          الكل
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Achievement Cards */}
      <div className="space-y-3">
        {achievements.map((achievement) => {
          const progressPercent = (achievement.progress / achievement.total) * 100;
          const isClose = progressPercent >= 60;

          return (
            <Card
              key={achievement.id}
              className={`border-0 shadow-soft cursor-pointer hover:shadow-card transition-all ${isClose ? 'ring-2 ring-primary/20' : ''}`}
              onClick={() => navigate(achievement.link)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${achievement.bgColor} flex items-center justify-center`}>
                    <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-warning/10 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        <span className="text-xs font-bold text-warning">+{achievement.points}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={progressPercent} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-2">
                      <Gift className="w-3 h-3 text-violet-500" />
                      <span className="text-xs text-violet-600">{achievement.reward}</span>
                    </div>
                  </div>

                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </div>

                {isClose && (
                  <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-center gap-2 text-primary">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">قريب من الإنجاز!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
