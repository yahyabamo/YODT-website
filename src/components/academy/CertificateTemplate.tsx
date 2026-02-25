import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Award, Star, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  instructorName: string;
  hoursCompleted: number;
  grade?: string;
  verificationUrl: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ 
    studentName, 
    courseName, 
    completionDate, 
    certificateId,
    instructorName,
    hoursCompleted,
    grade,
    verificationUrl
  }, ref) => {
    return (
      <div 
        ref={ref}
        className="w-[1056px] h-[816px] bg-white relative overflow-hidden"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute"
                style={{
                  left: `${(i % 5) * 25}%`,
                  top: `${Math.floor(i / 5) * 25}%`,
                  transform: 'rotate(45deg)'
                }}
              >
                <Star className="w-12 h-12 text-primary" />
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Border */}
        <div className="absolute inset-4 border-4 border-primary/30 rounded-lg" />
        <div className="absolute inset-6 border-2 border-primary/20 rounded-lg" />
        <div className="absolute inset-8 border border-primary/10 rounded-lg" />

        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full text-primary/40">
            <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute top-8 right-8 w-24 h-24 rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full text-primary/40">
            <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-8 left-8 w-24 h-24 -rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full text-primary/40">
            <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-8 right-8 w-24 h-24 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full text-primary/40">
            <path d="M0 0 L100 0 L100 20 L20 20 L20 100 L0 100 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-between p-16">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src={logo} alt="YSU Logo" className="w-16 h-16 object-contain" />
              <div>
                <h3 className="text-xl font-bold text-primary">اتحاد الطلاب اليمنيين</h3>
                <p className="text-sm text-gray-600">Yemeni Students Union - Istanbul</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-px w-32 bg-gradient-to-r from-transparent to-primary/50" />
              <Award className="w-8 h-8 text-amber-500" />
              <div className="h-px w-32 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center -mt-4">
            <h1 className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              شهادة إتمام
            </h1>
            <p className="text-lg text-gray-600">Certificate of Completion</p>
          </div>

          {/* Recipient */}
          <div className="text-center -mt-4">
            <p className="text-gray-600 mb-2">تُمنح هذه الشهادة إلى</p>
            <h2 
              className="text-3xl font-bold text-gray-800 mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {studentName}
            </h2>
            <div className="w-64 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto" />
          </div>

          {/* Course Details */}
          <div className="text-center -mt-4">
            <p className="text-gray-600 mb-2">لإتمامه بنجاح دورة</p>
            <h3 
              className="text-2xl font-bold text-primary mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {courseName}
            </h3>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{hoursCompleted} ساعة تدريبية</span>
              </div>
              {grade && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>التقدير: {grade}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="w-full flex items-end justify-between">
            {/* Signature */}
            <div className="text-center">
              <div className="w-48 h-0.5 bg-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-700">{instructorName}</p>
              <p className="text-xs text-gray-500">المدرب</p>
            </div>

            {/* QR Code & Details */}
            <div className="text-center">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 inline-block mb-2">
                <QRCodeSVG 
                  value={verificationUrl}
                  size={80}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500">امسح للتحقق</p>
              <p className="text-xs text-gray-400 mt-1">رقم الشهادة: {certificateId}</p>
            </div>

            {/* Date */}
            <div className="text-center">
              <div className="w-48 h-0.5 bg-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-700">{completionDate}</p>
              <p className="text-xs text-gray-500">تاريخ الإصدار</p>
            </div>
          </div>
        </div>

        {/* Gold Seal */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
              <div className="w-16 h-16 rounded-full border-2 border-amber-300 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-8">
              <div className="w-full h-full bg-gradient-to-b from-red-600 to-red-700 rounded-b-sm" 
                   style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 50% 70%, 20% 100%)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
