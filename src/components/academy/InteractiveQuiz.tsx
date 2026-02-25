import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, ArrowLeft, ArrowRight, 
  Trophy, RotateCcw, Lightbulb, Clock, Target,
  Sparkles, Award, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface InteractiveQuizProps {
  title: string;
  questions: QuizQuestion[];
  onComplete: (score: number, results: QuizResult[]) => void;
  onClose: () => void;
  passingScore?: number;
  timeLimit?: number; // in seconds, optional
}

export const InteractiveQuiz = ({
  title,
  questions,
  onComplete,
  onClose,
  passingScore = 70,
  timeLimit,
}: InteractiveQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (timeLimit && !showResults) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLimit, showResults]);

  // Reset question start time when moving to next question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent,
    };

    setResults([...results, result]);
    setIsAnswered(true);
    setTotalTime(prev => prev + timeSpent);

    // Play sound effect (optional visual feedback)
    if (isCorrect) {
      // Could add success sound here
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    const finalResults = [...results];
    // Add any unanswered questions as incorrect
    for (let i = results.length; i < questions.length; i++) {
      finalResults.push({
        questionId: questions[i].id,
        selectedAnswer: -1,
        isCorrect: false,
        timeSpent: 0,
      });
    }
    
    const score = Math.round(
      (finalResults.filter(r => r.isCorrect).length / questions.length) * 100
    );
    
    setResults(finalResults);
    setShowResults(true);
    
    // Trigger confetti for passing score
    if (score >= passingScore) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
    }
    
    onComplete(score, finalResults);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setResults([]);
    setShowResults(false);
    setTotalTime(0);
    setTimeRemaining(timeLimit || 0);
    setQuestionStartTime(Date.now());
  };

  const score = Math.round(
    (results.filter(r => r.isCorrect).length / questions.length) * 100
  );
  const passed = score >= passingScore;

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
        <Card className="w-full max-w-lg animate-scale-in my-8">
          <CardHeader className="text-center pb-2">
            <div className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4",
              passed ? "bg-green-500/10" : "bg-red-500/10"
            )}>
              {passed ? (
                <Trophy className="h-10 w-10 text-green-500" />
              ) : (
                <AlertCircle className="h-10 w-10 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? '🎉 أحسنت!' : '😔 حاول مرة أخرى'}
            </CardTitle>
            <p className="text-muted-foreground">
              {passed 
                ? 'لقد اجتزت الاختبار بنجاح!' 
                : `تحتاج ${passingScore}% على الأقل للنجاح`
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={cn(
                "text-6xl font-bold mb-2",
                passed ? "text-green-500" : "text-red-500"
              )}>
                {score}%
              </div>
              <p className="text-sm text-muted-foreground">
                {results.filter(r => r.isCorrect).length} من {questions.length} إجابة صحيحة
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-0 bg-muted/50">
                <CardContent className="p-3 text-center">
                  <Target className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">{results.filter(r => r.isCorrect).length}</p>
                  <p className="text-[10px] text-muted-foreground">صحيحة</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-muted/50">
                <CardContent className="p-3 text-center">
                  <XCircle className="h-5 w-5 mx-auto text-red-500 mb-1" />
                  <p className="text-lg font-bold">{results.filter(r => !r.isCorrect).length}</p>
                  <p className="text-[10px] text-muted-foreground">خاطئة</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-muted/50">
                <CardContent className="p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-lg font-bold">{formatTime(totalTime)}</p>
                  <p className="text-[10px] text-muted-foreground">الوقت</p>
                </CardContent>
              </Card>
            </div>

            {/* Badges earned */}
            {passed && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-semibold">مكافآت</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/20 text-primary">
                    <Sparkles className="h-3 w-3 ml-1" />
                    +{Math.round(score / 10) * 5} نقطة
                  </Badge>
                  {score === 100 && (
                    <Badge className="bg-yellow-500/20 text-yellow-600">
                      <Trophy className="h-3 w-3 ml-1" />
                      إجابة مثالية
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Review Answers */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                مراجعة الإجابات
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {questions.map((q, index) => {
                  const result = results[index];
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        result?.isCorrect 
                          ? "bg-green-500/5 border-green-500/20" 
                          : "bg-red-500/5 border-red-500/20"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {result?.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                          {!result?.isCorrect && (
                            <p className="text-xs text-green-600 mt-1">
                              الإجابة الصحيحة: {q.options[q.correctAnswer]}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                إغلاق
              </Button>
              {!passed && (
                <Button className="flex-1" onClick={handleRetry}>
                  <RotateCcw className="h-4 w-4 ml-2" />
                  إعادة المحاولة
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-slide-up">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">
              سؤال {currentIndex + 1} من {questions.length}
            </Badge>
            {timeLimit && (
              <Badge 
                variant={timeRemaining < 60 ? "destructive" : "secondary"}
                className="gap-1"
              >
                <Clock className="h-3 w-3" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          <CardTitle className="text-lg mt-4">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-lg font-medium leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showCorrectness = isAnswered;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-right transition-all",
                    "flex items-center gap-3",
                    !isAnswered && !isSelected && "hover:border-primary/50 hover:bg-primary/5",
                    !isAnswered && isSelected && "border-primary bg-primary/10",
                    showCorrectness && isCorrect && "border-green-500 bg-green-500/10",
                    showCorrectness && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                    showCorrectness && !isSelected && !isCorrect && "opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold",
                    !isAnswered && !isSelected && "bg-muted text-muted-foreground",
                    !isAnswered && isSelected && "bg-primary text-primary-foreground",
                    showCorrectness && isCorrect && "bg-green-500 text-white",
                    showCorrectness && isSelected && !isCorrect && "bg-red-500 text-white"
                  )}>
                    {showCorrectness ? (
                      isCorrect ? <CheckCircle className="h-5 w-5" /> : 
                      isSelected ? <XCircle className="h-5 w-5" /> :
                      String.fromCharCode(65 + index)
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation (shown after answering) */}
          {isAnswered && (
            <div className={cn(
              "p-4 rounded-xl animate-fade-in",
              selectedAnswer === currentQuestion.correctAnswer
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-amber-500/10 border border-amber-500/20"
            )}>
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1">التفسير:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isAnswered ? (
              <>
                <Button variant="outline" onClick={onClose}>
                  إلغاء
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleConfirmAnswer}
                  disabled={selectedAnswer === null}
                >
                  تأكيد الإجابة
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={handleNextQuestion}>
                {currentIndex < questions.length - 1 ? (
                  <>
                    السؤال التالي
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </>
                ) : (
                  <>
                    عرض النتائج
                    <Trophy className="h-4 w-4 mr-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
