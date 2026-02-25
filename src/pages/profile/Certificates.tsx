import { useState } from 'react';
import { Award, Download, Share2, Eye, Calendar, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import CertificateGenerator from '@/components/academy/CertificateGenerator';

// Mock data for certificates - in production, this would come from the database
const mockCertificates = [
  {
    id: 'CERT-2025-001',
    studentName: 'أحمد محمد العامري',
    courseName: 'أساسيات تطوير الويب',
    completionDate: '15 يناير 2025',
    instructorName: 'م. خالد الصنعاني',
    hoursCompleted: 24,
    grade: 'ممتاز',
    courseImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
  },
  {
    id: 'CERT-2025-002',
    studentName: 'أحمد محمد العامري',
    courseName: 'التحضير لاختبار IELTS',
    completionDate: '10 يناير 2025',
    instructorName: 'أ. سارة المقطري',
    hoursCompleted: 30,
    grade: 'جيد جداً',
    courseImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
  },
  {
    id: 'CERT-2025-003',
    studentName: 'أحمد محمد العامري',
    courseName: 'مهارات القيادة والإدارة',
    completionDate: '5 يناير 2025',
    instructorName: 'د. عبدالله الحميري',
    hoursCompleted: 18,
    grade: 'ممتاز',
    courseImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
  },
];

const Certificates = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<typeof mockCertificates[0] | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const handlePreview = (certificate: typeof mockCertificates[0]) => {
    setSelectedCertificate(certificate);
    setIsGeneratorOpen(true);
  };

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
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="شهاداتي" showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* Stats Summary */}
        <Card className="border-0 shadow-soft mb-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{mockCertificates.length}</h3>
                  <p className="text-sm text-muted-foreground">شهادات مكتسبة</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-primary">
                  {mockCertificates.reduce((acc, cert) => acc + cert.hoursCompleted, 0)}
                </p>
                <p className="text-xs text-muted-foreground">ساعة تدريبية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {mockCertificates.length === 0 ? (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-semibold text-foreground mb-2">لا توجد شهادات بعد</h2>
              <p className="text-sm text-muted-foreground">
                أكمل الدورات واجتز الاختبارات للحصول على شهاداتك
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockCertificates.map((certificate, index) => (
              <Card 
                key={certificate.id}
                className="border-0 shadow-soft animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Course Image Header */}
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={certificate.courseImage} 
                    alt={certificate.courseName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 right-3 left-3">
                    <h3 className="font-bold text-white text-lg">{certificate.courseName}</h3>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getGradeColor(certificate.grade)} border`}>
                      <Star className="w-3 h-3 ml-1" />
                      {certificate.grade}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Certificate Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{certificate.completionDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{certificate.hoursCompleted} ساعة</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    المدرب: {certificate.instructorName}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreview(certificate)}
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      معاينة
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary"
                      onClick={() => handlePreview(certificate)}
                    >
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Generator Modal */}
      {selectedCertificate && (
        <CertificateGenerator
          certificate={{
            studentName: selectedCertificate.studentName,
            courseName: selectedCertificate.courseName,
            completionDate: selectedCertificate.completionDate,
            certificateId: selectedCertificate.id,
            instructorName: selectedCertificate.instructorName,
            hoursCompleted: selectedCertificate.hoursCompleted,
            grade: selectedCertificate.grade,
          }}
          isOpen={isGeneratorOpen}
          onClose={() => {
            setIsGeneratorOpen(false);
            setSelectedCertificate(null);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Certificates;
