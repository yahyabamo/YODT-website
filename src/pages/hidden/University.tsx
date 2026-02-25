import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { tracks, Track, UniversityCourse, getCourseById } from '@/data/universityData';
import { 
  GraduationCap, BookOpen, CheckCircle, Award, Play, FileText, 
  ChevronLeft, Trophy, Star, Clock, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProgress {
  completedLessons: string[];
  completedCourses: string[];
  passedQuizzes: string[];
  points: number;
  badges: string[];
}

const University = () => {
  const [activeTab, setActiveTab] = useState('tracks');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<UniversityCourse | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedLessons: [],
    completedCourses: [],
    passedQuizzes: [],
    points: 0,
    badges: []
  });

  useEffect(() => {
    const saved = localStorage.getItem('universityProgress');
    if (saved) {
      setUserProgress(JSON.parse(saved));
    }
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    localStorage.setItem('universityProgress', JSON.stringify(newProgress));
  };

  const markLessonComplete = (lessonId: string) => {
    if (!userProgress.completedLessons.includes(lessonId)) {
      const newProgress = {
        ...userProgress,
        completedLessons: [...userProgress.completedLessons, lessonId],
        points: userProgress.points + 1
      };
      saveProgress(newProgress);
      toast.success('+1 نقطة');
    }
  };

  const handleQuizSubmit = () => {
    if (!selectedCourse) return;
    
    let correct = 0;
    selectedCourse.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const passThreshold = Math.ceil(selectedCourse.quiz.length * 0.6);
    
    if (correct >= passThreshold) {
      const newProgress = {
        ...userProgress,
        passedQuizzes: [...userProgress.passedQuizzes, selectedCourse.id],
        completedCourses: [...userProgress.completedCourses, selectedCourse.id],
        points: userProgress.points + 5 + 10, // Quiz + Course completion
        badges: [...userProgress.badges, selectedCourse.id]
      };
      saveProgress(newProgress);
      setShowQuiz(false);
      setShowCertificate(true);
      toast.success('🎉 مبارك! اجتزت الاختبار وأكملت الدورة');
    } else {
      toast.error(`لم تجتز الاختبار. أجبت ${correct} من ${selectedCourse.quiz.length} بشكل صحيح. حاول مرة أخرى.`);
    }
  };

  const getTrackProgress = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return 0;
    
    const completed = track.courses.filter(c => userProgress.completedCourses.includes(c.id)).length;
    return Math.round((completed / track.courses.length) * 100);
  };

  const getCourseProgress = (course: UniversityCourse) => {
    const completedLessons = course.lessons.filter(l => 
      userProgress.completedLessons.includes(l.id)
    ).length;
    return Math.round((completedLessons / course.lessons.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="جامعة الاتحاد" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Points Display */}
        <Card className="shadow-soft mb-4 border-0 bg-gradient-to-l from-primary/10 to-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نقاطك</p>
                <p className="text-2xl font-bold text-primary">{userProgress.points}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">الشارات</p>
              <p className="text-xl font-bold">{userProgress.badges.length}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="tracks" className="text-xs gap-1">
              <GraduationCap className="h-4 w-4" />
              المسارات
            </TabsTrigger>
            <TabsTrigger value="lessons" className="text-xs gap-1">
              <BookOpen className="h-4 w-4" />
              الدروس
            </TabsTrigger>
            <TabsTrigger value="tests" className="text-xs gap-1">
              <CheckCircle className="h-4 w-4" />
              الاختبارات
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs gap-1">
              <Award className="h-4 w-4" />
              التقدم
            </TabsTrigger>
          </TabsList>

          {/* Tab A: Tracks */}
          <TabsContent value="tracks" className="space-y-4">
            {selectedTrack ? (
              <>
                <Button variant="ghost" onClick={() => setSelectedTrack(null)} className="gap-2 mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  العودة للمسارات
                </Button>
                
                <Card className={`border-0 shadow-soft ${selectedTrack.color}/10`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{selectedTrack.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{selectedTrack.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedTrack.description}</p>
                      </div>
                    </div>
                    <Progress value={getTrackProgress(selectedTrack.id)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{getTrackProgress(selectedTrack.id)}% مكتمل</p>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {selectedTrack.courses.map((course) => {
                    const isCompleted = userProgress.completedCourses.includes(course.id);
                    return (
                      <Card 
                        key={course.id} 
                        className={`shadow-soft border-0 cursor-pointer hover:shadow-card transition-all ${isCompleted ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                        onClick={() => { setSelectedCourse(course); setActiveTab('lessons'); }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold">{course.title}</h4>
                                {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 fill-green-500" />}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {course.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {course.points} نقطة
                                </span>
                              </div>
                            </div>
                            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => (
                  <Card 
                    key={track.id}
                    className="shadow-soft border-0 cursor-pointer hover:shadow-card transition-all"
                    onClick={() => setSelectedTrack(track)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl ${track.color} flex items-center justify-center text-white text-2xl`}>
                          {track.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{track.name}</h3>
                          <p className="text-sm text-muted-foreground">{track.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={getTrackProgress(track.id)} className="flex-1 h-2" />
                            <span className="text-xs text-muted-foreground">{getTrackProgress(track.id)}%</span>
                          </div>
                        </div>
                        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab B: Lessons */}
          <TabsContent value="lessons" className="space-y-4">
            {selectedCourse ? (
              <>
                <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="gap-2 mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  العودة
                </Button>

                <Card className="shadow-soft border-0">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">{selectedCourse.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{selectedCourse.description}</p>
                    <Progress value={getCourseProgress(selectedCourse)} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{getCourseProgress(selectedCourse)}% مكتمل</p>
                  </CardContent>
                </Card>

                {selectedCourse.videoUrl && (
                  <Card className="shadow-soft border-0 overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        src={selectedCourse.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </Card>
                )}

                <div className="space-y-2">
                  {selectedCourse.lessons.map((lesson, index) => {
                    const isCompleted = userProgress.completedLessons.includes(lesson.id);
                    return (
                      <Card key={lesson.id} className={`shadow-soft border-0 ${isCompleted ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                              {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </div>
                          {!isCompleted && (
                            <Button size="sm" variant="ghost" onClick={() => markLessonComplete(lesson.id)}>
                              <CheckCircle className="h-4 w-4 ml-1" />
                              أكملت
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {getCourseProgress(selectedCourse) === 100 && !userProgress.passedQuizzes.includes(selectedCourse.id) && (
                  <Button className="w-full" onClick={() => setShowQuiz(true)}>
                    <CheckCircle className="h-4 w-4 ml-2" />
                    ابدأ الاختبار
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">اختر دورة من المسارات لعرض الدروس</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab('tracks')}>
                  استعرض المسارات
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab C: Tests */}
          <TabsContent value="tests" className="space-y-4">
            <div className="space-y-3">
              {tracks.flatMap(track => track.courses).map((course) => {
                const progress = getCourseProgress(course);
                const isPassed = userProgress.passedQuizzes.includes(course.id);
                const canTakeQuiz = progress === 100 && !isPassed;

                return (
                  <Card key={course.id} className={`shadow-soft border-0 ${isPassed ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">{course.quiz.length} أسئلة • {course.points} نقطة</p>
                        </div>
                        {isPassed ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            ناجح
                          </Badge>
                        ) : canTakeQuiz ? (
                          <Button size="sm" onClick={() => { setSelectedCourse(course); setShowQuiz(true); }}>
                            ابدأ
                          </Button>
                        ) : (
                          <Badge variant="secondary">أكمل الدروس أولاً</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab D: Progress */}
          <TabsContent value="progress" className="space-y-4">
            <Card className="shadow-soft border-0">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{userProgress.points}</p>
                    <p className="text-xs text-muted-foreground">نقطة مكتسبة</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userProgress.completedCourses.length}</p>
                    <p className="text-xs text-muted-foreground">دورة مكتملة</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userProgress.badges.length}</p>
                    <p className="text-xs text-muted-foreground">شارة</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h3 className="font-bold">تقدم المسارات</h3>
            {tracks.map((track) => (
              <Card key={track.id} className="shadow-soft border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{track.icon}</span>
                    <span className="font-medium">{track.name}</span>
                  </div>
                  <Progress value={getTrackProgress(track.id)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {track.courses.filter(c => userProgress.completedCourses.includes(c.id)).length} من {track.courses.length} دورات
                  </p>
                </CardContent>
              </Card>
            ))}

            {userProgress.badges.length > 0 && (
              <>
                <h3 className="font-bold">الشارات المكتسبة</h3>
                <div className="grid grid-cols-4 gap-3">
                  {userProgress.badges.map((badgeId) => {
                    const course = getCourseById(badgeId);
                    return (
                      <div key={badgeId} className="text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg">
                          🏆
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground truncate">{course?.title}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quiz Dialog */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>اختبار: {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {selectedCourse?.quiz.map((q, index) => (
              <div key={q.id} className="space-y-3">
                <p className="font-medium">{index + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIndex })}
                      className={`w-full p-3 text-right rounded-xl border-2 transition-all ${
                        quizAnswers[q.id] === optIndex
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button 
              className="w-full" 
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length !== selectedCourse?.quiz.length}
            >
              إرسال الإجابات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="max-w-md text-center">
          <div className="py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-4xl shadow-lg">
              🎓
            </div>
            <h2 className="text-2xl font-bold mb-2">مبارك!</h2>
            <p className="text-muted-foreground mb-4">أتممت دورة "{selectedCourse?.title}" بنجاح</p>
            
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">شهادة إتمام</p>
                <p className="text-lg font-bold">{selectedCourse?.title}</p>
                <p className="text-sm mt-4">الطالب: {localStorage.getItem('registrationData') ? JSON.parse(localStorage.getItem('registrationData')!).firstName : 'المستخدم'}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date().toLocaleDateString('ar-SA')}</p>
              </CardContent>
            </Card>

            <div className="flex gap-3 mt-6">
              <Badge className="bg-primary">+{selectedCourse?.points} نقطة</Badge>
              <Badge variant="outline">🏆 شارة جديدة</Badge>
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={() => setShowCertificate(false)}>
              تم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default University;
