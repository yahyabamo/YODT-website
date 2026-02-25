import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Clock, Star, CheckCircle, Play, FileText, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { courses } from '@/data/mockData';
import { toast } from 'sonner';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>الدورة غير موجودة</p>
      </div>
    );
  }

  const lessons = Array.from({ length: course.lessons }, (_, i) => ({
    id: i + 1,
    title: `الدرس ${i + 1}`,
    duration: '15 دقيقة',
    isCompleted: course.progress ? (i + 1) <= Math.floor(course.lessons * course.progress / 100) : false,
  }));

  const handleStartQuiz = () => {
    toast.success('سيتم فتح الاختبار قريباً');
  };

  const handleGetCertificate = () => {
    navigate('/certificates');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title={course.title} showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* Course Info */}
        <Card className="border-0 shadow-soft mb-6 animate-slide-up">
          <CardContent className="p-5">
            <h1 className="text-xl font-bold text-foreground mb-2">{course.title}</h1>
            <p className="text-muted-foreground mb-4">{course.description}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.lessons} دروس
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1 text-primary font-medium">
                <Star className="h-4 w-4" />
                +{course.points} نقطة
              </span>
            </div>

            {course.progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">التقدم</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      course.progress === 100 ? 'bg-success' : 'bg-primary'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            )}

            {course.isCompleted ? (
              <div className="flex gap-2">
                <Button onClick={handleStartQuiz} variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 ml-2" />
                  إعادة الاختبار
                </Button>
                {course.hasCertificate && (
                  <Button onClick={handleGetCertificate} className="flex-1">
                    <Award className="h-4 w-4 ml-2" />
                    عرض الشهادة
                  </Button>
                )}
              </div>
            ) : (
              <Button className="w-full">
                <Play className="h-4 w-4 ml-2" />
                {course.progress ? 'متابعة الدورة' : 'ابدأ الدورة'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Lessons */}
        <h2 className="font-semibold text-foreground mb-3">محتوى الدورة</h2>
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <Card 
              key={lesson.id}
              className="border-0 shadow-soft animate-slide-up cursor-pointer hover:shadow-card transition-all"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  lesson.isCompleted 
                    ? 'bg-success/10 text-success' 
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {lesson.isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="font-medium">{lesson.id}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{lesson.title}</h3>
                  <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                </div>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quiz Section */}
        {course.progress && course.progress >= 80 && !course.isCompleted && (
          <Card className="border-0 shadow-soft mt-6 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">الاختبار النهائي</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                أكملت 80% من الدورة. يمكنك الآن إجراء الاختبار للحصول على الشهادة.
              </p>
              <Button onClick={handleStartQuiz} className="w-full">
                ابدأ الاختبار
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CourseDetail;