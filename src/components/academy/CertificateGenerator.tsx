import { useState, useRef } from 'react';
import { Download, Share2, Eye, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CertificateTemplate from './CertificateTemplate';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  instructorName: string;
  hoursCompleted: number;
  grade?: string;
}

interface CertificateGeneratorProps {
  certificate: CertificateData;
  isOpen: boolean;
  onClose: () => void;
}

const CertificateGenerator = ({ certificate, isOpen, onClose }: CertificateGeneratorProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const verificationUrl = `https://ysu-academy.lovable.app/verify/${certificate.certificateId}`;

  const generateImage = async (): Promise<Blob | null> => {
    if (!certificateRef.current) return null;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1056,
        height: 816,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error generating certificate image:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateImage();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `شهادة_${certificate.courseName.replace(/\s+/g, '_')}_${certificate.studentName.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('تم تحميل الشهادة بنجاح!');
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('حدث خطأ أثناء تحميل الشهادة');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const blob = await generateImage();
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], `certificate_${certificate.certificateId}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `شهادة إتمام - ${certificate.courseName}`,
            text: `لقد أتممت بنجاح دورة "${certificate.courseName}" من أكاديمية اتحاد الطلاب اليمنيين`,
            files: [file],
          });
          toast.success('تمت المشاركة بنجاح!');
        } else {
          // Fallback to sharing URL only
          await navigator.share({
            title: `شهادة إتمام - ${certificate.courseName}`,
            text: `لقد أتممت بنجاح دورة "${certificate.courseName}" من أكاديمية اتحاد الطلاب اليمنيين`,
            url: verificationUrl,
          });
          toast.success('تمت المشاركة بنجاح!');
        }
      } else {
        // Fallback: copy verification URL
        await navigator.clipboard.writeText(verificationUrl);
        toast.success('تم نسخ رابط التحقق!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error('حدث خطأ أثناء المشاركة');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-auto max-h-[95vh] overflow-auto p-0">
        <div className="p-4 border-b flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">معاينة الشهادة</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Share2 className="w-4 h-4 ml-2" />
              )}
              مشاركة
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-primary"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Download className="w-4 h-4 ml-2" />
              )}
              تحميل PNG
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 bg-gray-100 overflow-auto">
          <div className="shadow-2xl rounded-lg overflow-hidden inline-block">
            <CertificateTemplate
              ref={certificateRef}
              studentName={certificate.studentName}
              courseName={certificate.courseName}
              completionDate={certificate.completionDate}
              certificateId={certificate.certificateId}
              instructorName={certificate.instructorName}
              hoursCompleted={certificate.hoursCompleted}
              grade={certificate.grade}
              verificationUrl={verificationUrl}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateGenerator;
