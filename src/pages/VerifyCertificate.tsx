import { useParams } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Calendar, Clock, User, BookOpen, Shield, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/logo.png';

// Mock certificate database - in production, this would be fetched from Supabase
const certificatesDatabase: Record<string, {
  id: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  hoursCompleted: number;
  grade: string;
  issuedAt: string;
  validUntil: string | null;
  skills: string[];
}> = {
  'CERT-2025-001': {
    id: 'CERT-2025-001',
    studentName: 'أحمد محمد العامري',
    courseName: 'أساسيات تطوير الويب',
    completionDate: '15 يناير 2025',
    instructorName: 'م. خالد الصنعاني',
    hoursCompleted: 24,
    grade: 'ممتاز',
    issuedAt: '2025-01-15T10:30:00Z',
    validUntil: null,
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design'],
  },
  'CERT-2025-002': {
    id: 'CERT-2025-002',
    studentName: 'أحمد محمد العامري',
    courseName: 'التحضير لاختبار IELTS',
    completionDate: '10 يناير 2025',
    instructorName: 'أ. سارة المقطري',
    hoursCompleted: 30,
    grade: 'جيد جداً',
    issuedAt: '2025-01-10T14:00:00Z',
    validUntil: null,
    skills: ['Reading', 'Writing', 'Listening', 'Speaking', 'Academic English'],
  },
  'CERT-2025-003': {
    id: 'CERT-2025-003',
    studentName: 'أحمد محمد العامري',
    courseName: 'مهارات القيادة والإدارة',
    completionDate: '5 يناير 2025',
    instructorName: 'د. عبدالله الحميري',
    hoursCompleted: 18,
    grade: 'ممتاز',
    issuedAt: '2025-01-05T09:15:00Z',
    validUntil: null,
    skills: ['Team Leadership', 'Strategic Planning', 'Communication', 'Decision Making'],
  },
};

const VerifyCertificate = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const certificate = certificateId ? certificatesDatabase[certificateId] : null;

  const isValid = !!certificate;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'ممتاز':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'جيد جداً':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'جيد':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="YSU Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-bold text-primary">اتحاد الطلاب اليمنيين</h1>
              <p className="text-xs text-muted-foreground">نظام التحقق من الشهادات</p>
            </div>
          </div>
          <Shield className="w-6 h-6 text-primary" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Verification Status Card */}
        <Card className={`border-2 mb-6 ${isValid ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                {isValid ? (
                  <CheckCircle className="w-10 h-10 text-green-600" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-600" />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {isValid ? 'شهادة موثقة ✓' : 'شهادة غير موجودة'}
                </h2>
                <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid 
                    ? 'تم التحقق من صحة هذه الشهادة بنجاح'
                    : 'لم يتم العثور على شهادة بهذا الرقم في سجلاتنا'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isValid && certificate ? (
          <>
            {/* Certificate Details */}
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-8 h-8 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-lg">تفاصيل الشهادة</h3>
                    <p className="text-sm text-muted-foreground">رقم الشهادة: {certificate.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Student Name */}
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">اسم الطالب</p>
                      <p className="font-semibold">{certificate.studentName}</p>
                    </div>
                  </div>

                  {/* Course Name */}
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">اسم الدورة</p>
                      <p className="font-semibold">{certificate.courseName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Completion Date */}
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">تاريخ الإتمام</p>
                        <p className="font-semibold text-sm">{certificate.completionDate}</p>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Clock className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">الساعات التدريبية</p>
                        <p className="font-semibold text-sm">{certificate.hoursCompleted} ساعة</p>
                      </div>
                    </div>
                  </div>

                  {/* Instructor & Grade */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">المدرب</p>
                      <p className="font-semibold">{certificate.instructorName}</p>
                    </div>
                    <Badge className={`${getGradeColor(certificate.grade)} border text-sm px-3 py-1`}>
                      {certificate.grade}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Skills Acquired */}
                <div>
                  <h4 className="font-semibold mb-3">المهارات المكتسبة</h4>
                  <div className="flex flex-wrap gap-2">
                    {certificate.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Info */}
            <Card className="border-0 shadow-soft bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Shield className="w-4 h-4" />
                  <span>تم إصدار هذه الشهادة من قبل أكاديمية اتحاد الطلاب اليمنيين - إسطنبول</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">لم يتم العثور على الشهادة</h3>
              <p className="text-muted-foreground mb-6">
                رقم الشهادة المطلوب: <code className="bg-muted px-2 py-1 rounded">{certificateId || 'غير محدد'}</code>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع إدارة الأكاديمية
              </p>
              <Button variant="outline" asChild>
                <a href="/academy">
                  <ExternalLink className="w-4 h-4 ml-2" />
                  زيارة الأكاديمية
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2025 اتحاد الطلاب اليمنيين - إسطنبول</p>
          <p className="mt-1">جميع الحقوق محفوظة</p>
        </footer>
      </main>
    </div>
  );
};

export default VerifyCertificate;
