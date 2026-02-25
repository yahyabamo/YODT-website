import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BookOpen, Clock, Star, CheckCircle, Play, FileText, Award, 
  Bot, ChevronDown, ChevronUp, Lock, Bookmark, BookmarkCheck,
  Trophy, Target, Flame, Download, Share2, MessageCircle, HelpCircle,
  Upload
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { InteractiveVideoPlayer } from '@/components/academy/InteractiveVideoPlayer';
import { AILearningAssistant } from '@/components/academy/AILearningAssistant';
import { InteractiveQuiz } from '@/components/academy/InteractiveQuiz';
import ProjectSubmissionSystem from '@/components/academy/ProjectSubmissionSystem';
import { academyCourses, QuizQuestion } from '@/data/academyCoursesData';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const CourseDetailNew = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { 
    getCourseProgress, 
    isLessonCompleted, 
    markLessonComplete,
    getCompletedLessonsCount,
    stats 
  } = useAcademyProgress();
  
  const [openModules, setOpenModules] = useState<string[]>(['1']);
  const [activeLesson, setActiveLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  
  const course = academyCourses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">الدورة غير موجودة</p>
          <Button onClick={() => navigate('/academy')}>العودة للأكاديمية</Button>
        </div>
      </div>
    );
  }

  const courseProgress = getCourseProgress(course.id);
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = getCompletedLessonsCount(course.id);
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleLessonClick = (moduleId: string, lessonId: string, isLocked: boolean) => {
    if (isLocked) {
      toast.error('أكمل الدروس السابقة أولاً');
      return;
    }
    setActiveLesson({ moduleId, lessonId });
  };

  const handleVideoComplete = () => {
    if (activeLesson) {
      markLessonComplete(course.id, activeLesson.lessonId);
      toast.success('🎉 أحسنت! تم إكمال الدرس', {
        description: `+${15} نقطة`
      });
    }
  };

  const handleStartQuiz = (lessonTitle?: string, questions?: QuizQuestion[]) => {
    if (questions && questions.length > 0) {
      setActiveQuiz({ title: lessonTitle || 'اختبار الدرس', questions });
    } else {
      // Collect all quizzes from the course for final exam
      const allQuestions: QuizQuestion[] = [];
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          if (lesson.quiz && lesson.quiz.length > 0) {
            allQuestions.push(...lesson.quiz);
          }
        });
      });
      
      if (allQuestions.length > 0) {
        setActiveQuiz({ title: 'الاختبار النهائي - ' + course.title, questions: allQuestions });
      } else {
        toast.info('لا يوجد اختبار متاح حالياً');
      }
    }
  };

  const handleQuizComplete = (score: number) => {
    if (score >= 70) {
      toast.success(`🎉 أحسنت! حصلت على ${score}%`, {
        description: `+${Math.round(score / 10) * 5} نقطة`
      });
    } else {
      toast.error(`حصلت على ${score}%، حاول مرة أخرى للحصول على 70% على الأقل`);
    }
  };

  const handleGetCertificate = () => {
    navigate('/certificates');
  };

  const getCurrentLesson = () => {
    if (!activeLesson) return null;
    const module = course.modules.find(m => m.id === activeLesson.moduleId);
    return module?.lessons.find(l => l.id === activeLesson.lessonId);
  };

  const currentLesson = getCurrentLesson();

  // Calculate if lesson is locked (previous lessons must be completed)
  const isLessonLocked = (moduleIndex: number, lessonIndex: number): boolean => {
    if (moduleIndex === 0 && lessonIndex === 0) return false;
    
    // Check all previous modules
    for (let m = 0; m < moduleIndex; m++) {
      for (const lesson of course.modules[m].lessons) {
        if (!isLessonCompleted(course.id, lesson.id)) return true;
      }
    }
    
    // Check previous lessons in current module
    for (let l = 0; l < lessonIndex; l++) {
      if (!isLessonCompleted(course.id, course.modules[moduleIndex].lessons[l].id)) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title={course.title} 
        showBack 
        actions={
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto">
        {/* Video Player Section */}
        {activeLesson && currentLesson && (
          <div className="animate-fade-in">
            <InteractiveVideoPlayer
              videoUrl={currentLesson.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
              title={currentLesson.title}
              lessonId={currentLesson.id}
              onComplete={handleVideoComplete}
            />
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* Course Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-3 text-center">
                <Trophy className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-primary">{course.points}</p>
                <p className="text-[10px] text-muted-foreground">نقطة</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-soft bg-gradient-to-br from-orange-500/10 to-orange-500/5">
              <CardContent className="p-3 text-center">
                <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                <p className="text-lg font-bold text-orange-500">{stats.streak}</p>
                <p className="text-[10px] text-muted-foreground">يوم متتالي</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-soft bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-3 text-center">
                <Target className="h-5 w-5 mx-auto text-green-500 mb-1" />
                <p className="text-lg font-bold text-green-500">{progressPercent}%</p>
                <p className="text-[10px] text-muted-foreground">مكتمل</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-blue-500">{course.duration}</p>
                <p className="text-[10px] text-muted-foreground">المدة</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">تقدمك في الدورة</span>
                <span className="text-sm text-muted-foreground">
                  {completedLessons}/{totalLessons} درس
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              
              {progressPercent === 100 && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => handleStartQuiz()} variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 ml-2" />
                    الاختبار النهائي
                  </Button>
                  <Button onClick={handleGetCertificate} className="flex-1">
                    <Award className="h-4 w-4 ml-2" />
                    احصل على الشهادة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">المحتوى</TabsTrigger>
              <TabsTrigger value="about">عن الدورة</TabsTrigger>
              <TabsTrigger value="project">المشروع</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4 space-y-3">
              {course.modules.map((module, moduleIndex) => (
                <Collapsible
                  key={module.id}
                  open={openModules.includes(module.id)}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <Card className="border-0 shadow-soft overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">{moduleIndex + 1}</span>
                          </div>
                          <div className="text-right">
                            <h3 className="font-semibold">{module.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {module.lessons.length} دروس • {module.duration}
                            </p>
                          </div>
                        </div>
                        {openModules.includes(module.id) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </CardContent>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="border-t">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const completed = isLessonCompleted(course.id, lesson.id);
                          const locked = isLessonLocked(moduleIndex, lessonIndex);
                          const isActive = activeLesson?.lessonId === lesson.id;
                          
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => handleLessonClick(module.id, lesson.id, locked)}
                              className={`p-4 flex items-center gap-3 border-b last:border-b-0 cursor-pointer transition-colors
                                ${isActive ? 'bg-primary/5' : 'hover:bg-muted/50'}
                                ${locked ? 'opacity-50' : ''}
                              `}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                ${completed ? 'bg-green-500 text-white' : 
                                  locked ? 'bg-muted' : 'bg-primary/10 text-primary'}
                              `}>
                                {completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : locked ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-medium text-sm ${isActive ? 'text-primary' : ''}`}>
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration}
                                  {lesson.hasQuiz && lesson.quiz && lesson.quiz.length > 0 && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-[10px] py-0 cursor-pointer hover:bg-primary/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartQuiz(lesson.title, lesson.quiz);
                                      }}
                                    >
                                      <HelpCircle className="h-2.5 w-2.5 ml-0.5" />
                                      اختبار
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {completed && (
                                <Badge className="bg-green-500/10 text-green-600 text-[10px]">
                                  مكتمل
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </TabsContent>

            <TabsContent value="about" className="mt-4">
              <Card className="border-0 shadow-soft">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">عن الدورة</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">المدرب</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold">
                        {course.instructor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{course.instructor.name}</p>
                        <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">ماذا ستتعلم</h3>
                    <ul className="space-y-2">
                      {course.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">الشارات المتاحة</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.badges.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          <Award className="h-3 w-3" />
                          {badge.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="project" className="mt-4">
              {course.project ? (
                <ProjectSubmissionSystem
                  project={{
                    id: `${course.id}-project`,
                    title: course.project.title,
                    description: course.project.description,
                    requirements: course.project.requirements.map((req, idx) => ({
                      id: `req-${idx}`,
                      title: req,
                      description: '',
                      points: Math.round(course.project!.points / course.project!.requirements.length),
                    })),
                    maxScore: course.project.points,
                  }}
                  courseId={course.id}
                  onSubmitSuccess={() => {
                    toast.success('تم تسليم المشروع بنجاح! سيتم مراجعته قريباً');
                  }}
                />
              ) : (
                <Card className="border-0 shadow-soft">
                  <CardContent className="p-4">
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">لا يوجد مشروع لهذه الدورة</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI Assistant Button */}
      <Button
        size="lg"
        className="fixed bottom-24 left-4 rounded-full shadow-lg gap-2 z-40"
        onClick={() => setIsAIOpen(true)}
      >
        <Bot className="h-5 w-5" />
        مساعد ذكي
      </Button>

      {/* AI Assistant Modal */}
      <AILearningAssistant
        courseTitle={course.title}
        currentLesson={currentLesson?.title}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Quiz Modal */}
      {activeQuiz && (
        <InteractiveQuiz
          title={activeQuiz.title}
          questions={activeQuiz.questions}
          onComplete={handleQuizComplete}
          onClose={() => setActiveQuiz(null)}
          passingScore={70}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default CourseDetailNew;
