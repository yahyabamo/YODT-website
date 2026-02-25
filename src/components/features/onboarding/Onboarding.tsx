import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Star, Briefcase, ArrowLeft, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [

  {
    icon: Star,
    title: 'اجمع النقاط واحصد التميز',
    description: 'كل نشاط وكل دورة تكملها تضيف لرصيدك نقاطًا تؤهلك للحصول على فرص حصرية وتكريم خاص.',
  },
  {
    icon: Briefcase,
    title: 'فرص وظيفية مخصصة لك',
    description: 'نربطك بفرص عمل من شركائنا بناءً على مهاراتك ونقاطك. ابدأ الآن وافتح أبواب المستقبل.',
  },
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                ? 'w-8 bg-primary'
                : index < currentStep
                  ? 'w-2 bg-primary'
                  : 'w-2 bg-muted'
                }`}
            />
          ))}
        </div>

        {/* Content Card */}
        <Card className="border-0 shadow-elevated animate-scale-in">
          <CardContent className="p-8 text-center">
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-12 w-12 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-4 leading-relaxed">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {step.description}
            </p>

            {/* Step indicator */}
            <div className="text-sm text-muted-foreground mb-8">
              {currentStep + 1} من {steps.length}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={handleNext}
            className="w-full h-14 text-lg font-semibold"
            size="xl"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check className="h-5 w-5 ml-2" />
                ابدأ الآن
              </>
            ) : (
              <>
                التالي
                <ArrowLeft className="h-5 w-5 mr-2" />
              </>
            )}
          </Button>

          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full text-muted-foreground text-sm py-3 hover:text-foreground transition-colors"
            >
              تخطي
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
