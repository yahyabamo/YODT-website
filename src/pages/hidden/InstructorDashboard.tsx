import { useState } from 'react';
import { 
  FileText, Clock, CheckCircle, XCircle, AlertTriangle, 
  Star, User, Calendar, ExternalLink, Github, Globe,
  MessageSquare, Send, ChevronDown, ChevronUp, Filter,
  Search, Download, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';

// Mock data for submissions
const mockSubmissions = [
  {
    id: '1',
    studentName: 'أحمد محمد العامري',
    studentAvatar: null,
    courseId: 'web-dev-fundamentals',
    courseName: 'أساسيات تطوير الويب',
    projectTitle: 'موقع شخصي تفاعلي',
    description: 'قمت ببناء موقع شخصي باستخدام React و Tailwind CSS يعرض مشاريعي ومهاراتي مع تصميم متجاوب وأنيميشن سلس.',
    fileUrls: ['https://example.com/file1.zip'],
    githubUrl: 'https://github.com/ahmed/portfolio',
    demoUrl: 'https://ahmed-portfolio.vercel.app',
    status: 'pending',
    submittedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    studentName: 'فاطمة علي السعدي',
    studentAvatar: null,
    courseId: 'web-dev-fundamentals',
    courseName: 'أساسيات تطوير الويب',
    projectTitle: 'تطبيق قائمة المهام',
    description: 'تطبيق لإدارة المهام اليومية مع إمكانية إضافة وحذف وتعديل المهام وحفظها في Local Storage.',
    fileUrls: ['https://example.com/file2.zip'],
    githubUrl: 'https://github.com/fatima/todo-app',
    demoUrl: 'https://fatima-todo.netlify.app',
    status: 'under_review',
    submittedAt: '2025-01-14T15:45:00Z',
  },
  {
    id: '3',
    studentName: 'محمد عبدالله الشرعبي',
    studentAvatar: null,
    courseId: 'ielts-preparation',
    courseName: 'التحضير لاختبار IELTS',
    projectTitle: 'مقال أكاديمي - التعليم عن بعد',
    description: 'مقال أكاديمي من 500 كلمة حول مزايا وعيوب التعليم عن بعد مع مقدمة وخاتمة وفقرات منظمة.',
    fileUrls: ['https://example.com/essay.pdf'],
    githubUrl: null,
    demoUrl: null,
    status: 'pending',
    submittedAt: '2025-01-13T09:00:00Z',
  },
];

const strengthsOptions = [
  'كود نظيف ومنظم',
  'تصميم جميل وعصري',
  'استخدام جيد للتقنيات',
  'توثيق ممتاز',
  'حل إبداعي للمشكلة',
  'أداء ممتاز',
  'تجربة مستخدم سلسة',
  'اهتمام بالتفاصيل',
];

const improvementsOptions = [
  'تحسين هيكلة الكود',
  'إضافة المزيد من التعليقات',
  'تحسين الأداء',
  'تحسين التصميم المتجاوب',
  'إضافة معالجة الأخطاء',
  'تحسين تجربة المستخدم',
  'إضافة اختبارات',
  'تحسين الوصولية',
];

const InstructorDashboard = () => {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<typeof mockSubmissions[0] | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review form state
  const [score, setScore] = useState([75]);
  const [feedback, setFeedback] = useState('');
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'needs_revision' | 'rejected'>('approved');

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock };
      case 'under_review':
        return { label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock };
      case 'approved':
        return { label: 'مقبول', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
      case 'needs_revision':
        return { label: 'يحتاج تعديل', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle };
      case 'rejected':
        return { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesCourse = filterCourse === 'all' || sub.courseId === filterCourse;
    const matchesSearch = sub.studentName.includes(searchQuery) || 
                          sub.projectTitle.includes(searchQuery);
    return matchesStatus && matchesCourse && matchesSearch;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const underReviewCount = submissions.filter(s => s.status === 'under_review').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  const openReviewDialog = (submission: typeof mockSubmissions[0]) => {
    setSelectedSubmission(submission);
    setScore([75]);
    setFeedback('');
    setSelectedStrengths([]);
    setSelectedImprovements([]);
    setReviewStatus('approved');
    setIsReviewDialogOpen(true);
  };

  const handleStartReview = (submission: typeof mockSubmissions[0]) => {
    setSubmissions(prev => 
      prev.map(s => s.id === submission.id ? { ...s, status: 'under_review' } : s)
    );
    toast.info('تم نقل المشروع إلى قيد المراجعة');
  };

  const handleSubmitReview = () => {
    if (!selectedSubmission) return;

    if (!feedback.trim()) {
      toast.error('يرجى كتابة ملاحظات للطالب');
      return;
    }

    setSubmissions(prev =>
      prev.map(s =>
        s.id === selectedSubmission.id
          ? { ...s, status: reviewStatus }
          : s
      )
    );

    toast.success(
      reviewStatus === 'approved' 
        ? '✅ تم قبول المشروع بنجاح' 
        : reviewStatus === 'needs_revision'
        ? '⚠️ تم طلب التعديلات'
        : '❌ تم رفض المشروع'
    );

    setIsReviewDialogOpen(false);
    setSelectedSubmission(null);
  };

  const uniqueCourses = [...new Set(submissions.map(s => s.courseId))].map(id => ({
    id,
    name: submissions.find(s => s.courseId === id)?.courseName || id
  }));

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <PageHeader title="لوحة تحكم المدرب" showBack />

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-soft bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">بانتظار المراجعة</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-700">{underReviewCount}</p>
              <p className="text-xs text-muted-foreground">قيد المراجعة</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">تمت المراجعة</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو عنوان المشروع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">بانتظار المراجعة</SelectItem>
                  <SelectItem value="under_review">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="needs_revision">يحتاج تعديل</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="الدورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الدورات</SelectItem>
                  {uniqueCourses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <Card className="border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد مشاريع مطابقة للفلاتر</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => {
              const statusInfo = getStatusInfo(submission.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={submission.id} className="border-0 shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{submission.studentName}</h3>
                          <p className="text-xs text-muted-foreground">{submission.courseName}</p>
                        </div>
                      </div>
                      <Badge className={`${statusInfo.color} border`}>
                        <StatusIcon className="h-3 w-3 ml-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-1">{submission.projectTitle}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {submission.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {submission.fileUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                        >
                          <Download className="h-3 w-3" />
                          ملف {i + 1}
                        </a>
                      ))}
                      {submission.githubUrl && (
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                        >
                          <Github className="h-3 w-3" />
                          GitHub
                        </a>
                      )}
                      {submission.demoUrl && (
                        <a
                          href={submission.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                        >
                          <Globe className="h-3 w-3" />
                          عرض تجريبي
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(submission.submittedAt).toLocaleDateString('ar-SA')}
                      </p>
                      <div className="flex gap-2">
                        {submission.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartReview(submission)}
                          >
                            بدء المراجعة
                          </Button>
                        )}
                        {(submission.status === 'pending' || submission.status === 'under_review') && (
                          <Button
                            size="sm"
                            onClick={() => openReviewDialog(submission)}
                          >
                            <MessageSquare className="h-4 w-4 ml-1" />
                            تقييم
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              تقييم المشروع
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">{selectedSubmission.projectTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSubmission.studentName} • {selectedSubmission.courseName}
                </p>
              </div>

              {/* Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>الدرجة</Label>
                  <span className="text-2xl font-bold text-primary">{score[0]}/100</span>
                </div>
                <Slider
                  value={score}
                  onValueChange={setScore}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>حالة المشروع</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={reviewStatus === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    className={reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => setReviewStatus('approved')}
                  >
                    <CheckCircle className="h-4 w-4 ml-1" />
                    قبول
                  </Button>
                  <Button
                    variant={reviewStatus === 'needs_revision' ? 'default' : 'outline'}
                    size="sm"
                    className={reviewStatus === 'needs_revision' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    onClick={() => setReviewStatus('needs_revision')}
                  >
                    <AlertTriangle className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant={reviewStatus === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    className={reviewStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => setReviewStatus('rejected')}
                  >
                    <XCircle className="h-4 w-4 ml-1" />
                    رفض
                  </Button>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <Label className="text-green-700">نقاط القوة</Label>
                <div className="flex flex-wrap gap-2">
                  {strengthsOptions.map((strength) => (
                    <Badge
                      key={strength}
                      variant={selectedStrengths.includes(strength) ? 'default' : 'outline'}
                      className={`cursor-pointer ${selectedStrengths.includes(strength) ? 'bg-green-600' : ''}`}
                      onClick={() => {
                        setSelectedStrengths(prev =>
                          prev.includes(strength)
                            ? prev.filter(s => s !== strength)
                            : [...prev, strength]
                        );
                      }}
                    >
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="space-y-2">
                <Label className="text-orange-700">نقاط للتحسين</Label>
                <div className="flex flex-wrap gap-2">
                  {improvementsOptions.map((improvement) => (
                    <Badge
                      key={improvement}
                      variant={selectedImprovements.includes(improvement) ? 'default' : 'outline'}
                      className={`cursor-pointer ${selectedImprovements.includes(improvement) ? 'bg-orange-600' : ''}`}
                      onClick={() => {
                        setSelectedImprovements(prev =>
                          prev.includes(improvement)
                            ? prev.filter(i => i !== improvement)
                            : [...prev, improvement]
                        );
                      }}
                    >
                      {improvement}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">ملاحظات للطالب</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="اكتب ملاحظاتك وتوجيهاتك للطالب هنا..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmitReview}>
              <Send className="h-4 w-4 ml-2" />
              إرسال التقييم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default InstructorDashboard;
