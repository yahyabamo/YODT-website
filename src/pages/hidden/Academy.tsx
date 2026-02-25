import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Star, CheckCircle, Award, Book, GraduationCap, FolderOpen, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courses } from '@/data/mockData';
import { BooksSection } from '@/components/academy/BooksSection';
import { ThesesSection } from '@/components/academy/ThesesSection';
import { MaterialsSection } from '@/components/academy/MaterialsSection';
import { GuidanceSection } from '@/components/academy/GuidanceSection';

const Academy = () => {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('courses');

  const paths = [
    { id: 'english', label: 'اللغة الإنجليزية', icon: '🌐', color: 'bg-blue-50 text-blue-600' },
    { id: 'professional', label: 'المهارات المهنية', icon: '💼', color: 'bg-primary/10 text-primary' },
    { id: 'smart', label: 'الطالب الذكي', icon: '💡', color: 'bg-success/10 text-success' },
  ];

  const filteredCourses = selectedPath 
    ? courses.filter(c => c.path === selectedPath)
    : courses;

  const tabs = [
    { id: 'courses', label: 'الدورات', icon: BookOpen },
    { id: 'books', label: 'الكتب', icon: Book },
    { id: 'theses', label: 'الرسائل', icon: GraduationCap },
    { id: 'materials', label: 'الملفات', icon: FolderOpen },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="أكاديمية الاتحاد" showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* Intro */}
        <Card className="border-0 shadow-soft mb-4 animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCapIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">تعلّم وتطوّر</h2>
                <p className="text-sm text-muted-foreground">دورات، كتب، رسائل، وملفات جامعية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guidance Section */}
        <div className="mb-4">
          <GuidanceSection />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-secondary/50">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col gap-1 py-2 text-xs data-[state=active]:bg-background"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="courses" className="mt-4">
            {/* Paths */}
            <div className="mb-4">
              <h3 className="font-semibold text-foreground mb-3">المسارات التعليمية</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedPath(null)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !selectedPath 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  الكل
                </button>
                {paths.map((path) => (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPath(path.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedPath === path.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <span>{path.icon}</span>
                    {path.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="space-y-3">
              {filteredCourses.map((course, index) => (
                <Card 
                  key={course.id}
                  className="border-0 shadow-soft animate-slide-up cursor-pointer hover:shadow-card transition-all"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => navigate(`/academy/${course.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {course.isCompleted && (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                          <h3 className="font-medium text-foreground">{course.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                      </div>
                      {course.hasCertificate && (
                        <Award className="h-5 w-5 text-warning flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.lessons} دروس
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Star className="h-3 w-3" />
                        +{course.points} نقطة
                      </span>
                    </div>

                    {course.progress !== undefined && course.progress > 0 && (
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            course.progress === 100 ? 'bg-success' : 'bg-primary'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}

                    {course.progress === undefined && (
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        ابدأ الدورة
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="books" className="mt-4">
            <BooksSection />
          </TabsContent>

          <TabsContent value="theses" className="mt-4">
            <ThesesSection />
          </TabsContent>

          <TabsContent value="materials" className="mt-4">
            <MaterialsSection />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

const GraduationCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

export default Academy;