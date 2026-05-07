import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Quiz, QuizQuestion } from '@/integrations/supabase/academy.types';
import { CheckCircle2, AlertCircle, RefreshCw, Award } from 'lucide-react';

export function StudentQuiz({ courseId, userId, onPassed }: { courseId: string, userId: string, onPassed: () => void }) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    
    // User attempts
    const [attemptsToday, setAttemptsToday] = useState(0);
    const [hasPassed, setHasPassed] = useState(false);

    // Quiz state
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null);

    useEffect(() => {
        loadQuizAndAttempts();
    }, [courseId, userId]);

    async function loadQuizAndAttempts() {
        setLoading(true);
        try {
            // 1. Get Quiz
            const { data: qData } = await supabase.from('quizzes').select('*').eq('course_id', courseId).maybeSingle();
            if (!qData) {
                // No quiz for this course! Just trigger onPassed immediately
                onPassed();
                return;
            }
            setQuiz(qData);

            // 2. Get Questions
            const { data: qqs } = await supabase.from('quiz_questions').select('*').eq('quiz_id', qData.id).order('order_index');
            setQuestions(qqs || []);

            // 3. Get Attempts
            const todayStr = new Date().toISOString().split('T')[0];
            const { data: attempts } = await supabase
                .from('quiz_attempts')
                .select('*')
                .eq('quiz_id', qData.id)
                .eq('user_id', userId);

            if (attempts) {
                const passed = attempts.some(a => a.passed);
                if (passed) {
                    setHasPassed(true);
                    onPassed();
                    return;
                }
                const todayAttempts = attempts.filter(a => a.created_at.startsWith(todayStr));
                setAttemptsToday(todayAttempts.length);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!quiz) return;
        if (Object.keys(answers).length < questions.length) {
            alert('يرجى الإجابة على جميع الأسئلة.');
            return;
        }

        setSubmitting(true);
        try {
            let correctCount = 0;
            const answerRows = [];

            // Calculate score locally (since we don't have a secure backend eval, we trust the DB correct_answer)
            // For a production app, evaluation should be done securely on the server/edge function.
            for (const q of questions) {
                const isCorrect = answers[q.id] === q.correct_answer;
                if (isCorrect) correctCount++;
                answerRows.push({
                    question_id: q.id,
                    selected_answer: answers[q.id],
                    is_correct: isCorrect
                });
            }

            const score = Math.round((correctCount / questions.length) * 100);
            const passed = score >= quiz.passing_score_percentage;

            // Save Attempt
            const { data: attempt, error: attemptErr } = await supabase.from('quiz_attempts').insert({
                quiz_id: quiz.id,
                user_id: userId,
                score_percentage: score,
                passed: passed,
                completed_at: new Date().toISOString()
            }).select().single();

            if (attemptErr) throw attemptErr;

            // Save Answers
            if (attempt) {
                await supabase.from('quiz_answers').insert(
                    answerRows.map(row => ({ ...row, attempt_id: attempt.id }))
                );
            }

            setResult({ score, passed });
            if (passed) {
                setHasPassed(true);
                onPassed();
            } else {
                setAttemptsToday(prev => prev + 1);
            }

        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء إرسال الاختبار.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="text-center py-6 text-gray-400">جاري تحميل الاختبار...</div>;
    
    if (!quiz) return null; // No quiz, handled in loadQuizAndAttempts
    
    if (hasPassed) {
        return (
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-[#059669] rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-[#065F46] mb-2">لقد اجتزت الاختبار بنجاح!</h3>
                <p className="text-sm text-[#047857]">الشهادة جاهزة للتحميل.</p>
            </div>
        );
    }

    if (result && !result.passed) {
        return (
            <div className="bg-white border border-[#F0EDE8] rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">لم تجتز الاختبار هذه المرة</h3>
                <p className="text-sm text-gray-500 mb-6">لقد حصلت على {result.score}٪ (النجاح من {quiz.passing_score_percentage}٪).</p>
                
                {attemptsToday >= quiz.daily_attempts_limit ? (
                    <div className="bg-orange-50 text-orange-800 text-sm p-4 rounded-xl font-bold">
                        لقد استنفدت محاولاتك اليوم ({quiz.daily_attempts_limit} محاولات). حاول غداً.
                    </div>
                ) : (
                    <button 
                        onClick={() => { setResult(null); setAnswers({}); }}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-all bg-[#111] hover:opacity-90"
                    >
                        <RefreshCw className="w-4 h-4" />
                        إعادة المحاولة ({quiz.daily_attempts_limit - attemptsToday} محاولات متبقية)
                    </button>
                )}
            </div>
        );
    }

    if (attemptsToday >= quiz.daily_attempts_limit) {
        return (
            <div className="bg-white border border-[#F0EDE8] rounded-2xl p-6 text-center">
                <div className="bg-orange-50 text-orange-800 text-sm p-4 rounded-xl font-bold mb-4">
                    لقد استنفدت محاولاتك اليوم ({quiz.daily_attempts_limit} محاولات). حاول غداً.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#F0EDE8] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F0EDE8]">
                <div>
                    <h3 className="font-black text-gray-900 text-lg">التقييم النهائي</h3>
                    <p className="text-xs text-gray-500 mt-1">اجتز هذا الاختبار للحصول على الشهادة</p>
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold text-[#B91C1C]">النجاح: {quiz.passing_score_percentage}٪</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">عدد الأسئلة: {questions.length}</p>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, i) => (
                    <div key={q.id} className="bg-[#F8F7F5] p-5 rounded-xl border border-[#E8E3DC]">
                        <p className="font-bold text-gray-900 text-sm mb-4 leading-relaxed">
                            {i + 1}. {q.question_text}
                        </p>
                        <div className="space-y-2">
                            {q.options.map((opt, optIdx) => (
                                <label 
                                    key={optIdx} 
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${answers[q.id] === opt ? 'border-[#B91C1C] bg-red-50' : 'border-transparent bg-white hover:border-[#E8E3DC]'}`}
                                >
                                    <input 
                                        type="radio" 
                                        name={`q_${q.id}`} 
                                        value={opt}
                                        checked={answers[q.id] === opt}
                                        onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                        className="w-4 h-4 text-[#B91C1C] accent-[#B91C1C]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
                style={{ background: '#B91C1C', boxShadow: '0 4px 16px rgba(185,28,28,0.25)' }}
            >
                <Award className="w-4 h-4" />
                {submitting ? 'جاري الإرسال...' : 'إرسال الإجابات وإصدار الشهادة'}
            </button>
        </div>
    );
}
