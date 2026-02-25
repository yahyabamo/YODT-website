import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Star, Clock, Users, Award, Play, ChevronLeft,
  Trophy, Flame, BookOpen, TrendingUp, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { academyCourses, courseCategories, courseLevels, Course } from '@/data/academyCoursesData';
import { AcademyProvider, useAcademy } from '@/hooks/useAcademyProgress';

const AcademyContent = () => {
  const navigate = useNavigate();
  const { stats, getCourseCompletionPercent } = useAcademy();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const filteredCourses = academyCourses.filter(course => {
    const matchesSearch = course.title.includes(searchQuery) || 
                          course.description.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || 
                            course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelBadge = (level: string) => {
    const levelInfo = courseLevels.find(l => l.id === level);
    return levelInfo ? (
      <Badge className={levelInfo.color}>{levelInfo.label}</Badge>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="أكاديمية الاتحاد" showBack />

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-6">
        {/* Stats Header */}
        <Card className="shadow-soft border-0 bg-gradient-to-l from-primary/10 to-primary/5 overflow-hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-1">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <p className="text-lg font-bold text-primary">{stats.totalPoints}</p>
                <p className="text-xs text-muted-foreground">نقطة</p>
              </div>
              <div>
                <div className="w-10 h-10 mx-auto rounded-full bg-warning/20 flex items-center justify-center mb-1">
                  <Flame className="h-5 w-5 text-warning" />
                </div>
                <p className="text-lg font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">يوم متتالي</p>
              </div>
              <div>
                <div className="w-10 h-10 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-1">
                  <BookOpen className="h-5 w-5 text-accent" />
                </div>
                <p className="text-lg font-bold">{stats.lessonsCompleted}</p>
                <p className="text-xs text-muted-foreground">درس</p>
              </div>
              <div>
                <div className="w-10 h-10 mx-auto rounded-full bg-secondary flex items-center justify-center mb-1">
                  <Award className="h-5 w-5 text-foreground" />
                </div>
                <p className="text-lg font-bold">{stats.totalBadges.length}</p>
                <p className="text-xs text-muted-foreground">شارة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن دورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-12 rounded-xl bg-secondary border-0"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {courseCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* AI Assistant Prompt */}
        <Card className="shadow-soft border-0 bg-gradient-to-l from-accent/10 to-accent/5 cursor-pointer hover:shadow-card transition-all">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">مساعد التعلم الذكي</h3>
              <p className="text-sm text-muted-foreground">اسألني عن أي شيء في الدورات!</p>
            </div>
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Courses List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">الدورات المتاحة</h2>
            <span className="text-sm text-muted-foreground">{filteredCourses.length} دورة</span>
          </div>

          {filteredCourses.map((course) => {
            const progress = getCourseCompletionPercent(course.id, course.totalLessons);
            
            return (
              <Card 
                key={course.id}
                className="shadow-soft border-0 cursor-pointer hover:shadow-card transition-all overflow-hidden"
                onClick={() => navigate(`/academy/course/${course.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Thumbnail */}
                    <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl shrink-0">
                      {course.thumbnail}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-sm line-clamp-1">{course.title}</h3>
                        {getLevelBadge(course.level)}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.studentsCount}
                        </span>
                        <span className="flex items-center gap-1 text-warning">
                          <Star className="h-3 w-3 fill-warning" />
                          {course.rating}
                        </span>
                      </div>

                      {progress > 0 ? (
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-primary">{progress}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Play className="h-3 w-3" />
                          ابدأ الآن
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

const AcademyNew = () => (
  <AcademyProvider>
    <AcademyContent />
  </AcademyProvider>
);

export default AcademyNew;
