import { Briefcase, MapPin, Clock, Star, CheckCircle, Lock, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { jobs } from '@/data/mockData'; // Assuming jobs is an array
import { toast } from 'sonner';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useState, useEffect } from 'react';


const Jobs = () => {
  const handleApply = (jobTitle: string, isEligible: boolean) => {
    if (!isEligible) {
      toast.error('لا تستوفي متطلبات هذه الوظيفة بعد');
      return;
    }
    toast.success(`تم إرسال طلبك لوظيفة ${jobTitle}`);
  };
  const [showSearch, setShowSearch] = useState(false);

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full-time': 'دوام كامل',
      'part-time': 'دوام جزئي',
      'internship': 'تدريب',
      'remote': 'عن بُعد',
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky-header">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
        </div>
      </header>
      <div className="p-4 max-w-lg mx-auto">
        {/* Intro */}
        <Card className="border-0 shadow-soft mb-6 animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">فرص حصرية للأعضاء</h2>
                <p className="text-sm text-muted-foreground">وظائف من شركائنا الداعمين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List or No Jobs Message */}
        {jobs && jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <Card
                key={job.id}
                className={`border-0 shadow-soft animate-slide-up ${!job.isEligible ? 'opacity-75' : ''
                  }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                        {job.companyLogo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{job.title}</h3>
                          {!job.isEligible && <Lock className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {getJobTypeLabel(job.type)}
                    </span>
                    {job.isOpen && (
                      <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                        متاحة
                      </span>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground">المتطلبات:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.englishLevel && (
                        <span className="px-2 py-1 bg-secondary text-xs rounded-lg">
                          إنجليزي: {job.requirements.englishLevel}
                        </span>
                      )}
                      {job.requirements.turkishLevel && (
                        <span className="px-2 py-1 bg-secondary text-xs rounded-lg">
                          تركي: {job.requirements.turkishLevel}
                        </span>
                      )}
                      {job.requirements.minPoints && (
                        <span className="px-2 py-1 bg-secondary text-xs rounded-lg flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {job.requirements.minPoints}+ نقطة
                        </span>
                      )}
                      {job.requirements.volunteerOnly && (
                        <span className="px-2 py-1 bg-secondary text-xs rounded-lg">
                          متطوعين فقط
                        </span>
                      )}
                      {job.requirements.skills?.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-secondary text-xs rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={job.isEligible ? 'default' : 'outline'}
                    onClick={() => handleApply(job.title, job.isEligible || false)}
                  >
                    {job.isEligible ? (
                      <>
                        <CheckCircle className="h-4 w-4 ml-2" />
                        قدّم الآن
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 ml-2" />
                        غير مؤهل
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-soft animate-slide-up">
            <CardContent className="p-4 text-center text-muted-foreground">
              <p>لا توجد فرص وظيفية متاحة حاليًا. يرجى التحقق لاحقًا.</p>
              <p>نتمنى لك التوفيق في العثور على الفرصة المناسبة!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Jobs;
