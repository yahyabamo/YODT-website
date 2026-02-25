import { useState } from 'react';
import { HelpCircle, ChevronLeft, Target, Lightbulb, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { guidanceQuestions, guidanceResults } from '@/data/academyData';
import { useNavigate } from 'react-router-dom';

export const GuidanceSection = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleStart = () => {
    setIsOpen(true);
    setCurrentQuestion('start');
    setResult(null);
  };

  const handleAnswer = (next?: string, resultKey?: string) => {
    if (resultKey) {
      setResult(resultKey);
      setCurrentQuestion(null);
    } else if (next) {
      setCurrentQuestion(next);
    }
  };

  const handleReset = () => {
    setCurrentQuestion('start');
    setResult(null);
  };

  const question = currentQuestion ? guidanceQuestions.find(q => q.id === currentQuestion) : null;
  const resultData = result ? guidanceResults[result] : null;

  if (!isOpen) {
    return (
      <Card 
        className="border-0 shadow-soft bg-gradient-to-r from-amber-50 to-orange-50 cursor-pointer hover:shadow-card transition-all"
        onClick={handleStart}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">هل تشعر بالتشتت؟</h3>
              <p className="text-sm text-muted-foreground">دعنا نساعدك على ترتيب أولوياتك</p>
            </div>
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-soft overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            مساعد الإرشاد
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            إغلاق
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {question && (
          <div className="space-y-4 animate-slide-up">
            <h4 className="font-medium text-foreground text-lg">{question.question}</h4>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-right h-auto py-3 px-4"
                  onClick={() => handleAnswer(option.next, option.result)}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {resultData && (
          <div className="space-y-4 animate-slide-up">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <Target className="h-8 w-8 text-success" />
              </div>
              <h4 className="font-semibold text-foreground text-lg">{resultData.title}</h4>
            </div>

            <div className="space-y-3">
              <div className="bg-primary/5 rounded-xl p-3">
                <h5 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  أولوياتك
                </h5>
                <ul className="space-y-1">
                  {resultData.priorities.map((p, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 rounded-xl p-3">
                <h5 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  نصائح عملية
                </h5>
                <ul className="space-y-1">
                  {resultData.tips.map((t, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <Card 
                className="border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all"
                onClick={() => navigate(resultData.suggestedLink)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">المسار المقترح</p>
                      <p className="font-medium text-foreground text-sm">{resultData.suggestedPath}</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleReset}
            >
              <RefreshCw className="h-4 w-4" />
              إعادة الاختبار
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
